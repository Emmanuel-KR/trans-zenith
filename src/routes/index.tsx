import { createFileRoute } from "@tanstack/react-router";
import TransactionPortal from "@/components/TransactionPortal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Transaction Reporting Portal" },
      { name: "description", content: "Search, filter, and export transaction reports." },
    ],
  }),
  component: TransactionPortal,
});
