import React, { useState } from "react";
import emailjs from "@emailjs/browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Waitlist } from "@/api/entities";
import { ArrowRight, Mail, CheckCircle, Building2, CreditCard, User } from "lucide-react";
import { EMAILJS_CONFIG, NOTIFY_EMAILS } from "@/config/emailjs";

const userTypes = [
  { id: "merchant", label: "Merchant", icon: Building2, description: "I sell products/services" },
  { id: "card_issuer", label: "Card Issuer", icon: CreditCard, description: "I issue payment cards" },
  { id: "consumer", label: "Consumer", icon: User, description: "I want to track my purchases" },
];

export default function WaitlistModal({ children }) {
  const [email, setEmail] = useState("");
  const [userType, setUserType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !userType) return;

    setIsSubmitting(true);
    const userTypeLabel = userTypes.find(t => t.id === userType)?.label || userType;

    try {
      // Store in Base44 Waitlist entity
      try {
        await Waitlist.create({
          email: email.trim(),
          source: "website",
          status: "pending",
          user_type: userTypeLabel
        });
      } catch (err) {
        console.log("Waitlist entity save skipped:", err);
      }

      // Send email notification via EmailJS
      try {
        await emailjs.send(
          EMAILJS_CONFIG.SERVICE_ID,
          EMAILJS_CONFIG.TEMPLATE_WAITLIST,
          {
            to_email: NOTIFY_EMAILS.join(","),
            from_email: email.trim(),
            user_type: userTypeLabel,
            signup_time: new Date().toLocaleString(),
            message: `New waitlist signup!\n\nEmail: ${email.trim()}\nUser Type: ${userTypeLabel}`
          },
          EMAILJS_CONFIG.PUBLIC_KEY
        );
        console.log("Email sent successfully");
      } catch (emailError) {
        console.log("EmailJS error:", emailError);
        // Continue anyway - data is saved in entity
      }

      setIsSubmitted(true);
    } catch (error) {
      console.error("Submission error:", error);
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Close modal after showing success
  React.useEffect(() => {
    if (isSubmitted) {
      const timer = setTimeout(() => {
        setIsOpen(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isSubmitted]);

  const handleOpenChange = (open) => {
    setIsOpen(open);
    if (!open) {
      setTimeout(() => {
        setEmail("");
        setUserType("");
        setIsSubmitted(false);
        setIsSubmitting(false);
      }, 200);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-600" />
            Join the ItemIQ Waitlist
          </DialogTitle>
        </DialogHeader>

        {isSubmitted ? (
          <div className="text-center py-6">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">You're on the list!</h3>
            <p className="text-slate-600">We'll be in touch soon with updates on ItemIQ.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                I am a...
              </label>
              <div className="grid grid-cols-1 gap-2">
                {userTypes.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setUserType(type.id)}
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                      userType === type.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <type.icon className={`w-5 h-5 ${userType === type.id ? "text-blue-600" : "text-slate-400"}`} />
                    <div>
                      <div className={`font-medium ${userType === type.id ? "text-blue-900" : "text-slate-700"}`}>
                        {type.label}
                      </div>
                      <div className="text-xs text-slate-500">{type.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@company.com"
                required
                className="w-full"
                disabled={isSubmitting}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700"
              disabled={!email.trim() || !userType || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Joining Waitlist...
                </>
              ) : (
                <>
                  Join Waitlist
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
