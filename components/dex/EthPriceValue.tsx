import { getEthPriceDisplayParts } from "@/lib/format";

export default function EthPriceValue({
  value,
  className = "",
}: {
  value: number;
  className?: string;
}) {
  const parts = getEthPriceDisplayParts(value);

  if (parts.leadingZeros === null) {
    return <span className={className}>{parts.plain}</span>;
  }

  return (
    <span className={className}>
      0.0<sub className="text-[0.7em]">{parts.leadingZeros}</sub>
      {parts.digits} ETH
    </span>
  );
}
