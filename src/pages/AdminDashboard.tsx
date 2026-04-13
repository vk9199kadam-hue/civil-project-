import { useAuth } from "@/hooks/useAuth";
import { Navigate, Link, Routes, Route, useLocation } from "react-router-dom";
import { Building2, LayoutDashboard, FolderPlus, MessageSquare, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminProjects from "@/components/admin/AdminProjects";
import AdminProjectForm from "@/components/admin/AdminProjectForm";
import AdminInquiries from "@/components/admin/AdminInquiries";
import AdminUnits from "@/components/admin/AdminUnits";

const AdminDashboard = () => {
  const { user, loading, signOut } = useAuth();
  const location = useLocation();

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;
  if (!user) return <Navigate to="/admin/login" replace />;

  const navLinks = [
    { to: "/admin", label: "Projects", icon: LayoutDashboard, exact: true },
    { to: "/admin/add", label: "Add Project", icon: FolderPlus },
    { to: "/admin/inquiries", label: "Inquiries", icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-primary text-primary-foreground flex-shrink-0">
        <div className="p-4 flex items-center gap-2 border-b border-primary-foreground/10">
          <Building2 className="h-6 w-6 text-secondary" />
          <span className="font-display text-lg font-bold">Admin Panel</span>
        </div>
        <nav className="p-2 flex flex-row md:flex-col gap-1 overflow-x-auto">
          {navLinks.map((l) => {
            const Icon = l.icon;
            const active = l.exact ? location.pathname === l.to : location.pathname.startsWith(l.to);
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                  active ? "bg-primary-foreground/15 text-secondary" : "text-primary-foreground/70 hover:bg-primary-foreground/10"
                }`}
              >
                <Icon className="h-4 w-4" />
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-2 mt-auto">
          <Button variant="ghost" size="sm" onClick={signOut} className="w-full justify-start text-primary-foreground/70 hover:text-primary-foreground">
            <LogOut className="h-4 w-4 mr-2" /> Sign Out
          </Button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 p-4 md:p-8 bg-muted/30 overflow-auto">
        <Routes>
          <Route index element={<AdminProjects />} />
          <Route path="add" element={<AdminProjectForm />} />
          <Route path="edit/:projectId" element={<AdminProjectForm />} />
          <Route path="projects/:projectId/units" element={<AdminUnits />} />
          <Route path="inquiries" element={<AdminInquiries />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminDashboard;
