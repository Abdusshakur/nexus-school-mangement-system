import apiClient from "./client";

export interface TimetableCreatePayload {
  term_id: string;
  class_id: string;
  subject_id: string;
  teacher_id: string;
  day_of_week: string; // e.g., "Monday"
  start_time: string;
  end_time: string;
}

export interface TimetableBulkCreatePayload {
  class_id: string;
  entries: TimetableCreatePayload[];
}

export async function createTimetableEntry(payload: TimetableCreatePayload): Promise<any> {
  return apiClient.post("/timetable/", payload);
}

export async function createBulkTimetable(payload: TimetableBulkCreatePayload): Promise<any> {
  return apiClient.post("/timetable/bulk", payload);
}

export async function getClassTimetable(classId: string, termId: string): Promise<any> {
  return apiClient.get(`/timetable/class/${classId}?term_id=${termId}`);
}

export async function getTeacherSchedule(termId: string): Promise<any> {
  return apiClient.get(`/timetable/my-schedule?term_id=${termId}`);
}

export async function getStudentSchedule(studentId: string, termId: string): Promise<any> {
  return apiClient.get(`/timetable/student/${studentId}?term_id=${termId}`);
}
