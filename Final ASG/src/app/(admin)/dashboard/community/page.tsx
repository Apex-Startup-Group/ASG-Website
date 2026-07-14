"use client";

import React, { useState, useEffect } from "react";
import { Search, Users, Plus, Eye, Pencil, Trash2, UploadCloud, Check, X as XIcon, Undo, Redo } from "lucide-react";
import Modal, {
  FormField,
  Input,
  Select,
  Textarea,
  PrimaryBtn,
  DangerBtn,
  GhostBtn,
} from "@/components/admin/Modal";
import { PageHeader } from "@/components/admin/PageHeader";
import { useUndoRedoState } from "@/hooks/admin/useUndoRedoState";

interface Member {
  id: string | number;
  name: string;
  email: string;
  type:
  | "Founder"
  | "Mentor"
  | "Investor"
  | "Service Provider"
  | "Other";
  company?: string;
  expertise?: string;
  city: string;
  joinDate: string;
  status: "Active" | "Inactive";
  phone?: string;
  photo?: string;
  description?: string;
  socialLinks?: string[];
  companyWebsite?: string;
  otherRoleDetails?: string;
}

const INITIAL: Member[] = [];

const empty: Omit<Member, "id"> = {
  name: "",
  email: "",
  type: "Founder",
  company: "",
  expertise: "",
  city: "",
  joinDate: new Date().toISOString().split("T")[0],
  status: "Active",
  phone: "",
  photo: "",
  description: "",
  socialLinks: [""],
  companyWebsite: "",
  otherRoleDetails: ""
};

