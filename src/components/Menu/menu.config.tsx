import type { ReactNode } from "react";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
// import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";

export interface MenuItem {
  key: string;
  title: string;
  path: string;
  icon: ReactNode;
}

/** Side-menu entries. Order here is the order shown in the sidebar. */
export const MENU: MenuItem[] = [
  {
    key: "disburse",
    title: "Disburse",
    path: "/",
    icon: <PaymentsRoundedIcon />,
  },
  {
    key: "wallets",
    title: "Wallets",
    path: "/wallets",
    icon: <AccountBalanceWalletRoundedIcon />,
  },
  {
    key: "merchants",
    title: "Merchants",
    path: "/merchants",
    icon: <StorefrontRoundedIcon />,
  },
  // {
  //   key: "shlog",
  //   title: "Shlog",
  //   path: "/shlog",
  //   icon: <ArticleRoundedIcon />,
  // },
];
