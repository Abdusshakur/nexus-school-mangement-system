interface SliderProps {
  label?: string;
  min?: number;
  max?: number;
  step?: number;
  value: number;
  onChange: (val: number) => void;
  suffix?: string;
}

export function Slider({
  label,
  min = 0,
  max = 100,
  step = 1,
  value,
  onChange,
  suffix = "",
}: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        {label && (
          <label className="text-sm font-semibold text-slate-700">
            {label}
          </label>
        )}
        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
          {value}
          {suffix}
        </span>
      </div>
      <div className="relative flex items-center select-none group">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/20 accent-indigo-600"
          style={{
            background: `linear-gradient(to right, rgb(99, 102, 241) 0%, rgb(99, 102, 241) ${percentage}%, rgb(241, 245, 249) ${percentage}%, rgb(241, 245, 249) 100%)`,
          }}
        />
      </div>
      <div className="flex justify-between text-[10px] font-semibold text-slate-400 mt-1.5 uppercase tracking-wider">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
