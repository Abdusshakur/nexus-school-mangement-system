import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import type { Announcement } from "./data";
import { useAnnouncementStore } from "../../../store/announcement.store";
import { CreateAnnouncement } from "./CreateAnnouncement";
import { AnnouncementList } from "./AnnouncementList";

export default function TeacherAnnouncements() {
  const { announcements, loading, fetchAnnouncements, postAnnouncement, deleteAnnouncement } = useAnnouncementStore();
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    fetchAnnouncements().catch(console.error);
  }, [fetchAnnouncements]);

  const handlePost = (ann: Omit<Announcement, "id">) => {
    postAnnouncement(ann).catch(console.error);
    setIsPosting(false);
  };

  const handleDelete = (id: string) => {
    deleteAnnouncement(id);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-0 overflow-y-auto">
      <header className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-slate-900 text-2xl font-extrabold tracking-tight">
            Announcements
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Post bulletins, lab deadlines, or schedule changes to your classes
          </p>
        </div>
        <button
          onClick={() => setIsPosting(!isPosting)}
          className="flex items-center gap-2 px-4.5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
        >
          <Plus size={16} /> Create Announcement
        </button>
      </header>

      <main className="flex-1 p-8 max-w-5xl w-full space-y-6">
        {isPosting && (
          <CreateAnnouncement
            onPost={handlePost}
            onCancel={() => setIsPosting(false)}
          />
        )}

        <AnnouncementList
          announcements={announcements}
          loading={loading}
          onDelete={handleDelete}
        />
      </main>
    </div>
  );
}
