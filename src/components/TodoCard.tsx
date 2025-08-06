import { useState } from "react";
import type { Todo } from "../types";
import "./TodoCard.css";
import * as Popover from "@radix-ui/react-popover";
import { priorityStyles } from "../config";
import { calcBubbleRadius } from "../utils";

type TodoCardProps = {
  todo: Todo;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
};

export function TodoCard({ todo, onToggleComplete, onDelete }: TodoCardProps) {
  const [open, setOpen] = useState(false);

  // Todoの優先度に応じてスタイル設定を取得
  const styleSettings = priorityStyles[todo.priority] || priorityStyles.medium;

  const radius = calcBubbleRadius(
    todo.content,
    styleSettings.baseRadius,
    styleSettings.growthFactor
  );

  const diameter = radius * 2;

  const position = todo.position || { x: 0, y: 0, angle: 0 };
  const cardStyle = {
    transform: `
      translate(
        calc(${position.x}px - 50%),
        calc(${position.y}px - 50%)
      )
      rotate(${position.angle}rad)
    `,

    width: `${diameter}px`,
    height: `${diameter}px`,
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        className={`popover_trigger ${todo.completed ? "completed" : "incomplete"} priority_${
          todo.priority
        }`}
        style={cardStyle}
        asChild
      >
        <button type="button">{todo.content}</button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className="popover_content" side="bottom" sideOffset={10} align="center">
          <div className="todo_card">
            <p className="todo_createDate">{todo.createDate}</p>
            <h3 className="todo_content">{todo.content}</h3>
            <div className="todo_completedDate_container">
              <p className="todo_completedDate_text">完了日 : </p>
              <p className="todo_completedDate_number">{todo.completedDate}</p>
            </div>
            <Popover.Close asChild>
              <div className="btn_container">
                <button
                  className="done_btn"
                  type="button"
                  onClick={() => onToggleComplete(todo.id)}
                >
                  {todo.completedText}
                </button>
                <img
                  className="delete_btn"
                  src="src\assets\delete_2_line.svg"
                  onClick={() => onDelete(todo.id)}
                ></img>
              </div>
            </Popover.Close>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
