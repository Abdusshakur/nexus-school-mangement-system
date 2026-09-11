import apiClient from "./client";

export interface SchoolApplicationPayload {
  school_name: string;
  school_email: string;
  school_phone: string;
  full_physical_address: string;
  city: string;
  state: string;
  country: string;
  timezone: string;
  owner_first_name: string;
  owner_last_name: string;
  owner_email: string;
  owner_password: string;
  owner_phone: string;
}

export const submitSchoolApplication = async (payload: SchoolApplicationPayload) => {
  return apiClient.post("/school-applications", payload);
};
