import CircleIcon from "@mui/icons-material/Circle";
import "./table.css";

export type PillTone = "green" | "orange" | "red" | "blue" | "black";

const GREEN = new Set(["Success", "ACTIVE", "PAID", "Paid", "Approved", "Sent", "Posted"]);
const ORANGE = new Set(["Pending", "Processing", "NEW", "Staged", "Draft"]);

function toneFor(state: string): PillTone {
  if (GREEN.has(state)) return "green";
  if (ORANGE.has(state)) return "orange";
  return "red";
}

interface TablePillProps {
  state: string;
  /** Override the auto-derived tone. */
  tone?: PillTone;
}

export default function TablePill({ state, tone }: TablePillProps) {
  return (
    <div className={`table-pill ${tone ?? toneFor(state)}`}>
      <CircleIcon />
      {state}
    </div>
  );
}
