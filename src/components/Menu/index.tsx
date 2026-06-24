import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { ACCENT_COLOR } from "@/utilities/shared/theme";
import { MENU } from "./menu.config";
import "./menu.css";

/** Sidebar navigation, ported from the transfer-advise gateway menu. */
export default function Menu() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [hovered, setHovered] = useState(-1);

  const activeStyle = {
    borderLeftColor: ACCENT_COLOR,
    background: `${ACCENT_COLOR}1A`,
    color: ACCENT_COLOR,
  };

  const isActive = (path: string) => (path === "/" ? pathname === "/" : pathname.startsWith(path));

  return (
    <div className="menu-container">
      {MENU.map((item, index) => (
        <div
          key={item.key}
          className="menu-item-standalone"
          style={isActive(item.path) || hovered === index ? activeStyle : undefined}
          onClick={() => navigate(item.path)}
          onMouseEnter={() => setHovered(index)}
          onMouseLeave={() => setHovered(-1)}
        >
          {item.icon}
          {item.title}
        </div>
      ))}
    </div>
  );
}
