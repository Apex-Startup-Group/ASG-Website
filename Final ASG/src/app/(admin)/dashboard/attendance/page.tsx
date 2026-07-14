"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Check, X as XIcon, Users, ChevronDown, ChevronRight, BarChart2 } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";

interface InternAttendance {
  id: number;
  name: string;
  problemStatement: string;
  attendanceRecord: Record<string, "Present" | "Absent">; // date string -> Present / Absent
}

const PROBLEM_STATEMENTS = [
  "Career Intelligence Platform",
  "Social Work & Sustainability",
  "Digital Economy Trackers",
  "ASG Ecosystem Portal",
  "Event Industry Planner",
  "Sports & Fitness Tracker",
  "Kids Sector & E-Learning",
  "HoReCa Management Systems",
  "Energy & Utilities Hub",
  "E-Sports & Gaming Guilds",
  "Mobility & Transit Helpers",
  "Temple Ecosystem Portal",
];

// No dummy data — attendance rows come from real interns in the database

const getPastDates = () => {
  const dates = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
};

export default function AttendancePage() {
  const [attendance, setAttendance] = useState<InternAttendance[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [collapsedStatements, setCollapsedStatements] = useState<Record<string, boolean>>({});
  const [dates, setDates] = useState<string[]>([]);

  useEffect(() => {
    setSelectedDate(new Date().toISOString().split("T")[0]);
    setDates(getPastDates());

    // Load real interns from database
    async function loadInterns() {
      try {
        const res = await fetch('/api/v1/admin/interns');
        if (res.ok) {
          const { data } = await res.json();
          // Try to restore saved attendance from localStorage
          let savedAttendance: Record<number, Record<string, "Present" | "Absent">> = {};
          try {
            const raw = localStorage.getItem("asg_attendance_v2");
            if (raw) savedAttendance = JSON.parse(raw);
          } catch { /* ignore */ }

          const rows: InternAttendance[] = data.map((intern: any) => ({
            id: intern.id,
            name: intern.name,
            problemStatement: intern.domain || 'General',
            attendanceRecord: savedAttendance[intern.id] || {},
          }));
          setAttendance(rows);
        }
      } catch (err) {
        console.error('Failed to load interns for attendance:', err);
      }
    }
    loadInterns();
  }, []);

  // Persist attendance changes to localStorage
  useEffect(() => {
    if (attendance.length > 0) {
      const toSave: Record<number, Record<string, "Present" | "Absent">> = {};
      attendance.forEach(a => { toSave[a.id] = a.attendanceRecord; });
      localStorage.setItem("asg_attendance_v2", JSON.stringify(toSave));
    }
  }, [attendance]);

  const toggleStatement = (stmt: string) => {
    setCollapsedStatements((prev) => ({
      ...prev,
      [stmt]: !prev[stmt],
    }));
  };

  const toggleAttendance = (internId: number, dateStr: string) => {
    setAttendance((prev) =>
      prev.map((item) => {
        if (item.id === internId) {
          const current = item.attendanceRecord[dateStr] || "Absent";
          return {
            ...item,
            attendanceRecord: {
              ...item.attendanceRecord,
              [dateStr]: current === "Present" ? "Absent" : "Present",
            },
          };
        }
        return item;
      })
    );
  };

  const getStatementStats = (stmt: string) => {
    const interns = attendance.filter((i) => i.problemStatement === stmt);
    if (interns.length === 0) return { internsCount: 0, presentCount: 0, attendanceRate: 0 };
    
    let totalLogs = 0;
    let totalPresents = 0;
    
    interns.forEach((i) => {
      dates.forEach((d) => {
        totalLogs++;
        if (i.attendanceRecord[d] === "Present") {
          totalPresents++;
        }
      });
    });

    return {
      internsCount: interns.length,
      presentCount: interns.filter((i) => i.attendanceRecord[selectedDate] === "Present").length,
      attendanceRate: totalLogs > 0 ? Math.round((totalPresents / totalLogs) * 100) : 0,
    };
  };

  const totalInterns = attendance.length;
  const activeToday = attendance.filter((i) => i.attendanceRecord[selectedDate] === "Present").length;
  const overallRate = (() => {
    let total = 0;
    let presents = 0;
    attendance.forEach((i) => {
      dates.forEach((d) => {
        total++;
        if (i.attendanceRecord[d] === "Present") presents++;
      });
    });
    return total > 0 ? Math.round((presents / total) * 100) : 0;
  })();

  if (!selectedDate) {
    return <div className="p-6 text-gray-500">Loading attendance data...</div>;
  }

  return (
    <div className="max-w-[1600px] mx-auto p-1 animate-fade-in">
      <PageHeader
        icon={<Calendar size={20} style={{ color: "#FF6B00" }} />}
        title="Intern Attendance"
        subtitle="View and manage intern attendance classified by problem statements."
        action={
          <div className="flex items-center gap-3">
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#555" }}>Target Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold bg-white text-gray-700 outline-none focus:border-[#FF6B00]"
              style={{ fontFamily: "'Satoshi', sans-serif" }}
            />
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-gray-400 block mb-1">Total Tracked Interns</span>
            <span className="text-3xl font-extrabold text-gray-900 block" style={{ fontFamily: "'Satoshi', sans-serif" }}>
              {totalInterns}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-orange-50/50">
            <Users size={22} className="text-[#FF6B00]" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-gray-400 block mb-1">Present Today ({selectedDate})</span>
            <span className="text-3xl font-extrabold text-gray-900 block" style={{ fontFamily: "'Satoshi', sans-serif" }}>
              {activeToday} <span className="text-sm font-semibold text-gray-400">/ {totalInterns}</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-50">
            <Check size={22} className="text-emerald-600" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-gray-400 block mb-1">Weekly Attendance Rate</span>
            <span className="text-3xl font-extrabold text-[#FF6B00] block" style={{ fontFamily: "'Satoshi', sans-serif" }}>
              {overallRate}%
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-orange-50/50">
            <BarChart2 size={22} className="text-[#FF6B00]" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {PROBLEM_STATEMENTS.map((stmt) => {
          const stats = getStatementStats(stmt);
          const internsInStmt = attendance.filter((i) => i.problemStatement === stmt);
          const isCollapsed = collapsedStatements[stmt];

          return (
            <div
              key={stmt}
              className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden transition-all"
            >
              <div
                onClick={() => toggleStatement(stmt)}
                className="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50/50 transition-colors"
                style={{ borderBottom: isCollapsed ? "none" : "1px solid #f5f5f5" }}
              >
                <div className="flex items-center gap-3">
                  {isCollapsed ? <ChevronRight size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                  <div>
                    <h2
                      className="text-sm font-bold text-gray-900"
                      style={{ fontFamily: "'Satoshi', sans-serif" }}
                    >
                      {stmt}
                    </h2>
                    <span className="text-[11px] text-gray-400 font-medium">
                      {stats.internsCount} active interns assigned
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-xs text-gray-400 block">Weekly Rate</span>
                    <span className="text-xs font-bold text-gray-800">{stats.attendanceRate}%</span>
                  </div>
                  <div className="w-16 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#FF6B00] h-full"
                      style={{ width: `${stats.attendanceRate}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {!isCollapsed && (
                <div className="p-5">
                  {internsInStmt.length > 0 ? (
                    <div className="overflow-x-auto text-gray-800">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b border-gray-100 text-left">
                            <th className="pb-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Intern Name</th>
                            {dates.map((d) => (
                              <th
                                key={d}
                                className={`pb-3 text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider ${
                                  d === selectedDate ? "bg-orange-50/50 rounded-t-lg text-[#FF6B00]" : ""
                                }`}
                              >
                                {new Date(d).toLocaleDateString("en-IN", { weekday: "short", day: "numeric" })}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {internsInStmt.map((intern) => (
                            <tr key={intern.id} className="hover:bg-gray-50/30 transition-colors">
                              <td className="py-3.5 text-sm font-semibold text-gray-800">{intern.name}</td>
                              {dates.map((d) => {
                                const status = intern.attendanceRecord[d] || "Absent";
                                const isSelected = d === selectedDate;
                                return (
                                  <td
                                    key={d}
                                    className={`py-3.5 text-center transition-colors ${
                                      isSelected ? "bg-orange-50/20" : ""
                                    }`}
                                  >
                                    <button
                                      onClick={() => toggleAttendance(intern.id, d)}
                                      className={`inline-flex items-center justify-center w-8 h-8 rounded-full border cursor-pointer transition-all hover:scale-105 border-none ${
                                        status === "Present"
                                          ? "bg-emerald-50 text-emerald-600 shadow-2xs"
                                          : "bg-red-50 text-red-500 shadow-2xs"
                                      }`}
                                    >
                                      {status === "Present" ? <Check size={14} /> : <XIcon size={14} />}
                                    </button>
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-xs text-gray-400 italic">
                      No interns currently assigned to this problem statement.
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
