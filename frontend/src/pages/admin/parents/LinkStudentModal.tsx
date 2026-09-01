import React, { useState, useEffect } from "react";
import { X, Search, Link as LinkIcon, User, CheckCircle2 } from "lucide-react";
import { linkParentToStudent } from "../../../api/parents";
import { fetchStudentsList, type StudentResponse } from "../../../api/students";
import { toast } from "sonner";
import { Spinner } from "../../../components/ui/Spinner";

interface LinkStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  parentId: string;
}

const RELATIONSHIP_TYPES = [
  "MOTHER",
  "FATHER",
  "GUARDIAN",
  "SPONSOR",
  "SIBLING",
  "OTHER",
];

export function LinkStudentModal({
  isOpen,
  onClose,
  onSuccess,
  parentId,
}: LinkStudentModalProps) {
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<StudentResponse[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [relationshipType, setRelationshipType] = useState<string>("GUARDIAN");

  // Failed search
  useEffect(() => {
    if (!search.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const [byAdm, byName] = await Promise.all([
          fetchStudentsList(search, undefined, undefined),
          fetchStudentsList(undefined, undefined, search),
        ]);

        const map = new Map();
        [...byAdm, ...byName].forEach((s) => map.set(s.id, s));
        setSearchResults(Array.from(map.values()));
      } catch (err) {
        console.error("Failed to search students", err);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  // Reset state when opened/closed
  useEffect(() => {
    if (isOpen) {
      setSearch("");
      setSearchResults([]);
      setSelectedStudentId("");
      setRelationshipType("GUARDIAN");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) {
      toast.error("Please select a student to link.");
      return;
    }

    setLoading(true);
    try {
      await linkParentToStudent({
        parent_id: parentId,
        student_id: selectedStudentId,
        relationship_type: relationshipType,
      });
      toast.success("Student successfully linked to this parent!");
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Failed to link student.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <LinkIcon size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Link Student</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Attach an existing student to this parent
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/*Search for Student */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                1. Find Student
              </label>
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, email, or admission number..."
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 bg-slate-50 focus:bg-white transition-colors"
                />
              </div>

              {/* Search Results list */}
              {search.trim().length > 0 && (
                <div className="mt-2 border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto bg-white">
                  {isSearching ? (
                    <div className="p-4 text-center text-sm text-slate-500">
                      Searching...
                    </div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((student) => (
                      <button
                        type="button"
                        key={student.id}
                        onClick={() => setSelectedStudentId(student.id)}
                        className={`w-full text-left p-3 flex items-center justify-between border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors ${
                          selectedStudentId === student.id
                            ? "bg-indigo-50/50"
                            : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                            <User size={14} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">
                              {student.first_name} {student.last_name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {student.admission_number} &middot;{" "}
                              {student.class_name}
                            </p>
                          </div>
                        </div>
                        {selectedStudentId === student.id && (
                          <CheckCircle2 size={18} className="text-indigo-600" />
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-center text-sm text-slate-500">
                      No students found matching "{search}"
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Select Relationship */}
            {selectedStudentId && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  2. Relationship Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {RELATIONSHIP_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setRelationshipType(type)}
                      className={`px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border transition-all ${
                        relationshipType === type
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 mt-2 pt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors border border-transparent"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !selectedStudentId}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center gap-2"
              >
                {loading && <Spinner size="sm" className="text-white" />}
                {loading ? "Linking..." : "Link Student"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
