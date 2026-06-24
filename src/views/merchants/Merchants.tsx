import { useState } from "react";
import { Box, Paper, Typography } from "@mui/material";

import PageToolbar from "@/components/PageToolbar";
import DataTable, { type DataTableHeader } from "@/components/DataTable";
import TablePill from "@/components/DataTable/TablePill";
import { type DateRange } from "@/components/Input/DateInput";
import { type FilterGroupDef } from "@/components/Input/FilterInput";
import { ACCENT_COLOR } from "@/utilities/shared/theme";

const HEADERS: DataTableHeader[] = [
  { key: "merchantId", title: "Merchant ID" },
  { key: "name", title: "Name" },
  { key: "email", title: "Email" },
  { key: "phone", title: "Phone" },
  { key: "status", title: "Status" },
  { key: "createdAt", title: "Created" },
];

const STATUS_OPTIONS = ["Active", "Suspended", "Pending"] as const;

interface Merchant {
  merchantId: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  createdAt: string;
}

export default function Merchants() {
  const [search, setSearch] = useState("");
  const [, setDateRange] = useState<DateRange | null>(null);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

  // Rows will be populated from the API during integration.
  const rows: Merchant[] = [];

  const filterGroups: FilterGroupDef[] = [
    {
      label: "Status",
      options: STATUS_OPTIONS,
      selected: selectedStatuses,
      onToggle: (value) =>
        setSelectedStatuses((prev) =>
          prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value],
        ),
    },
  ];

  const renderCell = (key: string, row: Merchant) => {
    if (key === "status") return <TablePill state={row.status} />;
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
        onFilterReset={() => setSelectedStatuses([])}
        onExport={() => {
          // TODO: wire up to the merchants export API.
        }}
      />

      <Paper elevation={1} sx={{ p: 2, border: "1px solid", borderColor: "divider" }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {rows.length} result{rows.length === 1 ? "" : "s"}
        </Typography>
        <DataTable
          headers={HEADERS}
          rows={rows}
          getRowId={(r) => r.merchantId}
          renderCell={renderCell}
          color={ACCENT_COLOR}
          rowsPerPage={10}
          emptyMessage="Oops, you currently do not have any merchants in the system"
        />
      </Paper>
    </Box>
  );
}
