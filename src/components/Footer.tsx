import { Building2, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="bg-primary text-primary-foreground/80 pt-12 pb-6">
    <div className="container grid grid-cols-1 md:grid-cols-3 gap-8">
      <div>
        <div className="flex items-center gap-2 font-display text-xl font-bold text-primary-foreground mb-4">
          <Building2 className="h-6 w-6 text-secondary" />
          BuildEstate
        </div>
        <p className="text-sm leading-relaxed">
          Building quality homes and commercial spaces with trust, transparency, and craftsmanship since 2010.
        </p>
      </div>
      <div>
        <h4 className="font-display text-lg text-primary-foreground mb-4">Quick Links</h4>
        <div className="flex flex-col gap-2 text-sm">
          <Link to="/" className="hover:text-secondary transition-colors">Home</Link>
          <Link to="/projects" className="hover:text-secondary transition-colors">All Projects</Link>
          <Link to="/contact" className="hover:text-secondary transition-colors">Contact Us</Link>
        </div>
      </div>
      <div>
        <h4 className="font-display text-lg text-primary-foreground mb-4">Contact</h4>
        <div className="flex flex-col gap-3 text-sm">
          <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-secondary" /> +91 98765 43210</div>
          <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-secondary" /> info@buildestate.com</div>
          <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-secondary" /> Mumbai, Maharashtra</div>
        </div>
      </div>
    </div>
    <div className="container mt-8 pt-6 border-t border-primary-foreground/10 text-center text-xs">
      © {new Date().getFullYear()} BuildEstate. All rights reserved.
    </div>
  </footer>
);

export default Footer;
