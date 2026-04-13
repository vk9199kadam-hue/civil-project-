import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProjectCard from "@/components/ProjectCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

const Projects = () => {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: projects = [] } = useQuery({
    queryKey: ["all-projects"],
    queryFn: async () => {
      const { data } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const filtered = projects.filter((p) => {
    const matchType = typeFilter === "all" || p.property_type === typeFilter;
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase());
    return matchType && matchStatus && matchSearch;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <section className="bg-primary text-primary-foreground py-12">
        <div className="container">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">All Projects</h1>
          <p className="text-primary-foreground/70">Browse our complete portfolio of properties</p>
        </div>
      </section>

      <section className="container py-8">
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Property Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="flat">Flat / Apartment</SelectItem>
              <SelectItem value="villa">Villa / House</SelectItem>
              <SelectItem value="commercial">Commercial</SelectItem>
              <SelectItem value="land">Land / Plot</SelectItem>
              <SelectItem value="builder_project">Builder Project</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="new_launch">New Launch</SelectItem>
              <SelectItem value="under_construction">Under Construction</SelectItem>
              <SelectItem value="ready_to_move">Ready to Move</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-16">No projects found.</p>
        )}
      </section>
      <div className="flex-1" />
      <Footer />
    </div>
  );
};

export default Projects;
