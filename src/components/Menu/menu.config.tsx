import type { ReactNode } from "react";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";

export interface MenuItem {
  key: string;
  title: string;
  path: string;
  icon: ReactNode;
}

/** Side-menu entries. Order here is the order shown in the sidebar. */
export const MENU: MenuItem[] = [
  {
    key: "transaxis",
    title: "Transaxis",
    path: "/",
    icon: <ReceiptLongRoundedIcon />,
  },
  {
    key: "merchants",
    title: "Merchants",
    path: "/merchants",
    icon: <StorefrontRoundedIcon />,
  },
  {
    key: "shlog",
    title: "Shlog",
    path: "/shlog",
    icon: <ArticleRoundedIcon />,
  },
];
