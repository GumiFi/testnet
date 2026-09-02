export default function Sparkline({
  values,
  positive,
  className = "h-8 w-20",
}: {
  values: number[];
  positive: boolean;
  className?: string;
}) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * 100;
      const y = 32 - ((value - min) / range) * 28 - 2;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox="0 0 100 32" className={className} preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke={positive ? "#4CAF7D" : "#C1615F"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
