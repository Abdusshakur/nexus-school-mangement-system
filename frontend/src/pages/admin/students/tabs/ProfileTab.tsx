import {
  Phone,
  Mail,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { type Student } from "../data";
import { formatPhoneNumber } from "../../../../utils/formatters";

export function ProfileTab({ s }: { s: Student }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Left: avatar + quick stats */}
      <div className="bg-white rounded-xl p-6 text-center border border-slate-200">
        <div
          className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-3 ${
            s.avatarColor || s.avatarBg || "bg-indigo-500"
          }`}
        >
          <span className="text-white font-bold text-2xl">
            {s.initials || s.avatar}
          </span>
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
            { icon: Phone, label: formatPhoneNumber(s.phone) },
            { icon: Mail, label: s.email },
            { icon: MapPin, label: s.address },
            { icon: Calendar, label: `DOB: ${s.dob}` },
          ].map(({ icon: Icon, label }, idx) => (
            <div key={idx} className="flex items-start gap-2.5">
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
              // ["Nationality", s.nationality],   "Part of backlog"
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
            Parents & Guardians
          </h3>
          {s.parentsList && s.parentsList.length > 0 ? (
            <div className="space-y-3">
              {s.parentsList.map((p, idx) => {
                const parentInitials =
                  `${p.first_name[0] || ""}${p.last_name[0] || ""}`.toUpperCase();
                return (
                  <div
                    key={p.id || idx}
                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100"
                  >
                    <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 bg-purple-500 text-white font-semibold text-sm">
                      {parentInitials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {p.first_name} {p.last_name}
                        </p>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700">
                          {p.relationship_type || `Parent ${idx + 1}`}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {formatPhoneNumber(p.phone_number)}
                      </p>
                      <p className="text-xs text-slate-500">{p.email}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${s.avatarColor || "bg-indigo-500"}`}
              >
                <span className="text-white font-semibold text-sm">
                  {(s.parentName || "PG")
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">
                  {s.parentName}
                </p>
                <p className="text-xs text-slate-500">
                  {formatPhoneNumber(s.parentPhone)}
                </p>
                <p className="text-xs text-slate-500">{s.parentEmail}</p>
              </div>
            </div>
          )}
        </div>

        {/* Guardian Information */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 mt-5">
          <h3 className="font-semibold mb-3 text-slate-900 text-[15px]">
            Guardian Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Guardian 1 */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-3 border-b border-slate-100 pb-2">
                Guardian 1
              </h4>
              {s.parentsList && s.parentsList.length > 0 ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-wide font-semibold mb-0.5 text-slate-400">
                      Name
                    </p>
                    <p className="text-sm font-medium text-slate-700">
                      {s.parentsList[0].first_name} {s.parentsList[0].last_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide font-semibold mb-0.5 text-slate-400">
                      Relationship
                    </p>
                    <p className="text-sm font-medium text-slate-700">
                      {s.parentsList[0].relationship_type ||
                        "Parent / Guardian"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide font-semibold mb-0.5 text-slate-400">
                      Phone
                    </p>
                    <p className="text-sm font-medium text-slate-700">
                      {formatPhoneNumber(s.parentsList[0].phone_number)}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic">
                  No Guardian 1 details found.
                </p>
              )}
            </div>

            {/* Guardian 2 */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 border-b border-slate-100 pb-2">
                Guardian 2
              </h4>
              {s.parentsList && s.parentsList.length > 1 ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-wide font-semibold mb-0.5 text-slate-400">
                      Name
                    </p>
                    <p className="text-sm font-medium text-slate-700">
                      {s.parentsList[1].first_name} {s.parentsList[1].last_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide font-semibold mb-0.5 text-slate-400">
                      Relationship
                    </p>
                    <p className="text-sm font-medium text-slate-700">
                      {s.parentsList[1].relationship_type ||
                        "Parent / Guardian"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide font-semibold mb-0.5 text-slate-400">
                      Phone
                    </p>
                    <p className="text-sm font-medium text-slate-700">
                      {formatPhoneNumber(s.parentsList[1].phone_number)}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic">
                  {" "}
                  Guardian 2 details not provided.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
