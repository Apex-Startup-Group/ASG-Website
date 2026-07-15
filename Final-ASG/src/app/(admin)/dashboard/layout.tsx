"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/admin/AuthContext";
import Sidebar from "@/components/admin/Sidebar";
import { Menu, Bell, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoggedIn, adminEmail } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ queries: any[]; blogs: any[]; events: any[] }>({
    queries: [],
    blogs: [],
    events: []
  });
  const [showSearch, setShowSearch] = useState(false);

  // Notification States
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  const initial = adminEmail?.[0]?.toUpperCase() || "A";

  const loadNotifications = async () => {
    try {
      const res = await fetch("/api/v1/admin/notifications");
      if (res.ok) {
        const json = await res.json();
        setNotifications(json.data.notifications || []);
        setUnreadCount(json.data.count || 0);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadNotifications();

    const supabase = createClient();
    const channel = supabase
      .channel('contact_queries_notif_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contact_queries' }, () => {
        loadNotifications();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClick = () => {
      setShowSearch(false);
      setShowNotifications(false);
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('click', handleClick);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('click', handleClick);
      }
    };
  }, []);

  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (!val.trim()) {
      setSearchResults({ queries: [], blogs: [], events: [] });
      setShowSearch(false);
      return;
    }

    try {
      const res = await fetch(`/api/v1/admin/search?q=${encodeURIComponent(val)}`);
      if (res.ok) {
        const json = await res.json();
        setSearchResults(json.data);
        setShowSearch(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "#f3f4f6", fontFamily: "'Inter', sans-serif" }}
    >
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar isOpen={false} onClose={() => {}} />
      </div>

      {/* Mobile sidebar */}
      <div className="lg:hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header
          className="flex items-center gap-4 px-6 py-3.5 bg-white flex-shrink-0 relative"
          style={{ borderBottom: "1px solid #f0f0f0" }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-xl"
            style={{ background: "#f4f4f5", border: "none", cursor: "pointer" }}
          >
            <Menu size={18} style={{ color: "#555" }} />
          </button>

          {/* Search */}
          <div className="hidden sm:flex items-center gap-2 flex-1 max-w-xs relative">
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-xl w-full"
              style={{
                background: "#f4f4f5",
                border: "1.5px solid transparent",
              }}
            >
              <Search size={15} style={{ color: "#aaa" }} />
              <input
                placeholder="Search…"
                value={searchQuery}
                onChange={handleSearchChange}
                onClick={(e) => { e.stopPropagation(); if (searchQuery.trim()) setShowSearch(true); }}
                style={{
                  background: "none",
                  border: "none",
                  outline: "none",
                  fontSize: "13px",
                  color: "#555",
                  width: "100%",
                  fontFamily: "'Inter', sans-serif",
                }}
              />
            </div>

            {/* Search Dropdown Overlay */}
            {showSearch && (
              <div 
                className="absolute left-0 top-full mt-2 bg-white rounded-2xl p-4 shadow-xl border border-gray-100 z-50 w-96 max-h-96 overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
                style={{ filter: "drop-shadow(0 10px 15px rgba(0,0,0,0.05))" }}
              >
                <div style={{ fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>Search Results</div>
                {searchResults.queries.length === 0 && searchResults.blogs.length === 0 && searchResults.events.length === 0 && (
                  <div style={{ fontSize: "12px", color: "#8a8a8a", padding: "10px 0" }}>No matches found.</div>
                )}
                {searchResults.queries.length > 0 && (
                  <div className="mb-4">
                    <div style={{ fontSize: "10px", fontWeight: 700, color: "#FF6B00", marginBottom: "6px", letterSpacing: "0.05em" }}>CONTACT QUERIES</div>
                    <div className="space-y-2">
                      {searchResults.queries.map((q) => (
                        <div 
                          key={q.id} 
                          onClick={() => { router.push('/dashboard/queries'); setShowSearch(false); }}
                          className="p-2 rounded-xl hover:bg-orange-50 cursor-pointer transition-all flex flex-col gap-0.5"
                        >
                          <div style={{ fontSize: "12px", fontWeight: 600, color: "#0d0d0d" }}>{q.name}</div>
                          <div style={{ fontSize: "11px", color: "#666", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{q.subject}: {q.message}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {searchResults.blogs.length > 0 && (
                  <div className="mb-4">
                    <div style={{ fontSize: "10px", fontWeight: 700, color: "#FF6B00", marginBottom: "6px", letterSpacing: "0.05em" }}>BLOG POSTS</div>
                    <div className="space-y-2">
                      {searchResults.blogs.map((b) => (
                        <div 
                          key={b.id} 
                          onClick={() => { router.push('/dashboard/blogs'); setShowSearch(false); }}
                          className="p-2 rounded-xl hover:bg-orange-50 cursor-pointer transition-all flex flex-col gap-0.5"
                        >
                          <div style={{ fontSize: "12px", fontWeight: 600, color: "#0d0d0d" }}>{b.title}</div>
                          <div style={{ fontSize: "11px", color: "#666" }}>Category: {b.category}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {searchResults.events.length > 0 && (
                  <div className="mb-2">
                    <div style={{ fontSize: "10px", fontWeight: 700, color: "#FF6B00", marginBottom: "6px", letterSpacing: "0.05em" }}>EVENTS</div>
                    <div className="space-y-2">
                      {searchResults.events.map((ev) => (
                        <div 
                          key={ev.id} 
                          onClick={() => { router.push('/dashboard/events'); setShowSearch(false); }}
                          className="p-2 rounded-xl hover:bg-orange-50 cursor-pointer transition-all flex flex-col gap-0.5"
                        >
                          <div style={{ fontSize: "12px", fontWeight: 600, color: "#0d0d0d" }}>{ev.title}</div>
                          <div style={{ fontSize: "11px", color: "#666" }}>Venue: {ev.venue}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex-1" />

          {/* Notification + Avatar */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setShowNotifications(!showNotifications); setShowSearch(false); }}
                className="relative p-2 rounded-xl transition-colors hover:bg-gray-100"
                style={{ background: "#f4f4f5", border: "none", cursor: "pointer" }}
              >
                <Bell size={17} style={{ color: "#8a8a8a" }} />
                {unreadCount > 0 && (
                  <span
                    className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
                    style={{ background: "#FF6B00" }}
                  />
                )}
              </button>

              {/* Notifications Dropdown Overlay */}
              {showNotifications && (
                <div 
                  className="absolute right-0 top-full mt-2 bg-white rounded-2xl p-3 shadow-xl border border-gray-100 z-50 w-80 max-h-96 overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                  style={{ filter: "drop-shadow(0 10px 15px rgba(0,0,0,0.05))" }}
                >
                  <div className="flex items-center justify-between pb-2 mb-2" style={{ borderBottom: "1px solid #f5f5f5" }}>
                    <span style={{ fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.06em" }}>Notifications</span>
                    {unreadCount > 0 && (
                      <span style={{ fontSize: "10.5px", fontWeight: 600, color: "#FF6B00" }}>{unreadCount} pending</span>
                    )}
                  </div>
                  {notifications.length === 0 ? (
                    <div style={{ fontSize: "12px", color: "#8a8a8a", padding: "12px 6px", textAlign: "center" }}>No new notifications</div>
                  ) : (
                    <div className="space-y-2">
                      {notifications.map((n) => (
                        <div 
                          key={n.id} 
                          onClick={() => { router.push(n.link); setShowNotifications(false); }}
                          className="p-2 rounded-xl hover:bg-orange-50 cursor-pointer transition-all flex flex-col gap-0.5"
                        >
                          <div className="flex items-center justify-between">
                            <span style={{ fontSize: "12px", fontWeight: 600, color: "#0d0d0d" }}>{n.title}</span>
                            <span style={{ fontSize: "9.5px", color: "#aaa" }}>
                              {new Date(n.time).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                            </span>
                          </div>
                          <span style={{ fontSize: "11px", color: "#666", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{n.description}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div
              className="flex items-center gap-2.5 pl-3"
              style={{ borderLeft: "1px solid #f0f0f0" }}
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "#FF6B00" }}
              >
                <span
                  style={{
                    fontFamily: "'Satoshi', sans-serif",
                    fontWeight: 700,
                    fontSize: "13px",
                    color: "#fff",
                  }}
                >
                  {initial}
                </span>
              </div>
              <div className="hidden md:block">
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#0d0d0d",
                    lineHeight: 1.2,
                  }}
                >
                  {adminEmail || "Admin"}
                </div>
                <div style={{ fontSize: "11px", color: "#8a8a8a" }}>
                  Super Admin
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page children */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
