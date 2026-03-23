import React, { useState } from "react";
import { toast } from "sonner";
import emailjs from "@emailjs/browser";

const EMAILJS_CONFIG = {
  PUBLIC_KEY: "rk-cyWGZuT7hvm5SY",
  SERVICE_ID: "flowtracker_service",
  TEMPLATE_ID: "template_c5dohuh",
};

// Initialize EmailJS
emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const templateParams = {
        from_name: name,
        from_email: email,
        message: message,
        type: "contact",
        subject: `📬 New Contact Message from ${name} — FlowTracker`,
      };

      const response = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        templateParams
      );

      console.log("EmailJS Success:", response.status, response.text);
      toast.success("Message sent! We'll get back to you soon.");
      setName("");
      setEmail("");
      setMessage("");
    } catch (e) {
      console.error("EmailJS Error:", e);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 shadow-sm">
      <h3 className="text-xl font-bold text-[var(--text)] mb-4 flex items-center gap-2">
        <span className="text-2xl">📬</span> Contact Us
      </h3>
      <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1.5 ml-1">
            Your Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your Name"
            className="w-full px-4 py-2.5 border border-[var(--border)] rounded-xl text-sm bg-[var(--bg)] text-[var(--text)] focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-20 focus:border-[var(--primary)] outline-none transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1.5 ml-1">
            Your Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="someone@example.com"
            className="w-full px-4 py-2.5 border border-[var(--border)] rounded-xl text-sm bg-[var(--bg)] text-[var(--text)] focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-20 focus:border-[var(--primary)] outline-none transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1.5 ml-1">
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="How can we help?"
            rows={4}
            className="w-full px-4 py-2.5 border border-[var(--border)] rounded-xl text-sm bg-[var(--bg)] text-[var(--text)] focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-20 focus:border-[var(--primary)] outline-none resize-none transition-all"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[var(--primary)] text-white py-3 rounded-xl font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100 shadow-lg shadow-[var(--primary)]/20"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Sending...
            </div>
          ) : (
            "Send Message"
          )}
        </button>
      </form>
    </div>
  );
}

export function ReviewForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !review || rating === 0) {
      toast.error("Please complete all fields and select a rating");
      return;
    }
    setLoading(true);
    try {
      const templateParams = {
        from_name: name,
        from_email: email,
        message: review,
        type: "review",
        rating: rating,
        stars: "⭐".repeat(rating),
        subject: `⭐ New Review from ${name} (${rating}/5) — FlowTracker`,
      };

      const response = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        templateParams
      );

      console.log("EmailJS Success:", response.status, response.text);
      toast.success("Thank you! Your review means a lot to us.");
      setName("");
      setEmail("");
      setRating(0);
      setReview("");
    } catch (e) {
      console.error("EmailJS Error:", e);
      toast.error("Failed to submit review. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 shadow-sm">
      <h3 className="text-xl font-bold text-[var(--text)] mb-4 flex items-center gap-2">
        <span className="text-2xl">⭐</span> Leave a Review
      </h3>
      <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1.5 ml-1">
            Your Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your Name"
            className="w-full px-4 py-2.5 border border-[var(--border)] rounded-xl text-sm bg-[var(--bg)] text-[var(--text)] focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-20 focus:border-[var(--primary)] outline-none transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1.5 ml-1">
            Your Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="someone@example.com"
            className="w-full px-4 py-2.5 border border-[var(--border)] rounded-xl text-sm bg-[var(--bg)] text-[var(--text)] focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-20 focus:border-[var(--primary)] outline-none transition-all"
          />
        </div>
        
        <div>
          <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-2 ml-1">
            Rating
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`text-3xl transition-all hover:scale-110 active:scale-95 ${
                  star <= rating ? "text-amber-500 drop-shadow-sm" : "text-[var(--border)]"
                }`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1.5 ml-1">
            Review
          </label>
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Tell us what you think..."
            rows={4}
            className="w-full px-4 py-2.5 border border-[var(--border)] rounded-xl text-sm bg-[var(--bg)] text-[var(--text)] focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-20 focus:border-[var(--primary)] outline-none resize-none transition-all"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[var(--primary)] text-white py-3 rounded-xl font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100 shadow-lg shadow-[var(--primary)]/20"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Submitting...
            </div>
          ) : (
            "Submit Review"
          )}
        </button>
      </form>
    </div>
  );
}

export function FeedbackForms() {
  const [activeTab, setActiveTab] = useState<"contact" | "review">("contact");

  return (
    <div className="mt-12 space-y-6">
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="text-xl font-bold text-[var(--text)]">Feedback & Support</h3>
          <p className="text-sm text-[var(--text-muted)] font-medium">We'd love to hear from you</p>
        </div>
        <div className="flex p-1 bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-sm">
          <button
            onClick={() => setActiveTab("contact")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "contact"
                ? "bg-[var(--primary)] text-white shadow-md"
                : "text-[var(--text-muted)] hover:text-[var(--text)]"
            }`}
          >
            Contact
          </button>
          <button
            onClick={() => setActiveTab("review")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "review"
                ? "bg-[var(--primary)] text-white shadow-md"
                : "text-[var(--text-muted)] hover:text-[var(--text)]"
            }`}
          >
            Review
          </button>
        </div>
      </div>

      <div className="animate-fade-in">
        {activeTab === "contact" ? <ContactForm /> : <ReviewForm />}
      </div>
    </div>
  );
}
