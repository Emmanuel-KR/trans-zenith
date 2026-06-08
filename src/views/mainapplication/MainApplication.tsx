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
} from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import DescriptionIcon from "@mui/icons-material/Description";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { isWithinInterval } from "date-fns";

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
  { key: "instId", title: "Inst ID" },
  { key: "dateTime", title: "Date / Time" },
  { key: "paymentRef", title: "Payment Ref" },
  { key: "transactionType", title: "Transaction Type" },
  { key: "trace", title: "Trace" },
  { key: "issuer", title: "Issuer" },
  { key: "provider", title: "Provider" },
  { key: "fromAccount", title: "From Account" },
  { key: "toAccount", title: "To Account" },
  { key: "toAccountName", title: "To Account Name" },
  { key: "rrn", title: "RRN" },
  { key: "amount", title: "Amount" },
  { key: "fee", title: "Fee" },
  { key: "responseType", title: "Response" },
  { key: "action", title: "Actions" },
];

const TX_TONE: Record<TxType, PillTone> = {
  Credit: "green",
  Debit: "red",
  Reversal: "orange",
  Transfer: "blue",
};

const SEARCHABLE_KEYS: (keyof Transaction)[] = [
  "instId",
  "paymentRef",
  "transactionType",
  "trace",
  "issuer",
  "provider",
  "fromAccount",
  "toAccount",
  "toAccountName",
  "rrn",
];

export default function MainApplication() {
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: () => databaseService.getTransactions(),
  });

  const [dateRange, setDateRange] = useState<DateRange | null>(null);
  const [search, setSearch] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<TxType[]>([]);
  const [selectedDbs, setSelectedDbs] = useState<DbName[]>([]);
  const [selectedResps, setSelectedResps] = useState<RespType[]>([]);
  const [selectedInsts, setSelectedInsts] = useState<string[]>([]);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<"csv" | "pdf" | null>(null);
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
      label: "Response Type",
      options: RESP_TYPES,
      selected: selectedResps,
      onToggle: (v) => toggle(selectedResps, v as RespType, setSelectedResps),
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
    setSelectedResps([]);
    setSelectedInsts([]);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return transactions.filter((t) => {
      if (dateRange && !isWithinInterval(t.dateTime, dateRange)) return false;
      if (selectedTypes.length && !selectedTypes.includes(t.transactionType)) return false;
      if (selectedDbs.length && !selectedDbs.includes(t.dbName)) return false;
      if (selectedResps.length && !selectedResps.includes(t.responseType)) return false;
      if (selectedInsts.length && !selectedInsts.includes(t.institution)) return false;
      if (q) {
        const hay = [...SEARCHABLE_KEYS.map((k) => String(t[k])), fmtDate(t.dateTime)]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [transactions, search, dateRange, selectedTypes, selectedDbs, selectedResps, selectedInsts]);

  const handleExportConfirm = () => {
    if (exportFormat === "csv") console.log("Export as CSV", filtered);
    if (exportFormat === "pdf") console.log("Export as PDF", filtered);
    setExportOpen(false);
    setExportFormat(null);
  };

  const renderCell = (key: string, t: Transaction) => {
    switch (key) {
      case "dateTime":
        return fmtDate(t.dateTime);
      case "transactionType":
        return <TablePill state={t.transactionType} tone={TX_TONE[t.transactionType]} />;
      case "responseType":
        return <TablePill state={t.responseType} />;
      case "amount":
        return fmtMoney(t.amount);
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
        {/* <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: "#353F50" }}>
          Transaction Reporting Portal
        </Typography> */}

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
            <DateInput color={ACCENT_COLOR} onChange={setDateRange} />
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
              getRowId={(t) => t.instId}
              renderCell={renderCell}
              onRowClick={setViewTx}
              color={ACCENT_COLOR}
              emptyMessage="No transactions match the current filters."
            />
          )}
        </Paper>

        {/* Export Dialog */}
        <Dialog open={exportOpen} onClose={() => setExportOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Export Transactions</DialogTitle>
          <DialogContent>
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
                    key: "pdf",
                    label: "Export as PDF",
                    icon: <PictureAsPdfIcon fontSize="large" />,
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
            <Button onClick={() => setExportOpen(false)}>Cancel</Button>
            <Button variant="contained" disabled={!exportFormat} onClick={handleExportConfirm}>
              Confirm
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
                    {viewTx.paymentRef} · {viewTx.instId}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                  <TablePill
                    state={viewTx.transactionType}
                    tone={TX_TONE[viewTx.transactionType]}
                  />
                  <TablePill state={viewTx.responseType} />
                  <IconButton size="small" onClick={() => setViewTx(null)}>
                    <CloseRoundedIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Stack>

              <DetailSection title="Overview">
                <Field label="Inst ID" value={viewTx.instId} />
                <Field label="Date / Time" value={fmtDate(viewTx.dateTime)} />
                <Field label="Payment Ref" value={viewTx.paymentRef} />
                <Field label="Trace" value={viewTx.trace} />
              </DetailSection>

              <DetailSection title="Parties">
                <Field label="Issuer" value={viewTx.issuer} />
                <Field label="Provider" value={viewTx.provider} />
                <Field label="Institution" value={viewTx.institution} />
              </DetailSection>

              <DetailSection title="Accounts">
                <Field label="From Account" value={viewTx.fromAccount} />
                <Field label="To Account" value={viewTx.toAccount} />
                <Field label="To Account Name" value={viewTx.toAccountName} />
                <Field label="RRN" value={viewTx.rrn} />
              </DetailSection>

              <DetailSection title="Amounts & System">
                <Field label="Amount" value={fmtMoney(viewTx.amount)} />
                <Field label="Fee" value={fmtMoney(viewTx.fee)} />
                <Field label="DB Name" value={viewTx.dbName} />
                <Field label="Response Type" value={viewTx.responseType} />
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
