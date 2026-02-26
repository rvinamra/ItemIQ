import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const { login } = useAuth();
  const [memberId, setMemberId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const success = await login(memberId, password);
    if (success) {
      // Submit to hidden iframe to trigger browser's "Save password?" prompt
      const iframe = document.getElementById("login-sink");
      if (iframe) {
        const form = document.getElementById("login-form");
        form.target = "login-sink";
        form.action = "about:blank";
        form.submit();
      }
    } else {
      setError("Invalid Member ID or Password.");
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background: "linear-gradient(180deg, #eff6ff 0%, #ffffff 100%)" }}
    >
      {/* Logo + tagline */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold">
          <span style={{ color: "#3b82f6" }}>item</span>
          <span style={{ color: "#111827" }}>IQ</span>
        </h1>
      </div>

      {/* Sign-in card */}
      <div className="w-full max-w-sm bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Sign in</h2>
        <p className="text-sm text-gray-500 mb-6">Enter your credentials to continue</p>

        <iframe name="login-sink" id="login-sink" className="hidden" style={{ display: "none" }} />
        <form id="login-form" onSubmit={handleSubmit} method="post" className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="memberId" className="text-sm font-medium text-gray-700">
              Member ID
            </Label>
            <Input
              id="memberId"
              name="username"
              type="text"
              autoComplete="username"
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              placeholder="Enter your Member ID"
              className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <Button
            type="submit"
            className="w-full text-white font-medium py-2.5"
            style={{ backgroundColor: "#3b82f6" }}
          >
            Sign In
          </Button>
        </form>
      </div>
    </div>
  );
}
