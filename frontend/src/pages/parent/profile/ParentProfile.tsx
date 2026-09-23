import { useEffect } from "react";
import { Mail, Phone, Users, Edit3, GraduationCap, Hash } from "lucide-react";
import { useParentContextStore } from "../../../store/parentContext.store";
import { Skeleton } from "../../../components/ui/Skeleton";
import { toast } from "sonner";

export function ParentProfile() {
  const { profile, loadProfile } = useParentContextStore();

  useEffect(() => {
    if (!profile) {
      loadProfile();
    }
  }, [profile, loadProfile]);

  const handleEdit = () => {
    toast.error("Editing not allowed. Contact admin.", {
      description: "Profile editing coming soon.",
    });
  };

  if (!profile) {
    return (
      <div className="max-w-4xl pb-10 space-y-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="bg-white rounded-xl p-6 border border-slate-200 text-center">
            <Skeleton className="w-24 h-24 rounded-full mx-auto mb-4" />
            <Skeleton className="h-6 w-32 mx-auto mb-2" />
            <Skeleton className="h-4 w-24 mx-auto mb-4" />
            <Skeleton className="h-8 w-32 mx-auto rounded-lg" />
          </div>
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-xl p-5 border border-slate-200">
              <Skeleton className="h-5 w-40 mb-4" />
              <div className="space-y-3">
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const avatarInitial = (profile.first_name?.[0] || "P").toUpperCase();
  const fullName = `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "Parent Profile";

  return (
    <div className="max-w-4xl pb-10 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
          <p className="text-sm mt-1 text-slate-500">Your personal and family details</p>
        </div>
        <button
          onClick={handleEdit}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
        >
          <Edit3 size={15} /> Edit Profile
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Avatar card */}
        <div className="bg-white rounded-xl p-6 text-center border border-slate-200">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 bg-indigo-500">
            <span className="text-white font-bold text-3xl">{avatarInitial}</span>
          </div>
          <p className="text-lg font-bold text-slate-900">{fullName}</p>
          <p className="text-sm mt-1 text-slate-500">Parent / Guardian</p>

          <div className="mt-4 px-3 py-2 rounded-lg inline-flex items-center gap-2 bg-indigo-50">
            <Users size={14} className="text-indigo-600" />
            <span className="text-xs font-semibold text-indigo-600">
              {profile.students?.length || 0} {(profile.students?.length === 1) ? "Child" : "Children"} Linked
            </span>
          </div>
        </div>

        {/* Details column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Contact info */}
          <div className="bg-white rounded-xl p-5 border border-slate-200">
            <h3 className="text-base font-semibold mb-4 text-slate-900">
              Contact Information
            </h3>
            <div className="space-y-3">
              {[
                { label: "Full Name", value: fullName, icon: Users },
                { label: "Email Address", value: profile.email, icon: Mail },
                { label: "Phone Number", value: profile.phone_number || "Not provided", icon: Phone },
                { label: "Role", value: "Parent Account", icon: GraduationCap },
              ].map(({ label, value, icon: Icon }) => (
                <div
                  key={label}
                  className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <Icon size={15} className="text-slate-400" />
                    <span className="text-sm text-slate-500">{label}</span>
                  </div>
                  <span className="text-sm font-medium text-slate-900">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Children */}
          {profile.students && profile.students.length > 0 && (
            <div className="bg-white rounded-xl p-5 border border-slate-200">
              <h3 className="text-base font-semibold mb-4 text-slate-900">
                Children
              </h3>
              <div className="space-y-3">
                {profile.students.map((child) => (
                  <div
                    key={child.id}
                    className="flex items-center gap-4 p-4 rounded-xl bg-indigo-50 border border-indigo-100"
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-indigo-500">
                      <span className="text-white font-bold text-sm">
                        {child.first_name[0]}{child.last_name[0]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-slate-900">
                        {child.first_name} {child.last_name}
                      </p>
                      <p className="text-xs mt-0.5 text-slate-500">{child.class_name}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="flex items-center gap-1.5">
                        <Hash size={11} className="text-slate-400" />
                        <span className="text-xs font-medium text-slate-500">
                          {child.admission_number || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
