import type { OrderStatus } from "@/lib/types";

const labels: Record<OrderStatus, string> = {
  OPEN: "Em aberto",
  COMPLETED: "Finalizado",
  CANCELED: "Cancelado",
};

const styles: Record<OrderStatus, string> = {
  OPEN: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  COMPLETED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  CANCELED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

interface Props {
  status: OrderStatus;
}

export function OrderStatusBadge({ status }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
