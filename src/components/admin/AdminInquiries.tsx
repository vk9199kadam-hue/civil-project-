import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const AdminInquiries = () => {
  const qc = useQueryClient();

  const { data: inquiries = [], isLoading } = useQuery({
    queryKey: ["admin-inquiries"],
    queryFn: async () => {
      const res = await fetch("/api/inquiries");
      if (!res.ok) throw new Error("Failed to fetch inquiries");
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/inquiries?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-inquiries"] });
      toast({ title: "Inquiry deleted" });
    },
  });

  if (isLoading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-6">Inquiries</h1>
      {inquiries.length === 0 ? (
        <p className="text-muted-foreground text-center py-16">No inquiries yet.</p>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Date</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inquiries.map((inq: any) => (
                <TableRow key={inq.id}>
                  <TableCell className="font-medium">{inq.name}</TableCell>
                  <TableCell>{inq.phone}</TableCell>
                  <TableCell>{inq.email || "—"}</TableCell>
                  <TableCell>{inq.projects?.name || "General"}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{inq.message || "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(inq.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(inq.id)}>
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

export default AdminInquiries;
