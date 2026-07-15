"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, GraduationCap, Check, X as XIcon, UploadCloud, Eye, Pencil, Trash2, Undo, Redo } from "lucide-react";
import Modal, { FormField, Input, Select, Textarea, PrimaryBtn, DangerBtn, GhostBtn } from "@/components/admin/Modal";
import { PageHeader } from "@/components/admin/PageHeader";
import { useUndoRedoState } from "@/hooks/admin/useUndoRedoState";
import ImageUpload from "@/components/shared/ImageUpload";
import { createClient } from "@/lib/supabase/client";
const supabase = createClient();

const DUMMY_MENTORS = [
  { id: 1, name: "Dr. Sandeep Joshi", expertise: "IP & Academic Research" },
  { id: 2, name: "Milind Kulkarni", expertise: "Cloud & Microservices Architecture" },
  { id: 3, name: "Anjali Sharma", expertise: "Marketing Strategy & GTM" },
  { id: 4, name: "Rohan Deshmukh", expertise: "B2B Sales & Corporate Partnerships" },
  { id: 5, name: "Priya Mehta", expertise: "Product Management & UX" },
  { id: 6, name: "Vivek Patil", expertise: "AI/ML & Data Science" },
  { id: 7, name: "Neha Joshi", expertise: "Legal & Startup Compliance" },
  { id: 8, name: "Aakash Desai", expertise: "Finance & Fundraising" },
];

type AALType = "Intern" | "Problem Statement" | "Application";

interface AALItem {
  id: number | string;
  type: AALType;
  title: string; // Used as Name for Interns/Applications, and Title for Problem Statements
  description: string;
  // Intern & Application fields
  internName?: string;
  internEmail?: string;
  phone?: string;
  college?: string;
  course?: string;
  year?: string;
  mentor?: string;
  photo?: string;
  github?: string;
  linkedin?: string;
  notes?: string; // Why join
  aiToolsUsed?: string;
  shortDescription?: string;
  // Application fields
  isExistingIntern?: boolean;
  // Common fields
  domain?: string;
  status: "Active" | "Completed" | "Pending" | "Accepted" | "Rejected" | "Inactive";
  startDate?: string;
  endDate?: string;
  // Problem Statement fields
  icon?: string; // Icon URL or emoji
  displayOrder?: number;
}

const INITIAL: AALItem[] = [];

const empty: Omit<AALItem, "id"> = {
  type: "Intern",
  title: "",
  description: "",
  internName: "",
  internEmail: "",
  phone: "",
  college: "",
  course: "",
  year: "3rd Year",
  mentor: "",
  photo: "",
  github: "",
  notes: "",
  aiToolsUsed: "",
  shortDescription: "",
  domain: "",
  status: "Active",
  startDate: new Date().toISOString().split("T")[0],
  endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  isExistingIntern: false,
  icon: "💡"
};

function StatusBadge({ status }: { status: AALItem["status"] }) {
  const styles: Record<string, { bg: string; color: string }> = {
    Pending: { bg: "rgba(245,158,11,0.12)", color: "#d97706" },
    Accepted: { bg: "rgba(16,185,129,0.12)", color: "#059669" },
    Rejected: { bg: "rgba(239,68,68,0.12)", color: "#dc2626" },
    Active: { bg: "rgba(16,185,129,0.12)", color: "#059669" },
    Inactive: { bg: "rgba(107,114,128,0.12)", color: "#6b7280" },
    Completed: { bg: "rgba(59,130,246,0.12)", color: "#3b82f6" },
  };
  const s = styles[status] || { bg: "#f4f4f5", color: "#888" };
  return (
    <span style={{
      fontSize: "11px", fontWeight: 600,
      padding: "3px 10px", borderRadius: "99px",
      background: s.bg, color: s.color,
    }}>
      {status}
    </span>
  );
}

