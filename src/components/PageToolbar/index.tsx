import { Paper, Stack, Box } from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";

import SearchInput from "@/components/Input/SearchInput";
import DateInput, { type DateRange } from "@/components/Input/DateInput";
import FilterInput, { type FilterGroupDef } from "@/components/Input/FilterInput";
import AddButton from "@/components/Buttons/AddButton";
import { ACCENT_COLOR } from "@/utilities/shared/theme";

export interface PageToolbarProps {
  /** Search box value and handler. */
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  /** Called with the resolved date interval (or null for "All Dates"). */
  onDateChange: (range: DateRange | null) => void;
  /** Filter categories shown in the "Add Filter" popover. */
  filterGroups: FilterGroupDef[];
  onFilterReset: () => void;
  /** Triggered by the Export button on the right. */
  onExport: () => void;
}

/**
 * Shared page toolbar: search input, date picker, filters on the left and an
 * Export button on the right. Reused by the Transaxis, Merchants and Shlog pages.
 */
export default function PageToolbar({
  search,
  onSearchChange,
  searchPlaceholder = "Search...",
  onDateChange,
  filterGroups,
  onFilterReset,
  onExport,
}: PageToolbarProps) {
  return (
    <Paper elevation={1} sx={{ p: 2, mb: 2, border: "1px solid", borderColor: "divider" }}>
      <Stack
        direction="row"
        spacing={1.5}
        sx={{ alignItems: "center", flexWrap: "wrap", rowGap: 1.5 }}
      >
        <SearchInput
          placeholder={searchPlaceholder}
          value={search}
          onChange={onSearchChange}
          onClear={() => onSearchChange("")}
        />
        <DateInput color={ACCENT_COLOR} onChange={onDateChange} />
        <FilterInput color={ACCENT_COLOR} groups={filterGroups} onReset={onFilterReset} />
        <Box sx={{ flex: 1 }} />
        <AddButton
          text="Export"
          color={ACCENT_COLOR}
          icon={<FileDownloadIcon />}
          onClick={onExport}
        />
      </Stack>
    </Paper>
  );
}
