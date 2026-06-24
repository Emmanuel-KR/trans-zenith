import type { ChangeEvent } from "react";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import "./input.css";

interface TextInputProps {
  id?: string;
  label?: string;
  placeholder?: string;
  input: string;
  handleInput: (e: ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  error?: boolean;
  errorMessage?: string;
  max?: number;
  min?: number;
  disabled?: boolean;
  required?: boolean;
  /** Visual variant: "blue" | "orange". */
  color?: string;
}

/** Labelled text input ported from the transfer-advise gateway. */
export default function TextInput({
  id,
  label,
  placeholder,
  input,
  handleInput,
  type = "text",
  error,
  errorMessage,
  max,
  min,
  disabled,
  required,
  color,
}: TextInputProps) {
  return (
    <div className="text-input-container">
      {label && (
        <span className={required ? "text-input-label display-inline" : "text-input-label"}>
          {label}
        </span>
      )}
      {required ? (
        <span className="text-input-label display-inline" style={{ color: "red" }}>
          {" "}
          *{" "}
        </span>
      ) : null}
      <input
        id={id}
        disabled={disabled}
        type={type}
        placeholder={placeholder}
        value={input}
        onChange={handleInput}
        maxLength={max}
        minLength={min}
        autoComplete={id === "code" ? "off" : "on"}
        className={error ? "text-input-container-error" : color ? `text-input-${color}` : undefined}
      />
      {error ? (
        <div className="text-input-error">
          <ErrorRoundedIcon />
          <span>{errorMessage}</span>
        </div>
      ) : null}
    </div>
  );
}
