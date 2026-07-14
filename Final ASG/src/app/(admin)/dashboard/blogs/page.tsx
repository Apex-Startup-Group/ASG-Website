"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Plus, Search, FileText, UploadCloud, Edit, Trash2, Eye, Link, Undo, Redo, 
  Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, CheckSquare, Quote, Code, ArrowLeft, Palette, Minimize2, PlusCircle, Smile, Image as ImageIcon, Video
} from "lucide-react";
import Modal, { FormField, Input, Select, Textarea, PrimaryBtn, DangerBtn, GhostBtn } from "@/components/admin/Modal";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { PageHeader } from "@/components/admin/PageHeader";
import ImageUpload from "@/components/shared/ImageUpload";

interface Blog {
  id: string;
  title: string;
  slug: string;
  author: string;
  category: string;
  tags: string[];
  status: "Published" | "Draft";
  date: string;
  excerpt: string;
  content: string;
  readTime: string;
  thumbnailUrl?: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  ogImage?: string;
  createdAt?: string;
  publishedAt?: string | null;
}

const INITIAL: Blog[] = [];


const CATEGORIES = ["Ecosystem", "Technology", "Education", "Startup", "AI", "Innovation", "Community"];

const empty: Omit<Blog, "id"> = {
  title: "",
  slug: "",
  author: "",
  category: "Technology",
  status: "Draft",
  date: new Date().toISOString().split("T")[0],
  excerpt: "",
  content: "",
  readTime: "1 min read",
  thumbnailUrl: "",
  tags: [],
  metaTitle: "",
  metaDescription: "",
  keywords: ""
};

const FONTS = [
  { label: "Sans-Serif (Default)", value: "sans-serif" },
  { label: "Serif (Georgia)", value: "Georgia, serif" },
  { label: "Monospace (Code)", value: "Courier New, monospace" },
  { label: "Satoshi (Premium)", value: "'Satoshi', sans-serif" },
  { label: "Inter (Modern)", value: "'Inter', sans-serif" },
  { label: "Playfair Display (Elegant)", value: "'Playfair Display', serif" },
  { label: "Merriweather (Readability)", value: "'Merriweather', serif" },
  { label: "Roboto (Clean)", value: "'Roboto', sans-serif" },
  { label: "Lora (Journal)", value: "'Lora', serif" },
  { label: "Montserrat (Geometric)", value: "'Montserrat', sans-serif" }
];

const FONT_SIZES = [
  { label: "Extra Small", value: "1" },
  { label: "Small", value: "2" },
  { label: "Medium", value: "3" },
  { label: "Large", value: "4" },
  { label: "Extra Large", value: "5" },
  { label: "Huge", value: "6" }
];

