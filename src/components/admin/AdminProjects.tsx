import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Pencil, Trash2, Layers, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { statusLabels, typeLabels } from "@/components/ProjectCard";

const AdminProjects = () => {
  const qc = useQueryClient();

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["admin-projects"],
    queryFn: async () => {
      const { data } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-projects"] });
      toast({ title: "Project deleted" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  if (isLoading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold">Your Projects</h1>
        <Link to="/admin/add">
          <Button className="gap-2"><Plus className="h-4 w-4" /> Add Project</Button>
        </Link>
      </div>

      {projects.length === 0 ? (
        <p className="text-muted-foreground text-center py-16">No projects yet. Add your first project!</p>
      ) : (
        <div className="grid gap-4">
          {projects.map((p) => (
            <div key={p.id} className="bg-card border rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="h-20 w-28 rounded overflow-hidden flex-shrink-0 bg-muted">
                <img src={p.images?.[0] || "/placeholder.svg"} alt={p.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{p.name}</h3>
                <p className="text-sm text-muted-foreground">{p.location}</p>
                <div className="flex gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">{typeLabels[p.property_type]}</Badge>
                  <Badge variant="secondary" className="text-xs">{statusLabels[p.status]}</Badge>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Link to={`/admin/projects/${p.id}/units`}>
                  <Button variant="outline" size="sm" className="gap-1"><Layers className="h-3.5 w-3.5" /> Units</Button>
                </Link>
                <Link to={`/admin/edit/${p.id}`}>
                  <Button variant="outline" size="sm"><Pencil className="h-3.5 w-3.5" /></Button>
                </Link>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    if (confirm("Delete this project and all its units?")) deleteMutation.mutate(p.id);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminProjects;
