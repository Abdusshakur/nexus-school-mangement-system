import apiClient from "./client";

export interface TeacherAttendanceSettings {
  id?: string;
  school_id?: string;
  check_in_start: string;
  expected_check_in_time: string;
  late_threshold: string;
  check_in_end: string;
  check_out_start: string;
  expected_check_out_time: string;
  check_out_end: string;
  qr_rotation_seconds: number;
}

export const fetchTeacherAttendanceSettings = async (): Promise<TeacherAttendanceSettings> => {
  return apiClient.get("/attendance/configuration");
};

export const updateTeacherAttendanceSettings = async (settings: TeacherAttendanceSettings, isUpdate: boolean = false): Promise<TeacherAttendanceSettings> => {
  if (isUpdate) {
    return apiClient.patch("/attendance/configuration", settings);
  } else {
    return apiClient.post("/attendance/configuration", settings);
  }
};
