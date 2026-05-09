import { useEffect, useState } from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { listUsers } from "@/features/users/api/userService";
import type { OrderFilters } from "../api/orderService";
import type { OrderStatus, User } from "@/lib/types";
import { cn } from "@/lib/utils";

function FunnelIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className={className} aria-hidden="true">
      <rect x="1" y="2" width="14" height="2.5" rx="1.25" />
      <rect x="3.5" y="6.75" width="9" height="2.5" rx="1.25" />
      <rect x="6.5" y="11.5" width="3" height="2" rx="1" />
    </svg>
  );
}

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "OPEN", label: "Aberto" },
  { value: "COMPLETED", label: "Fechado" },
  { value: "CANCELED", label: "Cancelado" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Mais novo → Mais antigo" },
  { value: "oldest", label: "Mais antigo → Mais novo" },
  { value: "most_items", label: "Mais itens → Menos itens" },
  { value: "least_items", label: "Menos itens → Mais itens" },
  { value: "most_expensive", label: "Mais caro → Mais barato" },
  { value: "cheapest", label: "Mais barato → Mais caro" },
];

const DEFAULT_SORT = "newest";

interface Props {
  onApply: (filters: OrderFilters) => void;
}

export function OrderFilterBar({ onApply }: Props) {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  const [sort, setSort] = useState(DEFAULT_SORT);
  const [statuses, setStatuses] = useState<OrderStatus[]>([]);
  const [userId, setUserId] = useState("");

  const [hasActiveFilters, setHasActiveFilters] = useState(false);

  useEffect(() => {
    listUsers(0, 100)
      .then((r) => setUsers(r.content))
      .catch(() => {});
  }, []);

  const toggleStatus = (status: OrderStatus) => {
    setStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status],
    );
  };

  const apply = () => {
    const filters: OrderFilters = {
      sort: sort !== DEFAULT_SORT ? sort : undefined,
      statuses: statuses.length > 0 ? statuses : undefined,
      userId: userId || undefined,
    };
    setHasActiveFilters(sort !== DEFAULT_SORT || statuses.length > 0 || !!userId);
    onApply(filters);
    setOpen(false);
  };

  const clear = () => {
    setSort(DEFAULT_SORT);
    setStatuses([]);
    setUserId("");
    setHasActiveFilters(false);
    onApply({});
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "relative h-9 gap-2 text-sm",
            hasActiveFilters && "border-purple-500 text-purple-600 hover:text-purple-600",
          )}
        >
          <FunnelIcon className="h-4 w-4" />
          Filtrar
          {hasActiveFilters && (
            <span className="absolute -right-1.5 -top-1.5 h-3 w-3 rounded-full bg-purple-500" />
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="start" sideOffset={10} className="w-72 p-0">
        <PopoverPrimitive.Arrow className="fill-border" width={14} height={7} />

        <div className="space-y-4 p-4">
          {/* Ordenação */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Ordenação
            </p>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="text-sm">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Status */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Status
            </p>
            <div className="space-y-2">
              {STATUS_OPTIONS.map((s) => (
                <div key={s.value} className="flex items-center gap-2">
                  <Checkbox
                    id={`status-${s.value}`}
                    checked={statuses.includes(s.value)}
                    onCheckedChange={() => toggleStatus(s.value)}
                  />
                  <Label
                    htmlFor={`status-${s.value}`}
                    className="cursor-pointer text-sm font-normal"
                  >
                    {s.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Usuário */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Usuário
            </p>
            <Select value={userId} onValueChange={setUserId}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Todos os usuários" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All" className="text-sm">
                  Todos os usuários
                </SelectItem>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id} className="text-sm">
                    {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Ações */}
          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1 bg-purple-600 text-white hover:bg-purple-700"
              onClick={apply}
            >
              Aplicar filtro
            </Button>
            <Button size="sm" variant="outline" className="flex-1" onClick={clear}>
              Limpar filtro
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
