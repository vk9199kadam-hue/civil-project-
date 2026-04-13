import { Link } from "react-router-dom";
import { MapPin, Building } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tables } from "@/integrations/supabase/types";

const statusLabels: Record<string, string> = {
  new_launch: "New Launch",
  under_construction: "Under Construction",
  ready_to_move: "Ready to Move",
};

const typeLabels: Record<string, string> = {
  flat: "Flat / Apartment",
  villa: "Villa / House",
  commercial: "Commercial",
  land: "Land / Plot",
  builder_project: "Builder Project",
};

const statusColors: Record<string, string> = {
  new_launch: "bg-info text-white",
  under_construction: "bg-secondary text-secondary-foreground",
  ready_to_move: "bg-success text-white",
};

type Project = Tables<"projects">;

const ProjectCard = ({ project }: { project: Project }) => {
  const image = project.images?.[0] || "/placeholder.svg";

  return (
    <Link to={`/projects/${project.id}`} className="group block">
      <div className="rounded-lg border bg-card overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
        <div className="relative h-48 overflow-hidden">
          <img
            src={image}
            alt={project.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <Badge className={`absolute top-3 left-3 ${statusColors[project.status] || ""}`}>
            {statusLabels[project.status]}
          </Badge>
        </div>
        <div className="p-4">
          <h3 className="font-display text-lg font-semibold text-card-foreground mb-1 group-hover:text-secondary transition-colors">
            {project.name}
          </h3>
          <div className="flex items-center gap-1 text-muted-foreground text-sm mb-2">
            <MapPin className="h-3.5 w-3.5" />
            {project.location}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Building className="h-3.5 w-3.5" />
              {typeLabels[project.property_type]}
            </div>
            {project.price_range && (
              <span className="text-sm font-semibold text-secondary">{project.price_range}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export { statusLabels, typeLabels, statusColors };
export default ProjectCard;
