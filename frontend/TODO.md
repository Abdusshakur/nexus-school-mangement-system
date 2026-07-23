1. add attendance route to the students page which shows the students attendance for thr time being.
2. work on teachers, attendance, parents announcement ans settings pages.
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

