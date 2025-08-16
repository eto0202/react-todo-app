import { useCallback, useEffect, useRef } from "react";
import Matter from "matter-js";
import type { Todo, Priority } from "../types";
import { calcBubbleRadius } from "../utils";
import { priorityStyles } from "../config";

type UsePhysicsEngineProps = {
  containerRef: React.RefObject<HTMLDivElement | null>;
  todoList: Todo[];
  onUpdatePositions: (positions: { [id: string]: { x: number; y: number; angle: number } }) => void;
};

type CustomBodyData = {
  priority: Priority;
  completed: boolean;
};

export function usePhysicsEngine({
  containerRef,
  todoList,
  onUpdatePositions,
}: UsePhysicsEngineProps) {
  const matterInstanceRef = useRef<{ engine: Matter.Engine } | null>(null);

  // セットアップ用。初回のみ実行。
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    // observerAPIを設定
    const setup = (width: number, height: number) => {
      const engine = Matter.Engine.create({
        gravity: { y: 0.05 },
        constraintIterations: 2,
        positionIterations: 6,
        velocityIterations: 4,
      });

      matterInstanceRef.current = { engine };
      const world = engine.world;

      const walls = [
        // 床
        Matter.Bodies.rectangle(width / 2, height + 10, width, 20, { isStatic: true }),
        // 天井
        Matter.Bodies.rectangle(width / 2, -10, width, 20, { isStatic: true }),
        // 左壁
        Matter.Bodies.rectangle(-10, height / 2, 20, height, { isStatic: true }),
        // 右壁
        Matter.Bodies.rectangle(width + 10, height / 2, 20, height, { isStatic: true }),
      ];
      Matter.World.add(world, walls);

      // マウスオブジェクトを作成
      const mouse = Matter.Mouse.create(container);

      // マウス制約を作成
      const mouseConstraint = Matter.MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
          stiffness: 0.2, // 掴んだ時の硬さ
          render: {
            visible: false, // 掴んだ時の線
          },
        },
      });

      // マウス制約をワールドに追加
      Matter.World.add(world, mouseConstraint);

      // 物理演算ループ
      let animationFramedId: number;
      (function update() {
        if (!matterInstanceRef.current) return;

        const currentEngine = matterInstanceRef.current.engine;

        Matter.Engine.update(currentEngine, 1000 / 60);

        // 浮力計算
        currentEngine.world.bodies.forEach((body) => {
          if (body.isStatic || !body.plugin.customData) return;

          // matter.bodyオブジェクトに追加したカスタムプロパティを参照。
          const customData = body.plugin.customData as CustomBodyData;
          const { priority, completed } = customData;

          let buoyancy = { high: 0.002, medium: 0.001, low: 0.0005 }[priority] || 0;

          if (completed) {
            buoyancy = -0.005;
          }
          Matter.Body.applyForce(body, body.position, { x: 0, y: -buoyancy });
        });

        // 位置情報の更新。
        const newPositions: { [id: string]: { x: number; y: number; angle: number } } = {};
        currentEngine.world.bodies.forEach((body) => {
          if (body.isStatic || !body.label.startsWith("bubble-")) return;
          const id = body.label.split("-")[1];
          newPositions[id] = { x: body.position.x, y: body.position.y, angle: body.angle };
        });

        onUpdatePositions(newPositions);

        animationFramedId = requestAnimationFrame(update);
      })();

      // クリーンアップ関数を返す。
      return () => {
        cancelAnimationFrame(animationFramedId);
        if (matterInstanceRef.current) {
          Matter.World.clear(matterInstanceRef.current.engine.world, false);
          Matter.Engine.clear(matterInstanceRef.current.engine);
          matterInstanceRef.current = null;
        }
      };
    };

    let cleanup: (() => void) | undefined;
    const observer = new ResizeObserver((entries) => {
      if (cleanup) cleanup();
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          cleanup = setup(width, height);
        }
      }
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [containerRef, onUpdatePositions]);

  // バブルを作成するヘルパー関数。
  // containerRefが変わらない限り再生成しない。
  const createBubble = useCallback(
    (todo: Todo): Matter.Body => {
      let initialX: number;
      let initialY: number;
      const container = containerRef.current;

      if (todo.position === null && container) {
        const centerX = container.clientWidth / 2;
        const centerY = container.clientHeight / 2;

        initialX = centerX + (Math.random() - 0.5) * 600;
        initialY = centerY + (Math.random() - 0.5) * 10;
      } else {
        initialX = todo.position?.x || Math.random() * (container?.clientWidth || 800);
        initialY = todo.position?.y || 50;
      }

      // Todoの優先度に応じてstyle設定を取得
      const style = priorityStyles[todo.priority] || priorityStyles.medium;
      const bubbleRadius = calcBubbleRadius(style.baseRadius, style.growthFactor);

      const body = Matter.Bodies.circle(initialX, initialY, bubbleRadius, {
        label: `bubble-${todo.id}`,
        restitution: 0.8, // 反発係数
        frictionAir: 0.02, // 空気抵抗
        // スロップ値。デフォルトは0.05。ボディの周りの薄い境界を指定し、そこでボディが他のボディにわずかに沈むことを許可する数。
        slop: 0.01,
      });

      // matter.bodyオブジェクトにカスタムプロパティを設定。
      body.plugin.customData = {
        priority: todo.priority,
        completed: todo.completed,
      };

      return body;
    },
    [containerRef]
  );

  // 同期用
  useEffect(() => {
    if (!matterInstanceRef.current) return;
    const engine = matterInstanceRef.current.engine;
    const worldBodies = engine.world.bodies.filter((b) => !b.isStatic);

    // 新規タスクを描画。
    todoList.forEach((todo) => {
      const existingBody = worldBodies.find((b) => b.label === `bubble-${todo.id}`);
      if (!existingBody) {
        const bubble = createBubble(todo);
        Matter.World.add(engine.world, bubble);
      } else {
        existingBody.plugin.customData = {
          priority: todo.priority,
          completed: todo.completed,
        };

        // 密度設定
        const targetDensity = todo.completed ? 0.05 : 0.001;
        if (existingBody.density !== targetDensity) {
          Matter.Body.setDensity(existingBody, targetDensity);
        }
      }
    });

    // 削除されたタスクを除去。
    const todoIds = new Set(todoList.map((todo) => todo.id));
    worldBodies.forEach((body) => {
      const id = body.label.split("-")[1];
      if (id && !todoIds.has(id)) {
        Matter.World.remove(engine.world, body);
      }
    });
  }, [todoList, createBubble]);
}
