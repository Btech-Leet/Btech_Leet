"use client";

import { useState } from "react";
import { Mail, Send, Loader2, CheckCircle2, MessageSquare, Phone, MapPin } from "lucide-react";
import { useToast } from "@/components/ui/toaster";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      toast({
        title: "Required Fields",
        description: "Please fill out all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (message.trim().length < 10) {
      toast({
        title: "Message Too Short",
        description: "Your message must be at least 10 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          mobile: mobile.trim() || null,
          subject: subject.trim(),
          message: message.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send message");
      }

      setIsSubmitted(true);
      toast({
        title: "Message Sent",
        description: "Thank you! Your inquiry has been received.",
      });
    } catch (err: any) {
      toast({
        title: "Submission Error",
        description: err.message || "Something went wrong sending your message.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 pb-20">
      {/* Premium Header */}
      <div className="relative py-16 sm:py-24 overflow-hidden bg-slate-900 dark:bg-slate-950">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] -z-10"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] -z-10"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 mb-6">
            <MessageSquare size={14} className="text-blue-400" />
            <span className="text-sm font-bold text-white tracking-wide uppercase">Get in Touch</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
            Contact <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Our Team</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Have questions about exams, counselling, premium notes, or mock tests? Send us a message and we will respond as soon as possible.
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Info Column */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
                Contact Details
              </h2>

              <div className="space-y-8">
                {/* Email */}
                <div className="flex gap-4 items-start group">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <Mail size={22} />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Email Address</h4>
                    <p className="text-base font-bold text-slate-900 dark:text-white">contact@btechleet.com</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Expect a response within 24 hours</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex gap-4 items-start group">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <Phone size={22} />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Support Line</h4>
                    <p className="text-base font-bold text-slate-900 dark:text-white">+91 98765 43210</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Mon-Fri from 9am to 6pm</p>
                  </div>
                </div>

                {/* Office */}
                <div className="flex gap-4 items-start group">
                  <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <MapPin size={22} />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Head Office</h4>
                    <p className="text-base font-bold text-slate-900 dark:text-white">New Delhi, India</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">BTech LEET Education Center</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Column */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] overflow-hidden relative">
              {isSubmitted ? (
                <div className="p-12 text-center flex flex-col items-center justify-center min-h-[500px]">
                  <div className="w-24 h-24 bg-green-50 dark:bg-green-500/10 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="text-green-500 animate-bounce" size={48} />
                  </div>
                  <h3 className="font-black text-slate-900 dark:text-white text-3xl mb-4">Inquiry Submitted!</h3>
                  <p className="text-lg text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8">
                    Thank you, <strong className="text-slate-900 dark:text-white">{name}</strong>. Your message was delivered successfully. Our representative will contact you at <strong className="text-slate-900 dark:text-white">{email}</strong> shortly.
                  </p>
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setName("");
                      setEmail("");
                      setMobile("");
                      setSubject("");
                      setMessage("");
                    }}
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-slate-900 dark:bg-white hover:bg-blue-600 dark:hover:bg-blue-500 text-white dark:text-slate-900 hover:text-white font-bold text-sm transition-all shadow-md hover:shadow-lg active:scale-95"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-8 sm:p-10 space-y-6">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    Send a Message
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">
                    Fill out the form below and we'll get back to you as soon as possible.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Name */}
                    <div className="space-y-2">
                      <label htmlFor="contact-name" className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name"
                        disabled={isLoading}
                        className="w-full text-sm px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <label htmlFor="contact-email" className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        disabled={isLoading}
                        className="w-full text-sm px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Mobile */}
                    <div className="space-y-2">
                      <label htmlFor="contact-mobile" className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                        Mobile Number (Optional)
                      </label>
                      <input
                        id="contact-mobile"
                        type="tel"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        placeholder="+91 XXXXX XXXXX"
                        disabled={isLoading}
                        className="w-full text-sm px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                      />
                    </div>

                    {/* Subject */}
                    <div className="space-y-2">
                      <label htmlFor="contact-subject" className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                        Subject <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="contact-subject"
                        type="text"
                        required
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="How can we help you?"
                        disabled={isLoading}
                        className="w-full text-sm px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                      />
                    </div>
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <label htmlFor="contact-message" className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                      Message <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      id="contact-message"
                      required
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Describe your inquiry or question in detail..."
                      disabled={isLoading}
                      className="w-full text-sm px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium resize-none"
                    />
                  </div>

                  {/* Submit */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-slate-900 dark:bg-white hover:bg-blue-600 dark:hover:bg-blue-500 text-white dark:text-slate-900 hover:text-white font-bold text-sm transition-all shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-900 disabled:hover:text-white disabled:dark:hover:bg-white disabled:dark:hover:text-slate-900"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 size={18} className="animate-spin" /> Sending Message...
                        </>
                      ) : (
                        <>
                          <Send size={18} /> Send Message
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
