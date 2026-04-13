import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, MapPin } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const Contact = () => {
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      toast({ title: "Please fill name and phone", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("inquiries").insert({
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || null,
      message: form.message.trim() || null,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Failed to submit", variant: "destructive" });
    } else {
      toast({ title: "Message sent successfully!" });
      setForm({ name: "", phone: "", email: "", message: "" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <section className="bg-primary text-primary-foreground py-12">
        <div className="container">
          <h1 className="font-display text-3xl md:text-4xl font-bold">Contact Us</h1>
          <p className="text-primary-foreground/70 mt-2">We'd love to hear from you</p>
        </div>
      </section>

      <section className="container py-12 grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <h2 className="font-display text-2xl font-bold mb-6">Get In Touch</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input placeholder="Your Name *" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} maxLength={100} required />
            <Input placeholder="Phone *" value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} maxLength={15} required />
            <Input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} maxLength={255} />
            <Textarea placeholder="Your Message" rows={5} value={form.message} onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))} maxLength={1000} />
            <Button type="submit" className="w-full" disabled={submitting}>{submitting ? "Sending..." : "Send Message"}</Button>
          </form>
        </div>
        <div className="space-y-6">
          <h2 className="font-display text-2xl font-bold mb-6">Contact Information</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3"><Phone className="h-5 w-5 text-secondary mt-0.5" /><div><p className="font-medium">Phone</p><p className="text-muted-foreground">+91 98765 43210</p></div></div>
            <div className="flex items-start gap-3"><Mail className="h-5 w-5 text-secondary mt-0.5" /><div><p className="font-medium">Email</p><p className="text-muted-foreground">info@buildestate.com</p></div></div>
            <div className="flex items-start gap-3"><MapPin className="h-5 w-5 text-secondary mt-0.5" /><div><p className="font-medium">Office</p><p className="text-muted-foreground">123 Builder Lane, Andheri West<br />Mumbai, Maharashtra 400058</p></div></div>
          </div>
        </div>
      </section>
      <div className="flex-1" />
      <Footer />
    </div>
  );
};

export default Contact;
