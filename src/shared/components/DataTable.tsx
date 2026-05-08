import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface TableColumn<T> {
  header: React.ReactNode;
  cell: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  loading?: boolean;
  emptyIcon?: React.ReactNode;
  emptyMessage: string;
  pagination?: {
    page: number;
    total: number;
    onPrev: () => void;
    onNext: () => void;
  };
  rowClassName?: string | ((row: T) => string);
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  loading,
  emptyIcon,
  emptyMessage,
  pagination,
  rowClassName,
}: DataTableProps<T>) {
  const resolveRowClass = (row: T) =>
    typeof rowClassName === "function" ? rowClassName(row) : (rowClassName ?? "");

  return (
    <div className="rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
      {loading ? (
        <div className="p-10 text-center text-sm text-muted-foreground">Carregando...</div>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center gap-2 p-12 text-center">
          {emptyIcon}
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                {columns.map((col, i) => (
                  <TableHead key={i} className={col.className}>
                    {col.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row) => (
                <TableRow key={keyExtractor(row)} className={resolveRowClass(row)}>
                  {columns.map((col, i) => (
                    <TableCell key={i} className={col.className}>
                      {col.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {pagination && pagination.total > 1 && (
            <div className="flex items-center justify-center gap-3 border-t p-3">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                disabled={pagination.page === 0}
                onClick={pagination.onPrev}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                {pagination.page + 1} / {pagination.total}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                disabled={pagination.page >= pagination.total - 1}
                onClick={pagination.onNext}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
