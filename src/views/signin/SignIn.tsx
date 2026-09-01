import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Stack } from "@mui/material";

import { useAuth } from "@/utilities/shared/auth";
import { ACCENT_COLOR } from "@/utilities/shared/theme";
import TextInput from "@/components/Input/TextInput";
import PasswordInput from "@/components/Input/PasswordInput";
import Toaster from "@/components/Toaster";
import iswLogo from "@/assets/Logos/isw.png";
import backgroundImg from "@/assets/background-img.png";
import "./login.css";

const ROTATING_TEXTS = [
  "Search, filter, and export transaction reports — all in one place.",
  "Secure authentication for your digital identity.",
  "Real-time insight across every transaction.",
  "Enterprise-grade security for your business.",
];

export default function SignIn() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [toastOpen, setToastOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [textIndex, setTextIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % ROTATING_TEXTS.length);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login({ username, password });
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
      setToastOpen(true);
    } finally {
      setSubmitting(false);
    }
  };

  const valid = username.trim() !== "" && password.trim() !== "";

  return (
    <div className="login-container">
      <Toaster
        open={toastOpen}
        state="false"
        title="Sign in failed"
        message={error ?? undefined}
        action={setToastOpen}
      />

      <div
        className="login-form-container"
        style={{
          backgroundImage: `url(${backgroundImg})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
        }}
      >
        <form className="login-form" onSubmit={handleSubmit}>
          <img className="login-logo" src={iswLogo} alt="Interswitch" />
          <h1>Hello, Welcome</h1>
          <h3>Enter your domain credentials to login</h3>

          <Stack spacing={2}>
            <TextInput
              id="username"
              label="Username"
              placeholder="Enter your username"
              input={username}
              handleInput={(e) => setUsername(e.target.value)}
              disabled={submitting}
            />
            <PasswordInput
              id="password"
              label="Password"
              placeholder="Enter your password"
              input={password}
              handleInput={(e) => setPassword(e.target.value)}
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
          backgroundImage: `url(${backgroundImg})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
        }}
      >
        <div key={textIndex} className="login-image-overlay fade-in">
          {ROTATING_TEXTS[textIndex]}
        </div>

        <div className="login-dots">
          {ROTATING_TEXTS.map((_, index) => (
            <span key={index} className={index === textIndex ? "login-dot active" : "login-dot"} />
          ))}
        </div>
      </div>
    </div>
  );
}
