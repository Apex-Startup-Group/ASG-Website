"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Pencil, Images, Search, Filter, UploadCloud, X, Undo, Redo } from "lucide-react";
import Modal, { FormField, Input, Select, Textarea, PrimaryBtn, DangerBtn, GhostBtn } from "@/components/admin/Modal";
import { PageHeader } from "@/components/admin/PageHeader";
import { useUndoRedoState } from "@/hooks/admin/useUndoRedoState";

interface GalleryItem {
  id: string | number;
  title: string;
  year: string;
  date: string;
  description: string;
  photos: string[]; // array of strings (base64 or URL)
  photographer?: string;
}

const INITIAL: GalleryItem[] = [];

const YEARS = ["All", "2026", "2025", "2024", "2023", "2022", "2021", "2020", "2019"];

const empty: Omit<GalleryItem, "id"> = {
  title: "",
  year: "2026",
  date: "",
  description: "",
  photos: [],
  photographer: "APEX Media Team"
};

export default function GalleryPage() {
  const [items, setItems, undo, redo, canUndo, canRedo] = useUndoRedoState<GalleryItem[]>(INITIAL);
  const [search, setSearch] = useState("");
  const [filterYear, setFilterYear] = useState("All");
  const [modal, setModal] = useState<{ open: boolean; mode: "add" | "edit" | "delete"; item: GalleryItem | null }>({
    open: false, mode: "add", item: null,
  });
  const [form, setForm] = useState<Omit<GalleryItem, "id">>(empty);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    async function loadGallery() {
      try {
        const res = await fetch('/api/v1/admin/gallery');
        if (res.ok) {
          const { data } = await res.json();
          if (data) {
            setItems(data);
          }
        }
      } catch (err) {
        console.error("Failed to load admin gallery:", err);
      }
    }
    loadGallery();
  }, [setItems]);

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
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFiles = (files: File[]) => {
    files.forEach(file => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setForm((f) => ({
            ...f,
            photos: [...f.photos, event.target!.result as string]
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhotoAtIndex = (index: number) => {
    setForm((f) => ({
      ...f,
      photos: f.photos.filter((_, i) => i !== index)
    }));
  };

  const filtered = items.filter((i) => {
    const matchSearch = i.title.toLowerCase().includes(search.toLowerCase()) || i.description.toLowerCase().includes(search.toLowerCase());
    const matchYear = filterYear === "All" || i.year === filterYear;
    return matchSearch && matchYear;
  });

  const openAdd = () => {
    setForm(empty);
    setModal({ open: true, mode: "add", item: null });
  };
  const openEdit = (item: GalleryItem) => {
    const { id, ...rest } = item;
    setForm(rest);
    setModal({ open: true, mode: "edit", item });
  };
  const openDelete = (item: GalleryItem) => setModal({ open: true, mode: "delete", item });
  const close = () => setModal((m) => ({ ...m, open: false }));

  const save = async () => {
    if (!form.title || !form.date) return;
    const finalPhotos = form.photos.length > 0 ? form.photos : ["https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop"];
    const entryYear = form.date.split("-")[0] || form.year;

    try {
      if (modal.mode === "add") {
        const res = await fetch('/api/v1/admin/gallery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: form.title,
            description: form.description,
            date: form.date,
            photos: finalPhotos,
          }),
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            const album = json.data;
            const newItem = {
              id: album.id,
              title: album.title,
              description: album.description || '',
              date: album.eventDate ? album.eventDate.slice(0, 10) : form.date,
              year: entryYear,
              photos: finalPhotos,
              photographer: form.photographer
            };
            setItems((prev) => [...prev, newItem]);
          }
        }
      } else if (modal.item) {
        const id = modal.item.id;
        const res = await fetch('/api/v1/admin/gallery', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id,
            title: form.title,
            description: form.description,
            date: form.date,
            photos: finalPhotos,
          }),
        });
        if (res.ok) {
          setItems((prev) =>
            prev.map((i) =>
              i.id === id
                ? {
                    ...i,
                    title: form.title,
                    description: form.description,
                    date: form.date,
                    year: entryYear,
                    photos: finalPhotos,
                    photographer: form.photographer
                  }
                : i
            )
          );
        }
      }
      close();
    } catch (err) {
      console.error("Failed to save gallery album:", err);
    }
  };

  const remove = async () => {
    if (modal.item) {
      const id = modal.item.id;
      try {
        const res = await fetch(`/api/v1/admin/gallery?id=${id}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          setItems((prev) => prev.filter((i) => i.id !== id));
        }
      } catch (err) {
        console.error("Failed to delete gallery album:", err);
      }
    }
    close();
  };

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div>
      <PageHeader
        icon={<Images size={20} style={{ color: "#FF6B00" }} />}
        title="Gallery Timeline"
        subtitle={`${items.length} chronological log entries`}
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
              <Plus size={16} /> Add Entry
            </button>
          </div>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl" style={{ border: "1px solid #f0f0f0" }}>
          <Search size={14} style={{ color: "#bbb" }} />
          <input
            placeholder="Search timeline..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: "none", outline: "none", fontSize: "13px", color: "#555", background: "none", fontFamily: "'Inter', sans-serif", width: "180px" }}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} style={{ color: "#8a8a8a" }} />
          <div className="flex gap-1 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {YEARS.map((y) => (
              <button
                key={y}
                onClick={() => setFilterYear(y)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "99px",
                  border: "none",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  background: filterYear === y ? "#FF6B00" : "#fff",
                  color: filterYear === y ? "#fff" : "#555",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
                  transition: "all 0.15s",
                  whiteSpace: "nowrap"
                }}
              >
                {y}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}
      >
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl overflow-hidden flex flex-col justify-between"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.07)", border: "1px solid #f0f0f0" }}
          >
            <div>
              <div className="relative overflow-hidden bg-gray-50" style={{ height: "180px" }}>
                <img
                  src={item.photos[0]}
                  alt={item.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <span
                  style={{
                    position: "absolute",
                    top: "10px",
                    left: "10px",
                    background: "#FF6B00",
                    color: "#fff",
                    fontSize: "11px",
                    fontWeight: 700,
                    padding: "3px 10px",
                    borderRadius: "99px",
                  }}
                >
                  {item.year}
                </span>
                {item.photos.length > 1 && (
                  <span
                    style={{
                      position: "absolute",
                      bottom: "10px",
                      right: "10px",
                      background: "rgba(0,0,0,0.7)",
                      color: "#fff",
                      fontSize: "10px",
                      fontWeight: 600,
                      padding: "2px 8px",
                      borderRadius: "6px",
                    }}
                  >
                    +{item.photos.length - 1} More Photos
                  </span>
                )}
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#0d0d0d" }}>{item.title}</h3>
                  <span className="text-[10px] text-[#FF6B00] font-bold bg-orange-50 px-2 py-0.5 rounded">{item.date.slice(5)}</span>
                </div>
                <p style={{ fontSize: "12px", color: "#555", lineHeight: 1.5 }} className="line-clamp-3">{item.description}</p>
              </div>
            </div>
            <div className="px-4 py-3 bg-gray-50/50 flex justify-between items-center border-t border-gray-100">
              <span className="text-[11px] text-gray-400 italic">Captured by: {item.photographer || "ASG"}</span>
              <div className="flex gap-1.5">
                <button onClick={() => openEdit(item)} className="p-1.5 text-gray-500 hover:text-[#FF6B00] border-none bg-transparent cursor-pointer"><Pencil size={14} /></button>
                <button onClick={() => openDelete(item)} className="p-1.5 text-gray-500 hover:text-red-500 border-none bg-transparent cursor-pointer"><Trash2 size={14} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      <Modal isOpen={modal.open && (modal.mode === "add" || modal.mode === "edit")} onClose={close} title={modal.mode === "add" ? "Create Timeline Log Entry" : "Modify Timeline Log"} size="lg">
        <div className="space-y-4">
          <FormField label="Timeline Title *">
            <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. APEX AI Launchpad: Cohort 3 Demo Day" />
          </FormField>
          
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Date Captured *">
              <Input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} />
            </FormField>
            <FormField label="Photographer Creds">
              <Input value={form.photographer} onChange={(e) => set("photographer", e.target.value)} placeholder="APEX Media Team" />
            </FormField>
          </div>

          <FormField label="Timeline Log Description *">
            <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Describe the log events and community highlights..." />
          </FormField>

          <FormField label="Upload Photos (Drag & Drop or Click to Upload multiple files)">
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => document.getElementById("gallery-multi-upload")?.click()}
              style={{
                borderColor: dragActive ? "#FF6B00" : "#e5e5e5",
                background: dragActive ? "rgba(255,107,0,0.05)" : "#fcfcfc",
                borderStyle: "dashed",
                borderWidth: "2px",
                borderRadius: "12px",
                padding: "24px",
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              <input
                id="gallery-multi-upload"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) {
                    handleFiles(Array.from(e.target.files));
                  }
                }}
              />
              <UploadCloud size={28} className="text-[#FF6B00] mb-2 mx-auto" />
              <p className="text-xs font-semibold text-gray-700">Drag & drop your logs images here</p>
              <p className="text-[10px] text-gray-400 mt-0.5">supporting multiple selections</p>
            </div>
          </FormField>

          {form.photos.length > 0 && (
            <div>
              <span className="text-[11px] font-bold text-gray-500 uppercase block mb-2">Uploaded Images ({form.photos.length})</span>
              <div className="flex gap-2 flex-wrap max-h-36 overflow-y-auto p-2 bg-gray-50 rounded-xl border border-gray-100">
                {form.photos.map((p, idx) => (
                  <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                    <img src={p} alt="upload preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removePhotoAtIndex(idx);
                      }}
                      className="absolute top-1 right-1 p-0.5 bg-black/60 text-white rounded-full border-none cursor-pointer"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2.5 border-t border-gray-100 pt-4">
            <GhostBtn onClick={close}>Cancel</GhostBtn>
            <PrimaryBtn onClick={save}>{modal.mode === "add" ? "Create Entry" : "Save Changes"}</PrimaryBtn>
          </div>
        </div>
      </Modal>

      <Modal isOpen={modal.open && modal.mode === "delete"} onClose={close} title="Confirm Timeline Deletion" size="sm">
        <p className="text-xs text-gray-600">Are you sure you want to remove the log <strong>"{modal.item?.title}"</strong>?</p>
        <div className="flex justify-end gap-2.5 pt-2 border-t border-gray-100 mt-4">
          <GhostBtn onClick={close}>Cancel</GhostBtn>
          <DangerBtn onClick={remove}>Remove Log</DangerBtn>
        </div>
      </Modal>
    </div>
  );
}