export default function CommunityPage() {
  const [members, setMembers, undo, redo, canUndo, canRedo] = useUndoRedoState<Member[]>(INITIAL);
  const [applications, setApplications] = useState<any[]>([]);

  useEffect(() => {
    async function loadMembers() {
      try {
        const res = await fetch('/api/v1/admin/community-members');
        if (res.ok) {
          const { data } = await res.json();
          if (data) {
            const mapped = data.map((m: any) => ({
              id: m.id,
              name: m.name,
              email: m.email || '',
              type: m.memberType === 'founder' ? 'Founder' :
                    m.memberType === 'mentor' ? 'Mentor' :
                    m.memberType === 'investor' ? 'Investor' :
                    m.memberType === 'service_provider' ? 'Service Provider' : 'Other',
              company: m.company,
              expertise: m.bio || '',
              city: 'Jalgaon',
              joinDate: m.createdAt ? new Date(m.createdAt).toISOString().slice(0, 10) : '',
              status: m.showOnWebsite ? 'Active' : 'Inactive',
              phone: m.phone || '',
              photo: m.photo,
              description: m.bio || '',
              socialLinks: m.linkedinUrl ? [m.linkedinUrl] : [],
              companyWebsite: m.websiteUrl || ''
            }));
            setMembers(mapped);
          }
        }
      } catch (err) {
        console.error("Failed to load community members:", err);
      }
    }

    async function loadLiveCommunityApplications() {
      try {
        const res = await fetch('/api/v1/admin/community-applications');
        if (res.ok) {
          const { data } = await res.json();
          const dbApps = data.map((app: any) => ({
            id: app.id,
            name: app.fullName,
            email: app.email,
            phone: app.phone,
            role: app.applicantType === 'founder' ? 'founders' :
                  app.applicantType === 'mentor' ? 'mentors' :
                  app.applicantType === 'investor' ? 'investors' :
                  app.applicantType === 'service_provider' ? 'service-providers' : 'other',
            company: app.company,
            companyWebsite: app.websiteUrl || '',
            description: app.motivation || '',
            photo: app.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
            status: app.status === 'pending' ? 'Pending' :
                    app.status === 'accepted' ? 'Accepted' : 'Rejected',
            socialLinks: app.linkedinUrl ? [app.linkedinUrl] : [],
            otherRoleDetails: app.designation || '',
            date: app.createdAt || ''
          }));
          setApplications(dbApps);
        }
      } catch (err) {
        console.error("Failed to load live community applications:", err);
      }
    }

    loadMembers();
    loadLiveCommunityApplications();
  }, [setMembers]);

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<string>("Founder");
  const [filterStatus, setFilterStatus] = useState<"All" | "Active" | "Inactive">("All");
  const [modal, setModal] = useState<{
    open: boolean;
    mode: "add" | "edit" | "delete" | "view";
    item: any | null;
  }>({
    open: false,
    mode: "add",
    item: null,
  });
  const [form, setForm] = useState<Omit<Member, "id">>(empty);
  const [dragActive, setDragActive] = useState(false);

  const saveMembers = (newMembers: Member[]) => {
    setMembers(newMembers);
  };

  const toggleStatus = async (id: string | number) => {
    const member = members.find((m) => m.id === id);
    if (!member) return;
    const nextStatus = member.status === "Active" ? "Inactive" : "Active";
    try {
      const res = await fetch('/api/v1/admin/community-members', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, showOnWebsite: nextStatus === 'Active' }),
      });
      if (res.ok) {
        setMembers((prev) =>
          prev.map((m) => (m.id === id ? { ...m, status: nextStatus } : m))
        );
      }
    } catch (err) {
      console.error("Failed to toggle member status:", err);
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

  const handleSocialLinkChange = (index: number, value: string) => {
    const newLinks = [...(form.socialLinks || [""])];
    newLinks[index] = value;
    set("socialLinks", newLinks);
  };

  const addSocialLink = () => {
    set("socialLinks", [...(form.socialLinks || [""]), ""]);
  };

  const removeSocialLink = (index: number) => {
    const newLinks = (form.socialLinks || [""]).filter((_, i) => i !== index);
    set("socialLinks", newLinks.length ? newLinks : [""]);
  };

  const filtered = members.filter((m) => {
    const matchType = m.type === activeTab;
    const matchSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      (m.company?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (m.expertise?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchStatus =
      filterStatus === "All" || m.status === filterStatus;
    return matchType && matchSearch && matchStatus;
  });

  const filteredApplications = applications.filter((app) => {
    const matchSearch =
      app.name.toLowerCase().includes(search.toLowerCase()) ||
      app.email.toLowerCase().includes(search.toLowerCase()) ||
      (app.company?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchStatus =
      filterStatus === "All" || app.status === filterStatus;
    return matchStatus && matchSearch;
  });

  const handleAcceptApplication = async (app: any) => {
    try {
      const res = await fetch(`/api/v1/admin/community-applications?id=${app.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        let mappedType: Member["type"] = "Founder";
        if (app.role === "founders") mappedType = "Founder";
        else if (app.role === "mentors") mappedType = "Mentor";
        else if (app.role === "investors") mappedType = "Investor";
        else if (app.role === "service-providers") mappedType = "Service Provider";
        else if (app.role === "other") mappedType = "Other";

        const newMember: Member = {
          id: Date.now(),
          name: app.name,
          email: app.email,
          phone: app.phone,
          type: mappedType,
          company: app.company,
          companyWebsite: app.companyWebsite,
          description: app.description,
          socialLinks: app.socialLinks,
          city: "Jalgaon",
          joinDate: new Date().toISOString().split("T")[0],
          status: "Active",
          photo: app.photo,
          otherRoleDetails: app.otherRoleDetails
        };

        const nextMembers = [...members, newMember];
        saveMembers(nextMembers);

        const nextApps = applications.map((a) => (a.id === app.id ? { ...a, status: "Accepted" } : a));
        setApplications(nextApps);
      } else {
        alert("Failed to approve application on server.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectApplication = async (app: any) => {
    try {
      const res = await fetch(`/api/v1/admin/community-applications?id=${app.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        const nextApps = applications.map((a) => (a.id === app.id ? { ...a, status: "Rejected" } : a));
        setApplications(nextApps);
      } else {
        alert("Failed to reject application on server.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openAdd = () => {
    setForm({ ...empty, type: activeTab as Member["type"] });
    setModal({ open: true, mode: "add", item: null });
  };
  const openEdit = (item: Member) => {
    const { id, ...rest } = item;
    setForm({
      ...empty,
      ...rest,
      socialLinks: rest.socialLinks && rest.socialLinks.length > 0 ? rest.socialLinks : [""]
    });
    setModal({ open: true, mode: "edit", item });
  };
  const openDelete = (item: Member) =>
    setModal({ open: true, mode: "delete", item });
  const openView = (item: Member) =>
    setModal({ open: true, mode: "view", item });
  const close = () => setModal((m) => ({ ...m, open: false }));

  const save = async () => {
    if (!form.name) return;
    const cleanedSocialLinks = (form.socialLinks || []).filter((l) => l.trim());
    
    try {
      if (modal.mode === "add") {
        const res = await fetch('/api/v1/admin/community-members', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name,
            photo: form.photo,
            designation: form.otherRoleDetails,
            company: form.company,
            type: form.type,
            linkedinUrl: cleanedSocialLinks[0] || null,
            websiteUrl: form.companyWebsite || null,
            bio: form.description || '',
            showOnWebsite: form.status === 'Active',
          }),
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            const m = json.data;
            const newMember = {
              id: m.id,
              name: m.name,
              email: m.email || '',
              type: (m.memberType === 'founder' ? 'Founder' :
                    m.memberType === 'mentor' ? 'Mentor' :
                    m.memberType === 'investor' ? 'Investor' :
                    m.memberType === 'service_provider' ? 'Service Provider' : 'Other') as Member['type'],
              company: m.company,
              expertise: m.bio || '',
              city: 'Jalgaon',
              joinDate: m.createdAt ? new Date(m.createdAt).toISOString().slice(0, 10) : '',
              status: (m.showOnWebsite ? 'Active' : 'Inactive') as Member['status'],
              phone: m.phone || '',
              photo: m.photo,
              description: m.bio || '',
              socialLinks: m.linkedinUrl ? [m.linkedinUrl] : [],
              companyWebsite: m.websiteUrl || ''
            };
            setMembers((prev) => [...prev, newMember]);
          }
        }
      } else if (modal.item) {
        const id = modal.item.id;
        const res = await fetch('/api/v1/admin/community-members', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id,
            name: form.name,
            photo: form.photo,
            designation: form.otherRoleDetails,
            company: form.company,
            type: form.type,
            linkedinUrl: cleanedSocialLinks[0] || null,
            websiteUrl: form.companyWebsite || null,
            bio: form.description || '',
            showOnWebsite: form.status === 'Active',
          }),
        });
        if (res.ok) {
          setMembers((prev) =>
            prev.map((m) =>
              m.id === id
                ? {
                    ...m,
                    name: form.name,
                    photo: form.photo,
                    otherRoleDetails: form.otherRoleDetails,
                    company: form.company,
                    type: form.type,
                    expertise: form.description || '',
                    status: form.status,
                    socialLinks: cleanedSocialLinks,
                    companyWebsite: form.companyWebsite,
                    description: form.description,
                  }
                : m
            )
          );
        }
      }
      close();
    } catch (err) {
      console.error("Failed to save member:", err);
    }
  };

  const remove = async () => {
    if (modal.item) {
      const id = modal.item.id;
      try {
        const res = await fetch(`/api/v1/admin/community-members?id=${id}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          setMembers((prev) => prev.filter((m) => m.id !== id));
        }
      } catch (err) {
        console.error("Failed to delete member:", err);
      }
    }
    close();
  };

  const set = (k: keyof typeof form, v: any) =>
    setForm((f) => ({ ...f, [k]: v }));

  const tabs = [
    "Founder",
    "Mentor",
    "Investor",
    "Service Provider",
    "Other",
    "Applications"
  ] as const;

  const tabCounts = tabs.map((t) => {
    if (t === "Applications") {
      return {
        type: t,
        count: applications.filter((app) => app.status === "Pending").length,
      };
    }
    return {
      type: t,
      count: members.filter(
        (m) => m.type === t && m.status === "Active",
      ).length,
    };
  });

  return (
    <div>
      <PageHeader
        icon={<Users size={20} style={{ color: "#FF6B00" }} />}
        title="Community Members"
        subtitle={`${members.length} total · ${members.filter((m) => m.status === "Active").length} active`}
        action={
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1 bg-gray-50 border border-gray-155 rounded-xl p-1 shadow-2xs">
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
            {activeTab !== "Applications" && (
              <button
                onClick={openAdd}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold border-none hover:opacity-90"
                style={{
                  background: "#FF6B00",
                  cursor: "pointer",
                  fontFamily: "'Satoshi', sans-serif",
                  boxShadow: "0 2px 10px rgba(255,107,0,0.35)",
                }}
              >
                <Plus size={16} /> Add {activeTab}
              </button>
            )}
          </div>
        }
      />

      <div
        className="mb-5 flex gap-2 overflow-x-auto pb-1"
        style={{ scrollbarWidth: "none" }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          const count =
            tabCounts.find((t) => t.type === tab)?.count || 0;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 whitespace-nowrap"
              style={{
                background: isActive ? "#FF6B00" : "#fff",
                color: isActive ? "#fff" : "#555",
                border: isActive
                  ? "1px solid #FF6B00"
                  : "1px solid #e5e5e5",
                cursor: "pointer",
                fontFamily: "'Inter', sans-serif",
                fontSize: "13px",
                fontWeight: isActive ? 600 : 500,
                boxShadow: isActive
                  ? "0 2px 8px rgba(255,107,0,0.25)"
                  : "0 1px 2px rgba(0,0,0,0.04)",
              }}
            >
              <span>{tab}</span>
              <span
                style={{
                  background: isActive
                    ? "rgba(255,255,255,0.25)"
                    : "rgba(0,0,0,0.06)",
                  color: isActive ? "#fff" : "#888",
                  padding: "2px 7px",
                  borderRadius: "99px",
                  fontSize: "11px",
                  fontWeight: 600,
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div
        className="bg-white rounded-2xl overflow-hidden"
        style={{
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          border: "1px solid #f0f0f0",
        }}
      >
        <div
          className="flex flex-wrap items-center gap-3 px-5 py-4"
          style={{ borderBottom: "1px solid #f5f5f5" }}
        >
          <div className="flex items-center gap-2 flex-1 min-w-[180px]">
            <Search size={15} style={{ color: "#bbb" }} />
            <input
              placeholder={`Search ${activeTab.toLowerCase()}s…`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                border: "none",
                outline: "none",
                fontSize: "14px",
                color: "#555",
                background: "none",
                flex: 1,
                fontFamily: "'Inter', sans-serif",
              }}
            />
          </div>
          <div className="flex gap-1">
            {(["All", "Active", "Inactive"] as const).map(
              (s) => (
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
                    background:
                      filterStatus === s
                        ? "#FF6B00"
                        : "#f4f4f5",
                    color: filterStatus === s ? "#fff" : "#555",
                    transition: "all 0.15s",
                  }}
                >
                  {s}
                </button>
              ),
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr style={{ background: "#fafafa" }}>
                {(activeTab === "Applications"
                  ? [
                      "Applicant",
                      "Selected Role",
                      "Company / details",
                      "Submitted",
                      "Status",
                      "Actions",
                    ]
                  : [
                      "Name",
                      "Company/Expertise",
                      "City",
                      "Joined",
                      "Status",
                      "Actions",
                    ]
                ).map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "#aaa",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      padding: "12px 16px",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activeTab === "Applications"
                ? filteredApplications.map((app) => (
                    <tr
                      key={app.id}
                      style={{ borderTop: "1px solid #f5f5f5" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#fafafa")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <td style={{ padding: "14px 16px" }}>
                        <div className="flex items-center gap-3">
                          {app.photo ? (
                            <img
                              src={app.photo}
                              alt={app.name}
                              style={{
                                width: "36px",
                                height: "36px",
                                borderRadius: "12px",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            <div
                              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                              style={{
                                background: `hsl(${(app.name.charCodeAt(0) * 37) % 360}, 60%, 92%)`,
                                color: `hsl(${(app.name.charCodeAt(0) * 37) % 360}, 60%, 40%)`,
                                fontWeight: 700,
                                fontSize: "14px",
                              }}
                            >
                              {app.name[0]}
                            </div>
                          )}
                          <div>
                            <div
                              style={{
                                fontSize: "14px",
                                fontWeight: 600,
                                color: "#0d0d0d",
                              }}
                            >
                              {app.name}
                            </div>
                            <div
                              style={{
                                fontSize: "12px",
                                color: "#aaa",
                              }}
                            >
                              {app.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: "13px", color: "#555" }}>
                        <span style={{ fontSize: "12px", fontWeight: 500, padding: "3px 10px", borderRadius: "99px", background: "rgba(255,107,0,0.1)", color: "#FF6B00" }}>
                          {app.role === "founders" ? "Founder" :
                           app.role === "mentors" ? "Mentor" :
                           app.role === "investors" ? "Investor" :
                           app.role === "service-providers" ? "Service Provider" :
                           app.role === "other" ? "Other" :
                           app.role}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: "13px", color: "#555" }}>
                        <div style={{ fontWeight: 600, color: "#0d0d0d" }}>{app.company || "—"}</div>
                        {app.companyWebsite && (
                          <a href={app.companyWebsite} target="_blank" rel="noopener noreferrer" style={{ fontSize: "12px", color: "#FF6B00", textDecoration: "none" }}>
                            {app.companyWebsite} ↗
                          </a>
                        )}
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: "13px", color: "#8a8a8a" }}>
                        {new Date(app.date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 600,
                            padding: "3px 10px",
                            borderRadius: "99px",
                            background:
                              app.status === "Pending"
                                ? "rgba(245,158,11,0.12)"
                                : app.status === "Accepted"
                                ? "rgba(16,185,129,0.12)"
                                : "rgba(239,68,68,0.12)",
                            color:
                              app.status === "Pending"
                                ? "#d97706"
                                : app.status === "Accepted"
                                ? "#059669"
                                : "#dc2626",
                          }}
                        >
                          {app.status}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => openView(app)}
                            className="p-1.5 rounded-lg transition-all bg-blue-50 text-blue-600 border-none cursor-pointer hover:bg-blue-100"
                            title="View Details"
                          >
                            <Eye size={13} />
                          </button>
                          {app.status === "Pending" && (
                            <>
                              <button
                                onClick={() => handleAcceptApplication(app)}
                                className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg border-none cursor-pointer hover:bg-emerald-100"
                                title="Accept"
                              >
                                <Check size={13} />
                              </button>
                              <button
                                onClick={() => handleRejectApplication(app)}
                                className="p-1.5 bg-red-50 text-red-500 rounded-lg border-none cursor-pointer hover:bg-red-100"
                                title="Reject"
                              >
                                <XIcon size={13} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                : filtered.map((member) => (
                    <tr
                      key={member.id}
                      style={{ borderTop: "1px solid #f5f5f5" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#fafafa")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <td style={{ padding: "14px 16px" }}>
                        <div className="flex items-center gap-3">
                          {member.photo ? (
                            <img
                              src={member.photo}
                              alt={member.name}
                              style={{
                                width: "36px",
                                height: "36px",
                                borderRadius: "12px",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            <div
                              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                              style={{
                                background: `hsl(${(member.name.charCodeAt(0) * 37) % 360}, 60%, 92%)`,
                                color: `hsl(${(member.name.charCodeAt(0) * 37) % 360}, 60%, 40%)`,
                                fontWeight: 700,
                                fontSize: "14px",
                              }}
                            >
                              {member.name[0]}
                            </div>
                          )}
                          <div>
                            <div
                              style={{
                                fontSize: "14px",
                                fontWeight: 600,
                                color: "#0d0d0d",
                              }}
                            >
                              {member.name}
                            </div>
                            <div
                              style={{
                                fontSize: "12px",
                                color: "#aaa",
                              }}
                            >
                              {member.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        {member.company && (
                          <div
                            style={{
                              fontSize: "13px",
                              fontWeight: 500,
                              color: "#0d0d0d",
                            }}
                          >
                            {member.company}
                          </div>
                        )}
                        {member.expertise && (
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#888",
                              marginTop: member.company
                                ? "2px"
                                : "0",
                            }}
                          >
                            {member.expertise}
                          </div>
                        )}
                      </td>
                      <td
                        style={{
                          padding: "14px 16px",
                          fontSize: "13px",
                          color: "#555",
                        }}
                      >
                        {member.city}
                      </td>
                      <td
                        style={{
                          padding: "14px 16px",
                          fontSize: "13px",
                          color: "#8a8a8a",
                        }}
                      >
                        {new Date(
                          member.joinDate,
                        ).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleStatus(member.id)}
                            className="relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out align-middle border-none"
                            style={{
                              background: member.status === "Active" ? "#10b981" : "#e5e7eb",
                              outline: "none"
                            }}
                            title={member.status === "Active" ? "Disable" : "Enable"}
                          >
                            <span
                              className="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out"
                              style={{
                                transform: member.status === "Active" ? "translateX(16px)" : "translateX(0)"
                              }}
                            />
                          </button>
                          <span style={{ fontSize: "12px", fontWeight: 500, color: member.status === "Active" ? "#10b981" : "#888" }}>
                            {member.status}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => openView(member)}
                            className="p-1.5 rounded-lg transition-all bg-blue-50 text-blue-600 border-none cursor-pointer hover:bg-blue-100"
                            title="View Details"
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            onClick={() => openEdit(member)}
                            className="p-1.5 rounded-lg transition-all bg-orange-50 text-[#FF6B00] border-none cursor-pointer hover:bg-orange-100"
                            title="Edit Details"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => openDelete(member)}
                            className="p-1.5 rounded-lg transition-all bg-red-50 text-red-500 border-none cursor-pointer hover:bg-red-100"
                            title="Remove Member"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              {((activeTab === "Applications" && filteredApplications.length === 0) ||
                (activeTab !== "Applications" && filtered.length === 0)) && (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      padding: "40px 16px",
                      textAlign: "center",
                      color: "#bbb",
                      fontSize: "14px",
                    }}
                  >
                    No {activeTab.toLowerCase()} found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modal.open && modal.mode === "view" && modal.item && (
        <Modal
          isOpen={true}
          onClose={close}
          title={`View ${modal.item.type} Details`}
          size="md"
        >
          <div className="space-y-4" style={{ fontFamily: "'Inter', sans-serif" }}>
            <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
              {modal.item.photo ? (
                <img
                  src={modal.item.photo}
                  alt={modal.item.name}
                  style={{
                    width: "70px",
                    height: "70px",
                    borderRadius: "16px",
                    objectFit: "cover",
                    border: "2px solid #FF6B00"
                  }}
                />
              ) : (
                <div
                  className="w-[70px] h-[70px] rounded-2xl flex items-center justify-center font-bold text-2xl"
                  style={{
                    background: `hsl(${(modal.item.name.charCodeAt(0) * 37) % 360}, 60%, 92%)`,
                    color: `hsl(${(modal.item.name.charCodeAt(0) * 37) % 360}, 60%, 40%)`
                  }}
                >
                  {modal.item.name[0]}
                </div>
              )}
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#0d0d0d" }}>{modal.item.name}</h3>
                <p style={{ fontSize: "13px", color: "#888" }}>{modal.item.email}</p>
                <span
                  style={{
                    display: "inline-block",
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "#FF6B00",
                    background: "rgba(255,107,0,0.1)",
                    padding: "3px 10px",
                    borderRadius: "99px",
                    marginTop: "6px"
                  }}
                >
                  {modal.item.type}
                </span>
              </div>
            </div>

            <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase" }}>Phone Number</label>
                <div style={{ fontSize: "13.5px", color: "#333", marginTop: "2px" }}>{modal.item.phone || "—"}</div>
              </div>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase" }}>City</label>
                <div style={{ fontSize: "13.5px", color: "#333", marginTop: "2px" }}>{modal.item.city || "—"}</div>
              </div>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase" }}>Company / Affiliation</label>
                <div style={{ fontSize: "13.5px", color: "#333", marginTop: "2px" }}>
                  {modal.item.companyWebsite ? (
                    <a href={modal.item.companyWebsite} target="_blank" rel="noopener noreferrer" style={{ color: "#FF6B00", textDecoration: "none" }}>
                      {modal.item.company} 🔗
                    </a>
                  ) : (
                    modal.item.company || "—"
                  )}
                </div>
              </div>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase" }}>Expertise</label>
                <div style={{ fontSize: "13.5px", color: "#333", marginTop: "2px" }}>{modal.item.expertise || "—"}</div>
              </div>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase" }}>Join Date</label>
                <div style={{ fontSize: "13.5px", color: "#333", marginTop: "2px" }}>
                  {new Date(modal.item.joinDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                </div>
              </div>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase" }}>Status</label>
                <div style={{ fontSize: "13.5px", marginTop: "2px", fontWeight: 600, color: modal.item.status === "Active" ? "#10b981" : "#ef4444" }}>
                  {modal.item.status}
                </div>
              </div>
            </div>

            {modal.item.otherRoleDetails && (
              <div>
                <label style={{ fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase" }}>Tell us about your role</label>
                <div style={{ fontSize: "13.5px", color: "#555", background: "#f9f9f9", padding: "10px 14px", borderRadius: "10px", border: "1px solid #f0f0f0", marginTop: "4px", lineHeight: "1.4" }}>
                  {modal.item.otherRoleDetails}
                </div>
              </div>
            )}

            {modal.item.description && (
              <div>
                <label style={{ fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase" }}>Short Description</label>
                <div style={{ fontSize: "13.5px", color: "#555", background: "#f9f9f9", padding: "10px 14px", borderRadius: "10px", border: "1px solid #f0f0f0", marginTop: "4px", lineHeight: "1.4" }}>
                  {modal.item.description}
                </div>
              </div>
            )}

            {modal.item.socialLinks && modal.item.socialLinks.filter(Boolean).length > 0 && (
              <div>
                <label style={{ fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase" }}>Social Media Links</label>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "6px" }}>
                  {modal.item.socialLinks.filter(Boolean).map((link: any, idx: number) => {
                    let domain = "Link";
                    if (link.includes("linkedin.com")) domain = "LinkedIn";
                    else if (link.includes("twitter.com") || link.includes("x.com")) domain = "Twitter";
                    else if (link.includes("github.com")) domain = "GitHub";
                    else if (link.includes("instagram.com")) domain = "Instagram";
                    return (
                      <a
                        key={idx}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: "12px",
                          fontWeight: 500,
                          color: "#FF6B00",
                          background: "rgba(255,107,0,0.08)",
                          padding: "4px 10px",
                          borderRadius: "8px",
                          textDecoration: "none"
                        }}
                      >
                        {domain} ↗
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-gray-100">
              <GhostBtn onClick={close}>Close</GhostBtn>
            </div>
          </div>
        </Modal>
      )}

      {modal.open && (modal.mode === "add" || modal.mode === "edit") && (
        <Modal
          isOpen={true}
          onClose={close}
          title={
            modal.mode === "add"
              ? `Add ${form.type}`
              : `Edit ${form.type}`
          }
          size="md"
        >
          <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-2 no-scrollbar">
            <FormField label="Full Name *">
              <Input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Full name"
              />
            </FormField>
            <FormField label="Email *">
              <Input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="email@example.com"
              />
            </FormField>
            <div
              className="grid gap-4"
              style={{ gridTemplateColumns: "1fr 1fr" }}
            >
              <FormField label="Type">
                <Select
                  value={form.type}
                  onChange={(e) => set("type", e.target.value)}
                >
                  {tabs.filter(t => t !== "Applications").map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Phone Number">
                <Input
                  type="tel"
                  value={form.phone || ""}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </FormField>
              <FormField label="City">
                <Input
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                  placeholder="City"
                />
              </FormField>
              <FormField label="Company">
                <Input
                  value={form.company || ""}
                  onChange={(e) => set("company", e.target.value)}
                  placeholder="Company name"
                />
              </FormField>
              <FormField label="Expertise">
                <Input
                  value={form.expertise || ""}
                  onChange={(e) => set("expertise", e.target.value)}
                  placeholder="Area of expertise"
                />
              </FormField>
              <FormField label="Company Website Link">
                <Input
                  type="url"
                  value={form.companyWebsite || ""}
                  onChange={(e) => set("companyWebsite", e.target.value)}
                  placeholder="https://company.com"
                />
              </FormField>
              <FormField label="Join Date">
                <Input
                  type="date"
                  value={form.joinDate}
                  onChange={(e) => set("joinDate", e.target.value)}
                />
              </FormField>
              <FormField label="Status">
                <Select
                  value={form.status}
                  onChange={(e) => set("status", e.target.value)}
                >
                  <option>Active</option>
                  <option>Inactive</option>
                </Select>
              </FormField>
            </div>

            {form.type === "Other" && (
              <FormField label="Tell us about your role *">
                <Textarea
                  value={form.otherRoleDetails || ""}
                  onChange={(e) => set("otherRoleDetails", e.target.value)}
                  placeholder="Specify custom role details..."
                  rows={2}
                />
              </FormField>
            )}

            <div>
              <FormField label="Profile Photo (Drag & Drop or Click to Upload)">
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById("member-photo-upload")?.click()}
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
                  <input id="member-photo-upload" type="file" accept="image/*" className="hidden" onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFile(e.target.files[0]);
                    }
                  }} />
                  {form.photo ? (
                    <div className="flex flex-col items-center">
                      <img src={form.photo} alt="Preview" className="w-16 h-16 rounded-xl object-cover mb-2" />
                      <span className="text-[11px] text-gray-400">Click to select a different photo</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <UploadCloud size={24} className="text-[#FF6B00] mb-1" />
                      <span className="text-xs font-semibold text-gray-650">Drag & drop profile picture here</span>
                    </div>
                  )}
                </div>
              </FormField>
            </div>

            <FormField label="Short Description">
              <Textarea
                value={form.description || ""}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Write a brief bio or description of the member..."
                rows={3}
              />
            </FormField>

            <div>
              <FormField label="Social Media Links">
                <div className="space-y-2">
                  {(form.socialLinks || [""]).map((link, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <Input
                        type="url"
                        value={link}
                        onChange={(e) => handleSocialLinkChange(idx, e.target.value)}
                        placeholder="https://linkedin.com/in/username"
                      />
                      {(form.socialLinks || []).length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSocialLink(idx)}
                          className="border-none cursor-pointer"
                          style={{
                            background: "rgba(239, 68, 68, 0.1)",
                            color: "#ef4444",
                            padding: "8px 12px",
                            borderRadius: "8px",
                            fontSize: "12px",
                            fontWeight: 600
                          }}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addSocialLink}
                    className="border-none cursor-pointer"
                    style={{
                      background: "rgba(255, 107, 0, 0.1)",
                      color: "#FF6B00",
                      padding: "6px 12px",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: 600,
                      marginTop: "4px"
                    }}
                  >
                    + Add Another Link
                  </button>
                </div>
              </FormField>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <GhostBtn onClick={close}>Cancel</GhostBtn>
              <PrimaryBtn onClick={save}>
                {modal.mode === "add"
                  ? `Add ${form.type}`
                  : "Save Changes"}
              </PrimaryBtn>
            </div>
          </div>
        </Modal>
      )}

      <Modal
        isOpen={modal.open && modal.mode === "delete"}
        onClose={close}
        title={`Remove ${modal.item?.type}`}
        size="sm"
      >
        <p
          style={{
            fontSize: "14px",
            color: "#555",
            marginBottom: "20px",
          }}
        >
          Remove <strong>"{modal.item?.name}"</strong> from the
          community? This cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <GhostBtn onClick={close}>Cancel</GhostBtn>
          <DangerBtn onClick={remove}>Remove</DangerBtn>
        </div>
      </Modal>
    </div>
  );
}
