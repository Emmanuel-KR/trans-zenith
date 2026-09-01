import { useState } from "react";
import { Popover } from "@mui/material";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { PickerDay, type PickerDayProps } from "@mui/x-date-pickers/PickerDay";
import {
  startOfDay,
  endOfDay,
  subDays,
  addDays,
  isSameDay,
  isBefore,
  isWithinInterval,
  startOfYear,
  endOfYear,
  min as minDate,
  format,
} from "date-fns";

import AppFormButton from "@/components/Buttons/AppFormButton";
import { ACCENT_COLOR } from "@/utilities/shared/theme";
import "./input.css";

export interface DateRange {
  start: Date;
  end: Date;
}

const PRESETS = [
  "All Dates",
  "Today",
  "Last 7 days",
  "Last 30 days",
  "Last 60 days",
  "Custom",
] as const;
type Preset = (typeof PRESETS)[number];

const PRESET_DAYS: Partial<Record<Preset, number>> = {
  "Last 7 days": 7,
  "Last 30 days": 30,
  "Last 60 days": 60,
};

const CUSTOM_OPTIONS = [
  { label: "Date Range (Max 90 Days)", value: "range" },
  { label: "Yearly", value: "year" },
] as const;
type CustomValue = "range" | "year" | "";

const MIN_YEAR = new Date(2024, 0, 1);
const MAX_RANGE_DAYS = 90;

interface DateInputProps {
  color?: string;
  /** Called with the resolved interval (or null for "All Dates") and its label. */
  onChange: (range: DateRange | null, label: string) => void;
}

