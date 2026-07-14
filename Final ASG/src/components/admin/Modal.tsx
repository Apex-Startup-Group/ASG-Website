import { X } from "lucide-react";
import { ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
}: ModalProps) {
  if (!isOpen) return null;

  const widths = { sm: "440px", md: "560px", lg: "720px" };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(2px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full flex flex-col"
        style={{ maxWidth: widths[size], maxHeight: "90vh" }}
      >
        <div
          className="flex items-center justify-between px-6 py-5 flex-shrink-0"
          style={{ borderBottom: "1px solid #f0f0f0" }}
        >
          <h3
            style={{
              fontFamily: "'Satoshi', sans-serif",
              fontWeight: 700,
              fontSize: "17px",
              color: "#0d0d0d",
            }}
          >
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#aaa",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "#f4f4f5")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "none")
            }
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

/* Reusable form field */
export function FormField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="mb-4">
      <label
        style={{
          display: "block",
          fontSize: "13px",
          fontWeight: 500,
          color: "#3a3a3a",
          marginBottom: "6px",
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

const inputBase: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: "10px",
  border: "1.5px solid #ebebeb",
  background: "#f8f8f8",
  fontSize: "14px",
  color: "#0d0d0d",
  outline: "none",
  fontFamily: "'Inter', sans-serif",
  boxSizing: "border-box",
};

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={inputBase}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = "#FF6B00";
        e.currentTarget.style.background = "#fff";
        e.currentTarget.style.boxShadow = "0 0 0 3px rgba(255,107,0,0.1)";
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = "#ebebeb";
        e.currentTarget.style.background = "#f8f8f8";
        e.currentTarget.style.boxShadow = "none";
        props.onBlur?.(e);
      }}
    />
  );
}

export function Textarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>
) {
  return (
    <textarea
      {...props}
      style={{ ...inputBase, resize: "vertical", minHeight: "90px" }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = "#FF6B00";
        e.currentTarget.style.background = "#fff";
        e.currentTarget.style.boxShadow = "0 0 0 3px rgba(255,107,0,0.1)";
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = "#ebebeb";
        e.currentTarget.style.background = "#f8f8f8";
        e.currentTarget.style.boxShadow = "none";
      }}
    />
  );
}

export function Select(
  props: React.SelectHTMLAttributes<HTMLSelectElement>
) {
  return (
    <select
      {...props}
      style={{
        ...inputBase,
        cursor: "pointer",
        appearance: "auto",
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = "#FF6B00";
        e.currentTarget.style.background = "#fff";
        e.currentTarget.style.boxShadow = "0 0 0 3px rgba(255,107,0,0.1)";
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = "#ebebeb";
        e.currentTarget.style.background = "#f8f8f8";
        e.currentTarget.style.boxShadow = "none";
      }}
    />
  );
}

/* Primary action button */
export function PrimaryBtn({
  children,
  onClick,
  type = "button",
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        background: "#FF6B00",
        color: "#fff",
        border: "none",
        borderRadius: "10px",
        padding: "10px 20px",
        fontSize: "14px",
        fontWeight: 600,
        fontFamily: "'Satoshi', sans-serif",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {children}
    </button>
  );
}

export function DangerBtn({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "#ef4444",
        color: "#fff",
        border: "none",
        borderRadius: "10px",
        padding: "10px 20px",
        fontSize: "14px",
        fontWeight: 600,
        fontFamily: "'Satoshi', sans-serif",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

export function GhostBtn({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "#f4f4f5",
        color: "#555",
        border: "none",
        borderRadius: "10px",
        padding: "10px 20px",
        fontSize: "14px",
        fontWeight: 500,
        fontFamily: "'Inter', sans-serif",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}
