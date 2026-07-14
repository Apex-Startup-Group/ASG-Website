import React from "react";

export interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const map: Record<string, { bg: string; color: string }> = {
    Upcoming: { bg: "rgba(255,107,0,0.1)", color: "#FF6B00" },
    Completed: { bg: "rgba(16,185,129,0.1)", color: "#10b981" },
    Cancelled: { bg: "rgba(239,68,68,0.1)", color: "#ef4444" },
    Published: { bg: "rgba(16,185,129,0.1)", color: "#10b981" },
    Draft: { bg: "rgba(156,163,175,0.15)", color: "#6b7280" },
    Active: { bg: "rgba(59,130,246,0.1)", color: "#3b82f6" },
    Pending: { bg: "rgba(245,158,11,0.1)", color: "#f59e0b" },
    Inactive: { bg: "rgba(156,163,175,0.15)", color: "#6b7280" },
    Accepted: { bg: "rgba(16,185,129,0.1)", color: "#10b981" },
    Rejected: { bg: "rgba(239,68,68,0.1)", color: "#ef4444" },
  };
  const s = map[status] || { bg: "#f0f0f0", color: "#555" };
  return (
    <span
      style={{
        display: "inline-block",
        background: s.bg,
        color: s.color,
        fontSize: "11px",
        fontWeight: 600,
        padding: "3px 10px",
        borderRadius: "99px",
        whiteSpace: "nowrap",
      }}
    >
      {status}
    </span>
  );
}
