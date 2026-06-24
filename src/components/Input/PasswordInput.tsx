import { useState, type ChangeEvent } from "react";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import "./input.css";

interface PasswordInputProps {
  id?: string;
  label?: string;
  placeholder?: string;
  input: string;
  handleInput: (e: ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  error?: boolean;
  errorMessage?: string;
}

/** Password input with show/hide toggle, ported from the transfer-advise gateway. */
export default function PasswordInput({
  id,
  label,
  placeholder,
  input,
  disabled,
  error,
  errorMessage,
  handleInput,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="text-input-container">
      {label && <span className="text-input-label">{label}</span>}
      <div className={error ? "text-input text-input-container-error" : "text-input"}>
        <input
          id={id}
          disabled={disabled}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          value={input}
          onChange={handleInput}
        />
        <div className="text-input-icon" onClick={() => setShowPassword((prev) => !prev)}>
          {showPassword ? <VisibilityOutlinedIcon /> : <VisibilityOffOutlinedIcon />}
        </div>
      </div>
      {error && errorMessage ? (
        <div className="text-input-error">
          <ErrorRoundedIcon />
          <span>{errorMessage}</span>
        </div>
      ) : null}
    </div>
  );
}
