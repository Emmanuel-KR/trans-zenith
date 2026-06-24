import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";

import Header from "@/components/Header";
import Menu from "@/components/Menu";

/** Authenticated shell: fixed top bar, sticky sidebar and the routed page. */
export default function Layout() {
  return (
    <Box sx={{ bgcolor: "#f5f6f8", minHeight: "100vh" }}>
      <Header title="Transaction Portal" />
      <Box
        sx={{
          display: "flex",
          gap: 3,
          p: 3,
          pt: "88px",
          alignItems: "flex-start",
        }}
      >
        <Box
          sx={{
            position: "sticky",
            top: 88,
            flexShrink: 0,
            alignSelf: "stretch",
            height: "calc(100vh - 112px)",
          }}
        >
          <Menu />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
