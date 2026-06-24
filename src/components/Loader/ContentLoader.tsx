import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import { CircularProgress } from "@mui/material";

import { ACCENT_COLOR } from "@/utilities/shared/theme";
import "./loader.css";

interface ContentLoaderProps {
  /** When not loading: true shows a success icon, false shows an error icon. */
  state?: boolean;
  color?: string;
  loading: boolean;
  loadingText?: string;
  loadedText?: string;
  /** Container height. Defaults to the gateway's 50vh; override for modals. */
  height?: string | number;
}

/** Centered spinner / result indicator, ported from the transfer-advise gateway. */
export default function ContentLoader({
  state,
  color = ACCENT_COLOR,
  loading,
  loadingText,
  loadedText,
  height,
}: ContentLoaderProps) {
  return (
    <div className="content-loader-container" style={height ? { height } : undefined}>
      {!loading ? (
        <>
          {state === true ? (
            <CheckCircleOutlineRoundedIcon className="content-loader-svg" style={{ color }} />
          ) : (
            <ErrorOutlineRoundedIcon className="content-loader-svg" color="error" />
          )}
          <span>{loadedText || " "}</span>
        </>
      ) : (
        <>
          <CircularProgress style={{ color }} />
          <span>{loadingText}</span>
        </>
      )}
    </div>
  );
}
