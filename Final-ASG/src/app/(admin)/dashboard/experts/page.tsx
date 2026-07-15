"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Search, Award, Plus, Pencil, Trash2, UploadCloud, Eye, Link2, X as XIcon, Undo, Redo } from "lucide-react";
import Modal, { FormField, Input, Select, Textarea, PrimaryBtn, DangerBtn, GhostBtn } from "@/components/admin/Modal";
import { PageHeader } from "@/components/admin/PageHeader";
import { useUndoRedoState } from "@/hooks/admin/useUndoRedoState";
import {
  getExpertsAction,
  createExpertAction,
  updateExpertAction,
  deleteExpertAction,
  toggleExpertStatusAction
} from "@/app/actions/experts";

interface Expert {
  id: string | number;
  name: string;
  role: string;
  company: string;
  description: string; // replaces expertise
  socialLinks: string[]; // replaces linkedin
  currentProblemStatement: string; // new field
  photo: string;
  bio: string;
  status: "Active" | "Inactive";
}

// Problem statements are fetched from the API at runtime

const INITIAL: Expert[] = [];


const empty: Omit<Expert, "id"> = {
  name: "",
  role: "",
  company: "",
  description: "",
  socialLinks: [""],
  currentProblemStatement: "",
  photo: "",
  bio: "",
  status: "Active"
};

