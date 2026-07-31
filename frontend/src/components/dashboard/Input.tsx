import React from "react";

interface InputProps {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  className?: string;
  placeholder?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
}

export function Input({
  label,
  error,
  icon,
  className = "",
  placeholder,
  value,
  onChange,
  type = "text",
  required = false,
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-slate-700 text-sm font-semibold mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        )}
        <input
          type={type}
          required={required}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          {...(type === "email"
            ? {
                pattern: "[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}",
                title: "Please enter a valid email address with a domain (e.g., user@example.com)",
              }
            : {})}
          className={`w-full border rounded-xl px-4 py-3 text-slate-800 text-sm placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50 focus:bg-white ${
            icon ? "pl-11" : ""
          } ${
            error
              ? "border-red-300 focus:ring-red-500/20 focus:border-red-500"
              : "border-slate-200"
          } ${className}`}
        />
      </div>
      {error && <p className="text-red-500 text-xs mt-1.5 font-medium">{error}</p>}
    </div>
  );
}
