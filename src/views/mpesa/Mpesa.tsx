import { useState } from "react";
import { Box, Paper, Typography } from "@mui/material";

import PageToolbar from "@/components/PageToolbar";
import DataTable, { type DataTableHeader } from "@/components/DataTable";
import TablePill from "@/components/DataTable/TablePill";
import { type DateRange } from "@/components/Input/DateInput";
import { type FilterGroupDef } from "@/components/Input/FilterInput";
import { ACCENT_COLOR } from "@/utilities/shared/theme";

const HEADERS: DataTableHeader[] = [
  { key: "timestamp", title: "Timestamp" },
  { key: "level", title: "Level" },
  { key: "source", title: "Source" },
  { key: "message", title: "Message" },
  { key: "status", title: "Status" },
];

const LEVEL_OPTIONS = ["INFO", "WARN", "ERROR", "DEBUG"] as const;

interface MpesaEntry {
  id: string;
  timestamp: string;
  level: string;
  source: string;
  message: string;
  status: string;
}

export default function Mpesa() {
  const [search, setSearch] = useState("");
  const [, setDateRange] = useState<DateRange | null>(null);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);

  // Rows will be populated from the API during integration.
  const rows: MpesaEntry[] = [];

  const filterGroups: FilterGroupDef[] = [
    {
      label: "Level",
      options: LEVEL_OPTIONS,
      selected: selectedLevels,
      onToggle: (value) =>
        setSelectedLevels((prev) =>
          prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value],
        ),
    },
  ];

  const renderCell = (key: string, row: MpesaEntry) => {
    if (key === "status") return <TablePill state={row.status} />;
    return undefined;
  };

  return (
    <Box>
      <PageToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search logs..."
        onDateChange={setDateRange}
        filterGroups={filterGroups}
        onFilterReset={() => setSelectedLevels([])}
        onExport={() => {
          // TODO: wire up to the Mpesa export API.
        }}
      />

      <Paper elevation={1} sx={{ p: 2, border: "1px solid", borderColor: "divider" }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {rows.length} result{rows.length === 1 ? "" : "s"}
        </Typography>
        <DataTable
          headers={HEADERS}
          rows={rows}
          getRowId={(r) => r.id}
          renderCell={renderCell}
          color={ACCENT_COLOR}
          rowsPerPage={10}
          emptyMessage="Coming up soon! This page will display Mpesa Transactions..."
        />
      </Paper>
    </Box>
  );
}
