import type { ReactNode } from "react";
import { Box, Typography } from "@mui/material";

interface FieldProps {
  label: string;
  value: ReactNode;
}

/** A labelled read-only value styled to match the DataTable palette. */
export default function Field({ label, value }: FieldProps) {
  return (
    <Box>
      <Typography
        sx={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 0.5,
          textTransform: "uppercase",
          color: "#7f91a8",
          mb: 0.5,
        }}
      >
        {label}
      </Typography>
      <Box sx={{ fontSize: 14, fontWeight: 600, color: "#353F50", wordBreak: "break-word" }}>
        {value}
      </Box>
    </Box>
  );
}
