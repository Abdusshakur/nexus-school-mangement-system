import { STATUS_STYLES, type AttStatus } from "../utils";

interface AttendanceTableProps {
  childName: string;
  records: Array<{ date: string; status: AttStatus; checkIn: string }>;
}

export function AttendanceTable({ childName, records }: AttendanceTableProps) {
  return (
    <div className="bg-white rounded-xl overflow-hidden border border-slate-200">
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="font-semibold text-slate-900">
          Recent Attendance — {childName}
        </h3>
        <p className="text-xs mt-0.5 text-slate-500">Last 10 school days</p>
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              {["Date", "Status", "Check-in Time"].map((h) => (
                <th
                  key={h}
                  className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.map((r, i) => {
              const s = STATUS_STYLES[r.status];
              return (
                <tr
                  key={i}
                  className={`border-b ${
                    i < records.length - 1 ? "border-slate-50" : "border-transparent"
                  }`}
                >
                  <td className="px-5 py-3.5 text-sm text-slate-700">
                    {r.date}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${s.dot}`} />
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}
                      >
                        {r.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-500">
                    {r.checkIn}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile list */}
      <div className="sm:hidden divide-y divide-slate-50">
        {records.map((r, i) => {
          const s = STATUS_STYLES[r.status];
          return (
            <div
              key={i}
              className="flex items-center justify-between px-5 py-3.5"
            >
              <div>
                <p className="text-sm font-medium text-slate-700">
                  {r.date}
                </p>
                <p className="text-xs mt-0.5 text-slate-400">
                  {r.checkIn}
                </p>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}
              >
                {r.status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
