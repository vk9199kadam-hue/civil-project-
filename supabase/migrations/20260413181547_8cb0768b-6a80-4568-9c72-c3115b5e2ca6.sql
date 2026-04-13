
CREATE TYPE public.property_type AS ENUM ('flat', 'villa', 'commercial', 'land', 'builder_project');
CREATE TYPE public.project_status AS ENUM ('new_launch', 'under_construction', 'ready_to_move');
CREATE TYPE public.unit_status AS ENUM ('available', 'booked', 'sold');

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT,
  property_type public.property_type NOT NULL DEFAULT 'flat',
  status public.project_status NOT NULL DEFAULT 'new_launch',
  price_range TEXT,
  featured BOOLEAN NOT NULL DEFAULT false,
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Auth users can insert projects" ON public.projects FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth users can update projects" ON public.projects FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth users can delete projects" ON public.projects FOR DELETE TO authenticated USING (true);
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.units (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  unit_number TEXT NOT NULL,
  size_sqft NUMERIC,
  bhk_type TEXT,
  price NUMERIC,
  floor INTEGER,
  status public.unit_status NOT NULL DEFAULT 'available',
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view units" ON public.units FOR SELECT USING (true);
CREATE POLICY "Auth users can insert units" ON public.units FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth users can update units" ON public.units FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth users can delete units" ON public.units FOR DELETE TO authenticated USING (true);
CREATE TRIGGER update_units_updated_at BEFORE UPDATE ON public.units FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.inquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit inquiries" ON public.inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Auth users can view inquiries" ON public.inquiries FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth users can delete inquiries" ON public.inquiries FOR DELETE TO authenticated USING (true);

INSERT INTO storage.buckets (id, name, public) VALUES ('property-photos', 'property-photos', true);
CREATE POLICY "Anyone can view property photos" ON storage.objects FOR SELECT USING (bucket_id = 'property-photos');
CREATE POLICY "Auth users can upload property photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'property-photos');
CREATE POLICY "Auth users can update property photos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'property-photos');
CREATE POLICY "Auth users can delete property photos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'property-photos');
