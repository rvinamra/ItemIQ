import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const { login } = useAuth();
  const [memberId, setMemberId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    const success = login(memberId, password);
    if (!success) {
      setError("Invalid Member ID or Password.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: "linear-gradient(135deg, #0a0f1a 0%, #1e293b 50%, #0f172a 100%)",
      }}
    >
      <Card className="w-full max-w-md border-slate-700/50 bg-slate-900/80 backdrop-blur-sm shadow-2xl">
        <CardContent className="pt-8 pb-8 px-8">
          <div className="flex justify-center mb-8">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68cb10678907e93d0710a15a/ef91f01b9_logo1.png"
              alt="ItemIQ Logo"
              className="h-10 w-auto"
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="memberId" className="text-slate-300 text-sm font-medium">
                Member ID
              </Label>
              <Input
                id="memberId"
                type="text"
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                placeholder="Enter your Member ID"
                className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-teal-400 focus:ring-teal-400/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300 text-sm font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-teal-400 focus:ring-teal-400/20"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full text-white font-semibold py-2.5"
              style={{
                background: "linear-gradient(135deg, #14b8a6 0%, #3b82f6 100%)",
              }}
            >
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
