import { useState } from "react";
import { Save, Bell, Lock, Globe, Moon } from "lucide-react";
import { Toggle } from "./Toggle";
import { NOTIFICATION_SETTINGS, LANGUAGES, TIMEZONES } from "./data";

export default function TeacherSettingsPage() {
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwSaved, setPwSaved] = useState(false);

  const handlePwChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw !== confirmPw) return;
    setPwSaved(true);
    setCurrentPw("");
    setNewPw("");
    setConfirmPw("");
    setTimeout(() => setPwSaved(false), 2500);
  };

  return (
    <div className="max-w-2xl space-y-5 p-2">
      <div>
        <h1 className="font-bold text-2xl text-slate-900">Settings</h1>
        <p className="text-sm mt-0.5 text-slate-500">
          Manage your account preferences
        </p>
      </div>

      {pwSaved && (
        <div className="px-4 py-3 rounded-xl text-sm font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">
          ✓ Password updated successfully
        </div>
      )}

      {/* Notifications */}
      <div className="bg-white rounded-xl p-5 border border-slate-200">
        <div className="flex items-center gap-2 mb-4">
          <Bell size={16} className="text-indigo-600" />
          <h2 className="font-semibold text-slate-900 text-[15px]">
            Notifications
          </h2>
        </div>
        <div className="space-y-1">
          {NOTIFICATION_SETTINGS.map((n, i) => (
            <div
              key={n.id}
              className={`flex items-center justify-between py-3 ${
                i < NOTIFICATION_SETTINGS.length - 1 ? "border-b border-slate-100" : ""
              }`}
            >
              <div>
                <p className="text-sm font-medium text-slate-900">{n.label}</p>
                <p className="text-xs mt-0.5 text-slate-500">{n.desc}</p>
              </div>
              <Toggle defaultOn={n.defaultOn} />
            </div>
          ))}
        </div>
      </div>

      {/* Display */}
      <div className="bg-white rounded-xl p-5 border border-slate-200">
        <div className="flex items-center gap-2 mb-4">
          <Globe size={16} className="text-indigo-600" />
          <h2 className="font-semibold text-slate-900 text-[15px]">
            Display & Language
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">
              Language
            </label>
            <select className="w-full px-3 py-2.5 rounded-lg text-sm bg-white border border-slate-200 text-slate-900 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors">
              {LANGUAGES.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">
              Timezone
            </label>
            <select className="w-full px-3 py-2.5 rounded-lg text-sm bg-white border border-slate-200 text-slate-900 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors">
              {TIMEZONES.map(tz => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between py-3 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <Moon size={15} className="text-slate-400" />
            <div>
              <p className="text-sm font-medium text-slate-900">Dark Mode</p>
              <p className="text-xs text-slate-500">Switch to dark theme</p>
            </div>
          </div>
          <Toggle defaultOn={false} />
        </div>
      </div>

      {/* Password */}
      <div className="bg-white rounded-xl p-5 border border-slate-200">
        <div className="flex items-center gap-2 mb-4">
          <Lock size={16} className="text-indigo-600" />
          <h2 className="font-semibold text-slate-900 text-[15px]">
            Change Password
          </h2>
        </div>
        <form onSubmit={handlePwChange} className="space-y-3">
          {[
            { label: "Current Password", value: currentPw, set: setCurrentPw },
            { label: "New Password", value: newPw, set: setNewPw },
            { label: "Confirm New Password", value: confirmPw, set: setConfirmPw },
          ].map(({ label, value, set }) => (
            <div key={label}>
              <label className="block text-sm font-medium mb-1.5 text-gray-700">
                {label}
              </label>
              <input
                type="password"
                value={value}
                onChange={(e) => set(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-lg text-sm bg-white border border-slate-200 text-slate-900 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
              />
            </div>
          ))}
          {newPw && confirmPw && newPw !== confirmPw && (
            <p className="text-xs text-red-500">Passwords do not match</p>
          )}
          <div className="pt-1">
            <button
              type="submit"
              disabled={!currentPw || !newPw || newPw !== confirmPw}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors ${
                currentPw && newPw && newPw === confirmPw
                  ? "bg-indigo-600 hover:bg-indigo-700"
                  : "bg-indigo-300 cursor-not-allowed"
              }`}
            >
              <Save size={15} /> Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
