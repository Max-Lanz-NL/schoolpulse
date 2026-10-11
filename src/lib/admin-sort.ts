import type { SortDirection } from "@/components/admin/SortableHeader";

export function sortByValue<T>(
  items: T[],
  getValue: (item: T) => string | number | null | undefined,
  direction: SortDirection,
): T[] {
  const collator = new Intl.Collator("nl", { numeric: true, sensitivity: "base" });
  return [...items].sort((left, right) => {
    const a = getValue(left);
    const b = getValue(right);
    let result = 0;
    if (typeof a === "number" && typeof b === "number") result = a - b;
    else result = collator.compare(String(a ?? ""), String(b ?? ""));
    return direction === "asc" ? result : -result;
  });
}
