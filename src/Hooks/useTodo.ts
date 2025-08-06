import { useCallback, useEffect, useRef, useState } from "react";
import type { Priority, Todo } from "../types";
import { formattedToday } from "../utils";

const STORAGE_KEY = "TodoList";

export function useTodos() {
  const [todoList, setTodoList] = useState<Todo[]>(() => {
    try {
      const savedTodos = localStorage.getItem(STORAGE_KEY);

      if (!savedTodos) return [];

      const parsedData = JSON.parse(savedTodos);

      // パースしたデータが配列であるかを確認。
      if (Array.isArray(parsedData)) {
        // 不完全なTodoオブジェクトが入ってくる可能性がある。
        return parsedData.map(
          (todo: Partial<Todo>) =>
            ({
              ...todo,
              position: todo.position || { x: Math.random() * 500, y: 50, angle: 0 },
              // 型アサーションを追加してTodo[]として推論。
            } as Todo)
        );
      } else {
        console.warn(
          "localStorageのデータが配列ではありませんでした。リストを初期化します。",
          parsedData
        );
        return [];
      }
    } catch (error) {
      // パースに失敗した場合、エラーを出して空配列を返す。
      console.error("localStorageからのデータ読み込みに失敗しました。", error);
      return [];
    }
  });

  // イベントリスナーや他のuseEffextから最新のstateへアクセスするためのref
  const latestTodoListRef = useRef(todoList);
  useEffect(() => {
    latestTodoListRef.current = todoList;
  }, [todoList]);

  // ページを離れる（リロード含む）直前に最終的な位置情報を含めて保存。
  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(latestTodoListRef.current));
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // 分割代入を使ってposition以外のデータが変更されたら即座に保存。
  const nonPositionTodoList = JSON.stringify(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    todoList.map(({ position, ...rest }) => rest)
  );
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(latestTodoListRef));
    // positionの変更のみ無視。
  }, [nonPositionTodoList]);

  const handleAddTodo = (content: string, priority: Priority) => {
    if (!content) return;

    const newTodo: Todo = {
      id: Date.now().toString(),
      content: content,
      createDate: formattedToday(),
      completed: false,
      completedText: "完了",
      priority: priority,
      position: {
        x: Math.random() * 500 + 150,
        y: 50,
        angle: 0,
      },
    };

    setTodoList((prevList) => [...prevList, newTodo]);
  };

  const handleToggleComplete = (id: string) => {
    setTodoList((prevList) =>
      prevList.map((todo) =>
        todo.id === id
          ? {
              ...todo,
              completed: !todo.completed,
              completedText: !todo.completed ? "未完了に戻す" : "完了",
              completedDate: !todo.completed ? formattedToday() : undefined,
            }
          : todo
      )
    );
  };

  const handleDelete = (id: string) => {
    setTodoList((prevList) => prevList.filter((todo) => todo.id !== id));
  };

  const handleUpdatePositions = useCallback(
    (updatePositions: { [id: string]: { x: number; y: number; angle: number } }) => {
      setTodoList((prevList) =>
        prevList.map((todo) => {
          const newPosition = updatePositions[todo.id];
          if (newPosition) {
            return { ...todo, position: newPosition };
          }
          return todo;
        })
      );
    },
    []
  );

  return { todoList, handleAddTodo, handleToggleComplete, handleDelete, handleUpdatePositions };
}
