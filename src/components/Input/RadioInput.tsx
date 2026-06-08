import { FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import { ACCENT_COLOR } from "@/utilities/shared/theme";
import "./input.css";

interface RadioInputProps {
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
  color?: string;
  label?: string;
}

export default function RadioInput({
  options,
  value,
  onChange,
  color = ACCENT_COLOR,
  label,
}: RadioInputProps) {
  return (
    <FormControl sx={label ? { mb: "10px" } : undefined}>
      {label ? <span className="input-label">{label}</span> : null}
      <RadioGroup row value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((option) => (
          <FormControlLabel
            key={option}
            value={option}
            label={option}
            slotProps={{ typography: { sx: { fontSize: 13 } } }}
            control={<Radio size="small" disableRipple sx={{ "&.Mui-checked": { color } }} />}
          />
        ))}
      </RadioGroup>
    </FormControl>
  );
}