export default function AALPage() {
  const [items, setItems, undo, redo, canUndo, canRedo, resetItems] = useUndoRedoState<AALItem[]>(INITIAL);

  useEffect(() => {
    async function loadLiveAALData() {
      try {
        // 1. Fetch problem statements first so we can map IDs to titles
        const probRes = await fetch('/api/v1/admin/problem-statements');
        let dbProblems: AALItem[] = [];
        if (probRes.ok) {
          const { data } = await probRes.json();
          dbProblems = data.map((prob: any) => ({
            id: prob.id,
            type: "Problem Statement",
            title: prob.title,
            description: prob.description,
            icon: prob.icon || '💡',
            displayOrder: prob.displayOrder || 0,
            status: prob.status === 'open' ? 'Active' : (prob.status === 'assigned' ? 'Active' : 'Inactive'),
          }));
        }

        // 2. Fetch applications
        const appRes = await fetch('/api/v1/admin/applications');
        let dbApplications: AALItem[] = [];
        if (appRes.ok) {
          const { data } = await appRes.json();
          dbApplications = data.map((app: any) => {
            const matchingProblem = dbProblems.find(p => p.id === app.preferredDomain);
            const domainTitle = matchingProblem ? matchingProblem.title : (app.preferredDomain || 'General');
            return {
              id: app.id,
              type: "Application",
              title: app.fullName,
              internName: app.fullName,
              internEmail: app.email,
              phone: app.phone,
              college: app.college,
              course: app.branch,
              year: app.year,
              description: app.motivation || app.skills || '',
              domain: domainTitle,
              status: app.status.charAt(0).toUpperCase() + app.status.slice(1),
              startDate: new Date(app.createdAt).toISOString().split('T')[0],
              isExistingIntern: app.isExistingIntern || false,
              photo: app.photoUrl || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
              github: app.githubUrl || '',
              linkedin: app.linkedinUrl || '',
              notes: app.motivation || '',
              aiToolsUsed: app.skills || '',
              shortDescription: app.skills || '',
            };
          });
        }

        // 3. Fetch interns
        const internRes = await fetch('/api/v1/admin/interns');
        let dbInterns: AALItem[] = [];
        if (internRes.ok) {
          const { data } = await internRes.json();
          dbInterns = data.map((intern: any) => {
            const matchingProblem = dbProblems.find(p => p.id === intern.domain);
            const domainTitle = matchingProblem ? matchingProblem.title : (intern.domain || 'General');
            return {
              id: intern.id,
              type: "Intern",
              title: intern.name,
              internName: intern.name,
              internEmail: intern.email || '',
              phone: intern.phone || '',
              college: intern.college,
              course: intern.course || '',
              year: intern.year || '',
              description: intern.description || `Working on ${domainTitle} Platform`,
              domain: domainTitle,
              mentor: "TBD",
              status: intern.status === 'active' ? 'Active' : 'Completed',
              startDate: new Date(intern.createdAt).toISOString().split('T')[0],
              isExistingIntern: false,
              photo: intern.photo || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop",
              github: intern.githubUrl || '',
              linkedin: intern.linkedinUrl || '',
              displayOrder: intern.displayOrder || 0,
              notes: '',
              aiToolsUsed: '',
              shortDescription: ''
            };
          });
        }

        // 4. Fetch industry experts
        const expertRes = await fetch('/api/v1/industry-experts');
        if (expertRes.ok) {
          const { data } = await expertRes.json();
          setExpertsList(data || []);
        }

        resetItems([...dbProblems, ...dbInterns, ...dbApplications]);
      } catch (err) {
        console.error("Failed to load live AAL data:", err);
      }
    }
    loadLiveAALData();
  }, [resetItems]);

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<AALType>("Intern");
  const [experts, setExpertsList] = useState<{ id: string | number; name: string; designation?: string }[]>([]);
  const [modal, setModal] = useState<{ open: boolean; mode: "add" | "edit" | "delete" | "view"; item: AALItem | null }>({
    open: false, mode: "add", item: null,
  });
  const [form, setForm] = useState<Omit<AALItem, "id">>(empty);
  const [dragActive, setDragActive] = useState(false);
  const [selectedProblemStatement, setSelectedProblemStatement] = useState<string>("");
  const [selectedMentor, setSelectedMentor] = useState<string>("");
  const [filterDomain, setFilterDomain] = useState<string>("All");
  const [isOrderChanged, setIsOrderChanged] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  const allDomains = Array.from(new Set(
    items
      .filter((i) => i.type === "Problem Statement")
      .map((i) => i.title)
      .filter((d) => d && d.trim())
  )) as string[];

  const saveItems = (newItems: AALItem[]) => {
    setItems(newItems);
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

  const toggleStatus = async (id: number | string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    if (item.type === "Problem Statement" || item.type === "Intern") {
      const nextStatus = item.status === "Active" ? "Inactive" : "Active";
      await updateStatusDirectly(id, nextStatus);
    } else {
      const updated = items.map((item) => {
        if (item.id === id) {
          const newStatus = (item.status === "Active" ? "Inactive" : "Active") as AALItem["status"];
          return { ...item, status: newStatus };
        }
        return item;
      });
      setItems(updated);
    }
  };

  const updateStatusDirectly = async (id: number | string, newStatus: AALItem["status"]) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    if (item.type === "Problem Statement") {
      try {
        const res = await fetch('/api/v1/admin/problem-statements', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id,
            status: newStatus === 'Active' ? 'open' : 'closed'
          })
        });
        if (res.ok) {
          setItems(items.map((item) => (item.id === id ? { ...item, status: newStatus } : item)));
        } else {
          alert("Failed to update status on server.");
        }
      } catch (err) {
        console.error(err);
      }
    } else if (item.type === "Intern") {
      try {
        const res = await fetch('/api/v1/admin/interns', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id,
            status: newStatus === 'Active' ? 'active' : 'completed'
          })
        });
        if (res.ok) {
          setItems(items.map((item) => (item.id === id ? { ...item, status: newStatus } : item)));
        } else {
          alert("Failed to update status on server.");
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      setItems(items.map((item) => (item.id === id ? { ...item, status: newStatus } : item)));
    }
  };

  const filtered = items.filter((i) => {
    const matchType = i.type === activeTab;
    const matchSearch =
      i.title.toLowerCase().includes(search.toLowerCase()) ||
      i.description.toLowerCase().includes(search.toLowerCase()) ||
      (i.domain?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (i.internName?.toLowerCase().includes(search.toLowerCase()) ?? false);
  const matchDomain = filterDomain === "All" || i.domain === filterDomain || (i.type === "Problem Statement" && i.title === filterDomain);
    return matchType && matchSearch && matchDomain;
  });

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= filtered.length) return;
    
    const item1 = filtered[index];
    const item2 = filtered[newIndex];
    const item1Idx = items.findIndex(i => i.id === item1.id);
    const item2Idx = items.findIndex(i => i.id === item2.id);
    
    const newItems = [...items];
    newItems[item1Idx] = item2;
    newItems[item2Idx] = item1;
    setItems(newItems);
    setIsOrderChanged(true);
  };

  const handleSaveOrder = async () => {
    if (activeTab === 'Application') return;
    setIsSavingOrder(true);
    try {
      const orderData = filtered.map((item, index) => ({ id: item.id, displayOrder: index }));
      const endpoint = activeTab === 'Intern' 
        ? '/api/v1/admin/interns/reorder' 
        : '/api/v1/admin/problem-statements/reorder';
        
      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: orderData })
      });
      if (!res.ok) throw new Error("Failed to save order");
      setIsOrderChanged(false);
    } catch (err) {
      console.error(err);
      alert("Failed to save order.");
    } finally {
      setIsSavingOrder(false);
    }
  };

  const openAdd = () => {
    setForm({ ...empty, type: activeTab });
    setModal({ open: true, mode: "add", item: null });
  };
  const openEdit = (item: AALItem) => {
    const { id, ...rest } = item;
    setForm({ ...empty, ...rest });
    setModal({ open: true, mode: "edit", item });
  };
  const openDelete = (item: AALItem) => setModal({ open: true, mode: "delete", item });
  const openView = (item: AALItem) => {
    setSelectedProblemStatement("");
    setSelectedMentor("");
    setModal({ open: true, mode: "view", item });
  };
  const close = () => setModal((m) => ({ ...m, open: false }));

  const save = async () => {
    if ((form.type === "Intern" && !form.internName) || (form.type !== "Intern" && !form.title)) return;
    
    if (form.type === "Problem Statement") {
      try {
        if (modal.mode === "add") {
          const res = await fetch('/api/v1/admin/problem-statements', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: form.title,
              description: form.description,
              icon: form.icon || '💡',
              status: 'open'
            })
          });
          if (!res.ok) throw new Error("Failed to save");
        } else if (modal.item) {
          const res = await fetch('/api/v1/admin/problem-statements', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: modal.item.id,
              title: form.title,
              description: form.description,
              icon: form.icon || '💡',
              status: form.status === 'Active' ? 'open' : 'closed'
            })
          });
          if (!res.ok) throw new Error("Failed to save");
        }
        
        window.location.reload();
      } catch (err) {
        console.error(err);
        alert("Failed to save problem statement on server.");
      }
    } else {
      if (modal.mode === "add") {
        try {
          const res = await fetch('/api/v1/admin/interns', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: form.internName,
              photo: form.photo,
              college: form.college,
              course: form.course,
              year: form.year,
              domain: form.domain,
              linkedinUrl: form.linkedin,
              githubUrl: form.github,
              email: form.internEmail,
              phone: form.phone,
              description: form.description
            })
          });
          if (res.ok) {
            window.location.reload();
          } else {
            alert("Failed to add intern on server.");
          }
        } catch (err) {
          console.error(err);
        }
      } else if (modal.item) {
        try {
          const res = await fetch('/api/v1/admin/interns', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: modal.item.id,
              name: form.internName,
              photo: form.photo,
              college: form.college,
              course: form.course,
              year: form.year,
              domain: form.domain,
              linkedinUrl: form.linkedin,
              githubUrl: form.github,
              email: form.internEmail,
              phone: form.phone,
              status: form.status,
              description: form.description
            })
          });
          if (res.ok) {
            window.location.reload();
          } else {
            alert("Failed to update intern on server.");
          }
        } catch (err) {
          console.error(err);
        }
      }
    }
    close();
  };

  const remove = async () => {
    if (modal.item) {
      try {
        if (modal.item.photo && modal.item.photo.includes('supabase.co')) {
          const filePath = modal.item.photo.split('/public/avatars/')[1];
          if (filePath) {
            await fetch('/api/v1/delete', { method: 'POST', body: JSON.stringify({ bucket: 'avatars', paths: [filePath] }) });
          }
        }
      } catch (err) {
        console.error('Storage delete error:', err);
      }

      if (modal.item.type === "Intern") {
        try {
          const res = await fetch(`/api/v1/admin/interns?id=${modal.item.id}`, {
            method: 'DELETE'
          });
          if (!res.ok) {
            alert("Failed to delete intern on database server.");
            return;
          }
        } catch (err) {
          console.error(err);
          alert("Network error deleting intern.");
          return;
        }
      } else if (modal.item.type === "Problem Statement") {
        try {
          const res = await fetch(`/api/v1/admin/problem-statements?id=${modal.item.id}`, {
            method: 'DELETE'
          });
          if (!res.ok) {
            alert("Failed to delete problem statement on database server.");
            return;
          }
        } catch (err) {
          console.error(err);
          alert("Network error deleting problem statement.");
          return;
        }
      }
      setItems(items.filter((i) => i.id !== modal.item!.id));
    }
    close();
  };

  const set = (k: keyof typeof form, v: any) => setForm((f) => ({ ...f, [k]: v }));

  // For EXISTING intern applications (unchanged workflow)
  const handleAcceptApplication = async (item: AALItem) => {
    try {
      // 1. Save intern to database
      const internRes = await fetch('/api/v1/admin/interns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: item.internName || item.title,
          photo: item.photo,
          college: item.college || 'SSBT',
          course: item.course || null,
          year: item.year || null,
          domain: item.domain || 'General',
          linkedinUrl: item.linkedin || null,
          githubUrl: item.github || null,
          email: item.internEmail || null,
          phone: item.phone || null
        })
      });

      if (!internRes.ok) {
        alert("Failed to save intern details on server.");
        return;
      }

      // 2. Delete application
      const res = await fetch(`/api/v1/admin/applications?id=${item.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        const updated = items.map((i) => {
          if (i.id === item.id) return { ...i, status: "Accepted" as const };
          if (i.type === "Intern" && i.internEmail === item.internEmail) {
            return { ...i, domain: item.domain || i.domain, description: item.description || i.description };
          }
          return i;
        });
        saveItems(updated);
      } else {
        alert("Failed to approve application on server.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // For NEW intern applications
  const handleAcceptNewInternApplication = async (item: AALItem, problemStatement: string, mentor: string) => {
    try {
      // 1. Save intern to database
      const internRes = await fetch('/api/v1/admin/interns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: item.internName || item.title,
          photo: item.photo,
          college: item.college || 'SSBT',
          course: item.course || null,
          year: item.year || null,
          domain: problemStatement,
          linkedinUrl: item.linkedin || null,
          githubUrl: item.github || null,
          email: item.internEmail || null,
          phone: item.phone || null
        })
      });

      if (!internRes.ok) {
        alert("Failed to save intern details on server.");
        return;
      }
      const internData = await internRes.json();
      const createdIntern = internData.data;

      // 2. Delete application
      const res = await fetch(`/api/v1/admin/applications?id=${item.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        const updatedItems = items.map((i) =>
          i.id === item.id ? { ...i, status: "Accepted" as const, domain: problemStatement } : i
        );
        const newIntern: AALItem = {
          id: createdIntern.id,
          type: "Intern",
          title: item.internName || item.title,
          internName: item.internName || item.title,
          internEmail: item.internEmail,
          phone: item.phone,
          college: item.college,
          course: item.course,
          year: item.year,
          description: item.shortDescription || `Working on ${problemStatement} Platform`,
          domain: problemStatement,
          mentor: mentor || "TBD (To Be Assigned)",
          status: "Active",
          photo: item.photo || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop",
          startDate: new Date().toISOString().split("T")[0],
          endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          github: item.github,
          linkedin: item.linkedin,
          notes: item.notes,
          aiToolsUsed: item.aiToolsUsed,
          shortDescription: item.shortDescription
        };
        saveItems([...updatedItems, newIntern]);
        close();
      } else {
        alert("Failed to approve application on server.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectApplication = async (item: AALItem) => {
    try {
      const res = await fetch(`/api/v1/admin/applications?id=${item.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        saveItems(items.map((i) => (i.id === item.id ? { ...i, status: "Rejected" as const } : i)));
      } else {
        alert("Failed to reject application on server.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const tabs: AALType[] = ["Intern", "Problem Statement", "Application"];
  const tabCounts = tabs.map(t => ({
    type: t,
    count: t === "Application"
      ? items.filter(i => i.type === "Application" && i.status !== "Accepted" && i.status !== "Rejected").length
      : items.filter(i => i.type === t).length
  }));

  const newApplications = filtered.filter(i => !i.isExistingIntern && i.status !== "Accepted" && i.status !== "Rejected");
  const existingApplications = filtered.filter(i => i.isExistingIntern && i.status !== "Accepted" && i.status !== "Rejected");

  return (
    <div>
      <PageHeader
        icon={<GraduationCap size={20} style={{ color: "#FF6B00" }} />}
        title="AAL — Apex AI Launchpad"
        subtitle={`${items.filter(i => i.type === "Intern" && i.status === "Active").length} active interns · ${items.filter(i => i.type === "Problem Statement").length} problem statements`}
        action={
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1 bg-gray-50 border border-gray-150 rounded-xl p-1 shadow-2xs">
              <button
                onClick={undo}
                disabled={!canUndo}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all border-none bg-transparent cursor-pointer"
                title="Undo List Action"
              >
                <Undo size={14} />
              </button>
              <button
                onClick={redo}
                disabled={!canRedo}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all border-none bg-transparent cursor-pointer"
                title="Redo List Action"
              >
                <Redo size={14} />
              </button>
            </div>
            {isOrderChanged && (
              <button onClick={handleSaveOrder} disabled={isSavingOrder} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold border-none hover:opacity-90 transition-all"
                style={{ background: "#10b981", cursor: "pointer", fontFamily: "'Satoshi', sans-serif", boxShadow: "0 2px 10px rgba(16,185,129,0.35)", opacity: isSavingOrder ? 0.7 : 1 }}>
                <Check size={16} /> {isSavingOrder ? 'Saving...' : 'Save Order'}
              </button>
            )}
            {activeTab === "Problem Statement" && (
              <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold border-none hover:opacity-90"
                style={{ background: "#FF6B00", cursor: "pointer", fontFamily: "'Satoshi', sans-serif", boxShadow: "0 2px 10px rgba(255,107,0,0.35)" }}>
                <Plus size={16} /> Add {activeTab}
              </button>
            )}
          </div>
        }
      />

      {/* Tabs */}
      <div className="mb-5 flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          const count = tabCounts.find(t => t.type === tab)?.count || 0;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 whitespace-nowrap"
              style={{
                background: isActive ? "#FF6B00" : "#fff",
                color: isActive ? "#fff" : "#555",
                border: isActive ? "1px solid #FF6B00" : "1px solid #e5e5e5",
                cursor: "pointer",
                fontFamily: "'Inter', sans-serif",
                fontSize: "13px",
                fontWeight: isActive ? 600 : 500,
                boxShadow: isActive ? "0 2px 8px rgba(255,107,0,0.25)" : "0 1px 2px rgba(0,0,0,0.04)",
              }}
            >
              <span>{tab}</span>
              <span style={{
                background: isActive ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.06)",
                color: isActive ? "#fff" : "#888",
                padding: "2px 7px",
                borderRadius: "99px",
                fontSize: "11px",
                fontWeight: 600,
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl overflow-hidden mb-6" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid #f0f0f0" }}>
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4" style={{ borderBottom: "1px solid #f5f5f5" }}>
          <div className="flex items-center gap-3 flex-1 min-w-[240px]">
            <Search size={16} style={{ color: "#bbb" }} />
            <input
              placeholder={`Search AAL ${activeTab.toLowerCase()}s…`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ border: "none", outline: "none", fontSize: "14px", color: "#555", background: "none", flex: 1, fontFamily: "'Inter', sans-serif" }}
            />
          </div>
          <div className="flex items-center gap-2">
            <span style={{ fontSize: "12px", fontWeight: 600, color: "#666", fontFamily: "'Inter', sans-serif" }}>Domain/PS:</span>
            <select
              value={filterDomain}
              onChange={(e) => setFilterDomain(e.target.value)}
              style={{
                padding: "6px 12px",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                backgroundColor: "#fff",
                fontSize: "13px",
                color: "#555",
                outline: "none",
                cursor: "pointer",
                fontFamily: "'Inter', sans-serif"
              }}
            >
              <option value="All">All Domains</option>
              {allDomains.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        {activeTab !== "Application" ? (
          <div className="overflow-x-auto">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#fafafa" }}>
                  {activeTab === "Intern" && ["Order", "Photo", "Name", "Email", "Phone Number", "Domain", "Mentor", "Status", "Actions"].map((h) => (
                    <th key={h} style={{ textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.06em", padding: "12px 16px" }}>{h}</th>
                  ))}
                  {activeTab === "Problem Statement" && ["Order", "Icon", "Title", "Description", "Status", "Actions"].map((h) => (
                    <th key={h} style={{ textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.06em", padding: "12px 16px" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, idx) => (
                  <tr key={item.id} style={{ borderTop: "1px solid #f5f5f5" }}>
                    <td style={{ padding: "14px 16px", width: "50px" }}>
                      <div className="flex flex-col gap-1">
                        <button onClick={() => handleMove(idx, 'up')} disabled={idx === 0 || !!search || filterDomain !== 'All'} className="text-gray-400 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed bg-transparent border-none cursor-pointer p-0" title="Move Up">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
                        </button>
                        <button onClick={() => handleMove(idx, 'down')} disabled={idx === filtered.length - 1 || !!search || filterDomain !== 'All'} className="text-gray-400 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed bg-transparent border-none cursor-pointer p-0" title="Move Down">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                        </button>
                      </div>
                    </td>
                    {activeTab === "Intern" && (
                      <>
                        <td style={{ padding: "14px 16px" }}>
                          <img src={item.photo || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"} alt={item.internName} style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }} />
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ fontSize: "14px", fontWeight: 600, color: "#0d0d0d" }}>{item.internName}</div>
                        </td>
                        <td style={{ padding: "14px 16px", fontSize: "12px", color: "#aaa" }}>{item.internEmail}</td>
                        <td style={{ padding: "14px 16px", fontSize: "13px", color: "#555" }}>{item.phone || "—"}</td>
                        <td style={{ padding: "14px 16px" }}>
                          <span style={{ fontSize: "12px", fontWeight: 500, padding: "3px 10px", borderRadius: "99px", background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>{item.domain}</span>
                        </td>
                        <td style={{ padding: "14px 16px", fontSize: "13px", color: "#555" }}>{item.mentor}</td>
                        <td style={{ padding: "14px 16px" }}>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleStatus(item.id)}
                              className="relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out align-middle"
                              style={{
                                background: item.status === "Active" ? "#10b981" : "#e5e7eb",
                                border: "none",
                                outline: "none"
                              }}
                              title={item.status === "Active" ? "Disable" : "Enable"}
                            >
                              <span
                                className="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out"
                                style={{
                                  transform: item.status === "Active" ? "translateX(16px)" : "translateX(0)"
                                }}
                              />
                            </button>
                            <span style={{ fontSize: "12px", fontWeight: 500, color: item.status === "Active" ? "#10b981" : "#888" }}>
                              {item.status}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => openView(item)}
                              className="p-1.5 rounded-lg transition-all bg-blue-50 text-blue-600 border-none cursor-pointer hover:bg-blue-100"
                              title="View Details"
                            >
                              <Eye size={13} />
                            </button>
                            <button
                              onClick={() => openEdit(item)}
                              className="p-1.5 rounded-lg transition-all bg-orange-50 text-[#FF6B00] border-none cursor-pointer hover:bg-orange-100"
                              title="Edit Details"
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              onClick={() => openDelete(item)}
                              className="p-1.5 rounded-lg transition-all bg-red-50 text-red-500 border-none cursor-pointer hover:bg-red-100"
                              title="Remove Intern"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </>
                    )}

                    {activeTab === "Problem Statement" && (
                      <>
                        <td style={{ padding: "14px 16px", fontSize: "18px" }}>
                          {item.icon || "💡"}
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ fontSize: "14px", fontWeight: 600, color: "#0d0d0d" }}>{item.title}</div>
                        </td>
                        <td style={{ padding: "14px 16px", fontSize: "13px", color: "#555", maxWidth: "300px" }}>
                          <div style={{ overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{item.description}</div>
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5">
                              <span style={{
                                display: "inline-block",
                                width: "6px",
                                height: "6px",
                                borderRadius: "50%",
                                background: item.status === "Active" ? "#10b981" : (item.status === "Pending" ? "#f59e0b" : "#888")
                              }} />
                              <span style={{ fontSize: "12.5px", fontWeight: 600, color: item.status === "Active" ? "#10b981" : (item.status === "Pending" ? "#f59e0b" : "#555") }}>
                                {item.status}
                              </span>
                            </div>
                            <div className="flex gap-1 mt-1">
                              <button
                                onClick={() => updateStatusDirectly(item.id, "Active")}
                                className="px-2 py-0.5 text-[10px] font-bold rounded cursor-pointer border transition-all"
                                style={{
                                  background: item.status === "Active" ? "#10b981" : "#fff",
                                  color: item.status === "Active" ? "#fff" : "#10b981",
                                  borderColor: "#10b981"
                                }}
                              >
                                Active
                              </button>
                              <button
                                onClick={() => updateStatusDirectly(item.id, "Pending")}
                                className="px-2 py-0.5 text-[10px] font-bold rounded cursor-pointer border transition-all"
                                style={{
                                  background: item.status === "Pending" ? "#f59e0b" : "#fff",
                                  color: item.status === "Pending" ? "#fff" : "#f59e0b",
                                  borderColor: "#f59e0b"
                                }}
                              >
                                Pending
                              </button>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => openEdit(item)}
                              className="p-1.5 rounded-lg transition-all bg-orange-50 text-[#FF6B00] border-none cursor-pointer hover:bg-orange-100"
                              title="Edit Problem"
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              onClick={() => openDelete(item)}
                              className="p-1.5 rounded-lg transition-all bg-red-50 text-red-500 border-none cursor-pointer hover:bg-red-100"
                              title="Remove Problem"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Application Tab - Dual Sub-sections */
          <div className="p-5 space-y-8">
            {/* Subsection 1: New Interns */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-3" style={{ fontFamily: "'Satoshi', sans-serif" }}>New Intern Applications</h3>
              <div className="overflow-x-auto border border-gray-100 rounded-xl">
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#fafafa" }}>
                      {["Photo", "Candidate", "Email", "College", "Domain", "Status", "Actions"].map((h) => (
                        <th key={h} style={{ textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.06em", padding: "12px 16px" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {newApplications.map((item) => (
                      <tr key={item.id} style={{ borderTop: "1px solid #f5f5f5" }}>
                        <td style={{ padding: "14px 16px" }}>
                          <img src={item.photo || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"} alt={item.internName} style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }} />
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ fontSize: "14px", fontWeight: 600, color: "#0d0d0d" }}>{item.internName}</div>
                        </td>
                        <td style={{ padding: "14px 16px", fontSize: "13px", color: "#aaa" }}>{item.internEmail}</td>
                        <td style={{ padding: "14px 16px", fontSize: "13px", color: "#555" }}>{item.college || "—"}</td>
                        <td style={{ padding: "14px 16px" }}><span style={{ fontSize: "12px", fontWeight: 500, padding: "3px 10px", borderRadius: "99px", background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>{item.domain}</span></td>
                        <td style={{ padding: "14px 16px" }}><StatusBadge status={item.status} /></td>
                        <td style={{ padding: "14px 16px" }}>
                          {item.status === "Pending" ? (
                            <div className="flex gap-2">
                              <button onClick={() => openView(item)} className="p-2 bg-blue-50 text-blue-600 rounded-lg border-none cursor-pointer" title="View & Approve"><Eye size={14} /></button>
                              <button onClick={() => handleRejectApplication(item)} className="p-2 bg-red-50 text-red-500 rounded-lg border-none cursor-pointer" title="Reject"><XIcon size={14} /></button>
                            </div>
                          ) : (
                            <div className="flex gap-2 items-center">
                              <span className="text-xs text-gray-400">Processed</span>
                              <button onClick={() => openView(item)} className="p-2 bg-blue-50 text-blue-600 rounded-lg border-none cursor-pointer" title="View Details"><Eye size={14} /></button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                    {newApplications.length === 0 && (
                      <tr><td colSpan={7} className="p-6 text-center text-xs text-gray-400">No new applications.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Subsection 2: Existing Interns */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-3" style={{ fontFamily: "'Satoshi', sans-serif" }}>Existing Intern Applications</h3>
              <div className="overflow-x-auto border border-gray-100 rounded-xl">
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#fafafa" }}>
                      {["Photo", "Candidate", "Email", "Updated Project Domain", "Status", "Actions"].map((h) => (
                        <th key={h} style={{ textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.06em", padding: "12px 16px" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {existingApplications.map((item) => (
                      <tr key={item.id} style={{ borderTop: "1px solid #f5f5f5" }}>
                        <td style={{ padding: "14px 16px" }}>
                          <img src={item.photo || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"} alt={item.internName} style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }} />
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ fontSize: "14px", fontWeight: 600, color: "#0d0d0d" }}>{item.internName}</div>
                        </td>
                        <td style={{ padding: "14px 16px", fontSize: "13px", color: "#aaa" }}>{item.internEmail}</td>
                        <td style={{ padding: "14px 16px" }}><span style={{ fontSize: "12px", fontWeight: 500, padding: "3px 10px", borderRadius: "99px", background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>{item.domain}</span></td>
                        <td style={{ padding: "14px 16px" }}><StatusBadge status={item.status} /></td>
                        <td style={{ padding: "14px 16px" }}>
                          {item.status === "Pending" ? (
                            <div className="flex gap-2">
                              <button onClick={() => handleAcceptApplication(item)} className="p-2 bg-emerald-50 text-emerald-600 rounded-lg border-none cursor-pointer" title="Accept"><Check size={14} /></button>
                              <button onClick={() => handleRejectApplication(item)} className="p-2 bg-red-50 text-red-500 rounded-lg border-none cursor-pointer" title="Reject"><XIcon size={14} /></button>
                              <button onClick={() => openView(item)} className="p-2 bg-blue-50 text-blue-600 rounded-lg border-none cursor-pointer" title="View Details"><Eye size={14} /></button>
                            </div>
                          ) : (
                            <div className="flex gap-2 items-center">
                              <span className="text-xs text-gray-400">Processed</span>
                              <button onClick={() => openView(item)} className="p-2 bg-blue-50 text-blue-600 rounded-lg border-none cursor-pointer" title="View Details"><Eye size={14} /></button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                    {existingApplications.length === 0 && (
                      <tr><td colSpan={7} className="p-6 text-center text-xs text-gray-400">No existing intern applications.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* VIEW INTERN / APPLICATION DETAILS MODAL */}
      {modal.open && modal.mode === "view" && modal.item && (
        <Modal isOpen={true} onClose={close} title={`View ${modal.item.type} Details`} size="md">
          <div className="space-y-4" style={{ fontFamily: "'Inter', sans-serif" }}>
            <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
              <img src={modal.item.photo || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"} alt={modal.item.internName} style={{ width: "70px", height: "70px", borderRadius: "50%", objectFit: "cover", border: "2.5px solid #FF6B00" }} />
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#0d0d0d" }}>{modal.item.internName || modal.item.title}</h3>
                <p style={{ fontSize: "13px", color: "#888" }}>{modal.item.internEmail}</p>
                <div className="flex gap-1.5 mt-1.5">
                  <span style={{ fontSize: "11px", fontWeight: 600, color: "#FF6B00", background: "rgba(255,107,0,0.1)", padding: "2px 8px", borderRadius: "99px" }}>{modal.item.type}</span>
                  <span style={{ fontSize: "11px", fontWeight: 600, color: "#3b82f6", background: "rgba(59,130,246,0.1)", padding: "2px 8px", borderRadius: "99px" }}>{modal.item.domain || "No Domain"}</span>
                </div>
              </div>
            </div>

            <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase" }}>Phone Number</label>
                <div style={{ fontSize: "13.5px", color: "#333", marginTop: "2px" }}>{modal.item.phone || "—"}</div>
              </div>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase" }}>College / University</label>
                <div style={{ fontSize: "13.5px", color: "#333", marginTop: "2px" }}>{modal.item.college || "—"}</div>
              </div>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase" }}>Degree & Course</label>
                <div style={{ fontSize: "13.5px", color: "#333", marginTop: "2px" }}>{modal.item.course || "—"}</div>
              </div>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase" }}>Year of Study</label>
                <div style={{ fontSize: "13.5px", color: "#333", marginTop: "2px" }}>{modal.item.year || "—"}</div>
              </div>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase" }}>Assigned Mentor</label>
                <div style={{ fontSize: "13.5px", color: "#333", marginTop: "2px" }}>{modal.item.mentor || "TBD"}</div>
              </div>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase" }}>Status</label>
                <div style={{ fontSize: "13.5px", marginTop: "2px", fontWeight: 600, color: modal.item.status === "Active" ? "#10b981" : "#888" }}>{modal.item.status}</div>
              </div>
              {modal.item.startDate && (
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase" }}>Start Date</label>
                  <div style={{ fontSize: "13.5px", color: "#333", marginTop: "2px" }}>{modal.item.startDate}</div>
                </div>
              )}
              {modal.item.endDate && (
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase" }}>End Date</label>
                  <div style={{ fontSize: "13.5px", color: "#333", marginTop: "2px" }}>{modal.item.endDate}</div>
                </div>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              {modal.item.github && (
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase" }}>GitHub / Portfolio</label>
                  <div style={{ fontSize: "13px", marginTop: "2px" }}>
                    <a href={modal.item.github} target="_blank" rel="noopener noreferrer" style={{ color: "#FF6B00", textDecoration: "none", fontWeight: 500 }}>{modal.item.github} ↗</a>
                  </div>
                </div>
              )}
              {modal.item.linkedin && (
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase" }}>LinkedIn Profile</label>
                  <div style={{ fontSize: "13px", marginTop: "2px" }}>
                    <a href={modal.item.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: "#0077b5", textDecoration: "none", fontWeight: 500 }}>{modal.item.linkedin} ↗</a>
                  </div>
                </div>
              )}
            </div>

            {modal.item.notes && (
              <div>
                <label style={{ fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase" }}>Motivation / Proposal</label>
                <div style={{ fontSize: "13px", color: "#555", background: "#fcfcfc", padding: "8px 12px", borderRadius: "8px", border: "1px solid #ebebeb", marginTop: "4px", whiteSpace: "pre-wrap" }}>
                  {modal.item.notes}
                </div>
              </div>
            )}

            {/* Assigned Problem Statement + Mentor section — only for Pending NEW intern applications */}
            {modal.item.type === "Application" && !modal.item.isExistingIntern && modal.item.status === "Pending" && (() => {
              const activeProblemStatements = items.filter(
                (i) => i.type === "Problem Statement" && i.status === "Active"
              );
              return (
                <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: "16px", marginTop: "4px", display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 700, color: "#374151", display: "block", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Assigned Problem Statement <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <select
                      value={selectedProblemStatement}
                      onChange={(e) => setSelectedProblemStatement(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "9px 12px",
                        borderRadius: "8px",
                        border: selectedProblemStatement ? "1.5px solid #10b981" : "1.5px solid #e5e7eb",
                        backgroundColor: "#fff",
                        fontSize: "13.5px",
                        color: selectedProblemStatement ? "#0d0d0d" : "#9ca3af",
                        outline: "none",
                        cursor: "pointer",
                        transition: "border-color 0.2s"
                      }}
                    >
                      <option value="">— Select a Problem Statement —</option>
                      {activeProblemStatements.map((ps) => (
                        <option key={ps.id} value={ps.title}>{ps.title}</option>
                      ))}
                    </select>
                    {activeProblemStatements.length === 0 && (
                      <p style={{ fontSize: "12px", color: "#f59e0b", marginTop: "6px" }}>⚠ No active problem statements available. Please activate one before approving.</p>
                    )}
                    {!selectedProblemStatement && (
                      <p style={{ fontSize: "11px", color: "#9ca3af", marginTop: "4px" }}>You must assign a Problem Statement before approving this application.</p>
                    )}
                  </div>

                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 700, color: "#374151", display: "block", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Assign Mentor <span style={{ fontSize: "10px", fontWeight: 400, color: "#9ca3af", textTransform: "none" }}>(optional — can be assigned later)</span>
                    </label>
                    <select
                      value={selectedMentor}
                      onChange={(e) => setSelectedMentor(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "9px 12px",
                        borderRadius: "8px",
                        border: selectedMentor ? "1.5px solid #3b82f6" : "1.5px solid #e5e7eb",
                        backgroundColor: "#fff",
                        fontSize: "13.5px",
                        color: selectedMentor ? "#0d0d0d" : "#9ca3af",
                        outline: "none",
                        cursor: "pointer",
                        transition: "border-color 0.2s"
                      }}
                    >
                      <option value="">— TBD (Assign later) —</option>
                      {experts.map((m) => (
                        <option key={m.id} value={m.name}>{m.name}{m.designation ? ` — ${m.designation}` : ''}</option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })()}

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100" style={{ marginTop: "12px" }}>
              {modal.item.type === "Application" && modal.item.status === "Pending" && (
                <>
                  {!modal.item.isExistingIntern ? (
                    <button
                      onClick={() => handleAcceptNewInternApplication(modal.item!, selectedProblemStatement, selectedMentor)}
                      disabled={!selectedProblemStatement}
                      style={{
                        padding: "8px 18px",
                        borderRadius: "8px",
                        border: "none",
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#fff",
                        background: selectedProblemStatement ? "#10b981" : "#d1d5db",
                        cursor: selectedProblemStatement ? "pointer" : "not-allowed",
                        transition: "background 0.2s"
                      }}
                    >
                      ✓ Approve & Assign
                    </button>
                  ) : (
                    <button
                      onClick={() => { handleAcceptApplication(modal.item!); close(); }}
                      style={{
                        padding: "8px 18px",
                        borderRadius: "8px",
                        border: "none",
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#fff",
                        background: "#10b981",
                        cursor: "pointer"
                      }}
                    >
                      ✓ Approve Update
                    </button>
                  )}
                  <button
                    onClick={() => { handleRejectApplication(modal.item!); close(); }}
                    style={{
                      padding: "8px 18px",
                      borderRadius: "8px",
                      border: "none",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#fff",
                      background: "#ef4444",
                      cursor: "pointer"
                    }}
                  >
                    ✗ Reject
                  </button>
                </>
              )}
              <GhostBtn onClick={close}>Close</GhostBtn>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal for ADD / EDIT */}
      {modal.open && (modal.mode === "add" || modal.mode === "edit") && form.type !== "Application" && (
        <Modal isOpen={true} onClose={close} title={modal.mode === "add" ? `Add ${form.type}` : `Edit ${form.type}`} size="lg">
          <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-2 no-scrollbar">
            {form.type === "Intern" && (
              <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <FormField label="Intern Name *">
                  <Input value={form.internName || ""} onChange={(e) => set("internName", e.target.value)} placeholder="Full name" />
                </FormField>
                <FormField label="Email *">
                  <Input type="email" value={form.internEmail || ""} onChange={(e) => set("internEmail", e.target.value)} placeholder="intern@asg.io" />
                </FormField>
                <FormField label="Phone Number">
                  <Input type="tel" value={form.phone || ""} onChange={(e) => set("phone", e.target.value)} placeholder="+91 98765 43210" />
                </FormField>
                <FormField label="College Name">
                  <Input value={form.college || ""} onChange={(e) => set("college", e.target.value)} placeholder="e.g. SSBT COET" />
                </FormField>
                <FormField label="Degree / Course">
                  <Input value={form.course || ""} onChange={(e) => set("course", e.target.value)} placeholder="e.g. B.Tech Computer Engineering" />
                </FormField>
                <FormField label="Year of Study">
                  <Select value={form.year || ""} onChange={(e) => set("year", e.target.value)}>
                    <option>1st Year</option>
                    <option>2nd Year</option>
                    <option>3rd Year</option>
                    <option>4th Year</option>
                    <option>Graduate / Other</option>
                  </Select>
                </FormField>
                <FormField label="Domain / Project">
                  <Input value={form.domain || ""} onChange={(e) => set("domain", e.target.value)} placeholder="e.g. Career Intelligence" />
                </FormField>
                <FormField label="Mentor">
                  <Input value={form.mentor || ""} onChange={(e) => set("mentor", e.target.value)} placeholder="Mentor name" />
                </FormField>
                <FormField label="GitHub Link">
                  <Input type="url" value={form.github || ""} onChange={(e) => set("github", e.target.value)} placeholder="https://github.com/username" />
                </FormField>
                <FormField label="Start Date">
                  <Input type="date" value={form.startDate || ""} onChange={(e) => set("startDate", e.target.value)} />
                </FormField>
                <FormField label="End Date">
                  <Input type="date" value={form.endDate || ""} onChange={(e) => set("endDate", e.target.value)} />
                </FormField>
                <FormField label="Status">
                  <Select value={form.status} onChange={(e) => set("status", e.target.value)}>
                    <option>Active</option>
                    <option>Inactive</option>
                    <option>Completed</option>
                  </Select>
                </FormField>

                <div style={{ gridColumn: "1 / -1" }}>
                  <FormField label="Motivation / Notes (Why join)">
                    <Textarea value={form.notes || ""} onChange={(e) => set("notes", e.target.value)} placeholder="Describe why this intern is joining..." rows={3} />
                  </FormField>
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <FormField label="Description (Shown on Website)">
                    <Textarea value={form.description || ""} onChange={(e) => set("description", e.target.value)} placeholder="Describe the intern's role or biography..." rows={2} />
                  </FormField>
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <FormField label="Profile Photo">
                    <ImageUpload
                      uploadType="intern_photo"
                      value={form.photo}
                      onChange={(url) => set("photo", url)}
                    />
                  </FormField>
                </div>
              </div>
            )}

             {form.type === "Problem Statement" && (
              <div className="grid gap-4">
                <FormField label="Title *">
                  <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Problem statement title" />
                </FormField>
                <FormField label="Description *">
                  <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Detailed description of the problem…" rows={4} />
                </FormField>
                <div>
                  <FormField label="Status">
                    <Select value={form.status} onChange={(e) => set("status", e.target.value)}>
                      <option>Active</option>
                      <option>Inactive</option>
                      <option>Completed</option>
                    </Select>
                  </FormField>
                </div>
                <FormField label="Icon (Emoji or Icon Code)">
                  <Input value={form.icon || ""} onChange={(e) => set("icon", e.target.value)} placeholder="e.g. 🧠, 📊, 🌱" />
                </FormField>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <GhostBtn onClick={close}>Cancel</GhostBtn>
              <PrimaryBtn onClick={save}>{modal.mode === "add" ? `Add ${form.type}` : "Save Changes"}</PrimaryBtn>
            </div>
          </div>
        </Modal>
      )}

      <Modal isOpen={modal.open && modal.mode === "delete"} onClose={close} title={`Remove ${modal.item?.type}`} size="sm">
        <p style={{ fontSize: "14px", color: "#555", marginBottom: "20px" }}>
          Remove <strong>"{modal.item?.title}"</strong>? This cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <GhostBtn onClick={close}>Cancel</GhostBtn>
          <DangerBtn onClick={remove}>Remove</DangerBtn>
        </div>
      </Modal>
    </div>
  );
}
