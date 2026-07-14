import React from "react";

export interface PageHeaderProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function PageHeader({
  icon,
  title,
  subtitle,
  action,
}: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#FF6B00]/10">
            {icon}
          </div>
        )}
        <div>
          <h1 className="font-bold text-xl text-gray-900 tracking-tight" style={{ fontFamily: "'Satoshi', sans-serif" }}>
            {title}
          </h1>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}
