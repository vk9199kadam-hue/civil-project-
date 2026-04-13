import { Link, useLocation } from "react-router-dom";
import { Building2, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const links = [
    { to: "/", label: "Home" },
    { to: "/projects", label: "Projects" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-lg">
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold">
          <Building2 className="h-7 w-7 text-secondary" />
          <span>BuildEstate</span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`text-sm font-medium transition-colors hover:text-secondary ${
                location.pathname === l.to ? "text-secondary" : "text-primary-foreground/80"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link to="/admin">
            <Button size="sm" variant="secondary" className="font-semibold">
              Admin
            </Button>
          </Link>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-primary-foreground/10 pb-4">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="block px-6 py-3 text-sm hover:bg-primary-foreground/10"
            >
              {l.label}
            </Link>
          ))}
          <Link to="/admin" onClick={() => setOpen(false)} className="block px-6 py-3">
            <Button size="sm" variant="secondary" className="font-semibold">
              Admin
            </Button>
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
