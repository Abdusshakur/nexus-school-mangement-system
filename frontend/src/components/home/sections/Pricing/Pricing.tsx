import { Check } from "lucide-react";

export default function Pricing() {
  const plans = [
    {
      id: "starter-plan",
      name: "Starter",
      oldPrice: "",
      price: "49",
      period: "month",
      subtext: "Perfect for small schools getting started.",
      features: [
        "Up to 300 students",
        "Parent & teacher portals",
        "Attendance tracking",
        "Announcements",
        "Email support",
      ],
      buttonText: "Get Started",
      isHighlighted: false,
      btnStyle:
        "bg-white hover:bg-indigo-500 hover:text-white text-indigo-600 border border-slate-200",
    },
    {
      id: "pro-plan",
      name: "Pro",
      tagline: "Most popular",
      price: "99",
      period: "month",
      subtext: "For growing schools that need more power.",
      features: [
        "Up to 1,000 students",
        "Everything in Starter",
        "Advanced reports & analytics",
        "SMS notifications",
        "Priority support",
        "Custom branding",
      ],
      buttonText: "Get Started",
      isHighlighted: true,
      btnStyle: "bg-white hover:bg-indigo-50 text-indigo-500",
    },
    {
      id: "enterprise-plan",
      name: "Enterprise",
      price: "Custom",
      period: "",
      subtext: "For school networks and large institutions.",
      features: [
        "Unlimited students",
        "Multi-campus management",
        "Everything in Pro",
        "Dedicated success manager",
        "SLA guarantee",
        "Custom integrations",
      ],
      buttonText: "Contact Sales",
      isHighlighted: false,
      btnStyle:
        "bg-indigo-500 hover:bg-indigo-600 text-white shadow-md shadow-indigo-500/10",
    },
  ];

  return (
    <section
      id="pricing"
      className="py-20 md:py-20 bg-white overflow-hidden font-inter"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span
            id="pricing-header"
            className="inline-block text-xs sm:text-sm font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-full mb-4"
          >
            Pricing
          </span>
          <h2
            id="pricing-title"
            className="text-3xl sm:text-4xl lg:text-[40px] font-extrabold text-slate-900"
          >
            Simple, transparent pricing
          </h2>
          <p
            id="pricing-description"
            className="mt-4 font-normal sm:text-lg text-slate-500 text-lg"
          >
            30-day free trial. No credit card required.
          </p>
        </div>

        {/* Pricing Cards with map function*/}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 max-w-6xl mx-auto items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.id}
              id={plan.id}
              className={`rounded-3xl p-8 text-left flex flex-col justify-between transition-all duration-300 relative ${
                plan.isHighlighted
                  ? "bg-indigo-500 text-white shadow-xl shadow-indigo-500/25 md:scale-[1.03] z-10 border border-indigo-500"
                  : "bg-white border border-slate-200 text-slate-700 hover:shadow-xl hover:shadow-slate-100"
              }`}
            >
              <div>
                {plan.tagline && (
                  <span className="absolute top-5 right-5 bg-white/20 text-white text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full border border-white/10">
                    {plan.tagline}
                  </span>
                )}

                {/* Plan Name */}
                <h3
                  className={`text-xl font-extrabold ${plan.isHighlighted ? "text-white" : "text-slate-950"}`}
                >
                  {plan.name}
                </h3>

                {/* Price Tag */}
                <div className="flex mt-4 mb-2">
                  <span
                    className={`text-4xl sm:text-5xl font-extrabold ${plan.isHighlighted ? "text-white" : "text-slate-950"}`}
                  >
                    {plan.price.startsWith("C") ? "" : "$"}
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span
                      className={`text-sm font-medium ml-1 ${plan.isHighlighted ? "text-indigo-100" : "text-slate-400"}`}
                    >
                      /{plan.period}
                    </span>
                  )}
                </div>

                <p
                  className={`text-sm leading-relaxed mb-6 font-medium ${plan.isHighlighted ? "text-indigo-100" : "text-slate-400"}`}
                >
                  {plan.subtext}
                </p>

                {/* Features Check List */}
                <div className="border-t border-slate-100/10 md:border-t-0 pt-6">
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feat, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-3 text-sm font-medium leading-tight"
                      >
                        <Check
                          className={`w-5 h-5 shrink-0 ${
                            plan.isHighlighted
                              ? "text-indigo-200"
                              : "text-indigo-500"
                          }`}
                        />
                        <span
                          className={`${plan.isHighlighted ? "text-white" : "text-slate-600"}`}
                        >
                          {feat}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Link button */}
              <a
                href={plan.name === "Enterprise" ? "#contact" : "#pricing"}
                id={`btn-pricing-${plan.name.toLowerCase()}`}
                className={`block w-full py-3 px-4 rounded-xl font-bold text-center text-sm active:scale-98 transition-all duration-200 ${plan.btnStyle}`}
              >
                {plan.buttonText}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
