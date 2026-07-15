"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/admin/AuthContext";
import logoImg from "@/assets/admin/logo.png";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  Zap,
  Shield,
  BarChart3,
  Users,
} from "lucide-react";

export default function LoginPage() {
  const { isLoggedIn, login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogoClick = () => {
    if (typeof window !== "undefined") {
      const origin = window.location.origin;
      if (origin.includes("3001")) {
        window.location.href = origin.replace("3001", "3000");
      } else if (origin.includes("5174")) {
        window.location.href = origin.replace("5174", "5173");
      } else {
        window.location.href = "http://localhost:3000";
      }
    }
  };

  useEffect(() => {
    if (isLoggedIn) router.push("/dashboard");
  }, [isLoggedIn, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await login(email, password);
      if (error) {
        setError(error.message || "Invalid email or password.");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* LEFT — dark branding panel */}
      <div
        className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative flex-col items-center justify-center overflow-hidden"
        style={{ background: "#0a0a0a" }}
      >
        <div
          className="absolute top-0 right-0 w-96 h-96 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(255,107,0,0.22) 0%, transparent 70%)",
            transform: "translate(30%,-30%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-80 h-80 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(255,107,0,0.13) 0%, transparent 70%)",
            transform: "translate(-30%,30%)",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="relative z-10 flex flex-col items-center text-center px-12 max-w-lg">
          <img
            src={logoImg.src}
            alt="APEX Startup Group"
            onClick={handleLogoClick}
            style={{
              height: "60px",
              width: "auto",
              marginBottom: "32px",
              cursor: "pointer",
            }}
          />

          <div className="mb-10 relative">
            <div
              className="absolute inset-0 blur-2xl pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse, rgba(255,107,0,0.35) 0%, transparent 70%)",
                transform: "scale(1.3) translateY(10%)",
              }}
            />
            <RocketSVG />
          </div>

          <h1
            style={{
              fontFamily: "'Satoshi', sans-serif",
              fontWeight: 700,
              fontSize: "clamp(26px,3vw,34px)",
              color: "#fff",
              lineHeight: 1.2,
              letterSpacing: "-0.5px",
              marginBottom: "14px",
            }}
          >
            Welcome to{" "}
            <span style={{ color: "#FF6B00" }}>ASG Admin</span> Panel
          </h1>
          <p style={{ color: "rgba(255,255,255,0.42)", fontSize: "15px", lineHeight: 1.6, maxWidth: "340px" }}>
            Your command center for managing operations, analytics, and
            team performance — all in one place.
          </p>

          <div className="flex gap-3 mt-10 flex-wrap justify-center">
            {[
              { icon: <Users size={12} />, label: "2,400+ Users" },
              { icon: <BarChart3 size={12} />, label: "99.9% Uptime" },
              { icon: <Shield size={12} />, label: "SOC 2 Certified" },
            ].map(({ icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.5)",
                  fontSize: "12px",
                  fontWeight: 500,
                }}
              >
                <span style={{ color: "#FF6B00" }}>{icon}</span>
                {label}
              </div>
            ))}
          </div>
        </div>

        <div
          className="absolute bottom-8 left-0 right-0 text-center"
          style={{ color: "rgba(255,255,255,0.18)", fontSize: "12px" }}
        >
          ASG Platform v3.2.1
        </div>
      </div>

      {/* RIGHT — login form */}
      <div className="flex-1 flex items-center justify-center bg-white px-6 py-12 relative">
        <div className="absolute top-6 left-6 lg:hidden">
          <img
            src={logoImg.src}
            alt="APEX Startup Group"
            onClick={handleLogoClick}
            style={{
              height: "32px",
              width: "auto",
              cursor: "pointer",
            }}
          />
        </div>

        <div className="w-full max-w-[400px]">
          <div className="flex justify-center mb-8">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(255,107,0,0.08)", border: "1.5px solid rgba(255,107,0,0.2)" }}
            >
              <Lock size={22} style={{ color: "#FF6B00" }} strokeWidth={2} />
            </div>
          </div>

          <div className="text-center mb-8">
            <h2
              style={{
                fontFamily: "'Satoshi', sans-serif",
                fontWeight: 700,
                fontSize: "28px",
                color: "#0d0d0d",
                letterSpacing: "-0.4px",
                marginBottom: "6px",
              }}
            >
              Admin Login
            </h2>
            <p style={{ color: "#8a8a8a", fontSize: "14px" }}>
              Sign in to access your admin dashboard
            </p>
          </div>

          {error && (
            <div
              className="mb-4 px-4 py-3 rounded-xl text-sm"
              style={{ background: "rgba(239,68,68,0.08)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#3a3a3a", marginBottom: "6px" }}>
                Email or Username
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Mail size={16} style={{ color: "#bbb" }} />
                </span>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@asg.io"
                  className="w-full pl-10 pr-4 py-3 rounded-xl outline-none transition-all duration-200"
                  style={{ background: "#f7f7f7", border: "1.5px solid #ebebeb", color: "#0d0d0d", fontSize: "14px" }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "#FF6B00"; e.currentTarget.style.background = "#fff"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(255,107,0,0.1)"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "#ebebeb"; e.currentTarget.style.background = "#f7f7f7"; e.currentTarget.style.boxShadow = "none"; }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#3a3a3a", marginBottom: "6px" }}>
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Lock size={16} style={{ color: "#bbb" }} />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  className="w-full pl-10 pr-12 py-3 rounded-xl outline-none transition-all duration-200"
                  style={{ background: "#f7f7f7", border: "1.5px solid #ebebeb", color: "#0d0d0d", fontSize: "14px" }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "#FF6B00"; e.currentTarget.style.background = "#fff"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(255,107,0,0.1)"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "#ebebeb"; e.currentTarget.style.background = "#f7f7f7"; e.currentTarget.style.boxShadow = "none"; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#bbb", padding: 0 }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#FF6B00")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#bbb")}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none" style={{ fontSize: "13px", color: "#555" }}>
                <div
                  className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all"
                  style={{
                    background: rememberMe ? "#FF6B00" : "#fff",
                    border: rememberMe ? "1.5px solid #FF6B00" : "1.5px solid #d0d0d0",
                    cursor: "pointer",
                  }}
                  onClick={() => setRememberMe((v) => !v)}
                >
                  {rememberMe && (
                    <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                      <path d="M1 3.5L3.2 5.8L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                Remember me
              </label>
              <button
                type="button"
                style={{ background: "none", border: "none", fontSize: "13px", fontWeight: 500, color: "#FF6B00", cursor: "pointer" }}
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition-all duration-200"
              style={{
                background: loading ? "#cc5500" : "linear-gradient(135deg,#FF6B00,#FF8C00)",
                border: "none",
                fontSize: "15px",
                fontFamily: "'Satoshi', sans-serif",
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 4px 20px rgba(255,107,0,0.35)",
                marginTop: "8px",
              }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  Signing in…
                </>
              ) : (
                <>
                  <Zap size={16} />
                  Login to Dashboard
                </>
              )}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ background: "#ebebeb" }} />
            <span style={{ color: "#c0c0c0", fontSize: "12px" }}>Secure access</span>
            <div className="flex-1 h-px" style={{ background: "#ebebeb" }} />
          </div>

          <div className="flex items-center justify-center gap-2 py-3 rounded-xl" style={{ background: "#f7f7f7", border: "1px solid #ebebeb" }}>
            <Shield size={14} style={{ color: "#8a8a8a" }} />
            <span style={{ fontSize: "12px", color: "#8a8a8a" }}>256-bit SSL · Protected by ASG Security</span>
          </div>

          <p className="text-center mt-8" style={{ fontSize: "12px", color: "#c0c0c0" }}>
            © 2025 ASG Inc. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

function RocketSVG() {
  return (
    <svg width="200" height="200" viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="110" cy="160" rx="70" ry="16" stroke="rgba(255,107,0,0.15)" strokeWidth="1.5" strokeDasharray="4 4" />
      <path d="M110 20 C110 20 86 58 86 100 L134 100 C134 58 110 20 110 20Z" fill="url(#rb)" />
      <circle cx="110" cy="78" r="12" fill="#0a0a0a" opacity="0.6" />
      <circle cx="110" cy="78" r="8" fill="url(#rw)" />
      <path d="M86 100 L66 128 L86 118 Z" fill="#FF6B00" opacity="0.8" />
      <path d="M134 100 L154 128 L134 118 Z" fill="#FF6B00" opacity="0.8" />
      <rect x="100" y="118" width="20" height="10" rx="3" fill="#1e1e1e" />
      <path d="M102 128 C98 140 94 150 102 162 C106 168 110 172 110 172 C110 172 114 168 118 162 C126 150 122 140 118 128 Z" fill="url(#fo)" opacity="0.9" />
      <path d="M105 132 C103 142 101 152 106 160 C107.5 163 110 166 110 166 C110 166 112.5 163 114 160 C119 152 117 142 115 132 Z" fill="url(#fi)" />
      <circle cx="96" cy="155" r="2.5" fill="#FF6B00" opacity="0.6" />
      <circle cx="124" cy="149" r="2" fill="#FF8C00" opacity="0.5" />
      <circle cx="60" cy="50" r="1.5" fill="white" opacity="0.5" />
      <circle cx="160" cy="35" r="2" fill="white" opacity="0.4" />
      <circle cx="48" cy="90" r="1" fill="white" opacity="0.3" />
      <circle cx="170" cy="80" r="1.5" fill="white" opacity="0.4" />
      <defs>
        <linearGradient id="rb" x1="86" y1="20" x2="134" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#c8c8c8" />
        </linearGradient>
        <radialGradient id="rw" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF6B00" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#FF8C00" stopOpacity="0.4" />
        </radialGradient>
        <linearGradient id="fo" x1="110" y1="128" x2="110" y2="172" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FF6B00" />
          <stop offset="100%" stopColor="#FFcc00" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="fi" x1="110" y1="132" x2="110" y2="166" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#FF6B00" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}
