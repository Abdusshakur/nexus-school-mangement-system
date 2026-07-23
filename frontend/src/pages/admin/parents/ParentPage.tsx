import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../../config/routes";
import { Search, Phone, Mail, MapPin, ChevronRight, Users } from "lucide-react";
import { useParentStore } from "../../../store/parent.store";

export function formatParentName(firstName?: string, lastName?: string, email?: string): string {
  const isInvalid = (val?: string) =>
    !val ||
    val.trim() === "" ||
    val.toLowerCase() === "unknown" ||
    val.toLowerCase().startsWith("string") ||
    val.toLowerCase() === "null";

  const firstValid = !isInvalid(firstName);
  const lastValid = !isInvalid(lastName);

  if (firstValid && lastValid) {
    return `${firstName!.trim()} ${lastName!.trim()}`;
  }
  if (firstValid) return firstName!.trim();
  if (lastValid) return lastName!.trim();

  if (email && email.includes("@")) {
    const handle = email.split("@")[0].replace(/[._-]/g, " ");
    return handle
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }

  return "Parent / Guardian";
}

export function formatParentInitials(name: string): string {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

export function ParentList() {
  const [search, setSearch] = useState("");
  const { parents: dbParents, loading, fetchParents } = useParentStore();

  useEffect(() => {
    fetchParents().catch(() => {});
  }, [fetchParents]);

  const listToRender = dbParents.map((p) => {
    const displayName = formatParentName(p.first_name, p.last_name, p.email);
    const initials = formatParentInitials(displayName);

    const childrenList = p.children && p.children.length > 0 ? p.children : p.students || [];
    const mappedChildren = childrenList.map((c) => {
      const childName = formatParentName(c.first_name, c.last_name, "");
      return {
        id: c.id,
        admission_number: c.admission_number,
        name: childName === "Parent / Guardian" ? "Student" : childName,
        class_name: c.class_name,
      };
    });

    const isInvalidPhone = !p.phone_number || p.phone_number.toLowerCase().startsWith("string") || p.phone_number.toLowerCase() === "null";
    const phoneDisplay = isInvalidPhone ? "No phone registered" : p.phone_number;

    return {
      id: p.id,
      name: displayName,
      occupation: "Parent / Guardian",
      email: p.email,
      phone: phoneDisplay,
      address: "Westwood Campus",
      avatarColor: "bg-purple-500",
      avatar: initials,
      children: mappedChildren,
    };
  });


  const filtered = listToRender.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex-1 flex flex-col min-w-0 ">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900 text-2xl font-bold ">Parents</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {dbParents.length} registered parents & guardians
          </p>
        </div>
      </header>

      <main className="flex-1 py-8 space-y-6 max-w-full w-full ">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="relative max-w-md">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search parents by name, email, or ID…"
              className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50 focus:bg-white"
            />
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <p className="text-slate-500 text-sm animate-pulse font-medium">
              Loading parent records ...
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
              <Users size={24} />
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              No Parent Records Found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {search
                ? `No parents matched "${search}".`
                : "No parent profiles have been registered in the database yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3.5 mb-5">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${p.avatarColor}`}
                    >
                      <span className="text-white font-bold text-sm">
                        {p.avatar}
                      </span>
                    </div>
                    <div>
                      <p className="font-extrabold text-slate-900">{p.name}</p>
                      <p className="text-xs font-bold text-slate-400 mt-0.5 truncate max-w-44">
                        {p.occupation}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3 pb-5 border-b border-slate-100">
                    {[
                      { icon: Mail, label: p.email },
                      { icon: Phone, label: p.phone },
                      { icon: MapPin, label: p.address },
                    ].map(({ icon: Icon, label }, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2.5 min-w-0"
                      >
                        <Icon size={14} className="text-slate-400 shrink-0" />
                        <p className="text-sm text-slate-500 font-medium truncate">
                          {label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-5 flex items-center justify-between">
                  <div className="flex min-w-0 flex-1 mr-3 items-center flex-wrap gap-1.5">
                    {p.children.length > 0 ? (
                      p.children.map((child, i) => (
                        <Link
                          key={child.id || i}
                          to={ROUTES.ADMIN.STUDENT_DETAIL(child.admission_number || child.id)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors text-xs font-semibold"
                          title={`View ${child.name}'s profile`}
                        >
                          <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] flex items-center justify-center font-bold">
                            {child.name[0]}
                          </span>
                          <span>{child.name}</span>
                        </Link>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">No children linked</span>
                    )}
                  </div>
                  <Link
                    to={ROUTES.ADMIN.PARENT_DETAIL(p.id)}
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1 shrink-0 transition-colors"
                  >
                    View <ChevronRight size={15} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

