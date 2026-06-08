import type { ReactNode } from "react";
import "./buttons.css";

interface AddButtonProps {
  text: string;
  color: string;
  icon?: ReactNode;
  onClick: () => void;
}

/** Solid, icon + label action button (e.g. Export, Add). */
export default function AddButton({ text, color, icon, onClick }: AddButtonProps) {
  return (
    <div className="add-button" style={{ backgroundColor: color }} onClick={onClick}>
      {icon}
      <span>{text}</span>
    </div>
  );
}
