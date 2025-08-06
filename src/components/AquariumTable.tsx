import { useRef } from "react";
import { TodoCard } from "./TodoCard";
import type { Todo } from "../types";
import { usePhysicsEngine } from "../Hooks/usePhysicsEngine";
import "./AquariumTable.css";

type AquariumTableProps = {
  todoList: Todo[];
  onUpdatePositions: (updatePositions: {
    [id: string]: { x: number; y: number; angle: number };
  }) => void;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
};

export function AquariumTable({
  todoList,
  onUpdatePositions,
  onToggleComplete,
  onDelete,
}: AquariumTableProps) {
  const sceneRef = useRef<HTMLDivElement>(null);

  usePhysicsEngine({ containerRef: sceneRef, todoList, onUpdatePositions });

  return (
    <div className="aquarium_table" ref={sceneRef}>
      {todoList.map((todo) => (
        <TodoCard
          key={todo.id}
          todo={todo}
          onToggleComplete={onToggleComplete}
          onDelete={onDelete}
        ></TodoCard>
      ))}
    </div>
  );
}
