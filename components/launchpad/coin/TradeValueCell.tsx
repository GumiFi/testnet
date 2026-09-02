import { getPriceDisplayParts } from "@/lib/format";

export default function TradeValueCell({
  amountEth,
  valueUsd,
  className = "",
}: {
  amountEth: number;
  valueUsd: number;
  className?: string;
}) {
  const parts = getPriceDisplayParts(valueUsd);

  if (parts.leadingZeros === null) {
    return <span className={`truncate font-mono text-[10px] text-ivory ${className}`}>{parts.plain}</span>;
  }

  return (
    <span className={`truncate font-mono text-[10px] text-ivory ${className}`}>
      $0.0<sub className="text-[0.7em]">{parts.leadingZeros}</sub>
      {parts.digits}
    </span>
  );
}
