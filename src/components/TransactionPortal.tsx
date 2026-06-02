import { useMemo, useState } from "react";
import {
  Box, Paper, Select, MenuItem, FormControl, InputLabel, TextField,
  InputAdornment, IconButton, Button, Badge, Popover, Checkbox,
  FormControlLabel, FormGroup, Typography, Table, TableHead, TableBody,
  TableRow, TableCell, TableContainer, Chip, Pagination, Dialog,
  DialogTitle, DialogContent, DialogActions, Card, CardActionArea,
  CardContent, Stack, Divider,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import FilterListIcon from "@mui/icons-material/FilterList";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DescriptionIcon from "@mui/icons-material/Description";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { format, startOfDay, subDays, isWithinInterval, endOfDay } from "date-fns";
import {
  MOCK_TRANSACTIONS, INSTITUTIONS, type Transaction, type TxType,
  type DbName, type RespType,
} from "@/lib/mockTransactions";

type DatePreset = "all" | "today" | "7" | "30" | "60" | "custom";

const TX_COLORS: Record<TxType, "success" | "error" | "warning" | "info"> = {
  Credit: "success", Debit: "error", Reversal: "warning", Transfer: "info",
};

const TX_TYPES: TxType[] = ["Credit", "Debit", "Reversal", "Transfer"];
const DB_NAMES: DbName[] = ["MainDB", "ArchiveDB", "BackupDB"];
const RESP_TYPES: RespType[] = ["Success", "Failed", "Pending", "Timeout"];

const fmtMoney = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

const fmtDate = (d: Date) => format(d, "dd/MM/yyyy HH:mm:ss");

export default function TransactionPortal() {
  const [datePreset, setDatePreset] = useState<DatePreset>("all");
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [search, setSearch] = useState("");
  const [filterAnchor, setFilterAnchor] = useState<HTMLElement | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<TxType[]>([]);
  const [selectedDbs, setSelectedDbs] = useState<DbName[]>([]);
  const [selectedResps, setSelectedResps] = useState<RespType[]>([]);
  const [selectedInsts, setSelectedInsts] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<"csv" | "pdf" | null>(null);
  const [viewTx, setViewTx] = useState<Transaction | null>(null);

  const filterCount =
    selectedTypes.length + selectedDbs.length + selectedResps.length + selectedInsts.length;

  const dateInterval = useMemo(() => {
    const now = new Date();
    switch (datePreset) {
      case "today": return { start: startOfDay(now), end: endOfDay(now) };
      case "7": return { start: startOfDay(subDays(now, 7)), end: endOfDay(now) };
      case "30": return { start: startOfDay(subDays(now, 30)), end: endOfDay(now) };
      case "60": return { start: startOfDay(subDays(now, 60)), end: endOfDay(now) };
      case "custom":
        if (fromDate && toDate) return { start: startOfDay(fromDate), end: endOfDay(toDate) };
        return null;
      default: return null;
    }
  }, [datePreset, fromDate, toDate]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return MOCK_TRANSACTIONS.filter((t) => {
      if (dateInterval && !isWithinInterval(t.dateTime, dateInterval)) return false;
      if (selectedTypes.length && !selectedTypes.includes(t.transactionType)) return false;
      if (selectedDbs.length && !selectedDbs.includes(t.dbName)) return false;
      if (selectedResps.length && !selectedResps.includes(t.responseType)) return false;
      if (selectedInsts.length && !selectedInsts.includes(t.institution)) return false;
      if (q) {
        const hay = [
          t.instId, fmtDate(t.dateTime), t.paymentRef, t.transactionType, t.trace,
          t.issuer, t.provider, t.fromAccount, t.toAccount, t.toAccountName, t.rrn,
          t.amount.toFixed(2), t.fee.toFixed(2),
        ].join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [search, dateInterval, selectedTypes, selectedDbs, selectedResps, selectedInsts]);

  const pageSize = 20;
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * pageSize;
  const pageRows = filtered.slice(start, start + pageSize);
  const showingFrom = filtered.length ? start + 1 : 0;
  const showingTo = Math.min(start + pageSize, filtered.length);

  // Reset page on any filter change
  const resetPage = () => setPage(1);

  const dateActive = datePreset !== "all";

  const toggle = <T,>(arr: T[], val: T, setter: (v: T[]) => void) => {
    setter(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
    resetPage();
  };

  const resetFilterPanel = () => {
    setSelectedTypes([]); setSelectedDbs([]); setSelectedResps([]); setSelectedInsts([]);
    resetPage();
  };

  const resetDate = () => {
    setDatePreset("all"); setFromDate(null); setToDate(null); resetPage();
  };

  const handleExportConfirm = () => {
    if (exportFormat === "csv") console.log("Export as CSV", filtered);
    if (exportFormat === "pdf") console.log("Export as PDF", filtered);
    setExportOpen(false); setExportFormat(null);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3, bgcolor: "#f5f6f8", minHeight: "100vh" }}>
        <Typography variant="h5" fontWeight={600} mb={2}>
          Transaction Reporting Portal
        </Typography>

        {/* Toolbar */}
        <Paper elevation={1} sx={{ p: 2, mb: 2, border: "1px solid", borderColor: "divider" }}>
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="nowrap">
            {/* Date */}
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <FormControl size="small" sx={{ minWidth: 170 }}>
                <InputLabel>Date</InputLabel>
                <Select
                  label="Date"
                  value={datePreset}
                  onChange={(e) => { setDatePreset(e.target.value as DatePreset); resetPage(); }}
                >
                  <MenuItem value="all">All Dates</MenuItem>
                  <MenuItem value="today">Today</MenuItem>
                  <MenuItem value="7">Last 7 Days</MenuItem>
                  <MenuItem value="30">Last 30 Days</MenuItem>
                  <MenuItem value="60">Last 60 Days</MenuItem>
                  <MenuItem value="custom">Custom Range</MenuItem>
                </Select>
              </FormControl>
              {dateActive && (
                <IconButton size="small" onClick={resetDate} title="Reset date filter">
                  <CloseIcon fontSize="small" />
                </IconButton>
              )}
            </Stack>

            {datePreset === "custom" && (
              <Stack direction="row" spacing={1}>
                <DatePicker
                  label="From"
                  value={fromDate}
                  onChange={(d) => { setFromDate(d); resetPage(); }}
                  views={["year", "month", "day"]}
                  slotProps={{ textField: { size: "small", sx: { width: 160 } } }}
                />
                <DatePicker
                  label="To"
                  value={toDate}
                  onChange={(d) => { setToDate(d); resetPage(); }}
                  views={["year", "month", "day"]}
                  slotProps={{ textField: { size: "small", sx: { width: 160 } } }}
                />
              </Stack>
            )}

            {/* Search */}
            <TextField
              size="small"
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); resetPage(); }}
              sx={{ flex: 1, minWidth: 240 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: search ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => { setSearch(""); resetPage(); }}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }}
            />

            {/* Filters */}
            <Badge badgeContent={filterCount} color="primary">
              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                onClick={(e) => setFilterAnchor(e.currentTarget)}
              >
                Filters
              </Button>
            </Badge>

            {/* Export */}
            <Button
              variant="contained"
              startIcon={<FileDownloadIcon />}
              onClick={() => setExportOpen(true)}
            >
              Export
            </Button>
          </Stack>
        </Paper>

        {/* Table */}
        <Paper elevation={1} sx={{ border: "1px solid", borderColor: "divider" }}>
          <TableContainer sx={{ maxHeight: "calc(100vh - 320px)" }}>
            <Table stickyHeader size="small" sx={{ "& td, & th": { fontSize: "0.9rem" } }}>
              <TableHead>
                <TableRow>
                  {[
                    "Inst ID", "Date / Time", "Payment Ref", "Transaction Type", "Trace",
                    "Issuer", "Provider", "From Account", "To Account", "To Account Name",
                    "RRN", "Amount", "Fee", "Actions",
                  ].map((h) => (
                    <TableCell key={h} sx={{ fontWeight: 600, bgcolor: "background.paper", whiteSpace: "nowrap" }}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {pageRows.map((t, idx) => (
                  <TableRow
                    key={t.instId}
                    sx={{ "&:nth-of-type(odd)": { bgcolor: "action.hover" } }}
                  >
                    <TableCell>{t.instId}</TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>{fmtDate(t.dateTime)}</TableCell>
                    <TableCell>{t.paymentRef}</TableCell>
                    <TableCell>
                      <Chip
                        label={t.transactionType}
                        color={TX_COLORS[t.transactionType]}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{t.trace}</TableCell>
                    <TableCell>{t.issuer}</TableCell>
                    <TableCell>{t.provider}</TableCell>
                    <TableCell>{t.fromAccount}</TableCell>
                    <TableCell>{t.toAccount}</TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>{t.toAccountName}</TableCell>
                    <TableCell>{t.rrn}</TableCell>
                    <TableCell>{fmtMoney(t.amount)}</TableCell>
                    <TableCell>{fmtMoney(t.fee)}</TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => setViewTx(t)}>
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {!pageRows.length && (
                  <TableRow>
                    <TableCell colSpan={14} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">No transactions match the current filters.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Pagination */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" mt={2}>
          <Typography variant="body2" color="text.secondary">
            Showing {showingFrom}–{showingTo} of {filtered.length} results
          </Typography>
          <Pagination
            count={pageCount}
            page={currentPage}
            onChange={(_, p) => setPage(p)}
            variant="outlined"
            shape="rounded"
            color="primary"
          />
        </Stack>

        {/* Filter Popover */}
        <Popover
          open={Boolean(filterAnchor)}
          anchorEl={filterAnchor}
          onClose={() => setFilterAnchor(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          slotProps={{ paper: { sx: { p: 2, width: 520 } } }}
        >
          <Stack direction="row" spacing={3} flexWrap="wrap">
            <FilterGroup title="Transaction Type" options={TX_TYPES} selected={selectedTypes}
              onToggle={(v) => toggle(selectedTypes, v, setSelectedTypes)} />
            <FilterGroup title="DB Name" options={DB_NAMES} selected={selectedDbs}
              onToggle={(v) => toggle(selectedDbs, v, setSelectedDbs)} />
            <FilterGroup title="Response Type" options={RESP_TYPES} selected={selectedResps}
              onToggle={(v) => toggle(selectedResps, v, setSelectedResps)} />
            <FilterGroup title="Institution" options={INSTITUTIONS} selected={selectedInsts}
              onToggle={(v) => toggle(selectedInsts, v, setSelectedInsts)} />
          </Stack>
          <Divider sx={{ my: 2 }} />
          <Stack direction="row" justifyContent="flex-end">
            <Button onClick={resetFilterPanel} size="small">Reset Filters</Button>
          </Stack>
        </Popover>

        {/* Export Dialog */}
        <Dialog open={exportOpen} onClose={() => setExportOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Export Transactions</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Choose a format to export the current filtered results.
            </Typography>
            <Stack direction="row" spacing={2}>
              {([
                { key: "csv", label: "Export as CSV", icon: <DescriptionIcon fontSize="large" /> },
                { key: "pdf", label: "Export as PDF", icon: <PictureAsPdfIcon fontSize="large" /> },
              ] as const).map((opt) => (
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
                      <Typography mt={1}>{opt.label}</Typography>
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
        <Dialog open={Boolean(viewTx)} onClose={() => setViewTx(null)} maxWidth="md" fullWidth>
          <DialogTitle>Transaction Details</DialogTitle>
          <DialogContent dividers>
            {viewTx && (
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", rowGap: 1.5, columnGap: 3 }}>
                <Field label="Inst ID" value={viewTx.instId} />
                <Field label="Date / Time" value={fmtDate(viewTx.dateTime)} />
                <Field label="Payment Ref" value={viewTx.paymentRef} />
                <Field label="Transaction Type" value={
                  <Chip label={viewTx.transactionType} color={TX_COLORS[viewTx.transactionType]} size="small" />
                } />
                <Field label="Trace" value={viewTx.trace} />
                <Field label="Issuer" value={viewTx.issuer} />
                <Field label="Provider" value={viewTx.provider} />
                <Field label="From Account" value={viewTx.fromAccount} />
                <Field label="To Account" value={viewTx.toAccount} />
                <Field label="To Account Name" value={viewTx.toAccountName} />
                <Field label="RRN" value={viewTx.rrn} />
                <Field label="Amount" value={fmtMoney(viewTx.amount)} />
                <Field label="Fee" value={fmtMoney(viewTx.fee)} />
                <Field label="DB Name" value={viewTx.dbName} />
                <Field label="Response Type" value={viewTx.responseType} />
                <Field label="Institution" value={viewTx.institution} />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewTx(null)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
}

function FilterGroup<T extends string>({
  title, options, selected, onToggle,
}: { title: string; options: readonly T[]; selected: T[]; onToggle: (v: T) => void }) {
  return (
    <Box sx={{ minWidth: 220 }}>
      <Typography variant="subtitle2" gutterBottom>{title}</Typography>
      <FormGroup>
        {options.map((opt) => (
          <FormControlLabel
            key={opt}
            control={
              <Checkbox
                size="small"
                checked={selected.includes(opt)}
                onChange={() => onToggle(opt)}
              />
            }
            label={opt}
          />
        ))}
      </FormGroup>
    </Box>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="body2">{value}</Typography>
    </Box>
  );
}
