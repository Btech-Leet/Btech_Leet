"use client";

import { useEffect, useState, useRef } from "react";
import { Mail, Plus, Edit2, Trash2, Loader2, Save, X, Eye, FileText, Send, Upload, Check, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/toaster";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  active: boolean;
  createdAt: string;
}

interface EmailCampaign {
  id: string;
  subject: string;
  content: string;
  templateId: string | null;
  recipientType: "ALL" | "CSV" | "MANUAL" | "SELECTED";
  recipientCount: number;
  sentCount: number;
  failedCount: number;
  status: "DRAFT" | "SENDING" | "SENT" | "FAILED";
  sentAt: string | null;
  createdAt: string;
}

export default function AdminEmailMarketingPage() {
  const [activeTab, setActiveTab] = useState<"campaigns" | "templates">("campaigns");
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Template Form State
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState("");
  const [templateSubject, setTemplateSubject] = useState("");
  const [templateContent, setTemplateContent] = useState("");
  const [previewTemplateMode, setPreviewTemplateMode] = useState<"edit" | "preview">("edit");

  // Campaign Form State
  const [editingCampaignId, setEditingCampaignId] = useState<string | null>(null);
  const [campaignSubject, setCampaignSubject] = useState("");
  const [campaignContent, setCampaignContent] = useState("");
  const [campaignTemplateId, setCampaignTemplateId] = useState("");
  const [recipientType, setRecipientType] = useState<"ALL" | "CSV" | "MANUAL">("ALL");
  const [manualEmails, setManualEmails] = useState("");
  const [csvEmails, setCsvEmails] = useState<string[]>([]);
  const [uploadedFilename, setUploadedFilename] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [previewCampaignMode, setPreviewCampaignMode] = useState<"edit" | "preview">("edit");

  const csvInputRef = useRef<HTMLInputElement>(null);

  const fetchTemplates = async () => {
    try {
      const res = await fetch("/api/admin/email-templates");
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.success) setTemplates(data.data || []);
    } catch {
      console.error("Failed to load templates");
    }
  };

  const fetchCampaigns = async () => {
    try {
      const res = await fetch("/api/admin/email-campaigns");
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.success) setCampaigns(data.data || []);
    } catch {
      console.error("Failed to load campaigns");
    }
  };

  const initPage = async () => {
    setIsLoading(true);
    await Promise.all([fetchTemplates(), fetchCampaigns()]);
    setIsLoading(false);
  };

  useEffect(() => {
    initPage();
  }, []);

  // Handle Load template content into campaign creator
  const handleSelectCampaignTemplate = (tId: string) => {
    setCampaignTemplateId(tId);
    if (!tId) return;
    const selected = templates.find((t) => t.id === tId);
    if (selected) {
      setCampaignSubject(selected.subject);
      setCampaignContent(selected.content);
    }
  };

  // Upload CSV
  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setCsvEmails([]);
    setUploadedFilename("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/email-campaigns/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");

      setCsvEmails(data.data.emails || []);
      setUploadedFilename(data.data.filename);
      toast({
        title: "CSV Uploaded",
        description: `Found ${data.data.count} unique emails in ${data.data.filename}.`,
      });
    } catch (err: any) {
      toast({
        title: "Upload Failed",
        description: err.message || "Failed to process file.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Create or Edit Template
  const handleSubmitTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateName.trim() || !templateSubject.trim() || !templateContent.trim()) {
      toast({ title: "Validation Error", description: "All fields are required.", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      const url = editingTemplateId ? `/api/admin/email-templates/${editingTemplateId}` : "/api/admin/email-templates";
      const method = editingTemplateId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: templateName.trim(),
          subject: templateSubject.trim(),
          content: templateContent.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save template");

      toast({ title: "Success", description: "Email template saved successfully." });
      setEditingTemplateId(null);
      setTemplateName("");
      setTemplateSubject("");
      setTemplateContent("");
      setPreviewTemplateMode("edit");
      fetchTemplates();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartEditTemplate = (t: EmailTemplate) => {
    setEditingTemplateId(t.id);
    setTemplateName(t.name);
    setTemplateSubject(t.subject);
    setTemplateContent(t.content);
    setPreviewTemplateMode("edit");
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;
    try {
      const res = await fetch(`/api/admin/email-templates/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setTemplates(templates.filter((t) => t.id !== id));
      toast({ title: "Deleted", description: "Template deleted successfully." });
    } catch {
      toast({ title: "Error", description: "Failed to delete template.", variant: "destructive" });
    }
  };

  // Create or Edit Campaign
  const handleSubmitCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignSubject.trim() || !campaignContent.trim()) {
      toast({ title: "Validation Error", description: "Subject and Content are required.", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      const url = editingCampaignId ? `/api/admin/email-campaigns/${editingCampaignId}` : "/api/admin/email-campaigns";
      const method = editingCampaignId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: campaignSubject.trim(),
          content: campaignContent.trim(),
          templateId: campaignTemplateId || null,
          recipientType,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save campaign");

      toast({ title: "Success", description: "Campaign draft saved successfully." });
      handleResetCampaignForm();
      fetchCampaigns();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetCampaignForm = () => {
    setEditingCampaignId(null);
    setCampaignSubject("");
    setCampaignContent("");
    setCampaignTemplateId("");
    setRecipientType("ALL");
    setManualEmails("");
    setCsvEmails([]);
    setUploadedFilename("");
    setPreviewCampaignMode("edit");
    if (csvInputRef.current) csvInputRef.current.value = "";
  };

  const handleStartEditCampaign = (c: EmailCampaign) => {
    setEditingCampaignId(c.id);
    setCampaignSubject(c.subject);
    setCampaignContent(c.content);
    setCampaignTemplateId(c.templateId || "");
    setRecipientType(c.recipientType as any);
    setManualEmails("");
    setCsvEmails([]);
    setUploadedFilename("");
    setPreviewCampaignMode("edit");
  };

  const handleTriggerSendCampaign = async (c: EmailCampaign) => {
    let targetList: string[] = [];

    if (c.recipientType === "MANUAL") {
      const input = prompt("Please confirm or input the manual email addresses (comma separated):", manualEmails);
      if (input === null) return;
      targetList = input.split(",").map((email) => email.trim()).filter((email) => email.length > 0);
      if (targetList.length === 0) {
        toast({ title: "Required Recipients", description: "At least one manual recipient is required.", variant: "destructive" });
        return;
      }
    } else if (c.recipientType === "CSV") {
      if (csvEmails.length === 0) {
        toast({ title: "CSV Required", description: "Please upload a CSV file on the campaign editor first.", variant: "destructive" });
        return;
      }
      targetList = csvEmails;
    }

    if (!confirm(`Are you sure you want to send this campaign to ${c.recipientType === "ALL" ? "All Users & Subscribers" : `${targetList.length} recipient(s)`}?`)) {
      return;
    }

    setIsSaving(true);
    // Optimistically set local status to SENDING
    setCampaigns(campaigns.map((camp) => (camp.id === c.id ? { ...camp, status: "SENDING" } : camp)));

    try {
      const res = await fetch(`/api/admin/email-campaigns/${c.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          send: true,
          recipients: targetList,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to trigger send");

      toast({
        title: "Campaign Completed",
        description: data.message || "Campaign sent successfully.",
      });

      fetchCampaigns();
    } catch (err: any) {
      toast({
        title: "Sending Failed",
        description: err.message || "Failed to trigger send.",
        variant: "destructive",
      });
      fetchCampaigns();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!confirm("Are you sure you want to delete this campaign?")) return;
    try {
      const res = await fetch(`/api/admin/email-campaigns/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setCampaigns(campaigns.filter((c) => c.id !== id));
      toast({ title: "Deleted", description: "Campaign deleted successfully." });
    } catch {
      toast({ title: "Error", description: "Failed to delete campaign.", variant: "destructive" });
    }
  };

  const campaignStatusColors = {
    DRAFT: "bg-gray-100 text-gray-800 dark:bg-slate-50 dark:bg-slate-950/30 dark:text-slate-500 dark:text-slate-400 border-gray-200 dark:border-gray-900/20",
    SENDING: "bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400 border-blue-200 dark:border-blue-900/20 animate-pulse",
    SENT: "bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-400 border-green-200 dark:border-green-900/20",
    FAILED: "bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400 border-red-200 dark:border-red-900/20",
  };

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 dark:border-slate-200 dark:border-slate-800 pb-5">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-slate-900 dark:text-white flex items-center gap-2">
            <Mail className="text-blue-500" size={24} />
            Email Marketing
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-500 dark:text-slate-500 dark:text-slate-400">
            Build responsive HTML newsletters, configure custom templates, and fire bulk email campaigns to subscribers.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex rounded-xl bg-gray-100 dark:bg-white dark:bg-slate-900 p-1 border border-gray-200 dark:border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab("campaigns")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "campaigns"
                ? "bg-white dark:bg-slate-50 dark:bg-slate-800 text-gray-950 dark:text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 dark:text-slate-500 hover:text-gray-900 dark:hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            Campaigns
          </button>
          <button
            onClick={() => setActiveTab("templates")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "templates"
                ? "bg-white dark:bg-slate-50 dark:bg-slate-800 text-gray-950 dark:text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 dark:text-slate-500 hover:text-gray-900 dark:hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            HTML Templates
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 size={32} className="animate-spin text-blue-500" />
        </div>
      ) : activeTab === "templates" ? (
        /* TEMPLATES TAB CONTENT */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Create/Edit Form */}
          <div className="lg:col-span-1 bg-white dark:bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-200 dark:border-slate-800 pb-2">
              <h2 className="text-lg font-bold text-gray-900 dark:text-slate-900 dark:text-white">
                {editingTemplateId ? "Edit Template" : "New Template"}
              </h2>

              {/* View/Preview switch */}
              <div className="flex rounded-lg bg-gray-50 dark:bg-slate-50 dark:bg-slate-950 p-0.5 border border-gray-150 dark:border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setPreviewTemplateMode("edit")}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                    previewTemplateMode === "edit" ? "bg-white dark:bg-white dark:bg-slate-900 text-blue-600 shadow-sm" : "text-slate-500 dark:text-slate-500"
                  }`}
                >
                  Code
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTemplateMode("preview")}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                    previewTemplateMode === "preview" ? "bg-white dark:bg-white dark:bg-slate-900 text-blue-600 shadow-sm" : "text-slate-500 dark:text-slate-500"
                  }`}
                >
                  Preview
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmitTemplate} className="space-y-4">
              {previewTemplateMode === "edit" ? (
                <>
                  <div className="space-y-1">
                    <label htmlFor="temp-name" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                      Template Name
                    </label>
                    <input
                      id="temp-name"
                      type="text"
                      required
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      placeholder="June Newsletter"
                      disabled={isSaving}
                      className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-200 dark:border-slate-800 bg-transparent text-gray-900 dark:text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="temp-subject" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                      Email Subject
                    </label>
                    <input
                      id="temp-subject"
                      type="text"
                      required
                      value={templateSubject}
                      onChange={(e) => setTemplateSubject(e.target.value)}
                      placeholder="Important Updates for LEET Aspirants!"
                      disabled={isSaving}
                      className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-200 dark:border-slate-800 bg-transparent text-gray-900 dark:text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="temp-content" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                      HTML Content
                    </label>
                    <textarea
                      id="temp-content"
                      required
                      rows={10}
                      value={templateContent}
                      onChange={(e) => setTemplateContent(e.target.value)}
                      placeholder="<div style='padding:20px;'><h1>Hello!</h1></div>"
                      disabled={isSaving}
                      className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-200 dark:border-slate-800 bg-transparent text-gray-900 dark:text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <div className="text-xs border border-gray-100 dark:border-slate-200 dark:border-slate-800 p-3 rounded-xl bg-gray-50 dark:bg-slate-50 dark:bg-slate-950/20">
                    <p className="text-slate-500 dark:text-slate-400 font-semibold uppercase">Subject:</p>
                    <p className="font-bold text-gray-800 dark:text-slate-900 dark:text-white text-sm mt-0.5">{templateSubject || "(No Subject)"}</p>
                  </div>
                  <div className="border border-gray-200 dark:border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden h-[300px] bg-white">
                    <iframe
                      srcDoc={templateContent || "<p style='padding:20px;text-align:center;color:#888;'>No preview content</p>"}
                      title="HTML Template Preview"
                      className="w-full h-full border-none"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-colors shadow-sm disabled:opacity-50"
                >
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {editingTemplateId ? "Save Template" : "Create Template"}
                </button>
                {editingTemplateId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTemplateId(null);
                      setTemplateName("");
                      setTemplateSubject("");
                      setTemplateContent("");
                      setPreviewTemplateMode("edit");
                    }}
                    className="px-4 py-2.5 rounded-xl border border-gray-205 dark:border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-500 hover:bg-gray-55 dark:hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Templates List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-slate-900 dark:text-white border-b border-gray-55 dark:border-slate-200 dark:border-slate-800 pb-2">
              Saved Templates ({templates.length})
            </h2>

            {templates.length === 0 ? (
              <div className="bg-white dark:bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-200 dark:border-slate-800 rounded-2xl p-16 text-center text-slate-500 dark:text-slate-400 shadow-sm">
                <FileText className="mx-auto text-slate-600 dark:text-slate-300 dark:text-gray-700 mb-4" size={48} />
                <h3 className="font-bold text-gray-800 dark:text-slate-700 dark:text-slate-200">No Templates</h3>
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Start by creating your first template on the left.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((t) => (
                  <div
                    key={t.id}
                    className="bg-white dark:bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-1.5">
                      <h3 className="font-extrabold text-gray-900 dark:text-slate-900 dark:text-white text-base">
                        {t.name}
                      </h3>
                      <p className="text-xs text-gray-550 dark:text-slate-500 dark:text-slate-400 line-clamp-1">
                        Subject: <strong className="text-gray-800 dark:text-slate-700 dark:text-slate-200">{t.subject}</strong>
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        Created: {new Date(t.createdAt).toLocaleDateString("en-IN")}
                      </p>
                    </div>

                    <div className="flex gap-2 justify-end pt-2 border-t border-gray-50 dark:border-slate-200 dark:border-slate-800/40">
                      <button
                        onClick={() => handleStartEditTemplate(t)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 transition-colors"
                      >
                        <Edit2 size={12} /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(t.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-red-600 dark:text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-colors"
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* CAMPAIGNS TAB CONTENT */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Create/Edit Campaign Form */}
          <div className="lg:col-span-1 bg-white dark:bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-200 dark:border-slate-800 pb-2">
              <h2 className="text-lg font-bold text-gray-900 dark:text-slate-900 dark:text-white">
                {editingCampaignId ? "Edit Campaign" : "New Campaign"}
              </h2>

              <div className="flex rounded-lg bg-gray-50 dark:bg-slate-50 dark:bg-slate-950 p-0.5 border border-gray-150 dark:border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setPreviewCampaignMode("edit")}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                    previewCampaignMode === "edit" ? "bg-white dark:bg-white dark:bg-slate-900 text-blue-600 shadow-sm" : "text-slate-500 dark:text-slate-500"
                  }`}
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewCampaignMode("preview")}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                    previewCampaignMode === "preview" ? "bg-white dark:bg-white dark:bg-slate-900 text-blue-600 shadow-sm" : "text-slate-500 dark:text-slate-500"
                  }`}
                >
                  Preview
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmitCampaign} className="space-y-4">
              {previewCampaignMode === "edit" ? (
                <>
                  {/* Select Template dropdown */}
                  <div className="space-y-1">
                    <label htmlFor="select-template" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                      Use Template
                    </label>
                    <select
                      id="select-template"
                      value={campaignTemplateId}
                      onChange={(e) => handleSelectCampaignTemplate(e.target.value)}
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-200 dark:border-slate-800 bg-transparent text-gray-900 dark:text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                    >
                      <option value="">-- Choose Template (Optional) --</option>
                      {templates.map((temp) => (
                        <option key={temp.id} value={temp.id}>
                          {temp.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="camp-subject" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                      Campaign Subject
                    </label>
                    <input
                      id="camp-subject"
                      type="text"
                      required
                      value={campaignSubject}
                      onChange={(e) => setCampaignSubject(e.target.value)}
                      placeholder="Important Updates for LEET"
                      disabled={isSaving}
                      className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-200 dark:border-slate-800 bg-transparent text-gray-900 dark:text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="camp-content" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                      Email Content (HTML)
                    </label>
                    <textarea
                      id="camp-content"
                      required
                      rows={8}
                      value={campaignContent}
                      onChange={(e) => setCampaignContent(e.target.value)}
                      placeholder="HTML Content of the newsletter..."
                      disabled={isSaving}
                      className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-200 dark:border-slate-800 bg-transparent text-gray-900 dark:text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="camp-recipient-type" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                      Recipient Type
                    </label>
                    <select
                      id="camp-recipient-type"
                      value={recipientType}
                      onChange={(e) => setRecipientType(e.target.value as any)}
                      className="w-full text-sm px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-200 dark:border-slate-800 bg-transparent text-gray-900 dark:text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                    >
                      <option value="ALL">All Users & Subscribers</option>
                      <option value="MANUAL">Manual List (Comma separated)</option>
                      <option value="CSV">Upload CSV File</option>
                    </select>
                  </div>

                  {recipientType === "MANUAL" && (
                    <div className="space-y-1">
                      <label htmlFor="camp-manual-emails" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                        Emails (Comma separated)
                      </label>
                      <textarea
                        id="camp-manual-emails"
                        rows={3}
                        value={manualEmails}
                        onChange={(e) => setManualEmails(e.target.value)}
                        placeholder="admin@leet.com, test@example.com"
                        className="w-full text-xs px-3.5 py-2 rounded-xl border border-gray-200 dark:border-slate-200 dark:border-slate-800 bg-transparent text-gray-900 dark:text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  )}

                  {recipientType === "CSV" && (
                    <div className="space-y-2 border border-dashed border-gray-200 dark:border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-gray-50/20 text-center">
                      <Upload className="mx-auto text-slate-500 dark:text-slate-400" size={24} />
                      <input
                        type="file"
                        ref={csvInputRef}
                        accept=".csv,.txt"
                        onChange={handleCsvUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        disabled={isUploading}
                        onClick={() => csvInputRef.current?.click()}
                        className="mt-1 inline-flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold text-gray-700 dark:text-slate-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-50 dark:bg-slate-800"
                      >
                        {isUploading ? <Loader2 size={12} className="animate-spin text-blue-500" /> : <Upload size={12} />}
                        Choose CSV File
                      </button>
                      
                      {uploadedFilename && (
                        <p className="text-[10px] text-green-600 font-bold mt-1.5 flex items-center justify-center gap-1">
                          <Check size={10} /> Parsed {csvEmails.length} emails in {uploadedFilename}
                        </p>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-3">
                  <div className="text-xs border border-gray-100 dark:border-slate-200 dark:border-slate-800 p-3 rounded-xl bg-gray-50 dark:bg-slate-50 dark:bg-slate-950/20">
                    <p className="text-slate-500 dark:text-slate-400 font-semibold uppercase">Subject:</p>
                    <p className="font-bold text-gray-850 dark:text-slate-900 dark:text-white text-sm mt-0.5">{campaignSubject || "(No Subject)"}</p>
                  </div>
                  <div className="border border-gray-200 dark:border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden h-[300px] bg-white">
                    <iframe
                      srcDoc={campaignContent || "<p style='padding:20px;text-align:center;color:#888;'>No content</p>"}
                      title="HTML Campaign Preview"
                      className="w-full h-full border-none"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-colors shadow-sm disabled:opacity-50"
                >
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {editingCampaignId ? "Save Draft" : "Create Draft"}
                </button>
                {editingCampaignId && (
                  <button
                    type="button"
                    onClick={handleResetCampaignForm}
                    className="px-4 py-2.5 rounded-xl border border-gray-205 dark:border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-500 hover:bg-gray-55 dark:hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Campaigns list */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-slate-900 dark:text-white border-b border-gray-55 dark:border-slate-200 dark:border-slate-800 pb-2">
              Campaigns Logs & Drafts ({campaigns.length})
            </h2>

            {campaigns.length === 0 ? (
              <div className="bg-white dark:bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-200 dark:border-slate-800 rounded-2xl p-16 text-center text-slate-500 dark:text-slate-400 shadow-sm">
                <Mail className="mx-auto text-slate-600 dark:text-slate-300 dark:text-gray-700 mb-4" size={48} />
                <h3 className="font-bold text-gray-800 dark:text-slate-700 dark:text-slate-200">No Campaigns</h3>
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Start by creating your first campaign draft on the left.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {campaigns.map((c) => (
                  <div
                    key={c.id}
                    className="bg-white dark:bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:shadow-md transition-shadow duration-300"
                  >
                    {/* Campaign Info */}
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-extrabold text-gray-900 dark:text-slate-900 dark:text-white">
                          {c.subject}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 border rounded-full ${campaignStatusColors[c.status]}`}>
                          {c.status}
                        </span>
                      </div>

                      <div className="text-xs space-y-1 text-slate-500 dark:text-slate-500 dark:text-slate-500 dark:text-slate-400">
                        <p>
                          Target: <strong className="text-gray-700 dark:text-slate-600 dark:text-slate-300">{c.recipientType}</strong>
                        </p>
                        
                        {c.status !== "DRAFT" && (
                          <p>
                            Recipients: <strong className="text-gray-700 dark:text-slate-600 dark:text-slate-300">{c.recipientCount}</strong> | Sent: <strong className="text-green-600 dark:text-green-400">{c.sentCount}</strong> | Failed: <strong className="text-red-500">{c.failedCount}</strong>
                          </p>
                        )}

                        <p>
                          {c.status === "DRAFT" ? (
                            `Created: ${new Date(c.createdAt).toLocaleDateString("en-IN")}`
                          ) : (
                            c.sentAt && `Sent: ${new Date(c.sentAt).toLocaleDateString("en-IN", { hour: "2-digit", minute: "2-digit" })}`
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-end gap-2 border-t sm:border-t-0 border-gray-50 dark:border-slate-200 dark:border-slate-800/40 pt-3 sm:pt-0">
                      {c.status === "DRAFT" && (
                        <>
                          <button
                            onClick={() => handleTriggerSendCampaign(c)}
                            disabled={isSaving}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50"
                          >
                            <Send size={12} /> Send Campaign
                          </button>
                          <button
                            onClick={() => handleStartEditCampaign(c)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 transition-colors"
                          >
                            <Edit2 size={12} /> Edit
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDeleteCampaign(c.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-red-600 dark:text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-colors"
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
