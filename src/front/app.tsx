import { BrowserRouter, Route, Routes } from "react-router";
import { LoginPage } from "./features/auth/page";
import { CourseDetailPage } from "./features/course-detail/page";
import { CoursesPage } from "./features/courses/page";
import { DashboardPage } from "./features/dashboard/page";
import { WeekDetailPage } from "./features/week-detail/page";
import { AuthProvider } from "./shared/auth/auth-context";
import { AuthGuard } from "./shared/auth/auth-guard";

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<AuthGuard />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/courses/:courseId" element={<CourseDetailPage />} />
            <Route path="/weeks/:weekId" element={<WeekDetailPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