const EMOJIS = ["😀", "😂", "😍", "👍", "👎", "🎉", "🔥", "🚀", "💡", "💻", "🎨", "📝", "🤔", "👏", "✔️", "🌟", "📅", "💡"];

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>(INITIAL);
  const [loading, setLoading] = useState(false);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/admin/blogs");
      if (res.ok) {
        const json = await res.json();
        setBlogs(json.data || []);
      }
    } catch (err) {
      console.error("Error fetching blogs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // CMS Views: "list" | "edit" | "add"
  const [viewState, setViewState] = useState<"list" | "edit" | "add">("list");
  const [editingId, setEditingId] = useState<string | null>(null);

  // Filters & List States
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterStatus, setFilterStatus] = useState<"All" | "Published" | "Draft">("All");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; item: Blog | null }>({ open: false, item: null });

  // Form States
  const [form, setForm] = useState<Omit<Blog, "id">>(empty);
  const [tagsInput, setTagsInput] = useState("");
  const [dragActive, setDragActive] = useState(false);
  
  // Editor Extra States
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [colorPickerTarget, setColorPickerTarget] = useState<"fore" | "back" | null>(null);
  const [emojiDropdownOpen, setEmojiDropdownOpen] = useState(false);
  
  // Refs
  const editorRef = useRef<HTMLDivElement>(null);
  const isEditorInitialized = useRef(false);
  const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(null);
  
  const savedRangeRef = useRef<Range | null>(null);

  const saveSelection = () => {
    if (typeof window !== 'undefined') {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        savedRangeRef.current = sel.getRangeAt(0);
      }
    }
  };

  const restoreSelection = () => {
    if (typeof window !== 'undefined' && savedRangeRef.current) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedRangeRef.current);
      }
    }
  };

  // Auto-generate slug and pre-fill SEO on title change
  const handleTitleChange = (title: string) => {
    setForm(prev => {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      
      return {
        ...prev,
        title,
        slug,
        metaTitle: prev.metaTitle ? prev.metaTitle : `${title} - ASG Blogs`
      };
    });
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
        setForm(f => ({ ...f, thumbnailUrl: event.target?.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleEditorInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      const text = editorRef.current.innerText || "";
      const wordCount = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
      const computedMinutes = Math.max(1, Math.ceil(wordCount / 200));
      const readTime = `${computedMinutes} min read`;
      
      setForm(prev => ({
        ...prev,
        content: html,
        readTime
      }));
    }
  };

  useEffect(() => {
    if ((viewState === "edit" || viewState === "add") && !isPreviewMode && editorRef.current && !isEditorInitialized.current) {
      editorRef.current.innerHTML = form.content;
      isEditorInitialized.current = true;
      const images = editorRef.current.getElementsByTagName("img");
      for (let i = 0; i < images.length; i++) {
        images[i].style.cursor = "pointer";
        images[i].onclick = (e) => {
          e.stopPropagation();
          setSelectedImage(e.currentTarget as HTMLImageElement);
        };
      }
    }
  }, [viewState, isPreviewMode, form.content]);

  useEffect(() => {
    const handleDeselect = () => {
      setSelectedImage(null);
    };
    document.addEventListener("click", handleDeselect);
    return () => document.removeEventListener("click", handleDeselect);
  }, []);

  const handleTogglePreview = () => {
    isEditorInitialized.current = false;
    setIsPreviewMode(prev => !prev);
  };

  const execEditorCmd = (cmd: string, val: string = "") => {
    if (typeof document !== 'undefined') {
      restoreSelection();
      document.execCommand("styleWithCSS", false, "true");
      document.execCommand(cmd, false, val);
      handleEditorInput();
      saveSelection();
    }
  };

  const handleLink = () => {
    const url = prompt("Enter hyperlink URL (e.g. https://google.com):", "https://");
    if (url) {
      execEditorCmd("createLink", url);
    }
  };

  const insertCodeBlock = () => {
    const html = `<pre style="background: #f4f4f5; padding: 12px; border-radius: 8px; font-family: monospace; border: 1px solid #e4e4e7; margin: 8px 0; overflow-x: auto;"><code>Code block here...</code></pre>`;
    execEditorCmd("insertHTML", html);
  };

  const insertChecklist = () => {
    const html = `
      <ul style="list-style: none; padding-left: 0;">
        <li style="display: flex; align-items: center; gap: 8px; margin: 4px 0;">
          <input type="checkbox" style="width: 16px; height: 16px; accent-color: #FF6B00; cursor: pointer;" />
          <span>New check item</span>
        </li>
      </ul>
    `;
    execEditorCmd("insertHTML", html);
  };

  const insertTable = () => {
    const html = `
      <table style="width: 100%; border-collapse: collapse; border: 1px solid #e4e4e7; margin: 12px 0;">
        <thead>
          <tr style="background: #f4f4f5;">
            <th style="border: 1px solid #e4e4e7; padding: 8px; text-align: left; font-weight: 600;">Header 1</th>
            <th style="border: 1px solid #e4e4e7; padding: 8px; text-align: left; font-weight: 600;">Header 2</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid #e4e4e7; padding: 8px;">Cell 1</td>
            <td style="border: 1px solid #e4e4e7; padding: 8px;">Cell 2</td>
          </tr>
          <tr>
            <td style="border: 1px solid #e4e4e7; padding: 8px;">Cell 3</td>
            <td style="border: 1px solid #e4e4e7; padding: 8px;">Cell 4</td>
          </tr>
        </tbody>
      </table>
    `;
    execEditorCmd("insertHTML", html);
  };

  const handleImageInsert = (url: string) => {
    if (url) {
      const html = `<img src="${url}" alt="Blog Image" style="max-width: 100%; height: auto; border-radius: 8px; margin: 12px auto; display: block; cursor: pointer;" />`;
      execEditorCmd("insertHTML", html);
      setTimeout(() => {
        if (editorRef.current) {
          const imgs = editorRef.current.getElementsByTagName("img");
          for (let i = 0; i < imgs.length; i++) {
            if (imgs[i].src === url) {
              imgs[i].onclick = (e) => {
                e.stopPropagation();
                setSelectedImage(e.currentTarget as HTMLImageElement);
              };
            }
          }
        }
      }, 100);
    }
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file size (1.5MB for inline images as per config limit)
      const maxSize = 1.5 * 1024 * 1024;
      if (file.size > maxSize) {
        alert("Inline image exceeds the 1.5MB size limit.");
        return;
      }

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("bucket", "media");
        formData.append("uploadType", "blog_inline");

        const res = await fetch("/api/v1/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error?.message || "Failed to upload inline image.");
        }

        const data = await res.json();
        handleImageInsert(data.url);
      } catch (err: any) {
        alert(err.message || "An error occurred during inline image upload.");
      }
    }
  };

  const handleVideoInsert = () => {
    const url = prompt("Enter YouTube video link (e.g. https://www.youtube.com/watch?v=...) or direct video mp4 url:");
    if (!url) return;

    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      let id = "";
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = url.match(regExp);
      if (match && match[2].length === 11) {
        id = match[2];
      }
      if (id) {
        const embedUrl = `https://www.youtube.com/embed/${id}`;
        const html = `
          <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; border-radius: 12px; margin: 16px 0;">
            <iframe src="${embedUrl}" style="position: absolute; top:0; left:0; width:100%; height:100%; border:none;" allowfullscreen></iframe>
          </div>
        `;
        execEditorCmd("insertHTML", html);
      } else {
        alert("Could not extract YouTube video ID. Check the URL.");
      }
    } else {
      const html = `
        <video controls style="width: 100%; max-height: 450px; border-radius: 12px; margin: 16px 0;">
          <source src="${url}" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      `;
      execEditorCmd("insertHTML", html);
    }
  };

  const resizeSelectedImage = (w: string) => {
    if (selectedImage) {
      selectedImage.style.width = w;
      handleEditorInput();
    }
  };

  const addImageCaption = () => {
    if (selectedImage) {
      const caption = prompt("Enter image caption:", "Figure: Description of the image");
      if (caption !== null) {
        const next = selectedImage.nextElementSibling;
        if (next && next.tagName === "FIGCAPTION") {
          next.innerHTML = caption;
        } else {
          const fig = document.createElement("figcaption");
          fig.style.textAlign = "center";
          fig.style.fontSize = "12px";
          fig.style.color = "#71717a";
          fig.style.marginTop = "6px";
          fig.style.fontStyle = "italic";
          fig.innerHTML = caption;
          selectedImage.insertAdjacentElement("afterend", fig);
        }
        handleEditorInput();
      }
    }
  };

  const handleAddTag = () => {
    const clean = tagsInput.trim().replace(/[^a-zA-Z0-9-]/g, "");
    if (clean && !form.tags.includes(clean)) {
      setForm(prev => ({ ...prev, tags: [...prev.tags, clean] }));
    }
    setTagsInput("");
  };

  const handleRemoveTag = (t: string) => {
    setForm(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== t) }));
  };

  const handleSave = async (status: "Published" | "Draft") => {
    if (!form.title) {
      alert("Blog Title is required!");
      return;
    }
    
    // Only enforce complete information when actually publishing
    if (status === "Published") {
      if (!form.thumbnailUrl) {
        alert("Featured Image is required to publish!");
        return;
      }
      if (!form.excerpt) {
        alert("Excerpt Summary is required to publish!");
        return;
      }
    }

    try {
      setLoading(true);
      const url = viewState === "add" ? "/api/v1/admin/blogs" : `/api/v1/admin/blogs/${editingId}`;
      const method = viewState === "add" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          status,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error?.message || "Failed to save blog post.");
      }

      await fetchBlogs();
      setViewState("list");
      setEditingId(null);
    } catch (err: any) {
      alert(err.message || "An error occurred while saving the blog post.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (blog: Blog) => {
    isEditorInitialized.current = false;
    setForm({
      title: blog.title,
      slug: blog.slug,
      author: blog.author,
      category: blog.category,
      status: blog.status,
      date: blog.date,
      excerpt: blog.excerpt,
      content: blog.content,
      readTime: blog.readTime,
      thumbnailUrl: blog.thumbnailUrl,
      tags: blog.tags || [],
      metaTitle: blog.metaTitle,
      metaDescription: blog.metaDescription,
      keywords: blog.keywords,
    });
    setEditingId(blog.id);
    setViewState("edit");
  };

  const handleAddNewClick = () => {
    isEditorInitialized.current = false;
    setForm(empty);
    setEditingId(null);
    setViewState("add");
  };

  const handleDeleteConfirm = async () => {
    if (deleteModal.item) {
      try {
        setLoading(true);
        const res = await fetch(`/api/v1/admin/blogs/${deleteModal.item.id}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error?.message || "Failed to delete blog post.");
        }

        await fetchBlogs();
      } catch (err: any) {
        alert(err.message || "An error occurred while deleting the blog post.");
      } finally {
        setLoading(false);
        setDeleteModal({ open: false, item: null });
      }
    }
  };

  const filteredBlogs = blogs.filter(b => {
    const matchSearch = b.title.toLowerCase().includes(search.toLowerCase()) || 
                        b.author.toLowerCase().includes(search.toLowerCase()) ||
                        b.excerpt.toLowerCase().includes(search.toLowerCase());
    
    const matchCategory = filterCategory === "All" || b.category === filterCategory;
    const matchStatus = filterStatus === "All" || b.status === filterStatus;

    return matchSearch && matchCategory && matchStatus;
  }).sort((a, b) => {
    const timeA = new Date(a.publishedAt || a.createdAt || a.date).getTime();
    const timeB = new Date(b.publishedAt || b.createdAt || b.date).getTime();
    return sortBy === "newest" ? timeB - timeA : timeA - timeB;
  });

  return (
    <div className={`p-1 ${isFullscreen ? "fixed inset-0 z-50 bg-white" : ""}`}>
      {viewState === "list" ? (
        <>
          <PageHeader
            icon={<FileText size={20} style={{ color: "#FF6B00" }} />}
            title="Blog Posts CMS"
            subtitle={`${blogs.length} posts · ${blogs.filter((b) => b.status === "Published").length} published`}
            action={
              <div className="flex items-center gap-2.5">
                <button 
                  onClick={handleAddNewClick} 
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity border-none cursor-pointer"
                  style={{ background: "#FF6B00", fontFamily: "'Satoshi', sans-serif", boxShadow: "0 2px 10px rgba(255,107,0,0.35)" }}
                >
                  <Plus size={16} /> New CMS Post
                </button>
              </div>
            }
          />

          <div className="bg-white rounded-2xl overflow-hidden mt-6" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid #f0f0f0" }}>
            <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 bg-gray-50/50" style={{ borderBottom: "1px solid #f5f5f5" }}>
              <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
                <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-gray-200 w-full max-w-sm">
                  <Search size={15} style={{ color: "#bbb" }} />
                  <input
                    placeholder="Search blogs by title, content or author…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full text-sm outline-none border-none text-gray-700 placeholder-gray-400"
                    style={{ background: "none" }}
                  />
                </div>

                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-2 bg-white rounded-xl border border-gray-200 text-sm text-gray-600 outline-none cursor-pointer"
                >
                  <option value="All">All Categories</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "newest" | "oldest")}
                  className="px-3 py-2 bg-white rounded-xl border border-gray-200 text-sm text-gray-600 outline-none cursor-pointer"
                >
                  <option value="newest">Sort by: Latest first</option>
                  <option value="oldest">Sort by: Oldest first</option>
                </select>
              </div>

              <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
                {(["All", "Published", "Draft"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "9px",
                      border: "none",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      background: filterStatus === s ? "#FF6B00" : "transparent",
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
                    {["Featured Image & Title", "Author", "Category", "Read Time", "Date", "Status", "Actions"].map((h) => (
                      <th key={h} style={{ textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.06em", padding: "12px 16px" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredBlogs.map((blog) => (
                    <tr key={blog.id} style={{ borderTop: "1px solid #f5f5f5" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#fafafa")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                      <td style={{ padding: "14px 16px", maxWidth: "380px" }}>
                        <div className="flex gap-3 items-start">
                          <div className="w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-50 border border-gray-150 flex items-center justify-center text-gray-400">
                            {blog.thumbnailUrl ? (
                              <img
                                src={blog.thumbnailUrl}
                                alt={blog.title}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              />
                            ) : (
                              <ImageIcon size={18} />
                            )}
                          </div>
                          <div>
                            <div style={{ fontSize: "14px", fontWeight: 600, color: "#0d0d0d", marginBottom: "3px" }}>{blog.title}</div>
                            <div className="text-xs text-gray-400 font-mono truncate max-w-[280px]">slug: {blog.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: "13px", color: "#555", whiteSpace: "nowrap" }}>{blog.author}</td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ fontSize: "12px", fontWeight: 500, padding: "3px 10px", borderRadius: "99px", background: "rgba(139,92,246,0.1)", color: "#8b5cf6" }}>{blog.category}</span>
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: "13px", color: "#8a8a8a", whiteSpace: "nowrap" }}>{blog.readTime}</td>
                      <td style={{ padding: "14px 16px", fontSize: "13px", color: "#8a8a8a", whiteSpace: "nowrap" }}>
                        {new Date(blog.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <StatusBadge status={blog.status} />
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleEditClick(blog)} 
                            title="Edit Post"
                            className="p-1.5 text-gray-500 hover:text-orange-500 rounded-lg hover:bg-gray-100 transition-colors border-none bg-transparent cursor-pointer"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => setDeleteModal({ open: true, item: blog })} 
                            title="Delete Post"
                            className="p-1.5 text-gray-500 hover:text-red-500 rounded-lg hover:bg-gray-100 transition-colors border-none bg-transparent cursor-pointer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredBlogs.length === 0 && (
                    <tr><td colSpan={7} style={{ padding: "40px 16px", textAlign: "center", color: "#bbb", fontSize: "14px" }}>No posts found matching the filters.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        // CMS WRITER VIEW
        <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-24 text-gray-800">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setViewState("list")}
                className="p-2 text-gray-500 hover:text-orange-500 hover:bg-gray-100 rounded-xl transition-all border-none bg-transparent cursor-pointer"
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{viewState === "add" ? "Write Blog Post" : "Edit Blog Post"}</h1>
                <p className="text-xs text-gray-500">Upgrade your ideas to formatted web publications</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <GhostBtn onClick={() => setViewState("list")}>Cancel</GhostBtn>
              <button 
                onClick={handleTogglePreview}
                className="px-4 py-2 border border-gray-250 hover:border-gray-300 text-gray-700 text-sm font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer bg-white"
              >
                <Eye size={15} /> {isPreviewMode ? "Edit Mode" : "Preview"}
              </button>
              <button 
                onClick={() => handleSave("Draft")}
                className="px-4 py-2 border border-orange-200 text-[#FF6B00] hover:bg-orange-50/50 text-sm font-semibold rounded-xl transition-all cursor-pointer bg-white"
              >
                Save Draft
              </button>
              <button 
                onClick={() => handleSave("Published")}
                className="px-4 py-2 bg-[#FF6B00] text-white hover:opacity-95 text-sm font-semibold rounded-xl transition-all shadow-md shadow-orange-500/10 border-none cursor-pointer"
              >
                Publish Post
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <FormField label="Blog Title *">
                  <input 
                    value={form.title} 
                    onChange={(e) => handleTitleChange(e.target.value)} 
                    placeholder="Enter an engaging, premium title..." 
                    className="w-full text-lg font-bold border-b border-gray-100 focus:border-orange-500 outline-none pb-2 transition-colors placeholder-gray-300 text-gray-800 bg-transparent"
                  />
                </FormField>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="URL Slug (auto-generated)">
                    <input 
                      value={form.slug} 
                      onChange={(e) => setForm(f => ({ ...f, slug: e.target.value }))} 
                      placeholder="url-slug-format" 
                      className="w-full text-xs font-mono px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                    />
                  </FormField>
                  <FormField label="Author *">
                    <input 
                      value={form.author} 
                      onChange={(e) => setForm(f => ({ ...f, author: e.target.value }))} 
                      placeholder="e.g. AI Lab Squad" 
                      className="w-full text-sm px-3 py-2 border border-gray-200 rounded-xl outline-none"
                    />
                  </FormField>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-150 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                {!isPreviewMode && (
                  <div className="bg-gray-50/80 backdrop-blur-md p-2.5 border-b border-gray-200 flex flex-wrap gap-1 items-center justify-between sticky top-0 z-10">
                    <div className="flex flex-wrap gap-1 items-center">
                      <button onMouseDown={(e) => { e.preventDefault(); execEditorCmd("undo"); }} className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors border-none bg-transparent cursor-pointer" title="Undo"><Undo size={15} /></button>
                      <button onMouseDown={(e) => { e.preventDefault(); execEditorCmd("redo"); }} className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors border-none bg-transparent cursor-pointer" title="Redo"><Redo size={15} /></button>
                      <div className="w-px h-5 bg-gray-200 mx-1"></div>

                      <select 
                        onChange={(e) => { execEditorCmd("formatBlock", e.target.value); e.target.value = ""; }}
                        className="px-2 py-1 text-xs bg-white border border-gray-200 rounded-lg outline-none text-gray-600 font-semibold cursor-pointer"
                        defaultValue=""
                      >
                        <option value="" disabled>Format</option>
                        <option value="<P>">Paragraph</option>
                        <option value="<H1>">H1 Heading</option>
                        <option value="<H2>">H2 Heading</option>
                        <option value="<H3>">H3 Heading</option>
                        <option value="<H4>">H4 Heading</option>
                      </select>

                      <select 
                        onChange={(e) => execEditorCmd("fontName", e.target.value)}
                        className="px-2 py-1 text-xs bg-white border border-gray-200 rounded-lg outline-none text-gray-600 cursor-pointer"
                        defaultValue="sans-serif"
                      >
                        {FONTS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                      </select>

                      <select 
                        onChange={(e) => execEditorCmd("fontSize", e.target.value)}
                        className="px-2 py-1 text-xs bg-white border border-gray-200 rounded-lg outline-none text-gray-600 cursor-pointer"
                        defaultValue="3"
                      >
                        {FONT_SIZES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>

                      <div className="w-px h-5 bg-gray-200 mx-1"></div>

                      <button onMouseDown={(e) => { e.preventDefault(); execEditorCmd("bold"); }} className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-700 font-bold border-none bg-transparent cursor-pointer" title="Bold"><Bold size={15} /></button>
                      <button onMouseDown={(e) => { e.preventDefault(); execEditorCmd("italic"); }} className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-700 italic border-none bg-transparent cursor-pointer" title="Italic"><Italic size={15} /></button>
                      <button onMouseDown={(e) => { e.preventDefault(); execEditorCmd("underline"); }} className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-700 underline border-none bg-transparent cursor-pointer" title="Underline"><Underline size={15} /></button>
                      <button onMouseDown={(e) => { e.preventDefault(); execEditorCmd("strikeThrough"); }} className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-700 line-through border-none bg-transparent cursor-pointer" title="Strikethrough"><Strikethrough size={15} /></button>
                      
                      <div className="w-px h-5 bg-gray-200 mx-1"></div>

                      <button onMouseDown={(e) => { e.preventDefault(); execEditorCmd("justifyLeft"); }} className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-600 border-none bg-transparent cursor-pointer" title="Align Left"><AlignLeft size={15} /></button>
                      <button onMouseDown={(e) => { e.preventDefault(); execEditorCmd("justifyCenter"); }} className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-600 border-none bg-transparent cursor-pointer" title="Align Center"><AlignCenter size={15} /></button>
                      <button onMouseDown={(e) => { e.preventDefault(); execEditorCmd("justifyRight"); }} className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-600 border-none bg-transparent cursor-pointer" title="Align Right"><AlignRight size={15} /></button>
                      <button onMouseDown={(e) => { e.preventDefault(); execEditorCmd("justifyFull"); }} className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-600 border-none bg-transparent cursor-pointer" title="Justify"><AlignJustify size={15} /></button>

                      <div className="w-px h-5 bg-gray-200 mx-1"></div>

                      <div className="relative flex items-center">
                        <button 
                          onMouseDown={(e) => { e.preventDefault(); setColorPickerTarget(colorPickerTarget === "fore" ? null : "fore"); }}
                          className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-700 flex items-center gap-0.5 border-none bg-transparent cursor-pointer" 
                          title="Text Color"
                        >
                          <Palette size={15} /> <span style={{ textDecoration: "underline", fontWeight: 700 }}>A</span>
                        </button>
                        {colorPickerTarget === "fore" && (
                          <div className="absolute top-8 left-0 bg-white p-2 rounded-xl shadow-xl border border-gray-200 grid grid-cols-4 gap-1 z-30">
                            {["#000000", "#ef4444", "#f97316", "#f59e0b", "#10b981", "#3b82f6", "#6366f1", "#8b5cf6", "#ec4899", "#6b7280", "#FF6B00"].map(c => (
                              <button 
                                key={c}
                                onMouseDown={(e) => { e.preventDefault(); execEditorCmd("foreColor", c); setColorPickerTarget(null); }}
                                style={{ background: c }}
                                className="w-5 h-5 rounded-md border border-gray-300 cursor-pointer"
                              />
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="relative flex items-center">
                        <button 
                          onMouseDown={(e) => { e.preventDefault(); setColorPickerTarget(colorPickerTarget === "back" ? null : "back"); }}
                          className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-700 flex items-center gap-0.5 border-none bg-transparent cursor-pointer" 
                          title="Highlight Color"
                        >
                          <Palette size={15} style={{ opacity: 0.7 }} /> <span className="bg-yellow-200 px-0.5 font-bold">H</span>
                        </button>
                        {colorPickerTarget === "back" && (
                          <div className="absolute top-8 left-0 bg-white p-2 rounded-xl shadow-xl border border-gray-200 grid grid-cols-4 gap-1 z-30">
                            {["#ffffff", "#fef08a", "#bbf7d0", "#bfdbfe", "#e9d5ff", "#fbcfe8", "#fed7aa", "#e4e4e7"].map(c => (
                              <button 
                                key={c}
                                onMouseDown={(e) => { e.preventDefault(); execEditorCmd("hiliteColor", c); setColorPickerTarget(null); }}
                                style={{ background: c }}
                                className="w-5 h-5 rounded-md border border-gray-300 cursor-pointer"
                              />
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="w-px h-5 bg-gray-200 mx-1"></div>

                      <button onMouseDown={(e) => { e.preventDefault(); execEditorCmd("insertUnorderedList"); }} className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-600 border-none bg-transparent cursor-pointer" title="Bullet List"><List size={15} /></button>
                      <button onMouseDown={(e) => { e.preventDefault(); execEditorCmd("insertOrderedList"); }} className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-600 border-none bg-transparent cursor-pointer" title="Numbered List"><ListOrdered size={15} /></button>
                      <button onMouseDown={(e) => { e.preventDefault(); insertChecklist(); }} className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-600 border-none bg-transparent cursor-pointer" title="Checklist"><CheckSquare size={15} /></button>

                      <div className="w-px h-5 bg-gray-200 mx-1"></div>

                      <button onMouseDown={(e) => { e.preventDefault(); execEditorCmd("formatBlock", "<BLOCKQUOTE>"); }} className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-600 border-none bg-transparent cursor-pointer" title="Quote"><Quote size={15} /></button>
                      <button onMouseDown={(e) => { e.preventDefault(); insertCodeBlock(); }} className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-600 border-none bg-transparent cursor-pointer" title="Code Block"><Code size={15} /></button>
                      <button onMouseDown={(e) => { e.preventDefault(); execEditorCmd("insertHorizontalRule"); }} className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-600 border-none bg-transparent cursor-pointer" title="Divider"><Minimize2 size={15} /></button>
                      <button onMouseDown={(e) => { e.preventDefault(); insertTable(); }} className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-600 border-none bg-transparent cursor-pointer" title="Table"><PlusCircle size={15} /></button>

                      <div className="w-px h-5 bg-gray-200 mx-1"></div>

                      <button onMouseDown={(e) => { e.preventDefault(); handleLink(); }} className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-600 border-none bg-transparent cursor-pointer" title="Insert Link"><Link size={15} /></button>
                      <button onMouseDown={(e) => { e.preventDefault(); execEditorCmd("unlink"); }} className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-600 border-none bg-transparent cursor-pointer text-xs font-semibold" title="Remove Link">unlink</button>

                      <div className="w-px h-5 bg-gray-200 mx-1"></div>

                      <button 
                        onMouseDown={(e) => { e.preventDefault(); document.getElementById("editor-inline-image")?.click(); }}
                        className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-600 border-none bg-transparent cursor-pointer"
                        title="Upload Image"
                      >
                        <ImageIcon size={15} />
                        <input 
                          id="editor-inline-image" 
                          type="file" 
                          accept="image/*" 
                          style={{ display: "none" }}
                          onChange={handleMediaUpload}
                        />
                      </button>

                      <button onMouseDown={(e) => { e.preventDefault(); handleVideoInsert(); }} className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-600 border-none bg-transparent cursor-pointer" title="Embed Video / YouTube"><Video size={15} /></button>

                      <div className="w-px h-5 bg-gray-200 mx-1"></div>

                      <div className="relative">
                        <button 
                          onMouseDown={(e) => { e.preventDefault(); setEmojiDropdownOpen(!emojiDropdownOpen); }}
                          className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-600 border-none bg-transparent cursor-pointer"
                          title="Insert Emoji"
                        >
                          <Smile size={15} />
                        </button>
                        {emojiDropdownOpen && (
                          <div className="absolute top-8 left-0 bg-white p-2 rounded-xl shadow-xl border border-gray-200 grid grid-cols-6 gap-1 z-30 w-40">
                            {EMOJIS.map(emoji => (
                              <button 
                                key={emoji}
                                onMouseDown={(e) => { 
                                  e.preventDefault(); 
                                  execEditorCmd("insertText", emoji);
                                  setEmojiDropdownOpen(false);
                                }}
                                className="hover:bg-gray-100 p-1 rounded text-sm text-center border-none bg-transparent cursor-pointer"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {selectedImage && !isPreviewMode && (
                  <div className="bg-orange-50 border-b border-orange-100 px-4 py-2 flex items-center justify-between text-xs text-orange-950 font-semibold gap-3 animate-fade-in z-20">
                    <div className="flex items-center gap-1">
                      <span className="text-[#FF6B00]">📸 Image Selected:</span>
                      <span>Adjust display parameters:</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onMouseDown={(e) => { e.preventDefault(); resizeSelectedImage("25%"); }}
                        className="bg-white border border-orange-200 px-2 py-1 rounded hover:bg-orange-100 transition-colors cursor-pointer"
                      >
                        25% Width
                      </button>
                      <button 
                        onMouseDown={(e) => { e.preventDefault(); resizeSelectedImage("50%"); }}
                        className="bg-white border border-orange-200 px-2 py-1 rounded hover:bg-orange-100 transition-colors cursor-pointer"
                      >
                        50% Width
                      </button>
                      <button 
                        onMouseDown={(e) => { e.preventDefault(); resizeSelectedImage("100%"); }}
                        className="bg-white border border-orange-200 px-2 py-1 rounded hover:bg-orange-100 transition-colors cursor-pointer"
                      >
                        Full Width (100%)
                      </button>
                      <div className="w-px h-4 bg-orange-200"></div>
                      <button 
                        onMouseDown={(e) => { e.preventDefault(); addImageCaption(); }}
                        className="bg-orange-600 text-white px-2 py-1 rounded hover:opacity-90 transition-colors border-none cursor-pointer"
                      >
                        Add Caption
                      </button>
                      <button 
                        onMouseDown={(e) => { e.preventDefault(); selectedImage.remove(); setSelectedImage(null); handleEditorInput(); }}
                        className="bg-red-500 text-white px-2 py-1 rounded hover:opacity-90 transition-colors border-none cursor-pointer"
                      >
                        Remove Image
                      </button>
                      <button 
                        onMouseDown={(e) => { e.preventDefault(); setSelectedImage(null); }}
                        className="text-gray-400 hover:text-gray-650 px-1 border-none bg-transparent cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}

                {isPreviewMode ? (
                  <div 
                    className="p-6 overflow-y-auto flex-1 bg-white text-gray-800 prose prose-orange max-w-none min-h-[400px] border-none outline-none font-sans"
                    dangerouslySetInnerHTML={{ __html: form.content || `<p style="color: #94a3b8; font-style: italic;">Nothing written yet...</p>` }}
                  />
                ) : (
                  <div 
                    ref={editorRef}
                    contentEditable
                    onInput={handleEditorInput}
                    onMouseUp={saveSelection}
                    onKeyUp={saveSelection}
                    onBlur={saveSelection}
                    className="p-6 overflow-y-auto flex-1 bg-white outline-none prose prose-orange max-w-none min-h-[400px] text-gray-800 font-sans"
                    style={{ minHeight: "450px" }}
                    data-placeholder="Start typing your rich-text blog content here..."
                  />
                )}

                <div className="bg-gray-50 px-4 py-2 border-t border-gray-150 flex items-center justify-between text-xs text-gray-500 font-mono">
                  <span>Auto-calculated Read Time: <strong>{form.readTime}</strong></span>
                  <span>Character count: {form.content.length}</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Search Engine Optimization (SEO)</h3>
                  <p className="text-xs text-gray-400">Configure how search engines represent this publication</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Meta Title">
                    <input 
                      value={form.metaTitle} 
                      onChange={(e) => setForm(f => ({ ...f, metaTitle: e.target.value }))} 
                      placeholder="Highly optimized search title" 
                      className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl outline-none"
                    />
                  </FormField>
                  <FormField label="Keywords (comma-separated)">
                    <input 
                      value={form.keywords} 
                      onChange={(e) => setForm(f => ({ ...f, keywords: e.target.value }))} 
                      placeholder="e.g. Technology, AI, Startups, Jalgaon" 
                      className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl outline-none"
                    />
                  </FormField>
                </div>
                <FormField label="Meta Description">
                  <textarea 
                    value={form.metaDescription} 
                    onChange={(e) => setForm(f => ({ ...f, metaDescription: e.target.value }))} 
                    placeholder="Short meta description to display in search indexes (max 160 characters)"
                    rows={3}
                    className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl outline-none resize-none font-sans"
                  />
                </FormField>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block">Featured Image *</label>
                <ImageUpload 
                  uploadType="blog_cover" 
                  value={form.thumbnailUrl} 
                  onChange={(url) => setForm(f => ({ ...f, thumbnailUrl: url }))} 
                />
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider">Publish Settings</h3>
                
                <FormField label="Category">
                  <select 
                    value={form.category} 
                    onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full text-sm px-3 py-2 border border-gray-200 rounded-xl outline-none bg-white cursor-pointer"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </FormField>

                <FormField label="Publish Date">
                  <input 
                    type="date"
                    value={form.date} 
                    onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))} 
                    className="w-full text-sm px-3 py-2 border border-gray-200 rounded-xl outline-none"
                  />
                </FormField>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Tags</label>
                  <div className="flex gap-2 mb-2">
                    <input 
                      value={tagsInput} 
                      onChange={(e) => setTagsInput(e.target.value)} 
                      placeholder="Add tag (e.g. AI)" 
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddTag(); } }}
                      className="w-full text-xs px-3 py-1.5 border border-gray-200 rounded-xl outline-none"
                    />
                    <button 
                      onClick={handleAddTag}
                      className="px-4 bg-[#FF5A14] hover:bg-[#e0480a] text-white text-xs font-semibold rounded-xl cursor-pointer border-none transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {form.tags.map(tag => (
                      <span 
                        key={tag} 
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-50 border border-orange-100 text-[#FF6B00] text-[11px] font-semibold"
                      >
                        #{tag}
                        <button 
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-red-650 text-[10px] ml-0.5 border-none bg-transparent cursor-pointer"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                    {form.tags.length === 0 && <span className="text-xs text-gray-400 italic">No tags selected.</span>}
                  </div>
                </div>

                <FormField label="Excerpt Summary *">
                  <textarea 
                    value={form.excerpt} 
                    onChange={(e) => setForm(f => ({ ...f, excerpt: e.target.value }))} 
                    placeholder="Short 2-sentence summary for card layouts..."
                    rows={4}
                    className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl outline-none resize-none font-sans"
                  />
                </FormField>
              </div>
            </div>
          </div>
        </div>
      )}

      <Modal isOpen={deleteModal.open} onClose={() => setDeleteModal({ open: false, item: null })} title="Delete CMS Post" size="sm">
        <p style={{ fontSize: "14px", color: "#555", marginBottom: "20px" }}>
          Delete the post <strong>"{deleteModal.item?.title}"</strong>? This will permanently remove it from the system and the website.
        </p>
        <div className="flex justify-end gap-3">
          <GhostBtn onClick={() => setDeleteModal({ open: false, item: null })}>Cancel</GhostBtn>
          <DangerBtn onClick={handleDeleteConfirm}>Delete CMS Post</DangerBtn>
        </div>
      </Modal>
    </div>
  );
}
