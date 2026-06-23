import { useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Paper,
  Button,
  Typography,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardActionArea,
  CardContent,
  IconButton,
  CircularProgress,
  Alert,
} from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import DescriptionIcon from "@mui/icons-material/Description";
import GridOnIcon from "@mui/icons-material/GridOn";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { isWithinInterval, format } from "date-fns";

import { databaseService } from "@/services/database.service";
import { fmtDate, fmtMoney } from "@/utilities/shared/format";
import { ACCENT_COLOR } from "@/utilities/shared/theme";
import {
  INSTITUTIONS,
  TX_TYPES,
  DB_NAMES,
  RESP_TYPES,
  type Transaction,
  type TxType,
  type DbName,
  type RespType,
} from "@/utilities/shared/types";

import SearchInput from "@/components/Input/SearchInput";
import DateInput, { type DateRange } from "@/components/Input/DateInput";
import FilterInput, { type FilterGroupDef } from "@/components/Input/FilterInput";
import AddButton from "@/components/Buttons/AddButton";
import DataTable, { type DataTableHeader } from "@/components/DataTable";
import TablePill, { type PillTone } from "@/components/DataTable/TablePill";
import TableActions from "@/components/DataTable/TableActions";
import Field from "@/components/Field";
import Header from "@/components/Header";

const HEADERS: DataTableHeader[] = [
  { key: "instid", title: "Inst ID" },
  { key: "createdate", title: "Date / Time" },
  { key: "rrn", title: "RRN" },
  { key: "trantype", title: "Transaction Type" },
  // { key: "trace", title: "Trace" },
  { key: "issuercode", title: "Issuer" },
  { key: "provider", title: "Provider" },
  { key: "fromaccount", title: "From Account" },
  { key: "toaccount", title: "To Account" },
  // { key: "profileName", title: "Profile Name" },
  { key: "paymentName", title: "Payment Name" },
  { key: "amount", title: "Amount" },
  { key: "fee", title: "Fee" },
  { key: "currency", title: "Currency" },
  { key: "responsecode", title: "RSP" },
  { key: "responsemessage", title: "RSP_INFO" },
  { key: "action", title: "Actions" },
];

const TX_TONE: Record<string, PillTone> = {
  "00": "green",
  "0": "green",
};

const SEARCHABLE_KEYS: (keyof Transaction)[] = [
  "instid",
  "paymentserno",
  "trantype",
  "trace",
  "issuercode",
  "provider",
  "fromaccount",
  "toaccount",
  "toaccountname",
  "rrn",
  "paymentName",
  "profileName",
];

