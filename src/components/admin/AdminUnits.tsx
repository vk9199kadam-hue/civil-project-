import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import { useState } from "react";
import type { Database } from "@/integrations/supabase/types";

type UnitStatus = Database["public"]["Enums"]["unit_status"];

const AdminUnits = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const qc = useQueryClient();

  const [newUnit, setNewUnit] = useState({
    unit_number: "",
    size_sqft: "",
    bhk_type: "",
    price: "",
    floor: "",
    status: "available" as UnitStatus,
  });

  const { data: project } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const res = await fetch(`/api/projects?id=${projectId}`);
      if (!res.ok) throw new Error("Failed to fetch project");
      const data = await res.json();
      return data;
    },
    enabled: !!projectId,
  });

  const { data: units = [], isLoading } = useQuery({
    queryKey: ["admin-units", projectId],
    queryFn: async () => {
      const res = await fetch(`/api/units?project_id=${projectId}`);
      if (!res.ok) throw new Error("Failed to fetch units");
      return res.json();
    },
    enabled: !!projectId,
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        project_id: projectId!,
        unit_number: newUnit.unit_number.trim(),
        size_sqft: newUnit.size_sqft ? Number(newUnit.size_sqft) : null,
        bhk_type: newUnit.bhk_type || null,
        price: newUnit.price ? Number(newUnit.price) : null,
        floor: newUnit.floor ? Number(newUnit.floor) : null,
        status: newUnit.status,
      };
      const res = await fetch("/api/units", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to add unit");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-units", projectId] });
      setNewUnit({ unit_number: "", size_sqft: "", bhk_type: "", price: "", floor: "", status: "available" });
      toast({ title: "Unit added" });
    },
    onError: () => toast({ title: "Failed to add unit", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/units?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-units", projectId] });
      toast({ title: "Unit deleted" });
    },
  });

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="font-display text-2xl font-bold">Units — {project?.name || "..."}</h1>
      </div>

      {/* Add Unit Form */}
      <div className="bg-card border rounded-lg p-4 mb-6">
        <h3 className="font-semibold mb-3">Add New Unit</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Input placeholder="Unit # *" value={newUnit.unit_number} onChange={(e) => setNewUnit(u => ({ ...u, unit_number: e.target.value }))} />
          <Input placeholder="Size (sq.ft)" type="number" value={newUnit.size_sqft} onChange={(e) => setNewUnit(u => ({ ...u, size_sqft: e.target.value }))} />
          <Input placeholder="BHK Type" value={newUnit.bhk_type} onChange={(e) => setNewUnit(u => ({ ...u, bhk_type: e.target.value }))} />
          <Input placeholder="Price (₹)" type="number" value={newUnit.price} onChange={(e) => setNewUnit(u => ({ ...u, price: e.target.value }))} />
          <Input placeholder="Floor" type="number" value={newUnit.floor} onChange={(e) => setNewUnit(u => ({ ...u, floor: e.target.value }))} />
          <Select value={newUnit.status} onValueChange={(v) => setNewUnit(u => ({ ...u, status: v as UnitStatus }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="booked">Booked</SelectItem>
              <SelectItem value="sold">Sold</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          className="mt-3 gap-1"
          size="sm"
          disabled={!newUnit.unit_number.trim() || addMutation.isPending}
          onClick={() => addMutation.mutate()}
        >
          <Plus className="h-4 w-4" /> Add Unit
        </Button>
      </div>

      {/* Units Table */}
      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : units.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No units yet. Add your first unit above.</p>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Unit</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>BHK</TableHead>
                <TableHead>Floor</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {units.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.unit_number}</TableCell>
                  <TableCell>{u.size_sqft || "—"}</TableCell>
                  <TableCell>{u.bhk_type || "—"}</TableCell>
                  <TableCell>{u.floor ?? "—"}</TableCell>
                  <TableCell>{u.price ? `₹${Number(u.price).toLocaleString("en-IN")}` : "—"}</TableCell>
                  <TableCell><Badge variant="outline">{u.status}</Badge></TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { if (confirm("Delete this unit?")) deleteMutation.mutate(u.id); }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default AdminUnits;
