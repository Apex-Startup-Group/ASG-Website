"use client";

import React, { useState } from "react";
import { UserCircle, Save, Check, Key, Camera } from "lucide-react";
import { useAuth } from "@/context/admin/AuthContext";
import { PageHeader } from "@/components/admin/PageHeader";
import { createClient } from "@/lib/supabase/client";

export default function ProfilePage() {
  const { adminEmail } = useAuth();
  const [saved, setSaved] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);
  const [profile, setProfile] = useState({
    name: adminEmail?.split("@")[0]?.replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "Admin User",
    email: adminEmail || "admin@asg.io",
    role: "Super Admin",
    phone: "+91 98765 43210",
    city: "Bangalore",
    bio: "Platform administrator for ASG. Overseeing community growth, events, and product development.",
    linkedin: "linkedin.com/in/asgadmin",
    twitter: "@asg_admin",
  });
  const [pw, setPw] = useState({ current: "", newPw: "", confirm: "" });
  const [pwError, setPwError] = useState("");

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  const handlePwSave = async () => {
    if (!pw.current || !pw.newPw) { setPwError("Please fill all password fields."); return; }
    if (pw.newPw !== pw.confirm) { setPwError("New passwords do not match."); return; }
    if (pw.newPw.length < 8) { setPwError("Password must be at least 8 characters."); return; }
    
    setPwError("");
    try {
      const supabase = createClient();
      
      // 1. Get the current user's email
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user || !user.email) {
        setPwError("Failed to identify current user.");
        return;
      }

      // 2. Verify current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: pw.current
      });

      if (signInError) {
        setPwError("Incorrect current password. Please try again.");
        return;
      }

      // 3. Update password inside Supabase Auth
      const { error } = await supabase.auth.updateUser({
        password: pw.newPw
      });
      
      if (error) {
        setPwError(error.message);
        return;
      }
      
      setPw({ current: "", newPw: "", confirm: "" });
      setPwSaved(true);
      setTimeout(() => setPwSaved(false), 2500);
    } catch (err: any) {
      console.error(err);
      setPwError("An unexpected error occurred while changing your password.");
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1.5px solid #ebebeb",
    background: "#f8f8f8",
    fontSize: "14px",
    color: "#0d0d0d",
    outline: "none",
    fontFamily: "'Inter', sans-serif",
    boxSizing: "border-box",
  };

  const focusStyle = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = "#FF6B00";
    e.currentTarget.style.background = "#fff";
    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(255,107,0,0.1)";
  };
  const blurStyle = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = "#ebebeb";
    e.currentTarget.style.background = "#f8f8f8";
    e.currentTarget.style.boxShadow = "none";
  };

  const initial = profile.name[0]?.toUpperCase() || "A";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <PageHeader
          icon={<UserCircle size={20} style={{ color: "#FF6B00" }} />}
          title="Profile"
          subtitle="Manage your admin profile"
        />
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold border-none hover:opacity-90"
          style={{ background: saved ? "#10b981" : "#FF6B00", cursor: "pointer", fontFamily: "'Satoshi', sans-serif", fontSize: "14px", boxShadow: saved ? "0 2px 10px rgba(16,185,129,0.35)" : "0 2px 10px rgba(255,107,0,0.35)", transition: "all 0.3s" }}>
          {saved ? <Check size={16} /> : <Save size={16} />}
          {saved ? "Saved!" : "Save Profile"}
        </button>
      </div>

      <div className="grid gap-6 text-gray-800" style={{ gridTemplateColumns: "300px 1fr" }}>
        <div className="bg-white rounded-2xl p-6 flex flex-col items-center" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid #f0f0f0", height: "fit-content" }}>
          <div className="relative mb-5">
            <div
              className="w-24 h-24 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#FF6B00,#FF8C00)", fontSize: "36px", fontWeight: 800, color: "#fff", fontFamily: "'Satoshi', sans-serif" }}
            >
              {initial}
            </div>
            <button
              className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl flex items-center justify-center border-none cursor-pointer"
              style={{ background: "#0d0d0d", border: "2px solid #fff" }}
            >
              <Camera size={13} style={{ color: "#fff" }} />
            </button>
          </div>
          <div style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 700, fontSize: "17px", color: "#0d0d0d", marginBottom: "4px" }}>{profile.name}</div>
          <div style={{ fontSize: "13px", color: "#8a8a8a", marginBottom: "12px" }}>{profile.email}</div>
          <span style={{ background: "rgba(255,107,0,0.1)", color: "#FF6B00", fontSize: "12px", fontWeight: 600, padding: "4px 14px", borderRadius: "99px" }}>{profile.role}</span>

          <div className="w-full mt-6 pt-5" style={{ borderTop: "1px solid #f0f0f0" }}>
            {[
              { label: "Member since", value: "Jan 2023" },
              { label: "Last login", value: "Today, 9:42 AM" },
              { label: "Access level", value: "Super Admin" },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between py-2">
                <span style={{ fontSize: "12px", color: "#aaa" }}>{label}</span>
                <span style={{ fontSize: "12px", fontWeight: 500, color: "#555" }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid #f0f0f0" }}>
            <h2 style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 700, fontSize: "16px", color: "#0d0d0d", marginBottom: "20px" }}>Personal Information</h2>
            <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
              {[
                { label: "Full Name", key: "name" as const, type: "text" },
                { label: "Email Address", key: "email" as const, type: "email" },
                { label: "Phone Number", key: "phone" as const, type: "tel" },
                { label: "City", key: "city" as const, type: "text" },
                { label: "LinkedIn", key: "linkedin" as const, type: "text" },
                { label: "Twitter / X", key: "twitter" as const, type: "text" },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#3a3a3a", marginBottom: "6px" }}>{label}</label>
                  <input
                    type={type}
                    style={inputStyle}
                    value={profile[key]}
                    onChange={(e) => setProfile((p) => ({ ...p, [key]: e.target.value }))}
                    onFocus={focusStyle}
                    onBlur={blurStyle}
                  />
                </div>
              ))}
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#3a3a3a", marginBottom: "6px" }}>Bio</label>
                <textarea
                  rows={3}
                  style={{ ...inputStyle, resize: "vertical" }}
                  value={profile.bio}
                  onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid #f0f0f0" }}>
            <div className="flex items-center gap-3 mb-5">
              <Key size={17} style={{ color: "#FF6B00" }} />
              <h2 style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 700, fontSize: "16px", color: "#0d0d0d" }}>Change Password</h2>
            </div>
            {pwError && (
              <div className="mb-4 px-4 py-3 rounded-xl text-sm" style={{ background: "rgba(239,68,68,0.08)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>{pwError}</div>
            )}
            <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
              {[
                { label: "Current Password", key: "current" as const },
                { label: "New Password", key: "newPw" as const },
                { label: "Confirm New Password", key: "confirm" as const },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#3a3a3a", marginBottom: "6px" }}>{label}</label>
                  <input
                    type="password"
                    style={inputStyle}
                    value={pw[key]}
                    placeholder="••••••••"
                    onChange={(e) => setPw((p) => ({ ...p, [key]: e.target.value }))}
                    onFocus={focusStyle}
                    onBlur={blurStyle}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={handlePwSave}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold border-none cursor-pointer"
                style={{ background: pwSaved ? "#10b981" : "#0d0d0d", fontFamily: "'Satoshi', sans-serif", fontSize: "14px", transition: "all 0.3s" }}
              >
                {pwSaved ? <Check size={15} /> : <Key size={15} />}
                {pwSaved ? "Updated!" : "Update Password"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
