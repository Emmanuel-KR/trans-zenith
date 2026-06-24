import { format } from "date-fns";

/** Format a number as USD currency. */
export const fmtMoney = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "kes" });

/** Format a date as dd/MM/yyyy HH:mm:ss. */
export const fmtDate = (d: Date) => format(d, "dd/MM/yyyy HH:mm:ss");

/** Turn a snake_case / camelCase key into a human Title Case label. */
export const toTitleCase = (key: string) =>
  key
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase());
