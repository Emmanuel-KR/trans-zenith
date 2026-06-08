import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Alert, Stack } from "@mui/material";

import { useAuth } from "@/utilities/shared/auth";
import { ACCENT_COLOR } from "@/utilities/shared/theme";
import iswLogo from "@/assets/Logos/isw.png";
import "./login.css";

export default function SignIn() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login({ username, password });
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setSubmitting(false);
    }
  };

  const valid = username.trim() !== "" && password.trim() !== "";

  return (
    <div className="login-container">
      <div className="login-form-container">
        <form className="login-form" onSubmit={handleSubmit}>
          <img className="login-logo" src={iswLogo} alt="Interswitch" />
          <h1>Hello, Welcome</h1>
          <h3>Enter credentials to login</h3>

          <Stack spacing={2}>
            {error && <Alert severity="error">{error}</Alert>}

            <TextField
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              size="small"
              fullWidth
              autoFocus
              disabled={submitting}
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              size="small"
              fullWidth
              disabled={submitting}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={!valid || submitting}
              sx={{
                mt: 1,
                bgcolor: ACCENT_COLOR,
                textTransform: "none",
                fontWeight: 700,
                "&:hover": { bgcolor: ACCENT_COLOR, filter: "brightness(0.95)" },
              }}
            >
              {submitting ? "Signing in…" : "Login"}
            </Button>
          </Stack>
        </form>
      </div>

      <div
        className="login-image-container"
        style={{
          background: `linear-gradient(135deg, ${ACCENT_COLOR} 0%, #1f2937 100%)`,
        }}
      >
        <div className="login-image-overlay fade-in">
          Search, filter, and export transaction reports — all in one place.
        </div>
      </div>
    </div>
  );
}
