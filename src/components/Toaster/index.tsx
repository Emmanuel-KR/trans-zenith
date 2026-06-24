import Snackbar from "@mui/material/Snackbar";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import "./toaster.css";

interface ToasterProps {
  open: boolean;
  /** "true" => success, "false" => error, undefined => warning. */
  state?: "true" | "false";
  title?: string;
  message?: string;
  action: (open: boolean) => void;
  position?: "left" | "center" | "right";
}

/** Snackbar notification, ported from the transfer-advise gateway. */
export default function Toaster({
  open,
  state,
  title,
  message,
  action,
  position = "right",
}: ToasterProps) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      anchorOrigin={{ vertical: "top", horizontal: position }}
      onClose={() => action(false)}
    >
      <div
        className={
          state
            ? state === "true"
              ? "toaster-container toaster-success"
              : "toaster-container toaster-error"
            : "toaster-container toaster-warning"
        }
      >
        {state ? (
          state === "true" ? (
            <CheckCircleRoundedIcon color="success" />
          ) : (
            <ErrorRoundedIcon color="error" />
          )
        ) : null}
        <div className="toaster-content">
          <span className="toaster-title">{title}</span>
          <span>{message}</span>
        </div>
      </div>
    </Snackbar>
  );
}
