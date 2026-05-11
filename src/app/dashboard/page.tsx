import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardRoute } from "@/components/dashboard/dashboard-route";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardRoute />
    </ProtectedRoute>
  );
}