export default function IndustryExpertsPage() {
  const [experts, setExperts, undo, redo, canUndo, canRedo] = useUndoRedoState<Expert[]>(INITIAL);
  const [loading, setLoading] = useState(false);
  const [problemStatements, setProblemStatements] = useState<string[]>([]);

  // Fetch problem statements from the database
  useEffect(() => {
    async function fetchProblemStatements() {
      try {
        const res = await fetch('/api/v1/admin/problem-statements');
        if (res.ok) {
          const { data } = await res.json();
          setProblemStatements((data || []).map((ps: any) => ps.title));
        }
      } catch {
        // ignore — keep empty list
      }
    }
    fetchProblemStatements();
  }, []);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"All" | "Active" | "Inactive">("All");
  const [modal, setModal] = useState<{ open: boolean; mode: "add" | "edit" | "delete" | "view"; item: Expert | null }>({
    open: false, mode: "add", item: null
  });
  const [form, setForm] = useState<Omit<Expert, "id">>(empty);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    async function loadExperts() {
      try {
        const fetched = await getExpertsAction();
        const mapped = fetched.map((e: any) => ({
          id: e.id,
          name: e.name,
          role: e.designation || e.role || "",
          company: e.company || "",
          description: e.description || e.bio || "",
          socialLinks: e.socialLinks || [],
          currentProblemStatement: e.currentProblemStatement || "",
          photo: e.photo || "",
          bio: e.bio || "",
          status: e.status || "Active"
        }));
        setExperts(mapped);
      } catch (err) {
        console.error("Failed to load experts:", err);
      }
    }
    loadExperts();
  }, [setExperts]);

  const filtered = useMemo(() => {
    return experts.filter((e) => {
      const matchSearch =
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.company.toLowerCase().includes(search.toLowerCase()) ||
        e.description.toLowerCase().includes(search.toLowerCase()) ||
        e.role.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === "All" || e.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [experts, search, filterStatus]);

  const toggleStatus = async (id: string | number) => {
    const expert = experts.find((e) => e.id === id);
    if (!expert) return;
    const nextStatus = expert.status === "Active" ? "Inactive" : "Active";
    try {
      await toggleExpertStatusAction(String(id), nextStatus);
      setExperts((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status: nextStatus } : e))
      );
    } catch (err) {
      console.error("Failed to toggle expert status:", err);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        set("photo", event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const addSocialLink = () => {
    set("socialLinks", [...form.socialLinks, ""]);
  };

  const removeSocialLink = (index: number) => {
    const newLinks = form.socialLinks.filter((_, i) => i !== index);
    set("socialLinks", newLinks.length > 0 ? newLinks : [""]);
  };

  const updateSocialLink = (index: number, value: string) => {
    const newLinks = [...form.socialLinks];
    newLinks[index] = value;
    set("socialLinks", newLinks);
  };

  const openAdd = () => {
    setForm({ ...empty, socialLinks: [""] });
    setModal({ open: true, mode: "add", item: null });
  };
  const openEdit = (item: Expert) => {
    const { id, ...rest } = item;
    setForm({ ...rest, socialLinks: rest.socialLinks?.length ? rest.socialLinks : [""] });
    setModal({ open: true, mode: "edit", item });
  };
  const openDelete = (item: Expert) => setModal({ open: true, mode: "delete", item });
  const openView = (item: Expert) => setModal({ open: true, mode: "view", item });
  const close = () => setModal((m) => ({ ...m, open: false }));

  const save = async () => {
    if (!form.name || !form.role || !form.company) return;
    const cleanedSocialLinks = (form.socialLinks || []).filter((l) => l.trim());
    try {
      if (modal.mode === "add") {
        const added = await createExpertAction({
          name: form.name,
          role: form.role,
          company: form.company,
          description: form.description,
          socialLinks: cleanedSocialLinks,
          currentProblemStatement: form.currentProblemStatement,
          photo: form.photo,
          bio: form.bio,
          status: form.status,
        });
        const newExpert = {
          id: added.id,
          name: added.name,
          role: added.designation || added.role || "",
          company: added.company || "",
          description: added.description || added.bio || "",
          socialLinks: added.socialLinks || [],
          currentProblemStatement: added.currentProblemStatement || "",
          photo: added.photo || "",
          bio: added.bio || "",
          status: added.status || "Active",
        };
        setExperts((prev) => [...prev, newExpert]);
      } else if (modal.item) {
        const id = modal.item.id;
        await updateExpertAction(String(id), {
          name: form.name,
          role: form.role,
          company: form.company,
          description: form.description,
          socialLinks: cleanedSocialLinks,
          currentProblemStatement: form.currentProblemStatement,
          photo: form.photo,
          bio: form.bio,
          status: form.status,
        });
        setExperts((prev) =>
          prev.map((e) =>
            e.id === id
              ? {
                  ...e,
                  name: form.name,
                  role: form.role,
                  company: form.company,
                  description: form.description,
                  socialLinks: cleanedSocialLinks,
                  currentProblemStatement: form.currentProblemStatement,
                  photo: form.photo,
                  bio: form.bio,
                  status: form.status,
                }
              : e
          )
        );
      }
      close();
    } catch (err) {
      console.error("Failed to save expert:", err);
    }
  };

  const remove = async () => {
    if (modal.item) {
      const id = modal.item.id;
      try {
        await deleteExpertAction(String(id));
        setExperts((prev) => prev.filter((e) => e.id !== id));
      } catch (err) {
        console.error("Failed to delete expert:", err);
      }
    }
    close();
  };

  const set = (k: keyof typeof form, v: any) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div>
      <PageHeader
        icon={<Award size={20} style={{ color: "#FF6B00" }} />}
        title="Industry Experts & Mentors"
        subtitle={`${experts.length} total experts · ${experts.filter((e) => e.status === "Active").length} active`}
        action={
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1 bg-gray-50 border border-gray-150 rounded-xl p-1 shadow-2xs">
              <button
                onClick={undo}
                disabled={!canUndo}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all border-none bg-transparent cursor-pointer"
                title="Undo Action"
              >
                <Undo size={14} />
              </button>
              <button
                onClick={redo}
                disabled={!canRedo}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all border-none bg-transparent cursor-pointer"
                title="Redo Action"
              >
                <Redo size={14} />
              </button>
            </div>
            <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold border-none hover:opacity-90 animate-fade-in"
              style={{ background: "#FF6B00", cursor: "pointer", fontFamily: "'Satoshi', sans-serif", boxShadow: "0 2px 10px rgba(255,107,0,0.35)" }}>
              <Plus size={16} /> Add Expert
            </button>
          </div>
        }
      />

      <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid #f0f0f0" }}>
        <div className="flex flex-wrap items-center gap-3 px-5 py-4" style={{ borderBottom: "1px solid #f5f5f5" }}>
          <div className="flex items-center gap-2 flex-1 min-w-[180px]">
            <Search size={15} style={{ color: "#bbb" }} />
            <input
              placeholder="Search experts…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ border: "none", outline: "none", fontSize: "14px", color: "#555", background: "none", flex: 1, fontFamily: "'Inter', sans-serif" }}
            />
          </div>
          <div className="flex gap-1">
            {(["All", "Active", "Inactive"] as const).map((s) => (
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
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#fafafa" }}>
                {["Expert / Photo", "Designation", "Company", "Problem Statement", "Status", "Actions"].map((h) => (
                  <th key={h} style={{ textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.06em", padding: "12px 16px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((expert) => (
                <tr key={expert.id} style={{ borderTop: "1px solid #f5f5f5" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#fafafa")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                  <td style={{ padding: "14px 16px" }}>
                    <div className="flex items-center gap-3">
                      {expert.photo ? (
                        <img src={expert.photo} alt={expert.name} style={{ width: "36px", height: "36px", borderRadius: "12px", objectFit: "cover" }} />
                      ) : (
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm bg-orange-50 text-[#FF6B00]">
                          {expert.name[0]}
                        </div>
                      )}
                      <div>
                        <div style={{ fontSize: "14px", fontWeight: 600, color: "#0d0d0d" }}>{expert.name}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: "13px", color: "#555" }}>{expert.role}</td>
                  <td style={{ padding: "14px 16px", fontSize: "13px", fontWeight: 500, color: "#0d0d0d" }}>{expert.company}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ fontSize: "12px", fontWeight: 500, padding: "3px 10px", borderRadius: "99px", background: "rgba(255,107,0,0.1)", color: "#FF6B00" }}>
                      {expert.currentProblemStatement || "—"}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleStatus(expert.id)}
                        className="relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out align-middle border-none"
                        style={{
                          background: expert.status === "Active" ? "#10b981" : "#e5e7eb",
                          outline: "none"
                        }}
                        title={expert.status === "Active" ? "Disable" : "Enable"}
                      >
                        <span
                          className="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out"
                          style={{
                            transform: expert.status === "Active" ? "translateX(16px)" : "translateX(0)"
                          }}
                        />
                      </button>
                      <span style={{ fontSize: "12px", fontWeight: 500, color: expert.status === "Active" ? "#10b981" : "#888" }}>
                        {expert.status}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openView(expert)}
                        className="p-1.5 bg-blue bg-blue-50 text-blue-600 border-none cursor-pointer hover:bg-blue-100 rounded-lg"
                        title="View details"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={() => openEdit(expert)}
                        className="p-1.5 bg-orange-50 text-[#FF6B00] border-none cursor-pointer hover:bg-orange-100 rounded-lg"
                        title="Edit details"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => openDelete(expert)}
                        className="p-1.5 bg-red-50 text-red-500 border-none cursor-pointer hover:bg-red-100 rounded-lg"
                        title="Remove Expert"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: "40px 16px", textAlign: "center", color: "#bbb", fontSize: "14px" }}>No experts found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modal.open && modal.mode === "view" && modal.item && (
        <Modal isOpen={true} onClose={close} title="Expert Details" size="md">
          <div className="space-y-4" style={{ fontFamily: "'Inter', sans-serif" }}>
            <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
              <img src={modal.item.photo || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"} alt={modal.item.name} style={{ width: "64px", height: "64px", borderRadius: "50%", objectFit: "cover", border: "2px solid #FF6B00" }} />
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0d0d0d" }}>{modal.item.name}</h3>
                <p style={{ fontSize: "13px", color: "#555" }}>{modal.item.role} at {modal.item.company}</p>
                {modal.item.currentProblemStatement && (
                  <span style={{ display: "inline-block", fontSize: "11px", fontWeight: 600, color: "#FF6B00", background: "rgba(255,107,0,0.1)", padding: "2px 8px", borderRadius: "99px", marginTop: "4px" }}>{modal.item.currentProblemStatement}</span>
                )}
              </div>
            </div>
            {modal.item.description && (
              <div>
                <label style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: 600, color: "#aaa" }}>Description</label>
                <p style={{ fontSize: "13.5px", color: "#555", marginTop: "2px", lineHeight: "1.4" }}>{modal.item.description}</p>
              </div>
            )}
            {modal.item.bio && (
              <div>
                <label style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: 600, color: "#aaa" }}>Bio / Notes</label>
                <p style={{ fontSize: "13.5px", color: "#555", marginTop: "2px", lineHeight: "1.4" }}>{modal.item.bio}</p>
              </div>
            )}
            {modal.item.socialLinks && modal.item.socialLinks.filter(l => l.trim()).length > 0 && (
              <div>
                <label style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: 600, color: "#aaa" }}>Social Media Links</label>
                <div style={{ marginTop: "6px", display: "flex", flexDirection: "column", gap: "4px" }}>
                  {modal.item.socialLinks.filter(l => l.trim()).map((link, i) => (
                    <a key={i} href={link} target="_blank" rel="noopener noreferrer" style={{ color: "#FF6B00", textDecoration: "none", fontSize: "13px", fontWeight: 500, display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <Link2 size={13} /> {link}
                    </a>
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-end pt-2">
              <GhostBtn onClick={close}>Close</GhostBtn>
            </div>
          </div>
        </Modal>
      )}

      {modal.open && (modal.mode === "add" || modal.mode === "edit") && (
        <Modal isOpen={true} onClose={close} title={modal.mode === "add" ? "Add Expert" : "Edit Expert"} size="md">
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 no-scrollbar">
            <FormField label="Full Name *">
              <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Sneha Joshi" />
            </FormField>
            <div className="grid grid-cols-2 gap-4" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <FormField label="Designation / Role *">
                <Input value={form.role} onChange={(e) => set("role", e.target.value)} placeholder="e.g. Lead Product Manager" />
              </FormField>
              <FormField label="Company *">
                <Input value={form.company} onChange={(e) => set("company", e.target.value)} placeholder="e.g. Google" />
              </FormField>
            </div>

            <FormField label="Description">
              <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Briefly describe the expert's background, skills, and what they offer to interns…" rows={3} />
            </FormField>

            <FormField label="Current Problem Statement">
              <Select value={form.currentProblemStatement} onChange={(e) => set("currentProblemStatement", e.target.value)}>
                <option value="">— None —</option>
                {problemStatements.map((ps) => (
                  <option key={ps} value={ps}>{ps}</option>
                ))}
              </Select>
            </FormField>

            <div>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "#374151", display: "block", marginBottom: "8px" }}>Social Media Links</label>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {form.socialLinks.map((link, index) => (
                  <div key={index} style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    <Input
                      type="url"
                      value={link}
                      onChange={(e) => updateSocialLink(index, e.target.value)}
                      placeholder="https://linkedin.com/in/... or https://twitter.com/..."
                    />
                    {form.socialLinks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSocialLink(index)}
                        className="border-none cursor-pointer"
                        style={{ padding: "6px", background: "rgba(239,68,68,0.08)", borderRadius: "8px", color: "#ef4444", flexShrink: 0 }}
                      >
                        <XIcon size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addSocialLink}
                className="border-none cursor-pointer animate-fade-in"
                style={{ marginTop: "8px", background: "rgba(255,107,0,0.08)", color: "#FF6B00", padding: "6px 14px", borderRadius: "99px", fontSize: "12px", fontWeight: 600 }}
              >
                + Add Another Link
              </button>
            </div>

            <div>
              <FormField label="Expert Photo (Drag & Drop or Click to Upload)">
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById("expert-photo-upload")?.click()}
                  style={{
                    borderColor: dragActive ? "#FF6B00" : "#ebebeb",
                    background: dragActive ? "rgba(255,107,0,0.04)" : "#fcfcfc",
                    borderStyle: "dashed",
                    borderWidth: "2px",
                    borderRadius: "12px",
                    padding: "16px",
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  <input id="expert-photo-upload" type="file" accept="image/*" className="hidden" onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFile(e.target.files[0]);
                    }
                  }} />
                  {form.photo ? (
                    <div className="flex flex-col items-center">
                      <img src={form.photo} alt="Preview" className="w-16 h-16 rounded-full object-cover mb-2" />
                      <span className="text-[11px] text-gray-400">Click to select a different photo</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <UploadCloud size={24} className="text-[#FF6B00] mb-1" />
                      <span className="text-xs font-semibold text-gray-700">Drag & drop profile picture here</span>
                    </div>
                  )}
                </div>
              </FormField>
            </div>

            <FormField label="Bio / Notes">
              <Textarea value={form.bio} onChange={(e) => set("bio", e.target.value)} placeholder="Write a brief profile or achievements..." rows={3} />
            </FormField>

            <FormField label="Status">
              <Select value={form.status} onChange={(e) => set("status", e.target.value)}>
                <option>Active</option>
                <option>Inactive</option>
              </Select>
            </FormField>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <GhostBtn onClick={close}>Cancel</GhostBtn>
              <PrimaryBtn onClick={save}>{modal.mode === "add" ? "Add Expert" : "Save Changes"}</PrimaryBtn>
            </div>
          </div>
        </Modal>
      )}

      <Modal isOpen={modal.open && modal.mode === "delete"} onClose={close} title="Remove Expert" size="sm">
        <p style={{ fontSize: "14px", color: "#555", marginBottom: "20px" }}>
          Remove expert <strong>"{modal.item?.name}"</strong>? This cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <GhostBtn onClick={close}>Cancel</GhostBtn>
          <DangerBtn onClick={remove}>Remove</DangerBtn>
        </div>
      </Modal>
    </div>
  );
}
