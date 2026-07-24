import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  CalendarCheck,
  ClipboardList,
  Star,
} from "lucide-react";
import { CLASSES_DATA } from "./data";

export default function ClassDetail() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("students");

  const classData = CLASSES_DATA.find((c) => c.id === id) || CLASSES_DATA[0];

  const tabs = [
    { id: "students", label: "Students", icon: Users },
    { id: "attendance", label: "Attendance", icon: CalendarCheck },
    { id: "assignments", label: "Assignments", icon: ClipboardList },
    { id: "grades", label: "Grades", icon: Star },
  ];

  return (
    <div className="max-w-7xl space-y-6">
      {/* Header */}
      <div>
        <Link
          to="/teacher/classes"
          className="text-indigo-600 text-sm font-bold flex items-center gap-1.5 hover:underline mb-3"
        >
          <ArrowLeft size={16} /> Back to Classes
        </Link>
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {classData.name}
              </h1>
              <span
                className={`px-2.5 py-1 rounded-md text-[10px] font-bold text-white uppercase tracking-wider ${classData.color}`}
              >
                {classData.code}
              </span>
            </div>
            <p className="text-slate-500 text-sm">
              {classData.schedule} · {classData.room}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col ">
        <div className="flex border-b border-slate-200 px-2 pt-2 bg-slate-50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 font-bold text-sm border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-indigo-500 text-indigo-700 bg-white rounded-t-xl"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-t-xl"
              }`}
            >
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="p-6 flex-1 bg-white">
          {activeTab === "students" && (
            <div>
              <h3 className="font-bold text-lg mb-4 text-slate-800">
                Enrolled Students ({classData.count})
              </h3>
              <p className="text-slate-500 text-sm">Is Coming...</p>
            </div>
          )}

          {activeTab === "attendance" && (
            <div>
              <h3 className="font-bold text-lg mb-4 text-slate-800">
                Mark Attendance
              </h3>
              <p className="text-slate-500 text-sm">Is Coming...</p>
            </div>
          )}

          {activeTab === "assignments" && (
            <div>
              <h3 className="font-bold text-lg mb-4 text-slate-800">
                Class Assignments
              </h3>
              <p className="text-slate-500 text-sm">Is Coming...</p>
            </div>
          )}

          {activeTab === "grades" && (
            <div>
              <h3 className="font-bold text-lg mb-4 text-slate-800">
                Gradebook
              </h3>
              <p className="text-slate-500 text-sm">
                Editable spreadsheet coming soon...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
