import {
  GraduationCap,
  Users,
  UserCheck,
  ClipboardCheck,
  Megaphone,
  BarChart3,
} from "lucide-react";

export default function Features() {
  const featuresList = [
    {
      id: "feat-student-mgt",
      icon: <GraduationCap className="w-6 h-6 text-indigo-600" />,
      title: "Student Management",
      description:
        "Complete student profiles with class history, guardian info, documents, and academic performance all in one place.",
      iconBg: "bg-indigo-50",
      borderColor: "hover:border-indigo-200/60",
    },
    {
      id: "feat-parent-mgt",
      icon: <Users className="w-6 h-6 text-purple-600" />,
      title: "Parent Management",
      description:
        "Give parents a dedicated portal to track attendance, receive announcements, and communicate with teachers directly.",
      iconBg: "bg-purple-50",
      borderColor: "hover:border-purple-200/60",
    },
    {
      id: "feat-teacher-mgt",
      icon: <UserCheck className="w-6 h-6 text-sky-600" />,
      title: "Teacher Management",
      description:
        "Manage teacher profiles, subject assignments, schedules, and leave requests from a single admin interface.",
      iconBg: "bg-sky-50",
      borderColor: "hover:border-sky-200/60",
    },
    {
      id: "feat-attendance-tracking",
      icon: <ClipboardCheck className="w-6 h-6 text-emerald-600" />,
      title: "Attendance Tracking",
      description:
        "Mark and monitor daily attendance by class or student. Generate instant reports and automate parent notifications.",
      iconBg: "bg-emerald-50",
      borderColor: "hover:border-emerald-200/60",
    },
    {
      id: "feat-announcements",
      icon: <Megaphone className="w-6 h-6 text-orange-600" />,
      title: "Announcements",
      description:
        "Send targeted announcements to all parents, specific classes, or individual families with delivery confirmation.",
      iconBg: "bg-orange-50",
      borderColor: "hover:border-orange-200/60",
    },
    {
      id: "feat-schooldashboard",
      icon: <BarChart3 className="w-6 h-6 text-rose-600" />,
      title: "School Dashboard",
      description:
        "Get a real-time overview of your school's health enrollment, attendance rates, outstanding fees, and staff metrics.",
      iconBg: "bg-rose-50",
      borderColor: "hover:border-rose-200/60",
    },
  ];

  return (
    <section
      id="features"
      className="py-11 md:py-12 bg-slate-50/50 border-t border-b border-slate-100 "
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span
            id="features-subtitle"
            className="inline-block text-xs sm:text-sm font-bold uppercase text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-full mb-4"
          >
            Features
          </span>
          <h2
            id="features-title"
            className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight"
          >
            Everything your school needs, <br /> finally in one place
          </h2>
          <p
            id="features-desc"
            className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed"
          >
            Built specifically for schools. No complexity just the tools you
            actually use, every day.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuresList.map((feat) => (
            <div
              key={feat.id}
              id={feat.id}
              className={`group bg-white rounded-2xl border border-slate-200 p-6 text-left shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 ${feat.borderColor || "hover:border-slate-300"} transition-all duration-300 flex flex-col justify-between`}
            >
              <div className="space-y-4">
                {/* Icon box */}
                <div className={`p-3 rounded-xl ${feat.iconBg} w-fit`}>
                  {feat.icon}
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-lg tracking-tight group-hover:text-indigo-500 transition-colors">
                    {feat.title}
                  </h3>
                  <p className="mt-2.5 text-sm sm:text-base text-slate-500 leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
