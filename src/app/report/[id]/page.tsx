import { ProtectedRoute } from "@/components/auth/protected-route";
import { ReportRoute } from "@/components/report/report-route";

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <ProtectedRoute>
      <ReportRoute reportId={id} />
    </ProtectedRoute>
  );
}
