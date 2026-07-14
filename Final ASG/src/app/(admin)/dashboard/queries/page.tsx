"use client";

import React, { useState, useEffect } from "react";
import { Search, Mail, Eye, Check, Reply, Trash2 } from "lucide-react";
import Modal, { PrimaryBtn, GhostBtn, FormField, Input } from "@/components/admin/Modal";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { createClient } from "@/lib/supabase/client";

interface QueryItem {
  id: string | number;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  date: string;
  status: "Pending" | "Resolved";
}

const INITIAL: QueryItem[] = [];

export default function ContactQueriesPage() {
  const [queries, setQueries] = useState<QueryItem[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"All" | "Pending" | "Resolved">("All");
  const [selectedQuery, setSelectedQuery] = useState<QueryItem | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [replyMode, setReplyMode] = useState(false);
  const [replySubject, setReplySubject] = useState("");
  const [replyMessage, setReplyMessage] = useState("");

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [queryToDelete, setQueryToDelete] = useState<QueryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    async function loadLiveQueries(isInitial = false) {
      try {
        if (isInitial) setLoading(true);
        const res = await fetch('/api/v1/admin/contact-queries');
        if (res.ok) {
          const { data } = await res.json();
          const dbQueries = data.map((q: any) => {
            let role = "General";
            let phone = "";
            const phoneMatch = q.subject.match(/\((.*?)\)/);
            if (phoneMatch) {
              phone = phoneMatch[1];
            }
            const roleMatch = q.subject.split(" Inquiry");
            if (roleMatch.length > 0) {
              role = roleMatch[0];
            }

            return {
              id: q.id,
              name: q.name,
              email: q.email,
              phone: phone || undefined,
              subject: q.subject,
              message: q.message,
              date: q.createdAt,
              status: q.status === 'pending' ? 'Pending' : 'Resolved'
            };
          });
          setQueries(dbQueries);
        }
      } catch (err) {
        console.error("Failed to load live queries:", err);
      } finally {
        if (isInitial) setLoading(false);
      }
    }

    loadLiveQueries(true);

    const channel = supabase
      .channel("contact_queries_changes")
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contact_queries'
        },
        () => {
          loadLiveQueries(false);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filtered = queries.filter((q) => {
    const matchSearch =
      q.name.toLowerCase().includes(search.toLowerCase()) ||
      q.subject.toLowerCase().includes(search.toLowerCase()) ||
      q.email.toLowerCase().includes(search.toLowerCase()) ||
      (q.phone && q.phone.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = filterStatus === "All" || q.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const resolveQuery = async (id: string | number) => {
    try {
      const res = await fetch('/api/v1/admin/contact-queries', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id, status: 'Resolved' })
      });
      if (res.ok) {
        setQueries(prev => prev.map((q) => (q.id === id ? { ...q, status: "Resolved" as const } : q)));
        if (selectedQuery && selectedQuery.id === id) {
          setSelectedQuery((prev) => prev ? { ...prev, status: "Resolved" as const } : null);
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error?.message || "Failed to update query status.");
      }
    } catch (err: any) {
      console.error(err);
      alert("Failed to connect to the server.");
    }
  };

  const handleDeleteQuery = async () => {
    if (!queryToDelete) return;
    if (queryToDelete.status === 'Pending') {
      alert("Cannot delete a pending inquiry.");
      return;
    }
    
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/v1/admin/contact-queries?id=${queryToDelete.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setQueries(prev => prev.filter(q => q.id !== queryToDelete.id));
        setDeleteConfirmOpen(false);
        setQueryToDelete(null);
        alert("Inquiry deleted successfully.");
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error?.message || "Failed to delete inquiry.");
      }
    } catch (err: any) {
      console.error(err);
      alert("Failed to delete inquiry.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenReply = (query: QueryItem) => {
    setSelectedQuery(query);
    
    // Parse Inquiry Role/Context
    let role = "General";
    const roleMatch = query.subject.split(" Inquiry");
    if (roleMatch.length > 0) {
      role = roleMatch[0];
    }

    setReplySubject(`Re: ${query.subject}`);
    
    let template = `Dear ${query.name},\n\n`;
    template += `Thank you for contacting APEX Startup Group regarding your ${role.toLowerCase()} inquiry.\n\n`;
    
    if (role === "Student") {
      template += `We appreciate your interest in our academic initiatives, training programs, and incubation opportunities. Our team will review the details you shared:\n`;
      template += `"${query.message}"\n\n`;
      template += `We will get back to you shortly with more details on how you can participate and access our student startup resources.\n\n`;
    } else if (role === "Startup") {
      template += `We are excited to learn more about your startup journey and venture ideas. Our incubation and acceleration team will review your details:\n`;
      template += `"${query.message}"\n\n`;
      template += `We will reach out to discuss potential incubation opportunities, cohort timelines, or schedule an introductory session.\n\n`;
    } else if (role === "Investor") {
      template += `Thank you for your interest in partnering with APEX Startup Group. Our investment relations team will review your inquiry:\n`;
      template += `"${query.message}"\n\n`;
      template += `We will follow up to schedule a call or share relevant investment decks and co-investment details.\n\n`;
    } else if (role === "Industry Partner" || role === "Industry Expert") {
      template += `Thank you for your interest in collaboration, sponsorship, and mentorship. Our team is looking forward to discussing partnership opportunities:\n`;
      template += `"${query.message}"\n\n`;
      template += `We will reach out to schedule an introductory discussion to explore mutual synergies.\n\n`;
    } else {
      template += `We have received your message and our team is currently reviewing your inquiry:\n`;
      template += `"${query.message}"\n\n`;
      template += `We will follow up with a detailed response as soon as possible.\n\n`;
    }

    template += `If you have any additional details or updates to share in the meantime, please feel free to reply directly to this email.\n\n`;
    template += `Best regards,\n`;
    template += `APEX Startup Group Team\n`;
    template += `Jalgaon, Maharashtra`;

    setReplyMessage(template);
    setReplyMode(true);
  };

  const handleSendEmailReply = () => {
    if (!selectedQuery) return;
    
    const mailtoUrl = `mailto:${selectedQuery.email}?subject=${encodeURIComponent(replySubject)}&body=${encodeURIComponent(replyMessage)}`;
    if (typeof window !== 'undefined') {
      window.location.href = mailtoUrl;
    }

    resolveQuery(selectedQuery.id);
    setReplyMode(false);
    setSelectedQuery(null);
  };

  return (
    <div>
      <PageHeader
        icon={<Mail size={20} style={{ color: "#FF6B00" }} />}
        title="Contact Queries"
        subtitle={`${queries.filter((q) => q.status === "Pending").length} pending queries`}
      />

      <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid #f0f0f0" }}>
        <div className="flex flex-wrap items-center gap-3 px-5 py-4" style={{ borderBottom: "1px solid #f5f5f5" }}>
          <div className="flex items-center gap-2 flex-1 min-w-[180px]">
            <Search size={15} style={{ color: "#bbb" }} />
            <input
              placeholder="Search queries…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ border: "none", outline: "none", fontSize: "14px", color: "#555", background: "none", flex: 1, fontFamily: "'Inter', sans-serif" }}
            />
          </div>
          <div className="flex gap-1">
            {(["All", "Pending", "Resolved"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                style={{
                  padding: "5px 14px",
                  borderRadius: "99px",
                  border: "none",
                  fontSize: "12px",
                  fontWeight: 500,
                  cursor: "pointer",
                  background: filterStatus === s ? "#FF6B00" : "#f4f4f5",
                  color: filterStatus === s ? "#fff" : "#555",
                  transition: "all 0.15s",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table style={{ width: "100%", tableLayout: "fixed", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#fafafa" }}>
                <th style={{ width: "110px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.06em", padding: "10px 12px" }}>Sender</th>
                <th style={{ width: "160px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.06em", padding: "10px 12px" }}>Email</th>
                <th style={{ width: "110px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.06em", padding: "10px 12px" }}>Phone</th>
                <th style={{ width: "130px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.06em", padding: "10px 12px" }}>Subject</th>
                <th style={{ textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.06em", padding: "10px 12px" }}>Message</th>
                <th style={{ width: "95px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.06em", padding: "10px 12px" }}>Date</th>
                <th style={{ width: "90px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.06em", padding: "10px 12px" }}>Status</th>
                <th style={{ width: "165px", textAlign: "center", fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.06em", padding: "10px 12px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((query) => {
                const dateObj = new Date(query.date);
                const formattedDate = dateObj.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
                const formattedTime = dateObj.toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit', hour12: true });

                return (
                  <tr key={query.id} style={{ borderTop: "1px solid #f5f5f5" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#fafafa")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                    <td style={{ padding: "10px 12px" }}>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: "#0d0d0d", textOverflow: "ellipsis", whiteSpace: "nowrap", overflow: "hidden" }} title={query.name}>
                        {query.name}
                      </div>
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <div style={{ fontSize: "12.5px", color: "#555", textOverflow: "ellipsis", whiteSpace: "nowrap", overflow: "hidden" }} title={query.email}>
                        {query.email}
                      </div>
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <div style={{ fontSize: "12.5px", color: "#555", whiteSpace: "nowrap" }}>
                        {query.phone ? `+91 ${query.phone}` : "—"}
                      </div>
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <div style={{ fontSize: "12.5px", fontWeight: 500, color: "#0d0d0d", textOverflow: "ellipsis", whiteSpace: "nowrap", overflow: "hidden" }} title={query.subject}>
                        {query.subject}
                      </div>
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <div style={{ fontSize: "12.5px", color: "#666", textOverflow: "ellipsis", whiteSpace: "nowrap", overflow: "hidden" }} title={query.message}>
                        {query.message}
                      </div>
                    </td>
                    <td style={{ padding: "10px 12px", fontSize: "12px", color: "#8a8a8a", whiteSpace: "nowrap" }}>
                      <div>{formattedDate}</div>
                      <div style={{ fontSize: "10.5px", color: "#aaa", marginTop: "1px" }}>{formattedTime}</div>
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <span
                        style={{
                          display: "inline-block",
                          background: query.status === "Pending" ? "rgba(245,158,11,0.08)" : "rgba(16,185,129,0.08)",
                          color: query.status === "Pending" ? "#f59e0b" : "#10b981",
                          fontSize: "10.5px",
                          fontWeight: 600,
                          padding: "2px 8px",
                          borderRadius: "99px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {query.status === "Pending" ? "● Pending" : "● Resolved"}
                      </span>
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "center" }}>
                      <div style={{ display: "flex", gap: "5px", justifyContent: "center" }}>
                        <button
                          onClick={() => { setSelectedQuery(query); setReplyMode(false); }}
                          title="View Details"
                          style={{
                            padding: "3px 6px",
                            background: "#f3f4f6",
                            borderRadius: "6px",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "10.5px",
                            fontWeight: "600",
                            color: "#4b5563",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "3px",
                            transition: "background-color 0.2s"
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#e5e7eb"}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#f3f4f6"}
                        >
                          <Eye size={11} /> View
                        </button>
                        {query.status === "Pending" && (
                          <button
                            onClick={() => handleOpenReply(query)}
                            title="Reply over Email"
                            style={{
                              padding: "3px 6px",
                              background: "rgba(255,107,0,0.08)",
                              borderRadius: "6px",
                              border: "none",
                              cursor: "pointer",
                              fontSize: "10.5px",
                              fontWeight: "600",
                              color: "#FF6B00",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "3px",
                              transition: "background-color 0.2s"
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255,107,0,0.15)"}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(255,107,0,0.08)"}
                          >
                            <Reply size={11} /> Reply
                          </button>
                        )}
                        {query.status === "Pending" && (
                          <button
                            onClick={() => resolveQuery(query.id)}
                            title="Mark Resolved"
                            style={{
                              padding: "3px 6px",
                              background: "rgba(16,185,129,0.08)",
                              borderRadius: "6px",
                              border: "none",
                              cursor: "pointer",
                              fontSize: "10.5px",
                              fontWeight: "600",
                              color: "#10b981",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "3px",
                              transition: "background-color 0.2s"
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(16,185,129,0.15)"}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(16,185,129,0.08)"}
                          >
                            <Check size={11} /> Resolve
                          </button>
                        )}
                        {query.status === "Resolved" && (
                          <button
                            onClick={() => { setQueryToDelete(query); setDeleteConfirmOpen(true); }}
                            title="Delete Inquiry"
                            style={{
                              padding: "3px 6px",
                              background: "rgba(239,68,68,0.08)",
                              borderRadius: "6px",
                              border: "1px solid rgba(239,68,68,0.2)",
                              cursor: "pointer",
                              fontSize: "10.5px",
                              fontWeight: "600",
                              color: "#ef4444",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "3px",
                              transition: "all 0.2s"
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.15)";
                              e.currentTarget.style.borderColor = "rgba(239,68,68,0.4)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.08)";
                              e.currentTarget.style.borderColor = "rgba(239,68,68,0.2)";
                            }}
                          >
                            <Trash2 size={11} /> Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding: "40px 16px", textAlign: "center", color: "#bbb", fontSize: "14px" }}>
                    {loading ? "Loading live queries..." : "No queries found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedQuery && (
        <Modal isOpen={true} onClose={() => { setSelectedQuery(null); setReplyMode(false); }} title={replyMode ? "Draft Email Reply" : "Query Details"} size="md">
          <div className="space-y-4" style={{ fontFamily: "'Inter', sans-serif" }}>
            
            {!replyMode ? (
              <>
                <div>
                  <label style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: 600, color: "#aaa" }}>From</label>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#0d0d0d" }}>
                    {selectedQuery.name} (<a href={`mailto:${selectedQuery.email}`} style={{ color: "#FF6B00", textDecoration: "none" }}>{selectedQuery.email}</a>)
                  </div>
                  {selectedQuery.phone && (
                    <div style={{ fontSize: "13px", color: "#555", marginTop: "2.5px", fontWeight: 500 }}>
                      📞 Mobile: {selectedQuery.phone}
                    </div>
                  )}
                </div>
                <div>
                  <label style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: 600, color: "#aaa" }}>Subject</label>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#0d0d0d" }}>{selectedQuery.subject}</div>
                </div>
                <div>
                  <label style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: 600, color: "#aaa" }}>Message</label>
                  <div style={{ fontSize: "13.5px", color: "#444", background: "#f8f8f8", padding: "12px", borderRadius: "8px", border: "1px solid #ebebeb", whiteSpace: "pre-wrap", marginTop: "4px" }}>
                    {selectedQuery.message}
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span style={{ fontSize: "12px", color: "#aaa" }}>
                    Submitted on: {new Date(selectedQuery.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                  </span>
                  <div className="flex gap-2">
                    <GhostBtn onClick={() => setSelectedQuery(null)}>Close</GhostBtn>
                    <button
                      onClick={() => handleOpenReply(selectedQuery)}
                      className="px-4 py-2 bg-[#FF6B00] text-white font-semibold text-xs rounded-xl border-none cursor-pointer flex items-center gap-1 hover:opacity-90"
                    >
                      <Reply size={13} /> Reply over Email
                    </button>
                    {selectedQuery.status === "Pending" && (
                      <PrimaryBtn onClick={() => resolveQuery(selectedQuery.id)}>Resolve Query</PrimaryBtn>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: 600, color: "#aaa" }}>To</label>
                  <div style={{ fontSize: "14px", fontWeight: 650, color: "#0d0d0d" }}>{selectedQuery.name} ({selectedQuery.email})</div>
                </div>
                <div>
                  <FormField label="Subject *">
                    <Input value={replySubject} onChange={(e) => setReplySubject(e.target.value)} placeholder="Email subject" />
                  </FormField>
                </div>
                <div>
                  <FormField label="Reply Message *">
                    <textarea
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      rows={8}
                      style={{
                        width: "100%",
                        padding: "10px",
                        border: "1.5px solid #ebebeb",
                        borderRadius: "10px",
                        fontSize: "13px",
                        fontFamily: "'Inter', sans-serif",
                        outline: "none",
                        resize: "vertical",
                        color: "#000000"
                      }}
                      placeholder="Type your response here..."
                    />
                  </FormField>
                </div>
                <div className="flex justify-end gap-2.5 pt-2 border-t border-gray-100">
                  <GhostBtn onClick={() => setReplyMode(false)}>Back</GhostBtn>
                  <button
                    onClick={handleSendEmailReply}
                    className="px-4 py-2 bg-[#FF6B00] text-white font-semibold text-xs rounded-xl border-none cursor-pointer flex items-center gap-1.5 hover:opacity-90 shadow-md"
                  >
                    <Mail size={13} /> Send & Resolve
                  </button>
                </div>
              </>
            )}

          </div>
        </Modal>
      )}

      {deleteConfirmOpen && (
        <Modal
          isOpen={true}
          onClose={() => { if (!isDeleting) setDeleteConfirmOpen(false); }}
          title="Delete Inquiry"
          size="sm"
        >
          <div style={{ fontFamily: "'Inter', sans-serif" }}>
            <p style={{ fontSize: "14px", color: "#4b5563", marginBottom: "20px", lineHeight: "1.5" }}>
              Are you sure you want to permanently delete this inquiry?
              <br />
              <span style={{ fontWeight: 550, color: "#9ca3af", fontSize: "12px", display: "inline-block", marginTop: "8px" }}>This action cannot be undone.</span>
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <GhostBtn onClick={() => setDeleteConfirmOpen(false)}>Cancel</GhostBtn>
              <button
                onClick={handleDeleteQuery}
                disabled={isDeleting}
                className="px-4 py-2"
                style={{
                  background: isDeleting ? "#fca5a5" : "#dc2626",
                  color: "#fff",
                  padding: "8px 16px",
                  borderRadius: "10px",
                  border: "none",
                  fontWeight: "600",
                  fontSize: "12px",
                  cursor: isDeleting ? "not-allowed" : "pointer"
                }}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
