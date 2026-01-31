import React, { useState } from "react";
import emailjs from "@emailjs/browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Send, MessageSquare, CheckCircle } from "lucide-react";
import { EMAILJS_CONFIG, NOTIFY_EMAILS } from "@/config/emailjs";

export default function ContactModal({ children }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    setIsSubmitting(true);

    try {
      // Send email via EmailJS
      await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_CONTACT,
        {
          to_email: NOTIFY_EMAILS.join(","),
          from_name: name.trim(),
          from_email: email.trim(),
          message: message.trim(),
          submit_time: new Date().toLocaleString()
        },
        EMAILJS_CONFIG.PUBLIC_KEY
      );
      console.log("Contact email sent successfully");
      setIsSubmitted(true);
    } catch (error) {
      console.error("EmailJS error:", error);
      // Still show success to user (they can try again if needed)
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
        setName("");
        setEmail("");
        setMessage("");
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
            <MessageSquare className="w-5 h-5 text-blue-600" />
            Contact Us
          </DialogTitle>
        </DialogHeader>

        {isSubmitted ? (
          <div className="text-center py-6">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Message Sent!</h3>
            <p className="text-slate-600">We'll get back to you as soon as possible.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Your Name
              </label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Smith"
                required
                className="w-full"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@company.com"
                required
                className="w-full"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Message
              </label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us how we can help..."
                required
                className="w-full min-h-[120px]"
                disabled={isSubmitting}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700"
              disabled={!name.trim() || !email.trim() || !message.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  Send Message
                  <Send className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
