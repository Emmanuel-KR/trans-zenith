import { useMemo, useState } from "react";
import { Box, Paper, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

import PageToolbar from "@/components/PageToolbar";
import DataTable, { type DataTableHeader } from "@/components/DataTable";
import TablePill from "@/components/DataTable/TablePill";
import { type DateRange } from "@/components/Input/DateInput";
import { type FilterGroupDef } from "@/components/Input/FilterInput";
import { databaseService } from "@/services/database.service";
import { fmtDate, fmtMoney, toTitleCase } from "@/utilities/shared/format";
import { MERCHANT_FIELDS, type MerchantTransaction } from "@/utilities/shared/types";
import { ACCENT_COLOR } from "@/utilities/shared/theme";

/** Keys that hold ISO date strings and should be rendered as formatted dates. */
const DATE_KEYS = new Set([
  "initial_transaction_date",
  "final_transaction_date",
  "created_on",
]);

export default function Merchants() {
  const defaultDateRange = useMemo(
    () => ({
      start: new Date("2019-11-01"),
      end: new Date("2019-12-31"),
    }),
    [],
  );

  const [dateRange, setDateRange] = useState<DateRange | null>(defaultDateRange);
  const [search, setSearch] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const { data: response, status } = useQuery({
    queryKey: ["merchants", dateRange],
    queryFn: () =>
      databaseService.getMerchants({
        start_date: dateRange?.start ? format(dateRange.start, "yyyy-MM-dd") : undefined,
        end_date: dateRange?.end ? format(dateRange.end, "yyyy-MM-dd") : undefined,
        sort_by: "final_transaction_date",
        sort_order: "desc",
        page: 1,
        page_size: 50,
      }),
  });

  const merchants = useMemo(() => response?.items ?? [], [response]);

  // Generate the table headers from the response keys (falling back to the
  // canonical field order until the first row arrives).
  const headers: DataTableHeader[] = useMemo(() => {
    const keys = merchants.length > 0 ? Object.keys(merchants[0]) : (MERCHANT_FIELDS as string[]);
    return keys.map((key) => ({ key, title: toTitleCase(key) }));
  }, [merchants]);

  // Transaction-type filter options derived from the loaded rows.
  const typeOptions = useMemo(
    () =>
      Array.from(
        new Set(merchants.map((m) => m.transaction_type).filter(Boolean) as string[]),
      ),
    [merchants],
  );

  const filterGroups: FilterGroupDef[] = [
    {
      label: "Transaction Type",
      options: typeOptions,
      selected: selectedTypes,
      onToggle: (value) =>
        setSelectedTypes((prev) =>
          prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value],
        ),
    },
  ];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return merchants.filter((m) => {
      if (selectedTypes.length && !selectedTypes.includes(m.transaction_type ?? "")) return false;
      if (q) {
        const hay = Object.values(m).map((v) => String(v ?? "")).join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [merchants, search, selectedTypes]);

  const renderCell = (key: string, row: MerchantTransaction) => {
    const value = (row as unknown as Record<string, unknown>)[key];

    if (value === null || value === undefined || value === "") return "—";
    if (DATE_KEYS.has(key)) return fmtDate(new Date(value as string));
    if (key === "amount") return fmtMoney(Number(value));
    if (key === "transaction_state") return <TablePill state={String(value)} />;

    return undefined;
  };

  return (
    <Box>
      <PageToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search merchants..."
        onDateChange={setDateRange}
        filterGroups={filterGroups}
        onFilterReset={() => setSelectedTypes([])}
        onExport={() => {
          // TODO: wire up to the merchants export API.
        }}
      />

      <Paper elevation={1} sx={{ p: 2, border: "1px solid", borderColor: "divider" }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {status === "pending"
            ? "Loading..."
            : `${filtered.length} result${filtered.length === 1 ? "" : "s"}`}
        </Typography>
        <DataTable
          headers={headers}
          rows={filtered}
          getRowId={(r) => r.transaction_id}
          renderCell={renderCell}
          color={ACCENT_COLOR}
          rowsPerPage={10}
          emptyMessage={
            status === "error"
              ? "Failed to load merchants. Please try again."
              : "Oops, you currently do not have any merchants in the system"
          }
        />
      </Paper>
    </Box>
  );
}
