export type Priority = "high" | "medium" | "low";

export interface Todo {
  id: string;
  createDate: string;
  completed: boolean;
  completedText: string;
  completedDate?: string;
  content: string;
  priority: Priority;
  position: {
    x: number;
    y: number;
    angle: number;
  };
}
