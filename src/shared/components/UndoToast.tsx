import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const TOTAL = 10;
const RADIUS = 18;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface UndoToastProps {
  id: string | number;
  message: string;
  onConfirm: () => void;
  onUndo: () => void;
}

function UndoToast({ id, message, onConfirm, onUndo }: UndoToastProps) {
  const [count, setCount] = useState(TOTAL);
  const undoneRef = useRef(false);
  const confirmedRef = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (!undoneRef.current && !confirmedRef.current) {
            confirmedRef.current = true;
            onConfirm();
          }
          toast.dismiss(id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleUndo = () => {
    if (confirmedRef.current) return;
    undoneRef.current = true;
    toast.dismiss(id);
    onUndo();
  };

  const progress = (count / TOTAL) * CIRCUMFERENCE;

  return (
    <div
      className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-lg"
      style={{ minWidth: 280 }}
    >
      <svg width={44} height={44} className="flex-shrink-0" aria-hidden="true">
        <circle cx={22} cy={22} r={RADIUS} fill="none" stroke="#f3f4f6" strokeWidth={3} />
        <circle
          cx={22}
          cy={22}
          r={RADIUS}
          fill="none"
          stroke="#ef4444"
          strokeWidth={3}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE - progress}
          strokeLinecap="round"
          transform="rotate(-90 22 22)"
        />
        <text
          x={22}
          y={22}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={13}
          fontWeight={700}
          fill="#111111"
        >
          {count}
        </text>
      </svg>

      <p className="flex-1 text-sm font-medium text-gray-900">{message}</p>

      <button
        onClick={handleUndo}
        className="text-sm font-semibold text-red-500 transition-colors hover:text-red-600"
      >
        Desfazer
      </button>
    </div>
  );
}

export function showUndoToast(
  message: string,
  onConfirm: () => void,
  onUndo: () => void,
): void {
  toast.custom(
    (t) => <UndoToast id={t} message={message} onConfirm={onConfirm} onUndo={onUndo} />,
    { duration: Infinity, position: "bottom-right" },
  );
}
