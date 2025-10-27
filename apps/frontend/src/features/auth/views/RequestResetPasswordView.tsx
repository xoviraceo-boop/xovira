"use client";
import React, { useState, useCallback } from "react";
import { Mail, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AuthContainer } from "../components/AuthContainer";
import { AuthMessage } from "../components/AuthMessage";
import { RequestPasswordReset } from "@/actions/auth";
import { useRouter } from "next/navigation";

export const RequestResetPasswordView = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const labelClass = "block text-sm font-medium text-gray-700 mb-1";
  const inputClass =
    "w-full px-4 py-3 bg-white/70 border border-gray-300/50 rounded-lg text-gray-800 transition duration-200 " +
    "focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:bg-white shadow-sm outline-none";

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setLoading(true);
      setMessage("");
      try {
        const res = await RequestPasswordReset(email);
        setMessage(res?.message || "If account exists, a reset link was sent.");
      } catch (error: any) {
        setMessage(error.message || "Failed to request password reset.");
      } finally {
        setLoading(false);
      }
    },
    [email]
  );

  return (
    <AuthContainer>
      <div className="max-w-lg mx-auto">
        <h2 className="text-3xl font-extrabold text-gray-800 mb-2 text-center">
          Forgot your password?
        </h2>
        <p className="text-gray-500 mb-8 text-center">
          Enter your email to receive a password reset link.
        </p>

        <AuthMessage message={message} />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email" className={labelClass}>
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email address"
              className={inputClass}
            />
          </div>

          <Button type="submit" disabled={loading} icon={Mail}>
            Send reset link
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Remembered your password?
          <button
            onClick={() => router.push("/login")}
            className="ml-1 font-semibold text-indigo-600 hover:text-indigo-700 transition duration-150"
          >
            Back to login
          </button>
        </div>
      </div>
    </AuthContainer>
  );
};

export default RequestResetPasswordView;


