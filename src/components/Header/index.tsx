import { useState } from "react";
import { Popover } from "@mui/material";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";

import { useAuth } from "@/utilities/shared/auth";
import { ACCENT_COLOR } from "@/utilities/shared/theme";
import iswLogo from "@/assets/Logos/isw.png";
import "./header.css";

function getInitials(name: string) {
  const parts = name
    .trim()
    .split(/[.\s_-]+/)
    .filter(Boolean);
  const chars = parts.length >= 2 ? parts[0][0] + parts[1][0] : name.slice(0, 2);
  return chars.toUpperCase();
}

function capitalize(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

interface HeaderProps {
  /** Brand text shown on the left of the bar. */
  title?: string;
  /** Subtitle under the user's name. */
  subtitle?: string;
}

export default function Header({
  title = "Transaction Portal",
  subtitle = "Signed in",
}: HeaderProps) {
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const name = user ?? "User";

  return (
    <header className="navi-header-container">
      <div className="logo-header-container">
        <img className="header-logo-img" src={iswLogo} alt="Interswitch" />
        <span className="header-logo-divider">|</span>
        <span>{title}</span>
      </div>

      <div className="app-header-container">
        <div className="header-user-details" onClick={(e) => setAnchorEl(e.currentTarget)}>
          <div
            className="header-avatar"
            style={{ background: `${ACCENT_COLOR}1A`, color: ACCENT_COLOR }}
          >
            {getInitials(name)}
          </div>
          <div className="header-user-text">
            <h1>Hi {capitalize(name)}</h1>
            <h2>{subtitle}</h2>
          </div>
          <KeyboardArrowDownRoundedIcon sx={{ color: "#5f738c", fontSize: 18 }} />
        </div>

        <Popover
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <div className="header-popover">
            <div
              className="header-popover-item"
              onClick={() => {
                setAnchorEl(null);
                logout();
              }}
            >
              <LogoutRoundedIcon /> Sign out
            </div>
          </div>
        </Popover>
      </div>
    </header>
  );
}
