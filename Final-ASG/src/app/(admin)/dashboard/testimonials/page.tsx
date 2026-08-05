"use client";

import React, { useState, useEffect } from "react";
import { Search, Quote, Plus, Pencil, Trash2, Star, Undo, Redo } from "lucide-react";
import Modal, { FormField, Input, Select, Textarea, PrimaryBtn, DangerBtn, GhostBtn } from "@/components/admin/Modal";
import { PageHeader } from "@/components/admin/PageHeader";
import { useUndoRedoState } from "@/hooks/admin/useUndoRedoState";
import ImageUpload from "@/components/shared/ImageUpload";
import {
  getTestimonialsAction,
  createTestimonialAction,
  updateTestimonialAction,
  deleteTestimonialAction,
  toggleTestimonialStatusAction,
  TestimonialRecord
} from "@/app/actions/testimonials";

const INITIAL: TestimonialRecord[] = [];

const empty: Omit<TestimonialRecord, "id" | "showOnWebsite"> = {
  name: "",
  role: "",
  company: "",
  avatar: "",
  content: "",
  rating: 5,
  status: "Active",
  displayOrder: 0
};

export default function TestimonialsAdminPage() {
  const [items, setItems, undo, redo, canUndo, canRedo] = useUndoRedoState<TestimonialRecord[]>(INITIAL);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const fetched = await getTestimonialsAction();
        setItems(fetched);
      } catch (err) {
        console.error("Failed to load testimonials:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [setItems]);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"All" | "Active" | "Inactive">("All");
  const [modal, setModal] = useState<{ open: boolean; mode: "add" | "edit" | "delete"; item: TestimonialRecord | null }>({
    open: false, mode: "add", item: null
  });
  const [form, setForm] = useState<Omit<TestimonialRecord, "id" | "showOnWebsite">>(empty);

  const filtered = items.filter((t) => {
    const matchSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.role.toLowerCase().includes(search.toLowerCase()) ||
      t.company.toLowerCase().includes(search.toLowerCase()) ||
      t.content.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "All" || t.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const toggleStatus = async (id: string) => {
    const item = items.find((t) => t.id === id);
    if (!item) return;
    const nextStatus = item.status === "Active" ? "Inactive" : "Active";
    try {
      await toggleTestimonialStatusAction(id, nextStatus);
      setItems((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: nextStatus, showOnWebsite: nextStatus === "Active" } : t))
      );
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  const openAdd = () => {
    setForm(empty);
    setModal({ open: true, mode: "add", item: null });
  };
  const openEdit = (item: TestimonialRecord) => {
    const { id, showOnWebsite, createdAt, updatedAt, ...rest } = item;
    setForm(rest);
    setModal({ open: true, mode: "edit", item });
  };
  const openDelete = (item: TestimonialRecord) => setModal({ open: true, mode: "delete", item });
  const close = () => setModal((m) => ({ ...m, open: false }));

  const save = async () => {
    if (!form.name || !form.role || !form.content) return;
    try {
      if (modal.mode === "add") {
        const added = await createTestimonialAction({
          name: form.name,
          role: form.role,
          company: form.company,
          avatar: form.avatar,
          content: form.content,
          rating: Number(form.rating) || 5,
          status: form.status
        });
        setItems((prev) => [added, ...prev]);
      } else if (modal.item) {
        const updated = await updateTestimonialAction(modal.item.id, {
          name: form.name,
          role: form.role,
          company: form.company,
          avatar: form.avatar,
          content: form.content,
          rating: Number(form.rating) || 5,
          status: form.status
        });
        setItems((prev) => prev.map((t) => (t.id === modal.item?.id ? updated : t)));
      }
      close();
    } catch (err) {
      console.error("Failed to save testimonial:", err);
    }
  };

  const remove = async () => {
    if (modal.item) {
      const id = modal.item.id;
      try {
        await deleteTestimonialAction(id);
        setItems((prev) => prev.filter((t) => t.id !== id));
      } catch (err) {
        console.error("Failed to delete testimonial:", err);
      }
    }
    close();
  };

  const set = (k: keyof typeof form, v: any) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div>
      <PageHeader
        icon={<Quote size={20} style={{ color: "#FF6B00" }} />}
        title="Testimonials"
        subtitle={`${items.length} total testimonials · ${items.filter((t) => t.status === "Active").length} active on website`}
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
            <button
              onClick={openAdd}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold border-none hover:opacity-90 cursor-pointer"
              style={{ background: "#FF6B00", fontFamily: "'Satoshi', sans-serif", boxShadow: "0 2px 10px rgba(255,107,0,0.35)" }}
            >
              <Plus size={16} /> Add Testimonial
            </button>
          </div>
        }
      />

      <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid #f0f0f0" }}>
        <div className="flex flex-wrap items-center gap-3 px-5 py-4" style={{ borderBottom: "1px solid #f5f5f5" }}>
          <div className="flex items-center gap-2 flex-1 min-w-[180px]">
            <Search size={15} style={{ color: "#bbb" }} />
            <input
              placeholder="Search by name, role, company, or content…"
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
                {["Author", "Role & Company", "Rating", "Content", "Status", "Actions"].map((h) => (
                  <th key={h} style={{ textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.06em", padding: "12px 16px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} style={{ borderTop: "1px solid #f5f5f5" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#fafafa")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                  <td style={{ padding: "14px 16px" }}>
                    <div className="flex items-center gap-3">
                      {t.avatar ? (
                        <img
                          src={t.avatar}
                          alt={t.name}
                          style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", border: "1px solid #eee" }}
                        />
                      ) : (
                        <div style={{
                          width: 40, height: 40, borderRadius: "50%", fontSize: 16,
                          fontWeight: 700, color: "#FF6B00",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          background: "#fff7f0", border: "1px solid #ffe4cc", flexShrink: 0
                        }}>
                          {t.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div style={{ fontSize: "14px", fontWeight: 600, color: "#0d0d0d" }}>{t.name}</div>
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: "13px", color: "#555" }}>
                    <div style={{ fontWeight: 500, color: "#111" }}>{t.role}</div>
                    {t.company && <div style={{ fontSize: "12px", color: "#888" }}>{t.company}</div>}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          fill={i < t.rating ? "#f59e0b" : "none"}
                          color={i < t.rating ? "#f59e0b" : "#d1d5db"}
                        />
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: "13px", color: "#555", maxWidth: "300px" }}>
                    <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      "{t.content}"
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleStatus(t.id)}
                        className="relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out align-middle border-none"
                        style={{
                          background: t.status === "Active" ? "#10b981" : "#e5e7eb",
                          outline: "none"
                        }}
                        title={t.status === "Active" ? "Disable" : "Enable"}
                      >
                        <span
                          className="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out"
                          style={{
                            transform: t.status === "Active" ? "translateX(16px)" : "translateX(0)"
                          }}
                        />
                      </button>
                      <span style={{ fontSize: "12px", fontWeight: 500, color: t.status === "Active" ? "#10b981" : "#888" }}>
                        {t.status}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(t)}
                        className="p-1.5 bg-orange-50 text-[#FF6B00] border-none cursor-pointer hover:bg-orange-100 rounded-lg"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => openDelete(t)}
                        className="p-1.5 bg-red-50 text-red-500 border-none cursor-pointer hover:bg-red-100 rounded-lg"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} style={{ padding: "40px 16px", textAlign: "center", color: "#bbb", fontSize: "14px" }}>
                    No testimonials found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modal.open && (modal.mode === "add" || modal.mode === "edit") && (
        <Modal isOpen={true} onClose={close} title={modal.mode === "add" ? "Add Testimonial" : "Edit Testimonial"} size="md">
          <div className="space-y-4">
            <FormField label="Author Name *">
              <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Rahul Sharma" />
            </FormField>
            <FormField label="Role / Designation *">
              <Input value={form.role} onChange={(e) => set("role", e.target.value)} placeholder="e.g. Founder & CEO, AI Launchpad Intern" />
            </FormField>
            <FormField label="Company / Organization">
              <Input value={form.company} onChange={(e) => set("company", e.target.value)} placeholder="e.g. TechCorp Solutions" />
            </FormField>
            <FormField label="Avatar Photo">
              <ImageUpload
                uploadType="testimonial_avatar"
                value={form.avatar}
                onChange={(url) => set("avatar", url)}
                allowFlexibleCrop={false}
              />
            </FormField>
            <FormField label="Rating">
              <Select value={form.rating} onChange={(e) => set("rating", Number(e.target.value))}>
                <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
                <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
                <option value={3}>⭐⭐⭐ (3 Stars)</option>
                <option value={2}>⭐⭐ (2 Stars)</option>
                <option value={1}>⭐ (1 Star)</option>
              </Select>
            </FormField>
            <FormField label="Testimonial Quote *">
              <Textarea value={form.content} onChange={(e) => set("content", e.target.value)} placeholder="Write the testimonial review quote…" rows={4} />
            </FormField>
            <FormField label="Status">
              <Select value={form.status} onChange={(e) => set("status", e.target.value)}>
                <option value="Active">Active (Show on website)</option>
                <option value="Inactive">Inactive</option>
              </Select>
            </FormField>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <GhostBtn onClick={close}>Cancel</GhostBtn>
              <PrimaryBtn onClick={save}>{modal.mode === "add" ? "Add Testimonial" : "Save Changes"}</PrimaryBtn>
            </div>
          </div>
        </Modal>
      )}

      <Modal isOpen={modal.open && modal.mode === "delete"} onClose={close} title="Remove Testimonial" size="sm">
        <p style={{ fontSize: "14px", color: "#555", marginBottom: "20px" }}>
          Remove testimonial by <strong>"{modal.item?.name}"</strong>? This cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <GhostBtn onClick={close}>Cancel</GhostBtn>
          <DangerBtn onClick={remove}>Remove</DangerBtn>
        </div>
      </Modal>
    </div>
  );
}
