import { useState } from "react";
import { CustomSelect } from "./CustomSelect";
import "./TodoForm.css";
import type { Priority } from "../types";

type TodoFormProps = {
  onAddTodo: (content: string, priority: Priority) => void;
};

const selectOptions = [
  { value: "low", label: "low" },
  { value: "medium", label: "medium" },
  { value: "high", label: "high" },
];

export function TodoForm({ onAddTodo }: TodoFormProps) {
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!content) return;
    onAddTodo(content, priority);

    setContent("");
    setPriority("medium");
  };

  return (
    <form className="todo_form" onSubmit={handleSubmit}>
      <input
        id="todo_form_input"
        className="form_input"
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Todo"
      ></input>
      <div className="priority_container">
        <p className="priority_text">優先度</p>
        <CustomSelect
          options={selectOptions}
          value={priority}
          placeholder="優先度を選択"
          onChange={setPriority}
        ></CustomSelect>
      </div>
      <button className="submit_btn" type="submit">
        Submit
      </button>
    </form>
  );
}
