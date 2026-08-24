import { TeacherQRScanner } from "../../components/attendance/TeacherQRScanner";

export function SecurityDashboard() {
  return (
    <div className="flex-1 bg-slate-50/50 min-h-screen">
      <main className="p-8">
        <TeacherQRScanner isAdmin={false} />
      </main>
    </div>
  );
}
