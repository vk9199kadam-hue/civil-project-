import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const LeadPopup = () => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Check if user has already submitted or closed the popup in this session
    const shown = sessionStorage.getItem("lead_popup_shown");
    if (shown) return;

    const timer = setTimeout(() => {
      setOpen(true);
    }, 30000); // 30 seconds

    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    setLoading(true);
    const res = await fetch("/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        phone,
        message: "Lead generation popup (30s interest)",
      }),
    });

    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      toast({ title: "Submisson failed", description: data.error, variant: "destructive" });
    } else {
      setSubmitted(true);
      sessionStorage.setItem("lead_popup_shown", "true");
      toast({ title: "Registration Successful", description: "We will keep you updated!" });
      setTimeout(() => setOpen(false), 2000);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      sessionStorage.setItem("lead_popup_shown", "true");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-primary">Stay Updated!</DialogTitle>
          <DialogDescription>
            Get the latest updates on our civil engineering projects and new property launches.
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="py-6 text-center text-green-600 font-medium font-display text-lg">
            Thank you! We'll be in touch soon.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="lead-name">Name</Label>
              <Input
                id="lead-name"
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lead-phone">Phone Number</Label>
              <Input
                id="lead-phone"
                type="tel"
                placeholder="Your Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Registering..." : "Get Updates"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LeadPopup;
