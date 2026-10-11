import { ArrowDown, ArrowDownUp, ArrowUp } from "lucide-react";

export type SortDirection = "asc" | "desc";

type SortableHeaderProps<Key extends string> = {
  label: string;
  sortKey: Key;
  activeKey: Key | null;
  direction: SortDirection;
  onSort: (key: Key) => void;
  className?: string;
};

export function SortableHeader<Key extends string>({
  label,
  sortKey,
  activeKey,
  direction,
  onSort,
  className = "",
}: SortableHeaderProps<Key>) {
  const active = activeKey === sortKey;
  const Icon = active ? (direction === "asc" ? ArrowUp : ArrowDown) : ArrowDownUp;

  return (
    <th
      className={`px-3 py-2 ${className}`}
      aria-sort={active ? (direction === "asc" ? "ascending" : "descending") : "none"}
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className="inline-flex items-center gap-1.5 text-left hover:text-foreground"
        aria-label={`Sorteer op ${label}${active ? (direction === "asc" ? ", oplopend" : ", aflopend") : ""}`}
      >
        {label}
        <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      </button>
    </th>
  );
}

export function SortToggle<Key extends string>({
  label,
  sortKey,
  activeKey,
  direction,
  onSort,
}: Omit<SortableHeaderProps<Key>, "className">) {
  const active = activeKey === sortKey;
  const Icon = active ? (direction === "asc" ? ArrowUp : ArrowDown) : ArrowDownUp;

  return (
    <button
      type="button"
      onClick={() => onSort(sortKey)}
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-1.5 text-xs font-medium ${active ? "border-primary/40 bg-primary/5 text-primary" : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"}`}
      aria-label={`Sorteer op ${label}${active ? (direction === "asc" ? ", oplopend" : ", aflopend") : ""}`}
    >
      {label}
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
    </button>
  );
}
