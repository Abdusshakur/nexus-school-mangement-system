import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../../config/routes";
import { Search, Phone, Mail, MapPin, ChevronRight, Users } from "lucide-react";
import { fetchParentsList, type ParentResponse } from "../../../api/parents";

export function ParentList() {
  const [search, setSearch] = useState("");
  const [dbParents, setDbParents] = useState<ParentResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetchParentsList()
      .then((data) => {
        if (isMounted) setDbParents(data);
      })
      .catch((err) => console.error("Failed to load parents:", err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const listToRender = dbParents.map((p) => {
    const username = p.email.split("@")[0];
    const initials = username.substring(0, 2).toUpperCase();
    return {
      id: p.id,
      name: username,
      occupation: "Parent / Guardian",
      email: p.email,
      phone: p.phone_number,
      address: "Westwood Campus",
      avatarColor: "bg-purple-500",
      avatar: initials,
      children: ["Student"],
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
                  <div className="flex -space-x-1 min-w-0 flex-1 mr-3 items-center">
                    {p.children.map((child, i) => (
                      <div
                        key={i}
                        className="w-7 h-7 rounded-full bg-indigo-50 border-2 border-white flex items-center justify-center shadow-sm shrink-0"
                        title={child}
                      >
                        <span className="text-indigo-600 font-extrabold text-[10px]">
                          {child.split(" ")[0][0]}
                        </span>
                      </div>
                    ))}
                    <span className="text-xs font-bold text-slate-500 ml-2.5 truncate">
                      {p.children.join(", ")}
                    </span>
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
