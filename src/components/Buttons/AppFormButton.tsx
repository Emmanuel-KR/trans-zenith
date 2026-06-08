import "./buttons.css";

interface AppFormButtonProps {
  text: string;
  /** Accent color, or "invert" for the white/outlined cancel style. */
  color: string;
  action: () => void;
  validation?: boolean;
  isLoading?: boolean;
}

/** Primary / cancel action button used inside filter popovers and forms. */
export default function AppFormButton({
  text,
  color,
  action,
  validation = true,
  isLoading = false,
}: AppFormButtonProps) {
  const invert = color === "invert";
  return (
    <button
      className={invert ? "form-button cancel" : "form-button"}
      style={invert ? undefined : { backgroundColor: color }}
      disabled={isLoading || !validation}
      onClick={() => action()}
    >
      <span>{text}</span>
    </button>
  );
}
