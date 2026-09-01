import { useEffect, useState } from "react";
import { ROUTES } from "../../../config/routes";
import { Link, useParams } from "react-router-dom";
import { Phone, Mail, MapPin, ArrowLeft, ChevronRight, Pencil, Link as LinkIcon } from "lucide-react";
import { useParentStore } from "../../../store/parent.store";
import { EditParentModal } from "./EditParentModal";
import { LinkStudentModal } from "./LinkStudentModal";
import { Skeleton } from "../../../components/ui/Skeleton";
import {
  formatParentName,
  formatParentInitials,
  formatPhoneNumber,
} from "../../../utils/formatters";

export function ParentDetail() {
  const { id } = useParams();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
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

  const isInvalidPhone = found && !found.phone_number;
  const phoneDisplay = found
    ? isInvalidPhone
      ? "No phone registered"
      : found.phone_number
    : "";

  const colors = ["bg-indigo-500", "bg-emerald-500", "bg-rose-500", "bg-blue-500", "bg-purple-500", "bg-amber-500", "bg-cyan-500", "bg-pink-500"];
  const colorIndex = found ? found.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length : 0;
  const avatarColor = colors[colorIndex];

  const parent = found
    ? {
        id: found.id,
        name: parentName,
        occupation: "Parent / Guardian",
        email: found.email,
        phone: phoneDisplay,
        address: "Address not provided",
        avatarColor: avatarColor,
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
      <div className="flex-1 flex flex-col min-w-0 p-8 space-y-6">
        <Skeleton className="h-10 w-1/3 rounded-lg" />
        <div className="flex gap-6">
          <Skeleton className="w-1/3 h-64 rounded-2xl" />
          <Skeleton className="flex-1 h-64 rounded-2xl" />
        </div>
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
        <div className="flex-1">
          <h1 className="text-slate-900 text-2xl font-extrabold tracking-tight">
            {parent.name}
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">{parent.occupation}</p>
        </div>
        <button
          onClick={() => setEditModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors shadow-sm text-sm"
        >
          <Pencil size={16} />
          Edit Profile
        </button>
      </header>

      <main className="flex-1 p-8 max-w-5xl w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className=" rounded-2xl bg-white border border-slate-200 p-6 text-center shadow-sm h-fit">
          <div
            className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md ${parent.avatarColor}`}
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
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-lg">Children</h3>
              <button
                onClick={() => setLinkModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-100"
              >
                <LinkIcon size={14} />
                Link Student
              </button>
            </div>
            <div className="space-y-3">
              {parent.children.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                  <p className="text-sm font-medium text-slate-500">No children linked to this profile.</p>
                </div>
              ) : (
                parent.children.map((child, i) => (
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
                ))
              )}
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
      
      {found && (
        <EditParentModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          onSuccess={() => {
            setEditModalOpen(false);
            fetchParents(true);
          }}
          parent={found as any}
        />
      )}

      {found && (
        <LinkStudentModal
          isOpen={linkModalOpen}
          onClose={() => setLinkModalOpen(false)}
          onSuccess={() => {
            setLinkModalOpen(false);
            fetchParents(true);
          }}
          parentId={found.id}
        />
      )}
    </div>
  );
}
