"use client";
import React, { useState, useCallback } from "react";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AuthContainer } from "../components/AuthContainer";
import { AuthMessage } from "../components/AuthMessage";
import { SignInWithGoogle, SignInWithCredentials, SignInWithMagicLink, RegisterUser } from "@/actions/auth";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export const RegisterView = () => {
  const { update: updateSession } = useSession()
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const labelClass = "block text-sm font-medium text-gray-700 mb-1";
  const inputClass =
    "w-full px-4 py-3 bg-white/70 border border-gray-300/50 rounded-lg text-gray-800 transition duration-200 " +
    "focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:bg-white shadow-sm outline-none";

  const handleRegister = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setLoading(true);
      setMessage("");
      try {
        const res = await RegisterUser(email, password);
        if (!res.success) {
          setMessage(res.message || "Registration failed");
          return;
        }
        setMessage("Success! Account created and signed in.");
        router.refresh();
      } catch (error: any) {
        setMessage(
          error.message || "An unexpected error occurred during registration."
        );
      } finally {
        setLoading(false);
      }
    },
    [email, password]
  );

  const handleGoogle = useCallback(async () => {
    setLoading(true);
    setMessage("");
    try {
      await SignInWithGoogle();
      setMessage("Success! Google login complete.");
    } catch (error: any) {
      setMessage(error.message || "Google sign-in failed. Please try again.");
    }
    setLoading(false);
  }, []);

  return (
    <AuthContainer>
      <div className="max-w-lg mx-auto">
        <h2 className="text-3xl font-extrabold text-gray-800 mb-2 text-center">
          Create an account
        </h2>
        <p className="text-gray-500 mb-8 text-center">
          Already have an account?
          <button
            onClick={() => router.push("/login")}
            className="ml-1 font-semibold text-indigo-600 hover:text-indigo-700 transition duration-150"
          >
            Log in
          </button>
        </p>

        <AuthMessage message={message} />

        <form onSubmit={handleRegister} className="space-y-4">
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
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="terms"
              required
              className="h-4 w-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
            />
            <Label
              htmlFor="terms"
              className="ml-2 mt-0 text-gray-600 font-normal"
            >
              I agree to the{" "}
              <a href="#" className="text-indigo-600 hover:underline">
                Terms & Conditions
              </a>
            </Label>
          </div>

          <Button type="submit" disabled={loading} icon={User}>
            Create account
          </Button>
        </form>

        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="flex-shrink mx-4 text-gray-500 text-sm font-medium">
            Or register with
          </span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

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
      </div>
    </AuthContainer>
  );
};