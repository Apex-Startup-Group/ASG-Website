import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/admin/AuthContext";
import logoImg from "@/assets/admin/logo.png";
import {
  LayoutDashboard,
  CalendarDays,
  GraduationCap,
  Images,
  FileText,
  Users,
  Mail,
  Settings,
  UserCircle,
  LogOut,
  X,
  Handshake,
  Award,
  Milestone,
} from "lucide-react";

const NAV = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Events", icon: CalendarDays, path: "/dashboard/events" },
  { label: "AAL", icon: GraduationCap, path: "/dashboard/aal" },
  { label: "Gallery", icon: Images, path: "/dashboard/gallery" },
  { label: "Blogs", icon: FileText, path: "/dashboard/blogs" },
  { label: "Community Members", icon: Users, path: "/dashboard/community" },
  { label: "Industry Partners", icon: Handshake, path: "/dashboard/partners" },
  { label: "Industry Experts", icon: Award, path: "/dashboard/experts" },
  { label: "ASG Initiatives", icon: Milestone, path: "/dashboard/initiatives" },
  { label: "Contact Queries", icon: Mail, path: "/dashboard/queries" },
];

const BOTTOM_NAV = [
  { label: "Settings", icon: Settings, path: "/dashboard/settings" },
  { label: "Profile", icon: UserCircle, path: "/dashboard/profile" },
];

export default function Sidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuth();

  const isActive = (path: string) =>
    path === "/dashboard"
      ? pathname === "/dashboard"
      : pathname?.startsWith(path) || false;

  const go = (path: string) => {
    router.push(path);
    onClose();
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={onClose}
        />
      )}

      <aside
        className="fixed top-0 left-0 h-full z-50 flex flex-col lg:static lg:z-auto lg:translate-x-0 transition-transform duration-300"
        style={{
          width: "240px",
          background: "#0d0d0d",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          transform: isOpen ? "translateX(0)" : undefined,
          flexShrink: 0,
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center justify-between px-5 py-5 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="flex flex-col gap-1.5">
            <img
              src={logoImg.src}
              alt="APEX Startup Group"
              style={{
                height: "60px",
                width: "auto",
              }}
            />
            <div
              style={{
                fontSize: "15px",
                color: "rgba(255,255,255,0.3)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                paddingLeft: "2px",
              }}
            >
              Admin Panel
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden"
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.4)",
              cursor: "pointer",
              padding: "4px",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto no-scrollbar">
          <SectionLabel>MAIN MENU</SectionLabel>
          {NAV.map(({ label, icon: Icon, path }) => {
            const active = isActive(path);
            return (
              <NavBtn
                key={path}
                active={active}
                icon={<Icon size={16} />}
                label={label}
                onClick={() => go(path)}
              />
            );
          })}

          <SectionLabel className="mt-4">ACCOUNT</SectionLabel>
          {BOTTOM_NAV.map(({ label, icon: Icon, path }) => {
            const active = isActive(path);
            return (
              <NavBtn
                key={path}
                active={active}
                icon={<Icon size={16} />}
                label={label}
                onClick={() => go(path)}
              />
            );
          })}
        </nav>

        {/* Logout */}
        <div
          className="px-3 pb-5 pt-4 flex-shrink-0"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <button
            onClick={() => {
              logout();
              router.push("/");
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150"
            style={{
              background: "transparent",
              color: "rgba(255,255,255,0.4)",
              border: "none",
              cursor: "pointer",
              fontFamily: "'Inter', sans-serif",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.background = "rgba(239,68,68,0.12)";
              el.style.color = "#ef4444";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.background = "transparent";
              el.style.color = "rgba(255,255,255,0.4)";
            }}
          >
            <LogOut size={16} />
            <span style={{ fontSize: "14px", fontWeight: 400 }}>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

function SectionLabel({
  children,
  className = "",
}: {
  children: string;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        fontSize: "10px",
        fontWeight: 600,
        color: "rgba(255,255,255,0.25)",
        letterSpacing: "0.08em",
        marginBottom: "6px",
        paddingLeft: "10px",
      }}
    >
      {children}
    </div>
  );
}

function NavBtn({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 text-left transition-all duration-150"
      style={{
        background: active ? "rgba(255,107,0,0.14)" : "transparent",
        color: active ? "#FF6B00" : "rgba(255,255,255,0.58)",
        border: active
          ? "1px solid rgba(255,107,0,0.22)"
          : "1px solid transparent",
        cursor: "pointer",
        fontFamily: "'Inter', sans-serif",
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.background = "rgba(255,255,255,0.05)";
          e.currentTarget.style.color = "rgba(255,255,255,0.85)";
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "rgba(255,255,255,0.58)";
        }
      }}
    >
      {icon}
      <span style={{ fontSize: "13.5px", fontWeight: active ? 600 : 400, flex: 1 }}>
        {label}
      </span>
      {active && (
        <div
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ background: "#FF6B00" }}
        />
      )}
    </button>
  );
}
