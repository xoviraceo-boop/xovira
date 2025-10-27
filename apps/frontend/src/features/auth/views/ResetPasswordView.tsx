"use client";
import React, { useState, useCallback, useMemo } from "react";
import { Lock, Eye, EyeOff, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AuthContainer } from "../components/AuthContainer";
import { AuthMessage } from "../components/AuthMessage";
import { ConfirmPasswordReset } from "@/actions/auth";
import { useRouter, useSearchParams } from "next/navigation";

function passwordStrength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score; // 0..5
}

export const ResetPasswordView = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const labelClass = "block text-sm font-medium text-gray-700 mb-1";
  const inputClass =
    "w-full px-4 py-3 bg-white/70 border border-gray-300/50 rounded-lg text-gray-800 transition duration-200 " +
    "focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:bg-white shadow-sm outline-none";

  const strength = useMemo(() => passwordStrength(password), [password]);
  const passwordsMatch = password.length > 0 && password === confirm;

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!token) {
        setMessage("Invalid or missing token.");
        return;
      }
      if (!passwordsMatch) {
        setMessage("Passwords do not match.");
        return;
      }
      setLoading(true);
      setMessage("");
      try {
        const res = await ConfirmPasswordReset(token, password);
        setMessage(res?.message || "Password updated successfully.");
        setTimeout(() => router.push("/login"), 1200);
      } catch (error: any) {
        setMessage(error.message || "Failed to reset password.");
      } finally {
        setLoading(false);
      }
    },
    [token, password, passwordsMatch]
  );

  const strengthLabel = ["Very weak", "Weak", "Fair", "Good", "Strong", "Very strong"][strength];

  return (
    <AuthContainer>
      <div className="max-w-lg mx-auto">
        <h2 className="text-3xl font-extrabold text-gray-800 mb-2 text-center">
          Set a new password
        </h2>
        <p className="text-gray-500 mb-8 text-center">
          Choose a strong password to secure your account.
        </p>

        <AuthMessage message={message} />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="password" className={labelClass}>
              New password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Create a password"
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Strength: {strengthLabel}
            </div>
          </div>

          <div>
            <Label htmlFor="confirm" className={labelClass}>
              Confirm password
            </Label>
            <div className="relative">
              <Input
                id="confirm"
                type={showConfirm ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                placeholder="Re-enter password"
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {passwordsMatch ? (
              <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
                <Check className="w-4 h-4" /> Passwords match
              </div>
            ) : (
              <div className="mt-2 text-xs text-gray-500">Passwords must match</div>
            )}
          </div>

          <Button type="submit" disabled={loading} icon={Lock}>
            Reset password
          </Button>
        </form>
      </div>
    </AuthContainer>
  );
};

export default ResetPasswordView;


