import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function FAQ() {
  const [openAccordion, openAccordionIndex] = useState<number | null>(0);

  const faqItems = [
    {
      question: "How long does it take to set up Nexus for my school?",
      answer:
        "Most schools are fully onboarded within 48 hours. We handle data migration from your existing spreadsheets and WhatsApp records, and our team provides live training for administrators, teachers, and parents.",
    },
    {
      question: "Can parents access Nexus from their phones?",
      answer:
        "Yes. Nexus works on any device desktop, tablet, or mobile browser. Parents receive a unique login link and can view attendance, announcements, and their child's profile instantly.",
    },
    {
      question: "Is our school's data secure?",
      answer:
        "Absolutely. All data is encrypted in transit and at rest. We are compliant with data protection regulations and never share your school's data with third parties.",
    },
    {
      question: "Can I manage multiple schools or campuses?",
      answer:
        "Yes. Nexus supports multi-campus management under a single administrator account with role-based access control for each campus.",
    },
    {
      question: "What happens if we need help after onboarding?",
      answer:
        "We offer dedicated support via live chat, email, and phone Monday through Friday. Priority support is included in the Pro and Enterprise plans.",
    },
    {
      question: "Do you offer a free trial?",
      answer:
        "Yes! you get a 30-day free trial with full access to all features. No credit card required. We'll help you migrate your data and get started at no cost.",
    },
  ];

  const handleToggle = (index: number) => {
    openAccordionIndex(openAccordion === index ? null : index);
  };

  return (
    <section
      id="faq"
      className="py-20 md:py-20 bg-slate-50/50 border-slate-100 font-inter"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span
            id="faq-subtitle"
            className="inline-block text-xs sm:text-sm font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-full mb-4"
          >
            FAQ
          </span>
          <h2
            id="faq-title"
            className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight"
          >
            Questions we get asked a lot
          </h2>
          <p
            id="faq-desc"
            className="mt-4 text-base sm:text-lg text-slate-600 flex flex-wrap items-center justify-center gap-1.5 font-normal"
          >
            <span>Still have questions? Reach us at</span>
            <a
              href="mailto:hello@nexusschool.io"
              className="text-indigo-500 font-bold hover:underline hover:decoration-indigo-500 inline-flex items-center gap-1 focus:outline-none"
            >
              <span className="text-indigo-500 ">hello@nexusschool.io</span>
            </a>
          </p>
        </div>

        {/* Stateful Accordion List */}
        <div className="space-y-4 max-w-3xl mx-auto" id="faq-accordion-list">
          {faqItems.map((item, idx) => {
            const isOpen = openAccordion === idx;
            return (
              <div
                key={idx}
                id={`faq-item-${idx}`}
                className="bg-white border border-slate-100 rounded-2xl hover:bg-slate-100 overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => handleToggle(idx)}
                  className="w-full text-left p-5 sm:p-6 flex justify-between items-center gap-2 hover:bg-slate-50/50 transition-colors focus:outline-none cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="font-semibold text-sm sm:text-base text-slate-900 leading-snug">
                    {item.question}
                  </span>
                  <div
                    className={`p-1.5 rounded-xl bg-slate-50 text-slate-500 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180 bg-indigo-50 text-indigo-500" : ""}`}
                  >
                    <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                </button>

                {/* Animated Accordion body details */}
                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isOpen ? "max-h-[300px] " : "max-h-0"
                  }`}
                >
                  <div className="p-5 sm:p-6 text-xs sm:text-sm text-slate-500 text-left bg-slate-50/20">
                    {item.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
