import { useState } from "react";
import { Popover } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";

import AppFormButton from "@/components/Buttons/AppFormButton";
import CheckboxInput from "./CheckboxInput";
import RadioInput from "./RadioInput";
import { ACCENT_COLOR } from "@/utilities/shared/theme";
import "./input.css";

export interface FilterGroupDef {
  label: string;
  options: readonly string[];
  selected: string[];
  onToggle: (value: string) => void;
}

interface FilterInputProps {
  color?: string;
  groups: FilterGroupDef[];
  onReset: () => void;
}

/** "Add Filter" trigger that opens a popover with a category radio + checkbox options. */
export default function FilterInput({ color = ACCENT_COLOR, groups, onReset }: FilterInputProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [activeLabel, setActiveLabel] = useState(groups[0]?.label ?? "");

  const open = Boolean(anchorEl);
  const activeGroup = groups.find((g) => g.label === activeLabel) ?? groups[0];
  const totalSelected = groups.reduce((sum, g) => sum + g.selected.length, 0);

  return (
    <div className="filter-input">
      <button
        onClick={(e) => setAnchorEl(e.currentTarget)}
        style={totalSelected > 0 ? { color, borderColor: color } : undefined}
      >
        {totalSelected > 0 ? (
          <>
            {`Filters (${totalSelected})`}
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </>
        ) : (
          <>
            Add Filter <AddRoundedIcon />
          </>
        )}
      </button>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <div className="filter-popover">
          <div className="filter-popover-header">
            <span className="filter-popover-title">Available Filters</span>
            <CancelRoundedIcon
              className="filter-popover-close"
              style={{ fill: color }}
              onClick={() => setAnchorEl(null)}
            />
          </div>
          <RadioInput
            color={color}
            options={groups.map((g) => g.label)}
            value={activeLabel}
            onChange={setActiveLabel}
          />
          <div className="filter-options">
            {activeGroup?.options.map((option) => (
              <CheckboxInput
                key={option}
                color={color}
                text={option}
                checked={activeGroup.selected.includes(option)}
                onChange={() => activeGroup.onToggle(option)}
              />
            ))}
          </div>
          <div className="filter-buttons">
            <AppFormButton text="Reset" color="invert" action={onReset} />
            <AppFormButton text="Apply" color={color} action={() => setAnchorEl(null)} />
          </div>
        </div>
      </Popover>
    </div>
  );
}
