import { useState } from "react";

interface ToggleProps {
  defaultOn?: boolean;
  onChange?: (state: boolean) => void;
  activeColor?: string; // Tailwind class like "bg-indigo-600"
}

export function Toggle({ defaultOn = false, onChange, activeColor = "bg-indigo-600" }: ToggleProps) {
  const [on, setOn] = useState(defaultOn);

  const handleToggle = () => {
    const newState = !on;
    setOn(newState);
    if (onChange) {
      onChange(newState);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`relative w-10 h-6 rounded-full transition-colors flex-shrink-0 ${
        on ? activeColor : "bg-slate-300"
      }`}
    >
      <span
        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${
          on ? "left-[calc(100%-20px)]" : "left-1"
        }`}
      />
    </button>
  );
}
