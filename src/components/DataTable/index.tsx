import { useEffect, useState, type ReactNode } from "react";
import {
  styled,
  Table,
  TableBody,
  TableCell,
  tableCellClasses,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";

import TablePagination from "./TablePagination";
import AddContent from "@/components/NotFound/AddContent";
import { ACCENT_COLOR } from "@/utilities/shared/theme";
import "./table.css";

export interface DataTableHeader {
  key: string;
  title: string;
}

export interface DataTableProps<T> {
  headers: DataTableHeader[];
  rows: T[];
  getRowId: (row: T) => string;
  /** Custom cell renderer; falls back to row[key] when it returns undefined. */
  renderCell?: (key: string, row: T) => ReactNode;
  onRowClick?: (row: T) => void;
  color?: string;
  rowsPerPage?: number;
  emptyMessage?: ReactNode;
}

const StyledTableCell = styled(TableCell)(() => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: "#F3F4F6",
    color: "#353F50",
    fontFamily: `"Averta-Bolder", sans-serif`,
    fontWeight: 700,
    fontSize: 12,
    lineHeight: "14px",
    padding: "10px 9px",
    whiteSpace: "nowrap",
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 12,
    fontFamily: `"Averta-Bold", sans-serif`,
    color: "#353F50",
    padding: "8px 9px",
  },
}));

export default function DataTable<T>({
  headers,
  rows,
  getRowId,
  renderCell,
  onRowClick,
  color = ACCENT_COLOR,
  rowsPerPage = 8,
  emptyMessage = "No results found.",
}: DataTableProps<T>) {
  const [page, setPage] = useState(1);
  const pages = Math.max(1, Math.ceil(rows.length / rowsPerPage));
  const currentPage = Math.min(page, pages);

  // Snap back to the first page whenever the underlying rows change.
  useEffect(() => {
    setPage(1);
  }, [rows]);

  if (rows.length === 0) {
    return (
      <div className="table-container">
        <AddContent
          text={emptyMessage}
          icon={<ErrorRoundedIcon style={{ fill: "#d32f2f" }} />}
          error
        />
      </div>
    );
  }

  const start = (currentPage - 1) * rowsPerPage;
  const pageRows = rows.slice(start, start + rowsPerPage);

  const cell = (key: string, row: T): ReactNode => {
    const custom = renderCell?.(key, row);
    if (custom !== undefined) return custom;
    return (row as Record<string, ReactNode>)[key];
  };

  return (
    <div className="table-container">
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {headers.map((header) => (
                <StyledTableCell key={header.key}>{header.title}</StyledTableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {pageRows.map((row) => (
              <TableRow
                key={getRowId(row)}
                hover={Boolean(onRowClick)}
                style={onRowClick ? { cursor: "pointer" } : undefined}
                onClick={() => onRowClick?.(row)}
              >
                {headers.map((header) => (
                  <StyledTableCell key={header.key}>{cell(header.key, row)}</StyledTableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination page={currentPage} pages={pages} color={color} onChange={setPage} />
    </div>
  );
}
