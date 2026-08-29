export interface DataTableColumn<T> {
  /** Unique, stable id — used as the React key and as the localStorage/order/filter key, so don't rename once shipped (would silently reset users' saved column layout). */
  key: string;
  label: string;
  /** Raw value backing default sort/filter/export. Should return a primitive, not JSX. */
  value: (row: T) => string | number | null | undefined;
  /** Custom cell rendering — falls back to String(value(row)) when omitted. */
  render?: (row: T) => React.ReactNode;
  sortable?: boolean; // default true
  filterable?: boolean; // default true
  className?: string; // extra classes on both the <th> and each <td> (e.g. "whitespace-nowrap")
}
