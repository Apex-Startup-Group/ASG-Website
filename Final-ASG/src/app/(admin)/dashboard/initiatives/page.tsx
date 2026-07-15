"use client";

import React, { useState, useEffect } from "react";
import { Search, Plus, Pencil, Trash2, Milestone, Undo, Redo } from "lucide-react";
import Modal, { FormField, Input, Textarea, PrimaryBtn, DangerBtn, GhostBtn } from "@/components/admin/Modal";
import { PageHeader } from "@/components/admin/PageHeader";
import { useUndoRedoState } from "@/hooks/admin/useUndoRedoState";

interface Initiative {
  id: string | number;
  icon: string; // emoji or icon URL
  title: string;
  shortDescription: string;
}

const INITIAL: Initiative[] = [];

const empty: Omit<Initiative, "id"> = {
  icon: "💡",
  title: "",
  shortDescription: ""
};

export default function ASGInitiativesPage() {
  const [initiatives, setInitiatives, undo, redo, canUndo, canRedo] = useUndoRedoState<Initiative[]>(INITIAL);

  useEffect(() => {
    async function loadInitiatives() {
      try {
        const res = await fetch('/api/v1/admin/initiatives');
        if (res.ok) {
          const { data } = await res.json();
          if (data) {
            const mapped = data.map((i: any) => ({
              id: i.id,
              icon: i.emoji || "💡",
              title: i.title,
              shortDescription: i.description || ""
            }));
            setInitiatives(mapped);
          }
        }
      } catch (err) {
        console.error("Failed to load initiatives:", err);
      }
    }
    loadInitiatives();
  }, [setInitiatives]);

  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<{ open: boolean; mode: "add" | "edit" | "delete"; item: Initiative | null }>({
    open: false, mode: "add", item: null
  });
  const [form, setForm] = useState<Omit<Initiative, "id">>(empty);

  const filtered = initiatives.filter((i) => {
    return (
      i.title.toLowerCase().includes(search.toLowerCase()) ||
      i.shortDescription.toLowerCase().includes(search.toLowerCase())
    );
  });

  const openAdd = () => {
    setForm(empty);
    setModal({ open: true, mode: "add", item: null });
  };

  const openEdit = (item: Initiative) => {
    const { id, ...rest } = item;
    setForm(rest);
    setModal({ open: true, mode: "edit", item });
  };

  const openDelete = (item: Initiative) => setModal({ open: true, mode: "delete", item });
  const close = () => setModal((m) => ({ ...m, open: false }));

  const save = async () => {
    if (!form.title || !form.shortDescription) return;
    try {
      if (modal.mode === "add") {
        const res = await fetch('/api/v1/admin/initiatives', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            const init = json.data;
            const newItem = {
              id: init.id,
              icon: init.emoji || "💡",
              title: init.title,
              shortDescription: init.description || ""
            };
            setInitiatives((prev) => [...prev, newItem]);
          }
        }
      } else if (modal.item) {
        const id = modal.item.id;
        const res = await fetch('/api/v1/admin/initiatives', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, id }),
        });
        if (res.ok) {
          setInitiatives((prev) =>
            prev.map((i) =>
              i.id === id
                ? {
                    ...i,
                    icon: form.icon,
                    title: form.title,
                    shortDescription: form.shortDescription
                  }
                : i
            )
          );
        }
      }
      close();
    } catch (err) {
      console.error("Failed to save initiative:", err);
    }
  };

  const remove = async () => {
    if (modal.item) {
      const id = modal.item.id;
      try {
        const res = await fetch(`/api/v1/admin/initiatives?id=${id}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          setInitiatives((prev) => prev.filter((i) => i.id !== id));
        }
      } catch (err) {
        console.error("Failed to delete initiative:", err);
      }
    }
    close();
  };

  const set = (k: keyof typeof form, v: any) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div>
      <PageHeader
        icon={<Milestone size={20} style={{ color: "#FF6B00" }} />}
        title="ASG Initiatives"
        subtitle={`${initiatives.length} total initiatives managed`}
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
            <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold border-none hover:opacity-90"
              style={{ background: "#FF6B00", cursor: "pointer", fontFamily: "'Satoshi', sans-serif", boxShadow: "0 2px 10px rgba(255,107,0,0.35)" }}>
              <Plus size={16} /> Add Initiative
            </button>
          </div>
        }
      />

      <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid #f0f0f0" }}>
        <div className="flex flex-wrap items-center gap-3 px-5 py-4" style={{ borderBottom: "1px solid #f5f5f5" }}>
          <div className="flex items-center gap-2 flex-1 min-w-[180px]">
            <Search size={15} style={{ color: "#bbb" }} />
            <input
              placeholder="Search initiatives…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ border: "none", outline: "none", fontSize: "14px", color: "#555", background: "none", flex: 1, fontFamily: "'Inter', sans-serif" }}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#fafafa" }}>
                {["Icon", "Title", "Short Description", "Actions"].map((h) => (
                  <th key={h} style={{ textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.06em", padding: "12px 16px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((init) => (
                <tr key={init.id} style={{ borderTop: "1px solid #f5f5f5" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#fafafa")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                  <td style={{ padding: "14px 16px", fontSize: "20px" }}>{init.icon}</td>
                  <td style={{ padding: "14px 16px", fontSize: "14px", fontWeight: 600, color: "#0d0d0d" }}>{init.title}</td>
                  <td style={{ padding: "14px 16px", fontSize: "13px", color: "#555", maxWidth: "400px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {init.shortDescription}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(init)}
                        style={{ padding: "6px", background: "none", border: "none", cursor: "pointer", color: "#FF6B00" }}
                        title="Edit initiative"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => openDelete(init)}
                        style={{ padding: "6px", background: "none", border: "none", cursor: "pointer", color: "#ef4444" }}
                        title="Delete initiative"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: "40px 16px", textAlign: "center", color: "#bbb", fontSize: "14px" }}>No initiatives found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modal.open && (modal.mode === "add" || modal.mode === "edit") && (
        <Modal isOpen={true} onClose={close} title={modal.mode === "add" ? "Add Initiative" : "Edit Initiative"} size="md">
          <div className="space-y-4">
            <FormField label="Icon (Emoji or Icon Symbol) *">
              <Input value={form.icon} onChange={(e) => set("icon", e.target.value)} placeholder="e.g. 💡 or 🚀" />
            </FormField>
            <FormField label="Title *">
              <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Mentorship Circles" />
            </FormField>
            <FormField label="Short Description *">
              <Textarea value={form.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} placeholder="Describe the initiative, its goals, and what cohorts get from it…" rows={3} />
            </FormField>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <GhostBtn onClick={close}>Cancel</GhostBtn>
              <PrimaryBtn onClick={save}>{modal.mode === "add" ? "Add Initiative" : "Save Changes"}</PrimaryBtn>
            </div>
          </div>
        </Modal>
      )}

      <Modal isOpen={modal.open && modal.mode === "delete"} onClose={close} title="Remove Initiative" size="sm">
        <p style={{ fontSize: "14px", color: "#555", marginBottom: "20px" }}>
          Remove initiative <strong>"{modal.item?.title}"</strong>? This cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <GhostBtn onClick={close}>Cancel</GhostBtn>
          <DangerBtn onClick={remove}>Remove</DangerBtn>
        </div>
      </Modal>
    </div>
  );
}
