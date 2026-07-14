"use client";

import React, { useState, useEffect } from "react";
import { Search, Handshake, Plus, Pencil, Trash2, ExternalLink, Undo, Redo } from "lucide-react";
import Modal, { FormField, Input, Select, Textarea, PrimaryBtn, DangerBtn, GhostBtn } from "@/components/admin/Modal";
import { PageHeader } from "@/components/admin/PageHeader";
import { useUndoRedoState } from "@/hooks/admin/useUndoRedoState";
import ImageUpload from "@/components/shared/ImageUpload";
import {
  getPartnersAction,
  createPartnerAction,
  updatePartnerAction,
  deletePartnerAction,
  togglePartnerStatusAction
} from "@/app/actions/partners";

interface Partner {
  id: string | number;
  name: string;
  logo: string; // URL or Emoji
  website: string;
  category: string; // e.g. Tech Partner, Media Partner, Incubation Partner, Legal Partner
  description: string;
  status: "Active" | "Inactive";
  showOnWebsite: boolean;
}

const INITIAL: Partner[] = [];

const empty: Omit<Partner, "id"> = {
  name: "",
  logo: "",
  website: "",
  category: "Technology",
  description: "",
  status: "Active",
  showOnWebsite: true
};

export default function IndustryPartnersPage() {
  const [partners, setPartners, undo, redo, canUndo, canRedo] = useUndoRedoState<Partner[]>(INITIAL);

  useEffect(() => {
    async function loadPartners() {
      try {
        const fetched = await getPartnersAction();
        const mapped = fetched.map((p: any) => ({
          id: p.id,
          name: p.name,
          logo: p.logo || "🤝",
          website: p.websiteUrl || p.website || "",
          category: p.category || "Technology",
          description: p.description || "",
          status: p.status || "Active",
          showOnWebsite: p.showOnWebsite
        }));
        setPartners(mapped);
      } catch (err) {
        console.error("Failed to load partners:", err);
      }
    }
    loadPartners();
  }, [setPartners]);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"All" | "Active" | "Inactive">("All");
  const [modal, setModal] = useState<{ open: boolean; mode: "add" | "edit" | "delete"; item: Partner | null }>({
    open: false, mode: "add", item: null
  });
  const [form, setForm] = useState<Omit<Partner, "id">>(empty);

  const filtered = partners.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "All" || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const toggleStatus = async (id: string | number) => {
    const partner = partners.find((p) => p.id === id);
    if (!partner) return;
    const nextStatus = partner.status === "Active" ? "Inactive" : "Active";
    try {
      await togglePartnerStatusAction(String(id), nextStatus);
      setPartners((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: nextStatus } : p))
      );
    } catch (err) {
      console.error("Failed to toggle partner status:", err);
    }
  };

  const openAdd = () => {
    setForm(empty);
    setModal({ open: true, mode: "add", item: null });
  };
  const openEdit = (item: Partner) => {
    const { id, ...rest } = item;
    setForm(rest);
    setModal({ open: true, mode: "edit", item });
  };
  const openDelete = (item: Partner) => setModal({ open: true, mode: "delete", item });
  const close = () => setModal((m) => ({ ...m, open: false }));

  const save = async () => {
    if (!form.name || !form.website) return;
    try {
      if (modal.mode === "add") {
        const added = await createPartnerAction({
          name: form.name,
          logo: form.logo,
          websiteUrl: form.website,
          category: form.category,
          status: form.status,
        });
        const newPartner = {
          id: added.id,
          name: added.name,
          logo: added.logo || "🤝",
          website: added.websiteUrl || added.website || "",
          category: added.category || "Technology",
          description: added.description || "",
          status: added.status || "Active",
          showOnWebsite: added.showOnWebsite
        };
        setPartners((prev) => [...prev, newPartner]);
      } else if (modal.item) {
        const id = modal.item.id;
        await updatePartnerAction(String(id), {
          name: form.name,
          logo: form.logo,
          websiteUrl: form.website,
          category: form.category,
          status: form.status,
        });
        setPartners((prev) =>
          prev.map((p) =>
            p.id === id
              ? {
                  ...p,
                  name: form.name,
                  logo: form.logo,
                  website: form.website,
                  category: form.category,
                  status: form.status,
                }
              : p
          )
        );
      }
      close();
    } catch (err) {
      console.error("Failed to save partner:", err);
    }
  };

  const remove = async () => {
    if (modal.item) {
      const id = modal.item.id;
      try {
        if (modal.item.logo && modal.item.logo.includes('supabase.co')) {
          const filePath = modal.item.logo.split('/public/logos/')[1];
          if (filePath) {
            await fetch('/api/v1/delete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ bucket: 'logos', paths: [filePath] })
            });
          }
        }
      } catch (err) {
        console.error("Storage delete error:", err);
      }

      try {
        await deletePartnerAction(String(id));
        setPartners((prev) => prev.filter((p) => p.id !== id));
      } catch (err) {
        console.error("Failed to delete partner:", err);
      }
    }
    close();
  };

  const set = (k: keyof typeof form, v: any) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div>
      <PageHeader
        icon={<Handshake size={20} style={{ color: "#FF6B00" }} />}
        title="Industry Partners"
        subtitle={`${partners.length} total partners · ${partners.filter((p) => p.status === "Active").length} active`}
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
              <Plus size={16} /> Add Partner
            </button>
          </div>
        }
      />

      <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid #f0f0f0" }}>
        <div className="flex flex-wrap items-center gap-3 px-5 py-4" style={{ borderBottom: "1px solid #f5f5f5" }}>
          <div className="flex items-center gap-2 flex-1 min-w-[180px]">
            <Search size={15} style={{ color: "#bbb" }} />
            <input
              placeholder="Search partners…"
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
                {["Partner Logo & Name", "Category", "Website", "Description", "Status", "Actions"].map((h) => (
                  <th key={h} style={{ textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.06em", padding: "12px 16px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((partner) => (
                <tr key={partner.id} style={{ borderTop: "1px solid #f5f5f5" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#fafafa")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                  <td style={{ padding: "14px 16px" }}>
                    <div className="flex items-center gap-3">
                      {/* Smart logo: render image if URL, emoji if short string, else letter avatar */}
                      {partner.logo && (partner.logo.startsWith('http') || partner.logo.startsWith('/')) ? (
                        <div style={{
                          width: 40, height: 40, borderRadius: 10,
                          border: "1px solid #f0f0f0",
                          background: "#fafafa",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          overflow: "hidden", flexShrink: 0
                        }}>
                          <img
                            src={partner.logo}
                            alt={partner.name}
                            style={{ width: "100%", height: "100%", objectFit: "contain" }}
                            onError={(e) => {
                              // fallback to letter avatar on broken image
                              (e.currentTarget as HTMLImageElement).style.display = 'none';
                              (e.currentTarget.parentElement as HTMLElement).innerText = partner.name.charAt(0).toUpperCase();
                            }}
                          />
                        </div>
                      ) : partner.logo && partner.logo.length <= 4 ? (
                        <div style={{
                          width: 40, height: 40, borderRadius: 10, fontSize: 22,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          background: "#fff7f0", border: "1px solid #ffe4cc", flexShrink: 0
                        }}>
                          {partner.logo}
                        </div>
                      ) : (
                        <div style={{
                          width: 40, height: 40, borderRadius: 10, fontSize: 16,
                          fontWeight: 700, color: "#FF6B00",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          background: "#fff7f0", border: "1px solid #ffe4cc", flexShrink: 0
                        }}>
                          {partner.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div style={{ fontSize: "14px", fontWeight: 600, color: "#0d0d0d" }}>{partner.name}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ fontSize: "12px", fontWeight: 500, padding: "3px 10px", borderRadius: "99px", background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>{partner.category}</span>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: "13px" }}>
                    <a href={partner.website} target="_blank" rel="noopener noreferrer" style={{ color: "#FF6B00", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      Link <ExternalLink size={12} />
                    </a>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: "13px", color: "#555", maxWidth: "250px" }}>
                    <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{partner.description}</div>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleStatus(partner.id)}
                        className="relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out align-middle border-none"
                        style={{
                          background: partner.status === "Active" ? "#10b981" : "#e5e7eb",
                          outline: "none"
                        }}
                        title={partner.status === "Active" ? "Disable" : "Enable"}
                      >
                        <span
                          className="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out"
                          style={{
                            transform: partner.status === "Active" ? "translateX(16px)" : "translateX(0)"
                          }}
                        />
                      </button>
                      <span style={{ fontSize: "12px", fontWeight: 500, color: partner.status === "Active" ? "#10b981" : "#888" }}>
                        {partner.status}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(partner)}
                        className="p-1.5 bg-orange-50 text-[#FF6B00] border-none cursor-pointer hover:bg-orange-100 rounded-lg"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => openDelete(partner)}
                        className="p-1.5 bg-red-50 text-red-500 border-none cursor-pointer hover:bg-red-100 rounded-lg"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: "40px 16px", textAlign: "center", color: "#bbb", fontSize: "14px" }}>No partners found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modal.open && (modal.mode === "add" || modal.mode === "edit") && (
        <Modal isOpen={true} onClose={close} title={modal.mode === "add" ? "Add Partner" : "Edit Partner"} size="md">
          <div className="space-y-4">
            <FormField label="Partner Name *">
              <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. AWS" />
            </FormField>
            <FormField label="Website Link *">
              <Input type="url" value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="https://..." />
            </FormField>
            <FormField label="Category">
              <Select value={form.category} onChange={(e) => set("category", e.target.value)}>
                <option>Technology</option>
                <option>SaaS Products</option>
                <option>Incubation</option>
                <option>Legal</option>
                <option>Marketing</option>
                <option>Fintech</option>
              </Select>
            </FormField>
            <FormField label="Logo">
              <ImageUpload
                uploadType="industry_partner_logo"
                value={form.logo}
                onChange={(url) => set("logo", url)}
              />
            </FormField>
            <FormField label="Description">
              <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Describe the partnership benefits…" rows={3} />
            </FormField>
            <FormField label="Status">
                <Select value={form.status} onChange={(e) => set("status", e.target.value)}>
                  <option>Active</option>
                  <option>Inactive</option>
                </Select>
              </FormField>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <GhostBtn onClick={close}>Cancel</GhostBtn>
              <PrimaryBtn onClick={save}>{modal.mode === "add" ? "Add Partner" : "Save Changes"}</PrimaryBtn>
            </div>
          </div>
        </Modal>
      )}

      <Modal isOpen={modal.open && modal.mode === "delete"} onClose={close} title="Remove Partner" size="sm">
        <p style={{ fontSize: "14px", color: "#555", marginBottom: "20px" }}>
          Remove partner <strong>"{modal.item?.name}"</strong>? This cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <GhostBtn onClick={close}>Cancel</GhostBtn>
          <DangerBtn onClick={remove}>Remove</DangerBtn>
        </div>
      </Modal>
    </div>
  );
}
