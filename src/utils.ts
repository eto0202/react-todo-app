//現在日時を取得
export function formattedToday(): string {
  const today = new Date();

  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const day = today.getDate();

  const formatted = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  return formatted;
}

// 円の半径計算
export const calcBubbleRadius = (baseRadius: number, growthFactor: number): number => {
  return baseRadius + growthFactor;
};
