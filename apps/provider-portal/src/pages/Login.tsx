/**
 * LoginPage.tsx
 * ──────────────────────────────────────────────────────────────
 * Passwordless email OTP login for the provider portal.
 * Two-step flow: email → 6-digit OTP verification.
 * Uses existing shadcn/ui components (Button, Input, Card, InputOTP).
 * ──────────────────────────────────────────────────────────────
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Building2,
  Mail,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60;

export default function LoginPage() {
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resending, setResending] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const { signIn, verifyOtp, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as { from?: { pathname: string } })?.from
        ?.pathname;
      navigate(from ?? "/", { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(
      () => setResendCooldown((c) => c - 1),
      1000,
    );
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Auto-focus first OTP input
  useEffect(() => {
    if (step === "otp" && inputRefs.current[0]) {
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [step]);

  // ─── Step 1: Send OTP ─────────────────────────────────────

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    const { error: otpError } = await signIn(trimmedEmail);

    if (otpError) {
      if (/rate limit/i.test(otpError.message)) {
        setError("Too many requests. Please wait a few minutes and try again.");
      } else if (/signups.*disabled/i.test(otpError.message)) {
        setError(
          "No provider account found for this email. Contact your administrator.",
        );
      } else {
        setError(otpError.message);
      }
      setLoading(false);
      return;
    }

    setResendCooldown(RESEND_COOLDOWN);
    setStep("otp");
    setLoading(false);
  };

  // ─── Step 2: OTP Handlers ─────────────────────────────────

  const handleVerifyOtp = useCallback(
    async (code: string) => {
      if (!code || code.length !== OTP_LENGTH) return;
      setLoading(true);
      setError("");

      const { error: verifyError } = await verifyOtp(email.trim(), code);

      if (verifyError) {
        setError(
          verifyError.message.includes("expired")
            ? "Code has expired. Please request a new one."
            : verifyError.message.includes("invalid")
              ? "Invalid code. Please check and try again."
              : verifyError.message,
        );
        setOtp(Array(OTP_LENGTH).fill(""));
        inputRefs.current[0]?.focus();
        setLoading(false);
        return;
      }
      // Success — redirect handled by the useEffect
      setLoading(false);
    },
    [email, verifyOtp],
  );

  const handleOtpChange = useCallback(
    (index: number, value: string) => {
      if (!/^[0-9]?$/.test(value)) return;

      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      setError("");

      if (value && index < OTP_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }

      if (value && newOtp.every((d) => d !== "")) {
        handleVerifyOtp(newOtp.join(""));
      }
    },
    [otp, handleVerifyOtp],
  );

  const handleOtpKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent) => {
      if (e.key === "Backspace" && !otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
      if (e.key === "ArrowLeft" && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
      if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [otp],
  );

  const handleOtpPaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault();
      const pasted = e.clipboardData
        .getData("text")
        .replace(/\D/g, "")
        .slice(0, OTP_LENGTH);
      if (!pasted) return;

      const newOtp = Array(OTP_LENGTH).fill("");
      for (let i = 0; i < pasted.length; i++) {
        newOtp[i] = pasted[i];
      }
      setOtp(newOtp);
      setError("");

      const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
      inputRefs.current[focusIdx]?.focus();

      if (pasted.length === OTP_LENGTH) {
        handleVerifyOtp(pasted);
      }
    },
    [handleVerifyOtp],
  );

  // ─── Resend OTP ───────────────────────────────────────────

  const handleResend = async () => {
    if (resendCooldown > 0 || resending) return;
    setResending(true);
    setError("");

    const { error: resendError } = await signIn(email.trim());
    if (resendError) {
      setError(resendError.message);
    } else {
      setResendCooldown(RESEND_COOLDOWN);
      setOtp(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    }
    setResending(false);
  };

  // ─── Render ───────────────────────────────────────────────

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <div className="px-6 py-5">
        <div className="flex items-center gap-2 text-primary">
          <Building2 className="h-7 w-7" />
          <span className="text-xl font-bold">HealthProvida</span>
        </div>
      </div>

      {/* Main */}
      <div className="flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md">
          <Card className="overflow-hidden shadow-lg">
            {/* Top accent */}
            <div className="h-1.5 bg-gradient-to-r from-primary via-primary/70 to-primary/40" />

            {step === "email" ? (
              /* ─── Step 1: Email Entry ─────────────────── */
              <>
                <CardHeader className="text-center pb-2">
                  <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg">
                    <Mail className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-2xl">Provider Login</CardTitle>
                  <CardDescription>
                    Enter your email and we'll send you a verification code.
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  {error && (
                    <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSendOtp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email address</Label>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="login-email"
                          type="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (error) setError("");
                          }}
                          placeholder="doctor@hospital.com"
                          required
                          autoComplete="email"
                          autoFocus
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full"
                      size="lg"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Sending code...
                        </>
                      ) : (
                        <>
                          Continue
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>

                  <p className="mt-6 text-center text-xs text-muted-foreground">
                    This portal is for verified healthcare providers only.
                    <br />
                    Patients should use the{" "}
                    <a href="/" className="font-medium text-primary hover:underline">
                      main app
                    </a>
                    .
                  </p>
                </CardContent>
              </>
            ) : (
              /* ─── Step 2: OTP Verification ─────────────── */
              <>
                <CardHeader className="pb-2">
                  <button
                    onClick={() => {
                      setStep("email");
                      setOtp(Array(OTP_LENGTH).fill(""));
                      setError("");
                      setResendCooldown(0);
                    }}
                    className="mb-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Use a different email
                  </button>

                  <div className="text-center">
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg">
                      <Mail className="h-7 w-7 text-primary-foreground" />
                    </div>
                    <CardTitle className="text-2xl">
                      Enter verification code
                    </CardTitle>
                    <CardDescription className="mt-2">
                      We sent a 6-digit code to{" "}
                      <strong className="text-foreground">{email}</strong>
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent>
                  {error && (
                    <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                      {error}
                    </div>
                  )}

                  {/* OTP Input */}
                  <div
                    className="mb-6 flex justify-center gap-3"
                    onPaste={handleOtpPaste}
                  >
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => {
                          inputRefs.current[index] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) =>
                          handleOtpChange(index, e.target.value)
                        }
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        disabled={loading}
                        className={`h-14 w-12 rounded-xl border-2 text-center text-xl font-bold outline-none transition-all ${
                          digit
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border bg-muted/30 text-foreground"
                        } focus:border-primary focus:ring-2 focus:ring-ring disabled:opacity-50`}
                      />
                    ))}
                  </div>

                  {/* Loading */}
                  {loading && (
                    <div className="mb-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Verifying...
                    </div>
                  )}

                  {/* Resend */}
                  <div className="text-center">
                    <p className="mb-2 text-sm text-muted-foreground">
                      Didn't receive the code?
                    </p>
                    <button
                      onClick={handleResend}
                      disabled={resendCooldown > 0 || resending}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition hover:text-primary/80 disabled:cursor-not-allowed disabled:text-muted-foreground"
                    >
                      <RefreshCw
                        className={`h-3.5 w-3.5 ${resending ? "animate-spin" : ""}`}
                      />
                      {resendCooldown > 0
                        ? `Resend code in ${resendCooldown}s`
                        : resending
                          ? "Sending..."
                          : "Resend code"}
                    </button>
                  </div>
                </CardContent>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