export default function MainApplication() {
  const defaultDateRange = useMemo(
    () => ({
      start: new Date("2025-06-01"),
      end: new Date("2026-06-18"),
    }),
    [],
  );

  const [dateRange, setDateRange] = useState<DateRange | null>(defaultDateRange);
  const [search, setSearch] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<TxType[]>([]);
  const [selectedDbs, setSelectedDbs] = useState<DbName[]>([]);
  const [selectedInsts, setSelectedInsts] = useState<string[]>([]);

  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["transactions", dateRange, search, selectedTypes, selectedInsts],
    queryFn: () =>
      databaseService.getTransactions({
        start_date: dateRange?.start ? format(dateRange.start, "yyyy-MM-dd") : undefined,
        end_date: dateRange?.end ? format(dateRange.end, "yyyy-MM-dd") : undefined,
        trantype: selectedTypes.length > 0 ? selectedTypes.join(",") : undefined,
        search: search || undefined,
        page: 1,
        page_size: 500, // Reduced from 1000 to a safer value that still covers 96
        sort_by: "createdate",
        sort_order: "desc",
      }),
  });

  const transactions = response?.items ?? [];
  const pagination = response?.pagination;

  const [exportOpen, setExportOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<"csv" | "xlsx" | null>(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [viewTx, setViewTx] = useState<Transaction | null>(null);

  const toggle = <T extends string>(arr: T[], val: T, setter: (v: T[]) => void) => {
    setter(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  };

  const filterGroups: FilterGroupDef[] = [
    {
      label: "Transaction Type",
      options: TX_TYPES,
      selected: selectedTypes,
      onToggle: (v) => toggle(selectedTypes, v as TxType, setSelectedTypes),
    },
    {
      label: "DB Name",
      options: DB_NAMES,
      selected: selectedDbs,
      onToggle: (v) => toggle(selectedDbs, v as DbName, setSelectedDbs),
    },
    {
      label: "Institution",
      options: INSTITUTIONS,
      selected: selectedInsts,
      onToggle: (v) => toggle(selectedInsts, v, setSelectedInsts),
    },
  ];

  const resetFilters = () => {
    setSelectedTypes([]);
    setSelectedDbs([]);
    setSelectedInsts([]);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return transactions.filter((t) => {
      if (dateRange && !isWithinInterval(t.createdate, dateRange)) return false;
      if (selectedTypes.length && !selectedTypes.includes(t.trantype)) return false;
      if (selectedInsts.length && !selectedInsts.includes(t.inst)) return false;
      if (q) {
        const hay = [...SEARCHABLE_KEYS.map((k) => String(t[k])), fmtDate(t.createdate)]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [transactions, search, dateRange, selectedTypes, selectedInsts]);

  const handleExportConfirm = async () => {
    if (!exportFormat) return;

    setExportLoading(true);
    setExportError(null);

    try {
      const blob = await databaseService.exportTransactions(exportFormat, {
        start_date: dateRange?.start ? format(dateRange.start, "yyyy-MM-dd") : undefined,
        end_date: dateRange?.end ? format(dateRange.end, "yyyy-MM-dd") : undefined,
        trantype: selectedTypes.length > 0 ? selectedTypes.join(",") : undefined,
        page: 1,
        page_size: 500,
        sort_by: "createdate",
        sort_order: "desc",
      });

      // Create a download link and trigger it
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const timestamp = new Date().toISOString().split("T")[0];
      link.download = `transactions_${timestamp}.${exportFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setExportOpen(false);
      setExportFormat(null);
    } catch (err) {
      setExportError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setExportLoading(false);
    }
  };

  const renderCell = (key: string, t: Transaction) => {
    switch (key) {
      case "createdate":
        return fmtDate(t.createdate);
      case "trantype":
        return t.trantype;
      case "responsemessage":
        return <TablePill state={t.responsemessage} tone={TX_TONE[t.responsecode] || "red"} />;
      case "amount":
        return t.amount;
      case "fee":
        return fmtMoney(t.fee);
      case "action":
        return (
          <TableActions
            actions={[{ key: "view", title: "View", icon: <VisibilityRoundedIcon /> }]}
            onAction={() => setViewTx(t)}
          />
        );
      default:
        return undefined;
    }
  };

  return (
    <Box sx={{ bgcolor: "#f5f6f8", minHeight: "100vh" }}>
      <Header title="Transaction Portal" />
      <Box sx={{ p: 3, pt: "88px" }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error instanceof Error ? error.message : "Failed to load transactions"}
          </Alert>
        )}

        {/* Toolbar */}
        <Paper elevation={1} sx={{ p: 2, mb: 2, border: "1px solid", borderColor: "divider" }}>
          <Stack
            direction="row"
            spacing={1.5}
            sx={{ alignItems: "center", flexWrap: "wrap", rowGap: 1.5 }}
          >
            <SearchInput
              placeholder="Search transactions..."
              value={search}
              onChange={setSearch}
              onClear={() => setSearch("")}
            />
            <DateInput
              color={ACCENT_COLOR}
              onChange={setDateRange}
              defaultValue={defaultDateRange}
            />
            <FilterInput color={ACCENT_COLOR} groups={filterGroups} onReset={resetFilters} />
            <Box sx={{ flex: 1 }} />
            <AddButton
              text="Export"
              color={ACCENT_COLOR}
              icon={<FileDownloadIcon />}
              onClick={() => setExportOpen(true)}
            />
          </Stack>
        </Paper>

        {/* Table */}
        <Paper elevation={1} sx={{ p: 2, border: "1px solid", borderColor: "divider" }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {filtered.length} result{filtered.length === 1 ? "" : "s"}
          </Typography>
          {isLoading ? (
            <Box sx={{ display: "grid", placeItems: "center", py: 6 }}>
              <CircularProgress size={28} />
            </Box>
          ) : (
            <DataTable
              headers={HEADERS}
              rows={filtered}
              getRowId={(t) => t.instid}
              renderCell={renderCell}
              onRowClick={setViewTx}
              color={ACCENT_COLOR}
              rowsPerPage={10}
              emptyMessage="No transactions match the current filters."
            />
          )}
        </Paper>

        {/* Export Dialog */}
        <Dialog open={exportOpen} onClose={() => setExportOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Export Transactions</DialogTitle>
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
                  {
                    key: "csv",
                    label: "Export as CSV",
                    icon: <DescriptionIcon fontSize="large" />,
                  },
                  {
                    key: "xlsx",
                    label: "Export as XLSX",
                    icon: <GridOnIcon fontSize="large" />,
                  },
                ] as const
              ).map((opt) => (
                <Card
                  key={opt.key}
                  variant="outlined"
                  sx={{
                    flex: 1,
                    borderColor: exportFormat === opt.key ? "primary.main" : "divider",
                    borderWidth: exportFormat === opt.key ? 2 : 1,
                    transition: "all 0.15s",
                  }}
                >
                  <CardActionArea onClick={() => setExportFormat(opt.key)}>
                    <CardContent sx={{ textAlign: "center", py: 3 }}>
                      {opt.icon}
                      <Typography sx={{ mt: 1 }}>{opt.label}</Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
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
              onClick={handleExportConfirm}
            >
              {exportLoading ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
              {exportLoading ? "Exporting..." : "Confirm"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* View Modal */}
        <Dialog
          open={Boolean(viewTx)}
          onClose={() => setViewTx(null)}
          maxWidth="md"
          fullWidth
          slotProps={{ paper: { sx: { borderRadius: 2 } } }}
        >
          {viewTx && (
            <Box sx={{ p: 3 }}>
              {/* Header */}
              <Stack
                direction="row"
                sx={{ justifyContent: "space-between", alignItems: "flex-start", mb: 2.5 }}
              >
                <Box>
                  <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#353F50" }}>
                    Transaction Details
                  </Typography>
                  <Typography sx={{ fontSize: 13, color: "#7f91a8", mt: 0.5 }}>
                    {viewTx.rrn} · {viewTx.instid} · {fmtDate(viewTx.createdate)}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                  <TablePill
                    state={viewTx.trantype}
                    // tone={TX_TONE[viewTx.transactionType]}
                  />
                  <TablePill state={viewTx.responsemessage} />
                  <IconButton size="small" onClick={() => setViewTx(null)}>
                    <CloseRoundedIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Stack>

              <DetailSection title="Overview">
                <Field label="Inst ID" value={viewTx.instid} />
                <Field label="Date / Time" value={fmtDate(viewTx.createdate)} />
                <Field label="Payment Ref" value={viewTx.rrn} />
                <Field label="Trace" value={viewTx.trace} />
              </DetailSection>

              <DetailSection title="Parties">
                <Field label="Issuer" value={viewTx.issuercode} />
                <Field label="Provider" value={viewTx.provider} />
                <Field label="Institution" value={viewTx.inst} />
              </DetailSection>

              <DetailSection title="Accounts">
                <Field label="From Account" value={viewTx.fromaccount} />
                <Field label="To Account" value={viewTx.toaccount} />
                <Field label="To Account Name" value={viewTx.toaccountname} />
                <Field label="RRN" value={viewTx.rrn} />
              </DetailSection>

              <DetailSection title="Amounts & System">
                <Field label="Amount" value={viewTx.amount} />
                <Field label="Fee" value={fmtMoney(viewTx.fee)} />
                {/* <Field label="DB Name" value={viewTx.dbName} /> */}
                <Field label="Response Type" value={viewTx.responsemessage} />
              </DetailSection>

              <Stack direction="row" sx={{ justifyContent: "flex-end", mt: 1 }}>
                <Button onClick={() => setViewTx(null)}>Close</Button>
              </Stack>
            </Box>
          )}
        </Dialog>
      </Box>
    </Box>
  );
}

function DetailSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography
        sx={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 0.6,
          textTransform: "uppercase",
          color: "#7f91a8",
          mb: 1,
        }}
      >
        {title}
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          rowGap: 1.5,
          columnGap: 3,
          p: 2,
          bgcolor: "#f8f9fb",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1.5,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
