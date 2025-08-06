import type { Priority } from "./types";

// 優先度に応じたバブルの大きさ設定
export const priorityStyles: {
  [key in Priority]: { baseRadius: number; growthFactor: number };
} = {
  low: { baseRadius: 45, growthFactor: 1.5 },
  medium: { baseRadius: 65, growthFactor: 2.0 },
  high: { baseRadius: 85, growthFactor: 2.5 },
};
