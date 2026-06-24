import { Clock, MessageSquare, FileText, Eye, Star } from "lucide-react";

export default function Benefits() {
  const metrics = [
    {
      id: "ben-1",
      icon: <Clock className="w-5 h-5 text-indigo-600" />,
      pillText: "12 hrs/week saved",
      pillBg: "bg-indigo-50 text-indigo-700",
      title: "Save Time",
      description:
        "Automate attendance, report generation, and parent notifications. Administrators save an average of 12 hours per week.",
    },
    {
      id: "ben-2",
      icon: <MessageSquare className="w-5 h-5 text-purple-600" />,
      pillText: "3x+ faster comms",
      pillBg: "bg-purple-50 text-purple-700",
      title: "Improve Communication",
      description:
        "Replace scattered WhatsApp groups with structured announcements. Every parent stays informed — always.",
    },
    {
      id: "ben-3",
      icon: <FileText className="w-5 h-5 text-emerald-600" />,
      pillText: "100% records digitized",
      pillBg: "bg-emerald-50 text-emerald-700",
      title: "Better Record Keeping",
      description:
        "All student, teacher, and financial records stored securely in the cloud. No more lost files or version conflicts.",
    },
    {
      id: "ben-4",
      icon: <Eye className="w-5 h-5 text-sky-600" />,
      pillText: "Real-time data",
      pillBg: "bg-sky-50 text-sky-700",
      title: "Gain Visibility",
      description:
        "Real-time dashboards give principals and boards instant insight into attendance, enrollment, and school health.",
    },
  ];

  const testimonials = [
    {
      id: "test-1",
      quote:
        "Nexus reduced our admin workload by half. We now spend more time on actual education, not paperwork.",
      author: "Mrs. Adjoa Mensah",
      role: "Principal, Accra International School",
    },
    {
      id: "test-2",
      quote:
        "Parents are so much better informed now. We get zero 'I didn't know about that' calls anymore.",
      author: "Mr. Emmanuel Okafor",
      role: "Head Teacher, Lagos Academy",
    },
    {
      id: "test-3",
      quote:
        "Setup took less than a day. The team walked us through everything and our data was fully migrated.",
      author: "Ms. Amina Bello",
      role: "Administrator, Nairobi Primary",
    },
  ];

  return (
    <section
      id="benefits"
      className="py-20 md:py-20 overflow-hidden font-inter"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span
            id="benefits-subtitle"
            className="inline-block text-xs sm:text-sm font-bold uppercase text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-full mb-4"
          >
            Benefits
          </span>
          <h2
            id="benefits-title"
            className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight"
          >
            Results schools actually see
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {metrics.map((metitems) => (
            <div
              key={metitems.id}
              id={metitems.id}
              className="bg-white border border-gray-100 rounded-2xl p-6 text-left shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="p-2.5 bg-gray-50 rounded-xl w-fit">
                  {metitems.icon}
                </div>

                <div
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold leading-none w-fit ${metitems.pillBg}`}
                >
                  {metitems.pillText}
                </div>

                <div>
                  <h3 className="font-extrabold text-gray-900 text-base tracking-tight mb-2">
                    {metitems.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                    {metitems.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className=" pt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((test) => (
              <div
                key={test.id}
                id={test.id}
                className="bg-gray-50/50 border border-gray-200 rounded-2xl p-6 text-left hover:bg-white "
              >
                <div className="flex items-center gap-0.5 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 text-amber-500 fill-amber-500"
                    />
                  ))}
                </div>

                <p className="text-sm sm:text-base italic text-gray-600 leading-relaxed font-medium mb-6">
                  "{test.quote}"
                </p>

                <div className="pt-4">
                  <h4 className="font-bold text-gray-900 text-sm">
                    {test.author}
                  </h4>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">
                    {test.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
