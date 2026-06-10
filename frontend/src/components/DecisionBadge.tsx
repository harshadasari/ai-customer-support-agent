interface Props {
  decision: string | null;
}

const COLORS: Record<string, string> = {
  APPROVED: "bg-green-100 text-green-800 border-green-300",
  DENIED: "bg-red-100 text-red-800 border-red-300",
  ESCALATED: "bg-yellow-100 text-yellow-800 border-yellow-300",
  NEEDS_INFO: "bg-blue-100 text-blue-800 border-blue-300",
};

export default function DecisionBadge({ decision }: Props) {
  if (!decision) return null;
  const color = COLORS[decision] || "bg-gray-100 text-gray-800 border-gray-300";
  return (
    <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full border ${color}`}>
      {decision}
    </span>
  );
}
