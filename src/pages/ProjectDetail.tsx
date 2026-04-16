import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { statusLabels, typeLabels, statusColors } from "@/components/ProjectCard";
import { MapPin, Building, ChevronLeft, ChevronRight, Phone, Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

const unitStatusBadge: Record<string, string> = {
  available: "bg-success text-white",
  booked: "bg-secondary text-secondary-foreground",
  sold: "bg-destructive text-destructive-foreground",
};

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [imgIdx, setImgIdx] = useState(0);
  const [inquiryForm, setInquiryForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", id],
    queryFn: async () => {
      const res = await fetch(`/api/projects?id=${id}`);
      if (!res.ok) throw new Error("Project not found");
      return res.json();
    },
    enabled: !!id,
  });

  const { data: units = [] } = useQuery({
    queryKey: ["units", id],
    queryFn: async () => {
      const res = await fetch(`/api/units?project_id=${id}`);
      if (!res.ok) throw new Error("Failed to fetch units");
      return res.json();
    },
    enabled: !!id,
  });

  const handleInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryForm.name.trim() || !inquiryForm.phone.trim()) {
      toast({ title: "Please fill name and phone", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const res = await fetch("/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project_id: id,
        name: inquiryForm.name.trim(),
        phone: inquiryForm.phone.trim(),
        email: inquiryForm.email.trim() || null,
        message: inquiryForm.message.trim() || null,
      }),
    });
    setSubmitting(false);
    if (!res.ok) {
      toast({ title: "Failed to submit", variant: "destructive" });
    } else {
      toast({ title: "Inquiry submitted! We'll get back to you soon." });
      setInquiryForm({ name: "", phone: "", email: "", message: "" });
    }
  };

  if (isLoading) return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center text-muted-foreground">Loading...</div>
    </div>
  );

  if (!project) return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center text-muted-foreground">Project not found</div>
    </div>
  );

  const images = project.images?.length ? project.images : ["/placeholder.svg"];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Image Gallery */}
      <section className="bg-primary/5">
        <div className="container py-6">
          <div className="relative rounded-lg overflow-hidden h-64 md:h-96">
            <img src={images[imgIdx]} alt={project.name} className="w-full h-full object-cover" />
            {images.length > 1 && (
              <>
                <button
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 p-2 rounded-full"
                  onClick={() => setImgIdx((i) => (i - 1 + images.length) % images.length)}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 p-2 rounded-full"
                  onClick={() => setImgIdx((i) => (i + 1) % images.length)}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
            <Badge className={`absolute top-3 left-3 ${statusColors[project.status]}`}>
              {statusLabels[project.status]}
            </Badge>
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setImgIdx(i)}
                  className={`h-16 w-24 rounded overflow-hidden border-2 flex-shrink-0 ${
                    i === imgIdx ? "border-secondary" : "border-transparent"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="container py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Project Info */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h1 className="font-display text-3xl font-bold mb-2">{project.name}</h1>
            <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-sm">
              <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{project.location}</span>
              <span className="flex items-center gap-1"><Building className="h-4 w-4" />{typeLabels[project.property_type]}</span>
              {project.price_range && (
                <span className="text-lg font-semibold text-secondary">{project.price_range}</span>
              )}
            </div>
          </div>

          {project.description && (
            <div>
              <h2 className="font-display text-xl font-semibold mb-2">About This Project</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{project.description}</p>
            </div>
          )}

          {/* Units Table */}
          {units.length > 0 && (
            <div>
              <h2 className="font-display text-xl font-semibold mb-4">Available Units</h2>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Unit</TableHead>
                      <TableHead>Size (sq.ft)</TableHead>
                      <TableHead>BHK</TableHead>
                      <TableHead>Floor</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
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
                        <TableCell>
                          <Badge className={unitStatusBadge[u.status]}>
                            {u.status.charAt(0).toUpperCase() + u.status.slice(1)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>

        {/* Inquiry Form */}
        <div>
          <div className="border rounded-lg p-6 bg-card sticky top-20">
            <h3 className="font-display text-lg font-semibold mb-4">Interested? Get in Touch</h3>
            <form onSubmit={handleInquiry} className="space-y-3">
              <Input
                placeholder="Your Name *"
                value={inquiryForm.name}
                onChange={(e) => setInquiryForm((f) => ({ ...f, name: e.target.value }))}
                maxLength={100}
                required
              />
              <Input
                placeholder="Phone Number *"
                value={inquiryForm.phone}
                onChange={(e) => setInquiryForm((f) => ({ ...f, phone: e.target.value }))}
                maxLength={15}
                required
              />
              <Input
                placeholder="Email (optional)"
                type="email"
                value={inquiryForm.email}
                onChange={(e) => setInquiryForm((f) => ({ ...f, email: e.target.value }))}
                maxLength={255}
              />
              <Textarea
                placeholder="Message (optional)"
                rows={3}
                value={inquiryForm.message}
                onChange={(e) => setInquiryForm((f) => ({ ...f, message: e.target.value }))}
                maxLength={1000}
              />
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Sending..." : "Send Inquiry"}
              </Button>
            </form>
            <div className="mt-4 pt-4 border-t space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><Phone className="h-4 w-4" /> +91 98765 43210</div>
              <div className="flex items-center gap-2"><Mail className="h-4 w-4" /> info@buildestate.com</div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ProjectDetail;
