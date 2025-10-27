"use client";
import React, { useState, useCallback } from "react";
import { Mail, Lock, Send, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AuthContainer } from "../components/AuthContainer";
import { AuthMessage } from "../components/AuthMessage";
import { useSession } from "next-auth/react";
import { SignInWithGoogle, SignInWithCredentials, SignInWithMagicLink } from "@/actions/auth";
import { useRouter } from "next/navigation";

export const LoginView = () => {
  const { update: updateSession } = useSession()
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [magicEmail, setMagicEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [loginMethod, setLoginMethod] = useState("password");
  const [showPassword, setShowPassword] = useState(false);

  const labelClass = "block text-sm font-medium text-gray-700 mb-1";
  const inputClass =
    "w-full px-4 py-3 bg-white/70 border border-gray-300/50 rounded-lg text-gray-800 transition duration-200 " +
    "focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:bg-white shadow-sm outline-none";

  const handleCredentials = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setLoading(true);
      setMessage("");
      try {
        await SignInWithCredentials(email, password);
        setMessage("Success! Redirecting...");
        router.refresh();
        updateSession();
      } catch (error: any) {
        setMessage(error.message || "Invalid credentials. Please try again.");
      }
      setLoading(false);
    },
    [email, password]
  );

  const handleGoogle = useCallback(async () => {
    setLoading(true);
    setMessage("");
    try {
      await SignInWithGoogle();
      setMessage("Success! Google login complete.");
      router.refresh();
      updateSession();
    } catch (error: any) {
      setMessage(error.message || "Google sign-in failed. Please try again.");
    }
    setLoading(false);
  }, []);

  const handleMagic = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setLoading(true);
      setMessage("");
      try {
        const result = await SignInWithMagicLink(magicEmail);
        if (result?.success) {
          setMessage("Check your email for the magic link!");
        } else {
          setMessage(result?.error || "Failed to send magic link.");
        }
      } catch (error: any) {
        setMessage("Failed to send magic link. Please try again.");
      }
      setLoading(false);
    },
    [magicEmail]
  );

  return (
    <AuthContainer>
      <div className="max-w-lg mx-auto">
        <h2 className="text-3xl font-extrabold text-gray-800 mb-2 text-center">
          Welcome back to{" "}
          <span className="text-cyan-600">ViewCreator</span>
        </h2>
        <p className="text-gray-500 mb-8 text-center">
          Access your account to keep building standout visuals.
        </p>

        <AuthMessage message={message} />

        <div className="space-y-4">
          <Button
            variant="google"
            onClick={handleGoogle}
            disabled={loading}
            icon={Mail}
          >
            Continue with Google
          </Button>
        </div>

        <div className="flex justify-center my-6">
          <div className="p-1 bg-gray-100 rounded-xl flex shadow-inner">
            <button
              type="button"
              onClick={() => setLoginMethod("password")}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-200 ${
                loginMethod === "password"
                  ? "bg-white shadow text-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Sign in with Password
            </button>
            <button
              type="button"
              onClick={() => setLoginMethod("magiclink")}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-200 ${
                loginMethod === "magiclink"
                  ? "bg-white shadow text-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Sign in with Magic Link
            </button>
          </div>
        </div>

        {loginMethod === "password" ? (
          <form
            onSubmit={handleCredentials}
            className="space-y-4 transition-opacity duration-300"
          >
            <div>
              <Label htmlFor="email" className={labelClass}>
                Email Address
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
            <div>
              <Label htmlFor="password" className={labelClass}>
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
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
              <a
                href="/forgot-password"
                className="block text-right text-sm text-indigo-600 hover:text-indigo-500 mt-2"
              >
                Forgot password?
              </a>
            </div>

            <Button type="submit" disabled={loading} icon={Send}>
              Sign In
            </Button>
          </form>
        ) : (
          <form
            onSubmit={handleMagic}
            className="space-y-4 transition-opacity duration-300"
          >
            <p className="text-sm text-gray-500 mb-4">
              Enter your email and we'll send you a secure passwordless
              sign-in link.
            </p>
            <div>
              <Label htmlFor="magic" className={labelClass}>
                Email for magic link
              </Label>
              <Input
                id="magic"
                type="email"
                value={magicEmail}
                onChange={(e) => setMagicEmail(e.target.value)}
                required
                placeholder="Email address"
                className={inputClass}
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              icon={Mail}
            >
              Send magic link
            </Button>
          </form>
        )}

        <div className="mt-6 text-center text-sm text-gray-600 border-t pt-6 border-gray-100">
          New to our platform?
          <button
            onClick={() => router.push("/register")}
            className="ml-1 font-semibold text-indigo-600 hover:text-indigo-700 transition duration-150"
          >
            Create Account
          </button>
        </div>
      </div>
    </AuthContainer>
  );
};