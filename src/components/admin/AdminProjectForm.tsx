import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { Upload, X } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type PropertyType = Database["public"]["Enums"]["property_type"];
type ProjectStatus = Database["public"]["Enums"]["project_status"];

const AdminProjectForm = () => {
  const { projectId } = useParams();
  const isEdit = !!projectId;
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [form, setForm] = useState({
    name: "",
    location: "",
    description: "",
    property_type: "flat" as PropertyType,
    status: "new_launch" as ProjectStatus,
    price_range: "",
    featured: false,
  });
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const { data: existing } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const res = await fetch(`/api/projects?id=${projectId}`);
      if (!res.ok) throw new Error("Failed to fetch project");
      return res.json();
    },
    enabled: isEdit,
  });

  useEffect(() => {
    if (existing) {
      setForm({
        name: existing.name,
        location: existing.location,
        description: existing.description || "",
        property_type: existing.property_type,
        status: existing.status,
        price_range: existing.price_range || "",
        featured: existing.featured,
      });
      setImages(existing.images || []);
    }
  }, [existing]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setUploading(true);
    const newUrls: string[] = [];
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const path = `projects/${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;
      const { error } = await supabase.storage.from("property-photos").upload(path, file);
      if (error) {
        console.error("Upload error:", error);
        toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      } else {
        const { data } = supabase.storage.from("property-photos").getPublicUrl(path);
        newUrls.push(data.publicUrl);
      }
    }
    setImages((prev) => [...prev, ...newUrls]);
    setUploading(false);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = { ...form, images };
      const url = isEdit ? `/api/projects?id=${projectId}` : "/api/projects";
      const method = isEdit ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Save failed");
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-projects"] });
      toast({ title: isEdit ? "Project updated" : "Project created" });
      navigate("/admin");
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl font-bold mb-6">{isEdit ? "Edit Project" : "Add New Project"}</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!form.name.trim() || !form.location.trim()) {
            toast({ title: "Name and location are required", variant: "destructive" });
            return;
          }
          saveMutation.mutate();
        }}
        className="space-y-5"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Project Name *</Label>
            <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} maxLength={200} required />
          </div>
          <div className="space-y-2">
            <Label>Location *</Label>
            <Input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} maxLength={200} required />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={4} maxLength={5000} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Property Type</Label>
            <Select value={form.property_type} onValueChange={(v) => setForm((f) => ({ ...f, property_type: v as PropertyType }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="flat">Flat / Apartment</SelectItem>
                <SelectItem value="villa">Villa / House</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
                <SelectItem value="land">Land / Plot</SelectItem>
                <SelectItem value="builder_project">Builder Project</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v as ProjectStatus }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="new_launch">New Launch</SelectItem>
                <SelectItem value="under_construction">Under Construction</SelectItem>
                <SelectItem value="ready_to_move">Ready to Move</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Price Range</Label>
            <Input placeholder="e.g. ₹45L - ₹80L" value={form.price_range} onChange={(e) => setForm((f) => ({ ...f, price_range: e.target.value }))} maxLength={50} />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Switch checked={form.featured} onCheckedChange={(v) => setForm((f) => ({ ...f, featured: v }))} />
          <Label>Featured Project</Label>
        </div>

        {/* Image Upload */}
        <div className="space-y-2">
          <Label>Photos</Label>
          <div className="flex flex-wrap gap-3">
            {images.map((url, i) => (
              <div key={i} className="relative h-20 w-28 rounded overflow-hidden border">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5"
                  onClick={() => setImages((imgs) => imgs.filter((_, j) => j !== i))}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            <label className="h-20 w-28 rounded border-2 border-dashed flex items-center justify-center cursor-pointer hover:bg-muted transition-colors">
              <Upload className="h-5 w-5 text-muted-foreground" />
              <input type="file" accept="image/*" multiple onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
          {uploading && <p className="text-sm text-muted-foreground">Uploading...</p>}
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={saveMutation.isPending}>
            {saveMutation.isPending ? "Saving..." : isEdit ? "Update Project" : "Create Project"}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate("/admin")}>Cancel</Button>
        </div>
      </form>
    </div>
  );
};

export default AdminProjectForm;
