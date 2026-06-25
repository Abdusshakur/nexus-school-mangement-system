import React from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  Edit3,
  Trash2,
  ChevronRight,
} from "lucide-react";
import { allStudents } from "./data";

export function StudentDetail() {
  const { id } = useParams();
  const student = allStudents.find((s) => s.id === id);

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400">
        <p className="mb-4">Student not found.</p>
        <Link
          to="/students"
          className="text-indigo-500 font-medium hover:underline"
        >
          Back to Students
        </Link>
      </div>
    );
  }

  const attendanceDays = [
    { date: "Jun 13", status: "Present" },
    { date: "Jun 12", status: "Present" },
    { date: "Jun 11", status: "Absent" },
    { date: "Jun 10", status: "Present" },
    { date: "Jun 9", status: "Present" },
    { date: "Jun 6", status: "Late" },
  ];

  return (
    <div className="max-w-4xl space-y-5">
      <div className="flex items-center gap-3">
        <Link
          to="/students"
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-slate-900 text-2xl font-bold">{student.name}</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {student.id} · {student.grade}
          </p>
        </div>
        <div className="ml-auto flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-500 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors cursor-pointer">
            <Edit3 size={15} /> Edit
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-rose-100 text-rose-500 rounded-lg text-sm font-medium hover:bg-rose-50 transition-colors cursor-pointer">
            <Trash2 size={15} /> Remove
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Profile Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 text-center">
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-3 text-white font-bold text-2xl ${student.avatarBg}`}
          >
            <span>{student.avatar}</span>
          </div>
          <p className="font-semibold text-slate-900 text-lg">{student.name}</p>
          <p className="text-slate-500 text-sm">
            {student.grade} · {student.gender}
          </p>
          <div className="mt-3">
            <span
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                student.status === "Active"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-rose-100 text-rose-800"
              }`}
            >
              {student.status === "Active" ? (
                <CheckCircle size={12} />
              ) : (
                <XCircle size={12} />
              )}
              {student.status}
            </span>
          </div>
          <div className="mt-5 space-y-2.5 text-left">
            {[
              { icon: Phone, label: student.phone },
              { icon: Mail, label: student.email },
              { icon: MapPin, label: student.address },
              { icon: Calendar, label: `Joined ${student.joined}` },
            ].map(({ icon: Icon, label }, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <Icon size={15} className="text-slate-400 mt-0.5 shrink-0" />
                <p className="text-sm text-slate-500 leading-snug">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Details */}
        <div className="lg:col-span-2 space-y-5">
          {/* Parent */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-900 mb-3">
              Parent / Guardian
            </h3>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {student.parentName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {student.parentName}
                </p>
                <p className="text-xs text-slate-500">{student.parentPhone}</p>
              </div>
              <Link
                to="#"
                className="ml-auto text-sm text-indigo-500 hover:text-indigo-600 font-medium flex items-center gap-1"
              >
                View profile <ChevronRight size={14} />
              </Link>
            </div>
          </div>

          {/* Attendance Summary */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-900">
                Recent Attendance
              </h3>
              <Link
                to="#"
                // Todo: Link to full attendance report
                className="text-sm text-indigo-500 hover:text-indigo-600 font-medium"
              >
                Full report
              </Link>
            </div>
            <div className="flex gap-2 flex-wrap">
              {attendanceDays.map((d) => (
                <div key={d.date} className="text-center">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center mb-1 text-[11px] font-semibold ${
                      d.status === "Present"
                        ? "bg-emerald-100 text-emerald-800"
                        : d.status === "Absent"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    <span>
                      {d.status === "Present"
                        ? "P"
                        : d.status === "Absent"
                          ? "A"
                          : "L"}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[10px]">{d.date}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3 pt-3 border-t border-slate-100">
              <div className="text-center">
                <p className="font-bold text-emerald-500 text-xl">84%</p>
                <p className="text-xs text-slate-500">Present Rate</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-rose-500 text-xl">12</p>
                <p className="text-xs text-slate-500">Days Absent</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-amber-500 text-xl">4</p>
                <p className="text-xs text-slate-500">Days Late</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function StudentDetailPage() {
  return <StudentDetail />;
}
