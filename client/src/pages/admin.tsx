import Layout from "@/components/layout";
import AdminDashboard from "@/components/admin-dashboard";

export default function AdminPage() {
  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <AdminDashboard />
      </div>
    </Layout>
  );
}