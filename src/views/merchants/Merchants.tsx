import { useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  IconButton,
  Alert,
  CircularProgress,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { useQuery } from "@tanstack/react-query";
import { format, startOfDay, endOfDay  } from "date-fns";

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

// Keys to hide from the table (edit this list to exclude other columns)
const HIDDEN_KEYS = new Set([
  "final_transaction_date",
  "esb_reference",
  "domain",
  "created_on",
  "cs_decision",
  "config_id",
  "customer_id",
  "provider",
  "terminal_id",
  "merchant_name",
  "result_message"
]);

export default function Merchants() {
  const defaultDateRange = useMemo(() => {
    const now = new Date();
    return { start: startOfDay(now), end: endOfDay(now) };
  }, []);


  const [dateRange, setDateRange] = useState<DateRange | null>(defaultDateRange);
  const [search, setSearch] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [selectedMerchant, setSelectedMerchant] = useState<string[]>([]);
  const [viewTx, setViewTx] = useState<MerchantTransaction | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<"csv" | "xlsx" | null>(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const { data: response, status } = useQuery({
    queryKey: ["merchants", dateRange, search, selectedTypes, selectedStatus, selectedMerchant],
    queryFn: () => {
      const resultCodeFilter = selectedStatus[0]
        ? selectedStatus[0] === "Successful"
          ? "0"
          : "failed"
        : undefined;

      return databaseService.getMerchants({
        start_date: dateRange?.start ? format(dateRange.start, "yyyy-MM-dd") : undefined,
        end_date: dateRange?.end ? format(dateRange.end, "yyyy-MM-dd") : undefined,
        // include UI filters so backend can pre-filter results
        // trantype: selectedTypes.length > 0 ? selectedTypes.join(",") : undefined,
        transaction_type: selectedTypes.length > 0 ? selectedTypes[0] : undefined,
        // backend expects result_code for merchant success/failure
        result_code: resultCodeFilter,
        // keep a human-friendly `status` as well for compatibility
        // status: selectedStatus.length ? selectedStatus[0] : undefined,
        // merchant: selectedMerchant.length > 0 ? selectedMerchant[0] : undefined,
        merchant_name: selectedMerchant.length > 0 ? selectedMerchant[0] : undefined,
        sort_by: "final_transaction_date",
        sort_order: "desc",
        page: 1,
        page_size: 500,
      });
    },
  });

  const merchants = useMemo(() => response?.items ?? [], [response]);

  // Generate the table headers from the response keys (falling back to the
  // canonical field order until the first row arrives).
  const headers: DataTableHeader[] = useMemo(() => {
    const rawKeys = merchants.length > 0 ? Object.keys(merchants[0]) : (MERCHANT_FIELDS as string[]);
    const keys = rawKeys.filter((k) => !HIDDEN_KEYS.has(k));

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

  const merchantOptions = useMemo(
    () => Array.from(new Set(merchants.map((m) => m.merchant_name).filter(Boolean) as string[])),
    [merchants],
  );

  const filterGroups: FilterGroupDef[] = [
    {
      label: "Transaction Type",
      options: typeOptions,
      selected: selectedTypes,
      single: true,
      onToggle: (v) => setSelectedTypes(selectedTypes.includes(v) ? [] : [v]),
    },
    {
      label: "Status",
      options: ["Successful", "Failed"],
      selected: selectedStatus,
      single: true,
      onToggle: (v) => setSelectedStatus(selectedStatus.includes(v) ? [] : [v]),
    },
    {
      label: "Merchant",
      options: merchantOptions,
      selected: selectedMerchant,
      single: true,
      onToggle: (v) => setSelectedMerchant(selectedMerchant.includes(v) ? [] : [v]),
    },
  ];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return merchants.filter((m) => {
      if (selectedTypes.length && !selectedTypes.includes(m.transaction_type ?? "")) return false;
      if (selectedMerchant.length && String(m.merchant_name) !== selectedMerchant[0]) return false;
      if (selectedStatus.length) {
        const rc = String(m.result_code ?? "");
        const isSuccess = rc === "0" || rc === "00";
        if (selectedStatus[0] === "Successful" && !isSuccess) return false;
        if (selectedStatus[0] === "Failed" && isSuccess) return false;
      }
      if (q) {
        const hay = Object.values(m).map((v) => String(v ?? "")).join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [merchants, search, selectedTypes, selectedStatus, selectedMerchant]);

  const renderCell = (key: string, row: MerchantTransaction) => {
    const value = (row as unknown as Record<string, unknown>)[key];

    if (value === null || value === undefined || value === "") return "NULL";
    if (DATE_KEYS.has(key)) return fmtDate(value as string | Date | null | undefined);
    // if (key === "amount") return fmtMoney(Number(value));
    // if (key === "transaction_state") return <TablePill state={String(value)} />;

    return undefined;
  };

  // (exports handled by backend)

  return (
    <Box>
      <PageToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search merchants..."
        onDateChange={setDateRange}
        filterGroups={filterGroups}
        onFilterReset={() => {
          setSelectedTypes([]);
          setSelectedStatus([]);
          setSelectedMerchant([]);
        }}
        onExport={() => setExportOpen(true)}
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
          onRowClick={setViewTx}
          getRowSx={(r) => {
            const rc = (r as MerchantTransaction).result_code;
            const failed = rc === null || Number(rc) !== 0;
            return failed ? { color: "#d32f2f" } : undefined;
          }}
          color={ACCENT_COLOR}
          rowsPerPage={12}
          emptyMessage={
            status === "error"
              ? "Failed to load merchants. Please try again."
              : "Oops, you currently do not have any merchants in the system"
          }
        />

        {/* Export Dialog */}
        <Dialog open={exportOpen} onClose={() => setExportOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Export Merchants</DialogTitle>
          <DialogContent>
            {exportError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {exportError}
              </Alert>
            )}
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Choose a format to export the current filtered results.
            </Typography>
            <Stack direction="row" spacing={2}>
              {(
                [
                  { key: "csv", label: "Export as CSV" },
                  { key: "xlsx", label: "Export as XLSX" },
                ] as const
              ).map((opt) => (
                <Button
                  key={opt.key}
                  variant={exportFormat === opt.key ? "contained" : "outlined"}
                  onClick={() => setExportFormat(opt.key)}
                >
                  {opt.label}
                </Button>
              ))}
            </Stack>
          </DialogContent>
            <DialogActions>
              <Button onClick={() => setExportOpen(false)} disabled={exportLoading}>
                Cancel
              </Button>
              <Button
                variant="contained"
                disabled={!exportFormat || exportLoading}
                onClick={async () => {
                  if (!exportFormat) return;
                  setExportLoading(true);
                  setExportError(null);
                  try {
                    const params: Record<string, any> = {
                      start_date: dateRange?.start ? format(dateRange.start, "yyyy-MM-dd") : undefined,
                      end_date: dateRange?.end ? format(dateRange.end, "yyyy-MM-dd") : undefined,
                      trantype: selectedTypes.length > 0 ? selectedTypes.join(",") : undefined,
                      status: selectedStatus.length ? selectedStatus[0] : undefined,
                      merchant: selectedMerchant.length > 0 ? selectedMerchant[0] : undefined,
                      merchant_name: selectedMerchant.length > 0 ? selectedMerchant[0] : undefined,
                      search: search || undefined,
                      page: 1,
                      page_size: 500,
                      sort_by: "final_transaction_date",
                      sort_order: "desc",
                    };

                    const blob = await databaseService.exportMerchants(exportFormat, params);

                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `merchants_${new Date().toISOString().split("T")[0]}.${exportFormat}`;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    URL.revokeObjectURL(url);

                    setExportOpen(false);
                    setExportFormat(null);
                  } catch (err) {
                    setExportError(err instanceof Error ? err.message : "Export failed");
                  } finally {
                    setExportLoading(false);
                  }
                }}
              >
                {exportLoading ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
                {exportLoading ? "Exporting..." : "Confirm"}
              </Button>
            </DialogActions>
        </Dialog>

        {/* View Modal */}
        <Dialog open={Boolean(viewTx)} onClose={() => setViewTx(null)} maxWidth="md" fullWidth>
          {viewTx && (
            <Box sx={{ p: 3 }}>
              <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start", mb: 2.5 }}>
                <Box>
                  <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#353F50" }}>
                    Merchant Transaction Details
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                  <IconButton size="small" onClick={() => setViewTx(null)}>
                    <CloseRoundedIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Stack>

              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 2 }}>
                <Typography><strong>Tran ID:</strong> {viewTx.transaction_id}</Typography>
                <Typography><strong>Tran State:</strong> {viewTx.transaction_state}</Typography>
                <Typography><strong>Tran Type:</strong> {viewTx.transaction_type}</Typography>
                <Typography><strong>Payemnt Item:</strong> {viewTx.payment_item}</Typography>

                <Typography><strong>Provider:</strong> {viewTx.provider}</Typography>
                <Typography><strong>Rsp Code:</strong> {viewTx.response_code}</Typography>
                <Typography><strong>Result Code:</strong> {viewTx.result_code}</Typography> 
                <Typography><strong>Result Message:</strong> {viewTx.result_message}</Typography>

                <Typography><strong>Customer ID:</strong> {viewTx.customer_id}</Typography>                
                <Typography><strong>Order ID:</strong> {viewTx.order_id}</Typography> 
                <Typography><strong>Currency:</strong> {viewTx.currency}</Typography>
                <Typography><strong>Amount:</strong> {viewTx.amount}</Typography>

                <Typography><strong>TERMID:</strong> {viewTx.terminal_id}</Typography>
                <Typography><strong>Config ID:</strong> {viewTx.config_id}</Typography>
                <Typography><strong>Merchant ID:</strong> {viewTx.merchant_id}</Typography>
                <Typography><strong>Merchant:</strong> {viewTx.merchant_name}</Typography>

                <Typography><strong>Domain:</strong> {viewTx.domain}</Typography>
                <Typography><strong>Created On:</strong> {fmtDate(viewTx.created_on)}</Typography>
                <Typography><strong>Initial TXN Date:</strong> {fmtDate(viewTx.initial_transaction_date)}</Typography>
                <Typography><strong>Final TXN Date:</strong> {fmtDate(viewTx.final_transaction_date)}</Typography>              

              </Box>   

              <Stack direction="row" sx={{ justifyContent: "flex-end", mt: 1 }}>
                <Button onClick={() => setViewTx(null)}>Close</Button>
              </Stack>
            </Box>
          )}
        </Dialog>
      </Paper>
    </Box>
  );
}
