import { useState } from "react";

export function usePagination(initialPage = 0) {
  const [page, setPage] = useState(initialPage);
  return {
    page,
    setPage,
    prev: () => setPage((p) => Math.max(0, p - 1)),
    next: () => setPage((p) => p + 1),
    reset: () => setPage(0),
  };
}
