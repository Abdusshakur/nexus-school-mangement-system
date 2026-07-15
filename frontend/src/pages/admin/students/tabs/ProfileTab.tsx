import { Phone, Mail, MapPin, Calendar, CheckCircle, XCircle, Award } from "lucide-react";
import { STUDENT_DB } from "../data";

// ─── Tab: Profile ─────────────────────────────────────────────────────────────

export function ProfileTab({ s }: { s: (typeof STUDENT_DB)[string] }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Left: avatar + quick stats */}
      <div className="bg-white rounded-xl p-6 text-center border border-slate-200">
        <div
          className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-3 ${s.avatarColor}`}
        >
          <span className="text-white font-bold text-2xl">{s.initials}</span>
        </div>
        <p className="font-bold text-slate-900 text-lg">{s.name}</p>
        <p className="text-sm mt-0.5 text-slate-500">
          {s.grade} · {s.gender}
        </p>
        <span
          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium mt-2 ${
            s.status === "Active"
              ? "bg-indigo-100 text-indigo-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {s.status === "Active" ? (
            <CheckCircle size={12} />
          ) : (
            <XCircle size={12} />
          )}{" "}
          {s.status}
        </span>
        <div className="mt-4 space-y-2 text-left">
          {[
            { icon: Phone, label: s.phone },
            { icon: Mail, label: s.email },
            { icon: MapPin, label: s.address },
            { icon: Calendar, label: `DOB: ${s.dob}` },
            { icon: Award, label: `Blood Group: ${s.bloodGroup}` },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-start gap-2.5">
              <Icon size={14} className="text-slate-400 mt-0.5" />
              <p className="text-sm leading-snug text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right: details */}
      <div className="lg:col-span-2 space-y-5">
        {/* Academic info */}
        <div className="bg-white rounded-xl p-5 border border-slate-200">
          <h3 className="font-semibold mb-4 text-slate-900 text-[15px]">
            Academic Information
          </h3>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3">
            {[
              ["Student ID", s.id],
              ["Class / Grade", s.grade],
              ["Nationality", s.nationality],
              ["Year Enrolled", s.joined],
            ].map(([k, v]) => (
              <div key={k}>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  {k}
                </p>
                <p className="text-sm font-medium mt-0.5 text-slate-700">{v}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Parent / Guardian */}
        <div className="bg-white rounded-xl p-5 border border-slate-200">
          <h3 className="font-semibold mb-4 text-slate-900 text-[15px]">
            Parent / Guardian
          </h3>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
            <div
              className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${s.avatarColor}`}
            >
              <span className="text-white font-semibold text-sm">
                {s.parentName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-900">
                {s.parentName}
              </p>
              <p className="text-xs text-slate-500">{s.parentPhone}</p>
              <p className="text-xs text-slate-500">{s.parentEmail}</p>
            </div>
          </div>
        </div>

        {/* Emergency */}
        <div className="bg-white rounded-xl p-5 border border-slate-200">
          <h3 className="font-semibold mb-3 text-slate-900 text-[15px]">
            Emergency Contact
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide font-medium mb-1 text-slate-400">
                Name
              </p>
              <p className="text-sm text-slate-700">{s.parentName}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide font-medium mb-1 text-slate-400">
                Relation
              </p>
              <p className="text-sm text-slate-700">Parent</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide font-medium mb-1 text-slate-400">
                Phone
              </p>
              <p className="text-sm text-slate-700">{s.parentPhone}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide font-medium mb-1 text-slate-400">
                Alt. Phone
              </p>
              <p className="text-sm text-slate-700">+1 555 9999</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
