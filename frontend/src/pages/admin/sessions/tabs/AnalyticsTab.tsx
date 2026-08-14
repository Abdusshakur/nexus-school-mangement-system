import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const ATTENDANCE_DATA = [
  { month: "Jan", rate: 89 },
  { month: "Feb", rate: 91 },
  { month: "Mar", rate: 90 },
  { month: "Apr", rate: 87 },
  { month: "May", rate: 94 },
  { month: "Jun", rate: 91 },
  { month: "Jul", rate: 92 },
];

export function AnalyticsTab() {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
        <h3 className="font-semibold mb-4 text-slate-900">
          Monthly Attendance Rate (%)
        </h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={ATTENDANCE_DATA}
            margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis
              dataKey="month"
              tick={{ fill: "#94A3B8", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[80, 100]}
              tick={{ fill: "#94A3B8", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "#fff",
                border: "1px solid #E2E8F0",
                borderRadius: 8,
                fontSize: 12,
              }}
              cursor={{ fill: "#F8FAFC" }}
            />
            <Bar
              dataKey="rate"
              fill="#6366F1"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Avg Attendance",
            value: "91%",
            sub: "Across all classes",
          },
          { label: "Best Month", value: "May", sub: "94% attendance" },
          { label: "Lowest Month", value: "Apr", sub: "87% attendance" },
        ].map(({ label, value, sub }) => (
          <div
            key={label}
            className="bg-white rounded-xl p-4 text-center border border-slate-200 shadow-sm"
          >
            <p className="font-bold text-[22px] text-indigo-500">{value}</p>
            <p className="text-sm font-semibold mt-0.5 text-slate-900">
              {label}
            </p>
            <p className="text-xs mt-0.5 text-slate-400">{sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
