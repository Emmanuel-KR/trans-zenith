import type { ReactNode } from "react";
import AddRoundedIcon from "@mui/icons-material/AddRounded";

import AddButton from "@/components/Buttons/AddButton";
import { ACCENT_COLOR } from "@/utilities/shared/theme";
import "./notFound.css";

interface AddContentProps {
  text: ReactNode;
  /** When provided (with onAction), renders a call-to-action button. */
  title?: string;
  icon: ReactNode;
  color?: string;
  /** Error variant: drops the ring + plus badge (used for empty/not-found states). */
  error?: boolean;
  onAction?: () => void;
}

/** Centered empty / not-found state, ported from the transfer-advise gateway. */
export default function AddContent({
  text,
  title,
  icon,
  color = ACCENT_COLOR,
  error,
  onAction,
}: AddContentProps) {
  return (
    <div className="not-found-container">
      <div className="add-content-container">
        <div className="add-content-icon" style={{ border: error ? "none" : `5px solid ${color}` }}>
          {icon}
          {!error && (
            <AddRoundedIcon className="add-content-icon-plus" style={{ backgroundColor: color }} />
          )}
        </div>
        <span className="add-content-text">{text}</span>
        {title && onAction ? <AddButton text={title} color={color} onClick={onAction} /> : null}
      </div>
    </div>
  );
}
