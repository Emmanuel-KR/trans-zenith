import { Pagination, Stack } from "@mui/material";
import { ACCENT_COLOR } from "@/utilities/shared/theme";
import "./table.css";

interface TablePaginationProps {
  page: number;
  pages: number;
  color?: string;
  onChange: (page: number) => void;
}

export default function TablePagination({
  page,
  pages,
  color = ACCENT_COLOR,
  onChange,
}: TablePaginationProps) {
  return (
    <Stack spacing={2} className="table-pagination">
      <Pagination
        count={pages}
        page={page}
        variant="outlined"
        shape="rounded"
        showFirstButton
        showLastButton
        onChange={(_, value) => onChange(value)}
        sx={{
          "& .Mui-selected": {
            background: `${color} !important`,
            color: "#fff !important",
            borderColor: `${color} !important`,
          },
        }}
      />
    </Stack>
  );
}
