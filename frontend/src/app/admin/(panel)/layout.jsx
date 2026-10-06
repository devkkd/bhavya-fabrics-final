import AdminShell from "../components/AdminShell";

export default function AdminPanelLayout({
  children
}) {
  return (
    <AdminShell>
      {children}
    </AdminShell>
  );
}