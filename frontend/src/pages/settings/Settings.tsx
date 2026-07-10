import React, { useState } from "react";
import { Save, Plus, Trash2, Check, Lock } from "lucide-react";
import { tabs, initialUsers, roleColors } from "./data";

export function Settings() {
  const [activeTab, setActiveTab] = useState("school");
  const [schoolForm, setSchoolForm] = useState({
    name: "Westwood Academy",
    motto: "Excellence in Education",
    address: "1 Academy Drive, Springfield, ST 12345",
    phone: "+1 555 1000",
    email: "info@westwood.edu",
    website: "www.westwood.edu",
    principal: "John Principal",
    established: "1985",
    accreditation: "State Board of Education",
  });
  const [saved, setSaved] = useState(false);
  const [usersList, setUsersList] = useState(initialUsers);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "Registrar",
  });
  const [showAddUser, setShowAddUser] = useState(false);

  // Notification states
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    smsAlerts: false,
    weeklyDigest: true,
    attendanceReports: true,
  });

  // Security password state
  const [passwords, setPasswords] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [pwSaved, setPwSaved] = useState(false);

  const setField = (key: string, val: string) =>
    setSchoolForm((f) => ({ ...f, [key]: val }));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) return;
    setUsersList([
      ...usersList,
      {
        id: "U" + (usersList.length + 1).toString().padStart(3, "0"),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: "Active",
        lastLogin: "Never",
      },
    ]);
    setNewUser({ name: "", email: "", role: "Registrar" });
    setShowAddUser(false);
  };

  const handleDeleteUser = (id: string) => {
    setUsersList(usersList.filter((u) => u.id !== id));
  };

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-8 py-5 ">
        <h1 className="text-slate-900 text-2xl font-extrabold tracking-tight">
          Settings
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Manage school configuration and system user access levels
        </p>
      </header>

      <main className="flex-1 p-8 max-w-7xl w-full flex flex-col md:flex-row gap-6">
        {/* Side Menu Tabs */}
        <div className="w-full md:w-64 shrink-0">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm ">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3.5 px-5 py-4 text-left transition-colors font-bold text-sm border-b border-slate-100 last:border-0 cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  }`}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Panel Content */}
        <div className="flex-1 min-w-0">
          {activeTab === "school" && (
            <div className="space-y-6">
              {/* Information */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h2 className="font-extrabold text-slate-900 text-lg mb-5">
                  School Profile
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {[
                    { label: "School Name", key: "name" },
                    { label: "School Motto", key: "motto" },
                    { label: "Phone Number", key: "phone" },
                    { label: "Email Address", key: "email" },
                    { label: "Website", key: "website" },
                    { label: "Principal", key: "principal" },
                    { label: "Year Established", key: "established" },
                    { label: "Accreditation Body", key: "accreditation" },
                  ].map(({ label, key }) => (
                    <div key={key}>
                      <label className="block text-slate-600 text-xs font-bold uppercase tracking-wider mb-1.5">
                        {label}
                      </label>
                      <input
                        value={schoolForm[key as keyof typeof schoolForm]}
                        onChange={(e) => setField(key, e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50 focus:bg-white"
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-5">
                  <label className="block text-slate-600 text-xs font-bold uppercase tracking-wider mb-1.5">
                    Full Physical Address
                  </label>
                  <input
                    value={schoolForm.address}
                    onChange={(e) => setField("address", e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50 focus:bg-white"
                  />
                </div>
                <div className="mt-6 pt-2">
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
                  >
                    {saved ? <Check size={16} /> : <Save size={16} />}
                    {saved ? "Changes Saved!" : "Save Profile"}
                  </button>
                </div>
              </div>

              {/* Academic Year */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h2 className="font-extrabold text-slate-900 text-lg mb-5">
                  Academic Calendar Term
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-slate-600 text-xs font-bold uppercase tracking-wider mb-1.5">
                      Current Term
                    </label>
                    <input
                      defaultValue="2025–2026 Term 3"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 text-xs font-bold uppercase tracking-wider mb-1.5">
                      Term Start Date
                    </label>
                    <input
                      type="date"
                      defaultValue="2025-09-01"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 text-xs font-bold uppercase tracking-wider mb-1.5">
                      Term End Date
                    </label>
                    <input
                      type="date"
                      defaultValue="2026-06-30"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all bg-slate-50"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-extrabold text-slate-900 text-lg">
                    System Users
                  </h2>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Manage administrative credentials and access levels
                  </p>
                </div>
                <button
                  onClick={() => setShowAddUser(!showAddUser)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
                >
                  <Plus size={16} /> Invite User
                </button>
              </div>

              {showAddUser && (
                <form
                  onSubmit={handleAddUser}
                  className="bg-white rounded-2xl border border-indigo-100 p-5 shadow-sm space-y-4"
                >
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    Add New Administrator
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <input
                        required
                        placeholder="Full Name"
                        value={newUser.name}
                        onChange={(e) =>
                          setNewUser({ ...newUser, name: e.target.value })
                        }
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-slate-50"
                      />
                    </div>
                    <div>
                      <input
                        required
                        type="email"
                        placeholder="Email Address"
                        value={newUser.email}
                        onChange={(e) =>
                          setNewUser({ ...newUser, email: e.target.value })
                        }
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-slate-50"
                      />
                    </div>
                    <div>
                      <select
                        value={newUser.role}
                        onChange={(e) =>
                          setNewUser({ ...newUser, role: e.target.value })
                        }
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
                      >
                        <option value="Administrator">Administrator</option>
                        <option value="Principal">Principal</option>
                        <option value="Registrar">Registrar</option>
                        <option value="Counselor">Counselor</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 cursor-pointer"
                    >
                      Invite
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddUser(false)}
                      className="px-4 py-2 border border-slate-200 text-slate-500 font-semibold text-xs rounded-xl hover:bg-slate-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-6 py-4 text-slate-400 text-xs font-bold uppercase tracking-wider">
                        User Details
                      </th>
                      <th className="px-6 py-4 text-slate-400 text-xs font-bold uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-4 text-slate-400 text-xs font-bold uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-slate-400 text-xs font-bold uppercase tracking-wider">
                        Last Login
                      </th>
                      <th className="px-6 py-4 text-slate-400 text-xs font-bold uppercase tracking-wider text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {usersList.map((user) => {
                      const badge = roleColors[user.role] || {
                        bg: "#F1F5F9",
                        color: "#475569",
                      };
                      return (
                        <tr
                          key={user.id}
                          className="hover:bg-slate-50/50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div>
                              <span className="font-bold text-slate-800 text-sm block">
                                {user.name}
                              </span>
                              <span className="text-slate-400 text-xs font-medium">
                                {user.email}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className="px-2.5 py-0.5 rounded-full text-xs font-bold"
                              style={{
                                background: badge.bg,
                                color: badge.color,
                              }}
                            >
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                user.status === "Active"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${user.status === "Active" ? "bg-emerald-500" : "bg-slate-400"}`}
                              />
                              {user.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-500 text-xs font-semibold">
                            {user.lastLogin}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Delete user"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div>
                <h2 className="font-extrabold text-slate-900 text-lg">
                  Notification Preferences
                </h2>
                <p className="text-slate-500 text-xs mt-0.5">
                  Control how and when your administrative team is alerted
                </p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    key: "emailAlerts" as const,
                    label: "Enable Email Alerts",
                    desc: "Send automated email bulletins to staff for priority notices.",
                  },
                  {
                    key: "smsAlerts" as const,
                    label: "SMS Broadcast Integrations",
                    desc: "Deliver high priority emergency announcements via text messages.",
                  },
                  {
                    key: "weeklyDigest" as const,
                    label: "Weekly Admin Summary Digest",
                    desc: "Compile a weekly overview report of attendance metrics and grade statistics.",
                  },
                  {
                    key: "attendanceReports" as const,
                    label: "Attendance Exceptions Reporting",
                    desc: "Notify counseling office when student registers mark 3 consecutive days absent.",
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-start justify-between p-4 bg-slate-50/50 rounded-xl border border-slate-100"
                  >
                    <div className="pr-4">
                      <label className="text-sm font-bold text-slate-800 block">
                        {item.label}
                      </label>
                      <span className="text-slate-500 text-xs mt-1 block leading-relaxed">
                        {item.desc}
                      </span>
                    </div>
                    <button
                      onClick={() => toggleNotification(item.key)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        notifications[item.key]
                          ? "bg-indigo-600"
                          : "bg-slate-200"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          notifications[item.key]
                            ? "translate-x-5"
                            : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div>
                <h2 className="font-extrabold text-slate-900 text-lg">
                  System Security
                </h2>
                <p className="text-slate-500 text-xs mt-0.5">
                  Maintain credentials and robust administrative encryption
                  standards
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setPwSaved(true);
                  setPasswords({ current: "", next: "", confirm: "" });
                  setTimeout(() => setPwSaved(false), 2000);
                }}
                className="space-y-5"
              >
                <div>
                  <label className="block text-slate-600 text-xs font-bold uppercase tracking-wider mb-1.5">
                    Current Admin Password
                  </label>
                  <input
                    type="password"
                    required
                    value={passwords.current}
                    onChange={(e) =>
                      setPasswords({ ...passwords, current: e.target.value })
                    }
                    className="w-full md:w-80 px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-slate-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 text-xs font-bold uppercase tracking-wider mb-1.5">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={passwords.next}
                    onChange={(e) =>
                      setPasswords({ ...passwords, next: e.target.value })
                    }
                    className="w-full md:w-80 px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-slate-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 text-xs font-bold uppercase tracking-wider mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={passwords.confirm}
                    onChange={(e) =>
                      setPasswords({ ...passwords, confirm: e.target.value })
                    }
                    className="w-full md:w-80 px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-slate-50 focus:bg-white"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
                  >
                    {pwSaved ? <Check size={16} /> : <Lock size={16} />}
                    {pwSaved ? "Password Changed!" : "Update Password"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
