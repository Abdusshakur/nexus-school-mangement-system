import { useEffect } from "react";
import { ROUTES } from "../../../config/routes";
import { Link, useParams } from "react-router-dom";
import { Phone, Mail, MapPin, ArrowLeft, ChevronRight } from "lucide-react";
import { useParentStore } from "../../../store/parent.store";
import {
  formatParentName,
  formatParentInitials,
  formatPhoneNumber,
} from "../../../utils/formatters";

export function ParentDetail() {
  const { id } = useParams();
  const { parents: dbParents, loading, fetchParents } = useParentStore();

  useEffect(() => {
    fetchParents().catch(() => {});
  }, [id, fetchParents]);

  const found = dbParents.find((p) => p.id === id);

  const parentName = found
    ? formatParentName(found.first_name, found.last_name, found.email)
    : "";
  const initials = found ? formatParentInitials(parentName) : "PG";

  const childrenList = found
    ? found.children && found.children.length > 0
      ? found.children
      : found.students || []
    : [];

  const isInvalidPhone =
    found &&
    (!found.phone_number ||
      found.phone_number.toLowerCase().startsWith("string") ||
      found.phone_number.toLowerCase() === "null");
  const phoneDisplay = found
    ? isInvalidPhone
      ? "No phone registered"
      : found.phone_number
    : "";

  const parent = found
    ? {
        id: found.id,
        name: parentName,
        occupation: "Parent / Guardian",
        email: found.email,
        phone: phoneDisplay,
        address: "Address not provided",
        avatarColor: "bg-purple-500",
        avatar: initials,
        children: childrenList.map((c) => {
          const childName = formatParentName(c.first_name, c.last_name, "");
          return {
            id: c.id,
            admission_number: c.admission_number,
            name:
              childName === "Parent / Guardian" ? "Student Profile" : childName,
            class_name: c.class_name,
          };
        }),
      }
    : null;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-24 text-slate-400">
        <p className="text-sm font-medium animate-pulse">
          Loading parent record...
        </p>
      </div>
    );
  }

  if (!parent) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-24 text-slate-400">
        <p className="mb-4 font-semibold text-base">Parent not found.</p>
        <Link
          to={ROUTES.ADMIN.PARENTS}
          className="text-indigo-600 font-bold hover:underline"
        >
          Back to list
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 ">
      <header className=" px-8 py-2.5 z-10 flex items-center gap-4">
        <Link
          to={ROUTES.ADMIN.PARENTS}
          className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-slate-900 text-2xl font-extrabold tracking-tight">
            {parent.name}
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">{parent.occupation}</p>
        </div>
      </header>

      <main className="flex-1 p-8 max-w-5xl w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className=" rounded-2xl bg-white border border-slate-200 p-6 text-center shadow-sm h-fit">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md"
            style={{ background: parent.avatarColor }}
          >
            <span className="text-white font-bold text-2xl">
              {parent.avatar}
            </span>
          </div>
          <p className="font-extrabold text-slate-900 text-lg">{parent.name}</p>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-1">
            {parent.occupation}
          </p>
          <div className="mt-6 space-y-3.5 text-left pt-6 border-t border-slate-100">
            {[
              { icon: Phone, label: formatPhoneNumber(parent.phone) },
              { icon: Mail, label: parent.email },
              { icon: MapPin, label: parent.address },
            ].map(({ icon: Icon, label }, i) => (
              <div key={i} className="flex items-start gap-3">
                <Icon size={16} className="text-slate-400 mt-0.5 shrink-0" />
                <p className="text-sm font-semibold text-slate-600 leading-tight break-all">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 text-lg mb-4">Children</h3>
            <div className="space-y-3">
              {parent.children.map((child, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-xl border border-slate-100"
                >
                  <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-xs">
                    {child.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      {child.name}
                    </p>
                    <p className="text-xs font-semibold text-slate-400 mt-0.5">
                      {child.class_name} · Active Student
                    </p>
                  </div>
                  <Link
                    to={ROUTES.ADMIN.STUDENT_DETAIL(
                      child.admission_number || child.id,
                    )}
                    className="ml-auto text-sm text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-0.5"
                  >
                    Profile <ChevronRight size={14} />
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-extrabold text-slate-900 text-lg mb-4">
              Communication Audit Logs
            </h3>
            <div className="space-y-4">
              {[
                {
                  date: "Jun 10, 2026",
                  type: "Email",
                  note: "Parent-teacher conference reminder sent successfully",
                },
                {
                  date: "May 28, 2026",
                  type: "Phone",
                  note: "Discussed general academic performance and attendance",
                },
                {
                  date: "May 15, 2026",
                  type: "Meeting",
                  note: "Attended school council quarterly development review",
                },
              ].map((c, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 py-4 first:pt-0 last:pb-0 border-b border-slate-100 last:border-0"
                >
                  <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold shrink-0">
                    {c.type}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">
                      {c.note}
                    </p>
                    <p className="text-xs font-bold text-slate-400 mt-1">
                      {c.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
