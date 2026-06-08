import type { ReactNode } from "react";
import "./table.css";

export interface TableAction {
  key: string;
  icon: ReactNode;
  title?: string;
}

interface TableActionsProps {
  actions: TableAction[];
  onAction: (key: string) => void;
}

export default function TableActions({ actions, onAction }: TableActionsProps) {
  return (
    <div className="table-actions">
      {actions.map((a) => (
        <span
          key={a.key}
          title={a.title}
          onClick={(e) => {
            e.stopPropagation();
            onAction(a.key);
          }}
        >
          {a.icon}
        </span>
      ))}
    </div>
  );
}
