import ProductMockup from "../../../../assets/images/productshowcase.png";

export default function ProductShowcase() {
  return (
    <section
      id="product-showcase"
      className="py-20 md:py-14 bg-white font-inter"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span
            id="showcase-subtitle"
            className="inline-block text-xs sm:text-sm font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-full mb-4"
          >
            Product
          </span>
          <h2
            id="showcase-title"
            className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight"
          >
            See Nexus in action
          </h2>
          <p
            id="showcase-desc"
            className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed"
          >
            A clean, intuitive interface your staff will actually enjoy using.
          </p>
        </div>

        {/* Browser Mockup */}
        <div
          className="w-full max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden"
          id="students-table-showcase"
        >
          <img
            src={ProductMockup}
            alt="Nexus Students Directory Administration Mockup"
            className="w-full h-auto object-cover block"
          />
        </div>
      </div>
    </section>
  );
}

// TODO: CONTINUE FROM THE PRICING SECTION CARD
