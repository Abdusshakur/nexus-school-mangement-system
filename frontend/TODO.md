1. add attendance route to the students page which shows the students attendance for thr time being.
2. work on attendance, announcement and settings pages. (Note: Teachers and Parents pages are mostly complete).
3. Add forgot password page
4. introduce {auth.service.ts} later when Logout
   Refresh token, Get current user, Password reset, Token expiration handling, Remember-me, behavior has been added.
5. Dual Parent Support & Parent-Child Relationships (Pending Backend Support):
   - Backend Schema & Endpoint Updates Required:
     * Update `UnifiedStudentOnboardingCreate` schema and `/students` onboarding endpoint to accept `parent2` (Parent 2 / Guardian 2) details alongside `parent` (Parent 1).
     * Update `StudentResponse` schema for `/students` and `/students/{admission_number}` endpoints to return linked parent profiles (`parents: List[ParentResponse]`).
     * Update `ParentResponse` schema for `/parents` endpoint to return `first_name`, `last_name`, and linked `children` list.
   - Frontend Implementation Steps:
     * Update `AddStudentPage.tsx` submit handler to include `p2_*` (Parent 2) form data in the `createStudent()` API payload.
     * Update `StudentDetailPage.tsx` & `ProfileTab.tsx` to replace hardcoded dummy parent values with real Parent 1 & Parent 2 data returned from the backend.
     * Update `ParentPage.tsx` and `ParentDetailPage.tsx` to render real parent names and their linked children.
     * Update `DashboardPage.tsx` Recent Students table to show connected Parent 1 & Parent 2 for each student.

6. [CRITICAL] Teacher Management API Missing Endpoints (Backend):
   - **`GET /api/v1/classes/`**: Needed to fetch the real database UUIDs of classes (e.g. "JSS 1") so the frontend can successfully assign them to teachers (`PUT /teachers/{id}/classes`).
   - **`GET /api/v1/subjects/`**: Needed to fetch the real database UUIDs of subjects (e.g. "Mathematics") so the frontend can successfully assign them to teachers (`PUT /teachers/{id}/subjects`).
   - *(Note: Alternatively, the backend developer can just provide a static text file containing the exact seeded UUIDs for classes and subjects so they can be hardcoded in the frontend).*
