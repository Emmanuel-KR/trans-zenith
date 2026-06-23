import { format } from "date-fns";

/** Format a number as USD currency. */
export const fmtMoney = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "kes" });

/** Format a date as dd/MM/yyyy HH:mm:ss. */
export const fmtDate = (d: Date) => format(d, "dd/MM/yyyy HH:mm:ss");