export default function DateInput({ color = ACCENT_COLOR, onChange }: DateInputProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [anchorElCustom, setAnchorElCustom] = useState<HTMLElement | null>(null);
  const [preset, setPreset] = useState<Preset>("All Dates");
  const [customValue, setCustomValue] = useState<CustomValue>("");
  const [active, setActive] = useState(false);
  const [hovered, setHovered] = useState<number>(-1);
  const [hoveredCustom, setHoveredCustom] = useState<number>(-1);
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);

  const open = Boolean(anchorEl);
  const openCustom = Boolean(anchorElCustom);
  const highlight = { background: `${color}1A`, color };

  const resolveRange = (p: Preset): DateRange | null => {
    const now = new Date();
    if (p === "All Dates") return { start: startOfDay(now), end: endOfDay(now) };
    if (p === "Today") return { start: startOfDay(now), end: endOfDay(now) };
    if (p === "Custom") {
        if (fromDate && toDate) return { start: startOfDay(fromDate), end: endOfDay(toDate) };
        return null;
      }
    const days = PRESET_DAYS[p] ?? 0;
    return { start: startOfDay(subDays(now, days)), end: endOfDay(now) };
  };

  const handlePresetClick = (p: Preset, e: React.MouseEvent<HTMLElement>) => {
    setPreset(p);
    setFromDate(null);
    setToDate(null);
    setCustomValue("");
    if (p === "Custom") setAnchorElCustom(e.currentTarget);
  };

  const handleCustomOption = (value: CustomValue) => {
    setCustomValue(value);
    setFromDate(null);
    setToDate(null);
    setAnchorElCustom(null);
  };

  // Range selection: first click sets start, second sets end (auto-ordered).
  const handleDayClick = (day: Date | null) => {
    if (!day) return;
    if (!fromDate || (fromDate && toDate)) {
      setFromDate(day);
      setToDate(null);
    } else if (isBefore(day, fromDate)) {
      setToDate(fromDate);
      setFromDate(day);
    } else {
      setToDate(day);
    }
  };

  // Yearly: a chosen year resolves to the whole year, capped at today.
  const handleYearClick = (year: Date | null) => {
    if (!year) return;
    const now = new Date();
    const isCurrentYear = year.getFullYear() === now.getFullYear();
    setFromDate(startOfYear(year));
    setToDate(isCurrentYear ? endOfDay(now) : endOfYear(year));
  };

  const handleApply = () => {
    const range = resolveRange(preset);
    onChange(range, preset);
    setActive(range !== null);
    setAnchorEl(null);
  };

  const handleReset = () => {
    setPreset("All Dates");
    setCustomValue("");
    setFromDate(null);
    setToDate(null);
    const todayRange = { start: startOfDay(new Date()), end: endOfDay(new Date()) };
    setActive(true);
    onChange(todayRange, "All Dates");
    setAnchorEl(null);
  };

  const applyValid =
    preset !== "Custom" || (customValue !== "" && fromDate !== null && toDate !== null);

  // Cap the range calendar at 90 days from the chosen start, never in the future.
  const today = endOfDay(new Date());
  const rangeMaxDate =
    customValue === "range" && fromDate && !toDate
      ? minDate([addDays(fromDate, MAX_RANGE_DAYS), today])
      : today;

  // Day cell that highlights the selected range.
  const RangeDay = (props: PickerDayProps) => {
    const day = props.day as Date;
    const isStart = Boolean(fromDate && isSameDay(day, fromDate));
    const isEnd = Boolean(toDate && isSameDay(day, toDate));
    const inRange = Boolean(
      fromDate &&
      toDate &&
      isWithinInterval(day, { start: startOfDay(fromDate), end: endOfDay(toDate) }),
    );
    const isEndpoint = isStart || isEnd;

    return (
      <PickerDay
        {...props}
        selected={isEndpoint}
        sx={{
          ...(inRange && !isEndpoint ? { backgroundColor: `${color}1F`, borderRadius: 0 } : {}),
          ...(isEndpoint
            ? {
                backgroundColor: `${color} !important`,
                color: "#fff",
                "&:hover": { backgroundColor: color },
              }
            : {}),
        }}
      />
    );
  };

  const rangeLabel =
    fromDate && toDate
      ? `${format(fromDate, "dd/MM/yyyy")} – ${format(toDate, "dd/MM/yyyy")}`
      : fromDate
        ? `${format(fromDate, "dd/MM/yyyy")} – …`
        : "Select a start and end date";

  const showCustomPicker = preset === "Custom" && !openCustom && customValue !== "";

  return (
    <div className="filter-date-input">
      <button
        onClick={(e) => setAnchorEl(e.currentTarget)}
        style={active ? { color, borderColor: color } : undefined}
      >
        <CalendarMonthRoundedIcon />
        {active ? preset : "Date"}
      </button>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <div className="filter-popover">
          <div className="filter-popover-header">
            <span className="filter-popover-title">Time Period</span>
            <CancelRoundedIcon
              className="filter-popover-close"
              style={{ fill: color }}
              onClick={() => setAnchorEl(null)}
            />
          </div>
          <div className="filter-date-options">
            {PRESETS.map((p, index) => (
              <span
                key={p}
                style={hovered === index || preset === p ? highlight : undefined}
                onMouseEnter={() => setHovered(index)}
                onMouseLeave={() => setHovered(-1)}
                onClick={(e) => handlePresetClick(p, e)}
              >
                {p}
              </span>
            ))}

            {/* Custom sub-popover: pick range mode or yearly */}
            <Popover
              open={openCustom}
              anchorEl={anchorElCustom}
              onClose={() => setAnchorElCustom(null)}
              anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
              transformOrigin={{ vertical: "top", horizontal: "center" }}
            >
              <div className="filter-date-options filter-date-suboptions">
                {CUSTOM_OPTIONS.map((option, index) => (
                  <span
                    key={option.value}
                    style={
                      hoveredCustom === index || customValue === option.value
                        ? highlight
                        : undefined
                    }
                    onMouseEnter={() => setHoveredCustom(index)}
                    onMouseLeave={() => setHoveredCustom(-1)}
                    onClick={() => handleCustomOption(option.value)}
                  >
                    {option.label}
                  </span>
                ))}
              </div>
            </Popover>

            {showCustomPicker && (
              <div className="filter-date-range">
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  {customValue === "year" ? (
                    <DateCalendar
                      views={["year", "month", "day"]}
                      openTo="year"
                      value={fromDate}
                      onChange={handleYearClick}
                      minDate={MIN_YEAR}
                      disableFuture
                      sx={{ width: 290, maxHeight: 260 }}
                    />
                  ) : (
                    <div style={{ display: "flex", gap: 12 }}>
                      {/* Year quick-jump selects */}
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <span className="filter-date-range-label">From</span>
                        <select
                          aria-label="From year"
                          value={fromDate ? fromDate.getFullYear() : ""}
                          onChange={(e) => {
                            const y = Number(e.target.value);
                            if (!Number.isNaN(y)) setFromDate(new Date(y, 0, 1));
                          }}
                          style={{ marginBottom: 8 }}
                        >
                          <option value="">Jump to year</option>
                          {Array.from({ length: new Date().getFullYear() - MIN_YEAR.getFullYear() + 1 }, (_, i) =>
                            MIN_YEAR.getFullYear() + i,
                          ).reverse().map((yr) => (
                            <option key={yr} value={yr}>
                              {yr}
                            </option>
                          ))}
                        </select>
                        <DateCalendar
                          views={["day", "month", "year"]}
                          value={fromDate}
                          onChange={(d) => d && setFromDate(d)}
                          disableFuture
                          maxDate={today}
                          sx={{ width: 220, maxHeight: 300 }}
                        />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <span className="filter-date-range-label">To</span>
                        <select
                          aria-label="To year"
                          value={toDate ? toDate.getFullYear() : ""}
                          onChange={(e) => {
                            const y = Number(e.target.value);
                            if (!Number.isNaN(y)) setToDate(new Date(y, 11, 31));
                          }}
                          style={{ marginBottom: 8 }}
                        >
                          <option value="">Jump to year</option>
                          {Array.from({ length: new Date().getFullYear() - MIN_YEAR.getFullYear() + 1 }, (_, i) =>
                            MIN_YEAR.getFullYear() + i,
                          ).reverse().map((yr) => (
                            <option key={yr} value={yr}>
                              {yr}
                            </option>
                          ))}
                        </select>
                        <DateCalendar
                          views={["day", "month", "year"]}
                          value={toDate ?? fromDate}
                          onChange={(d) => d && setToDate(d)}
                          disableFuture
                          minDate={fromDate ?? undefined}
                          maxDate={fromDate ? minDate([addDays(fromDate, MAX_RANGE_DAYS), today]) : today}
                          sx={{ width: 220, maxHeight: 300 }}
                        />
                      </div>
                    </div>
                  )}
                </LocalizationProvider>
              </div>
            )}
          </div>
          <div className="filter-buttons">
            <AppFormButton text="Reset" color="invert" action={handleReset} />
            <AppFormButton
              text="Apply"
              color={color}
              action={handleApply}
              validation={applyValid}
            />
          </div>
        </div>
      </Popover>
    </div>
  );
}
