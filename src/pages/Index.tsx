import { Link } from "react-router-dom";
import { Search, Building2, Home, Store, TreePine, Hammer, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ProjectCard from "@/components/ProjectCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

const propertyTypes = [
  { key: "all", label: "All", icon: Building2 },
  { key: "flat", label: "Apartments", icon: Building2 },
  { key: "villa", label: "Villas", icon: Home },
  { key: "commercial", label: "Commercial", icon: Store },
  { key: "land", label: "Land/Plot", icon: TreePine },
  { key: "builder_project", label: "New Projects", icon: Hammer },
];

const stats = [
  { value: "50+", label: "Projects Completed" },
  { value: "1200+", label: "Units Delivered" },
  { value: "15+", label: "Years Experience" },
  { value: "98%", label: "Happy Clients" },
];

const Index = () => {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const { data: projects = [] } = useQuery({
    queryKey: ["featured-projects"],
    queryFn: async () => {
      const { data } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(6);
      return data || [];
    },
  });

  const filtered = projects.filter((p) => {
    const matchType = filter === "all" || p.property_type === filter;
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative bg-primary text-primary-foreground py-20 md:py-32">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('/placeholder.svg')", backgroundSize: "cover" }} />
        <div className="container relative z-10 text-center">
          <h1 className="font-display text-4xl md:text-6xl font-bold mb-4">
            Find Your <span className="text-secondary">Dream Property</span>
          </h1>
          <p className="text-primary-foreground/70 max-w-2xl mx-auto mb-8 text-lg">
            Premium residential & commercial projects built with quality craftsmanship and modern design.
          </p>
          <div className="flex max-w-lg mx-auto gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or location..."
                className="pl-10 bg-background text-foreground"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Link to="/projects">
              <Button variant="secondary" className="font-semibold">Browse All</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-secondary/10 py-8">
        <div className="container grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="text-3xl font-display font-bold text-primary">{s.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Property Type Filters */}
      <section className="container py-12">
        <h2 className="font-display text-3xl font-bold text-center mb-8">Our Projects</h2>
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {propertyTypes.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                onClick={() => setFilter(t.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                  filter === t.key
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-card-foreground border-border hover:border-primary"
                }`}
              >
                <Icon className="h-4 w-4" />
                {t.label}
              </button>
            );
          })}
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-12">
            {projects.length === 0
              ? "No projects yet. Add your first project from the Admin panel!"
              : "No projects match your filter."}
          </p>
        )}

        <div className="text-center mt-8">
          <Link to="/projects">
            <Button variant="outline" className="gap-2">
              View All Projects <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
