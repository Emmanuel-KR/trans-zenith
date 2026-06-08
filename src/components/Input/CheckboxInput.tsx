import { Checkbox } from "@mui/material";
import { ACCENT_COLOR } from "@/utilities/shared/theme";
import "./input.css";

interface CheckboxInputProps {
  checked: boolean;
  onChange: () => void;
  text?: string;
  color?: string;
  disabled?: boolean;
}

export default function CheckboxInput({
  checked,
  onChange,
  text,
  color = ACCENT_COLOR,
  disabled,
}: CheckboxInputProps) {
  return (
    <label className="checkbox-input">
      <Checkbox
        size="small"
        disableRipple
        disabled={disabled}
        checked={checked}
        onChange={onChange}
        sx={{ p: 0, color: "#9ca3af", "&.Mui-checked": { color } }}
      />
      {text ? <span className="checkbox-input-span">{text}</span> : null}
    </label>
  );
}
