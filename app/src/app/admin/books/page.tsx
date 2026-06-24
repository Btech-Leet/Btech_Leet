"use client";

import { useEffect, useState, useRef } from "react";
import { BookOpen, Plus, Edit2, Loader2, Save, Trash2, Camera, Check, X, Star, DollarSign, Upload } from "lucide-react";
import { useToast } from "@/components/ui/toaster";

interface Author {
  id: string;
  name: string;
}

interface Book {
  id: string;
  name: string;
  slug: string;
  coverImage?: string | null;
  description?: string | null;
  price?: number | null;
  category?: string | null;
  fileUrl?: string | null;
  fileKey?: string | null;
  fileSize?: number | null;
  authorId?: string | null;
  author?: Author | null;
  active: boolean;
  featured: boolean;
}

const CATEGORIES = [
  "Mathematics", "Physics", "Chemistry", "English",
  "Reasoning", "General Knowledge", "Engineering Mechanics",
  "Computer Science", "Electrical Engineering", "Other"
];

export default function AdminBooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [paymentType, setPaymentType] = useState<"free" | "paid">("free");
  const [price, setPrice] = useState<number | "">(0);
  const [category, setCategory] = useState("");
  const [authorId, setAuthorId] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileKey, setFileKey] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [active, setActive] = useState(true);
  const [featured, setFeatured] = useState(false);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileUploading, setFileUploading] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      const [booksRes, authorsRes] = await Promise.all([
        fetch("/api/admin/books"),
        fetch("/api/admin/authors"),
      ]);

      if (booksRes.ok) {
        const booksData = await booksRes.json();
        setBooks(booksData.data);
      }
      if (authorsRes.ok) {
        const authorsData = await authorsRes.json();
        setAuthors(authorsData.data);
      }
    } catch {
      toast({ title: "Error", description: "Failed to load data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCoverUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "books");

    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
        setCoverImage(data.data.url);
        toast({ title: "Success", description: "Cover uploaded", variant: "success" });
      } else {
        toast({ title: "Upload Failed", description: data.message || "Failed", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to upload", variant: "destructive" });
    } finally {
      setCoverUploading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "books/pdfs");

    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
        setFileUrl(data.data.url);
        setFileKey(data.data.path);
        setFileSize(file.size);
        toast({ title: "Success", description: "PDF/File uploaded successfully", variant: "success" });
      } else {
        toast({ title: "Upload Failed", description: data.message || "Failed", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to upload file", variant: "destructive" });
    } finally {
      setFileUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const isEdit = !!editingBook;
    const url = isEdit ? `/api/admin/books/${editingBook.id}` : "/api/admin/books";
    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description: description || null,
          price: paymentType === "paid" && price !== "" ? Number(price) : 0,
          category: category || null,
          authorId: authorId || null,
          coverImage: coverImage || null,
          fileUrl: fileUrl || null,
          fileKey: fileKey || null,
          fileSize: fileSize || null,
          active,
          featured,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast({ title: "Success", description: isEdit ? "Book updated" : "Book created", variant: "success" });
        resetForm();
        fetchData();
      } else {
        toast({ title: "Error", description: data.message || "Failed to save", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Network error", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (book: Book) => {
    setEditingBook(book);
    setName(book.name);
    setDescription(book.description || "");
    const bookPrice = book.price ?? 0;
    setPrice(bookPrice);
    setPaymentType(bookPrice > 0 ? "paid" : "free");
    setCategory(book.category || "");
    setAuthorId(book.authorId || "");
    setCoverImage(book.coverImage || null);
    setFileUrl(book.fileUrl || null);
    setFileKey(book.fileKey || null);
    setFileSize(book.fileSize || null);
    setActive(book.active);
    setFeatured(book.featured);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this book?")) return;
    try {
      const res = await fetch(`/api/admin/books/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast({ title: "Success", description: "Book deleted", variant: "success" });
        fetchData();
      } else {
        toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Network error", variant: "destructive" });
    }
  };

  const toggleActive = async (book: Book) => {
    try {
      const res = await fetch(`/api/admin/books/${book.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !book.active }),
      });
      if (res.ok) {
        setBooks(prev => prev.map(b => b.id === book.id ? { ...b, active: !b.active } : b));
        toast({ title: "Success", description: "Status updated", variant: "success" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to update", variant: "destructive" });
    }
  };

  const resetForm = () => {
    setEditingBook(null);
    setName(""); setDescription(""); setPrice(0); setCategory("");
    setPaymentType("free");
    setAuthorId(""); setCoverImage(null); setFileUrl(null); setFileKey(null); setFileSize(null);
    setActive(true); setFeatured(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BookOpen size={24} className="text-orange-500" />
          Manage Books & Notes
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Upload and manage study materials, books, and notes for students</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 h-fit shadow-sm space-y-5">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            {editingBook ? <Edit2 size={18} className="text-blue-500" /> : <Plus size={18} className="text-blue-500" />}
            {editingBook ? "Edit Book" : "Add Book / Notes"}
          </h2>

          <form onSubmit={handleSave} className="space-y-4">
            {/* Cover Image */}
            <div className="flex flex-col items-center p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl gap-3">
              <div className="relative w-20 h-28 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden shadow-inner">
                {coverUploading ? (
                  <Loader2 className="animate-spin text-blue-500" size={24} />
                ) : coverImage ? (
                  <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                  <BookOpen size={28} className="text-gray-700" />
                )}
              </div>
              <button type="button" onClick={() => coverInputRef.current?.click()} disabled={coverUploading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-800 transition-colors">
                <Camera size={14} /> Upload Cover
              </button>
              <input type="file" ref={coverInputRef} onChange={handleCoverUpload} accept="image/*" className="hidden" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Book / Notes Title</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Engineering Mathematics for LEET"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 placeholder-gray-700" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500">
                  <option value="">Select</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Resource Type</label>
                <div className="flex bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentType("free");
                      setPrice(0);
                    }}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${
                      paymentType === "free"
                        ? "bg-blue-600 text-white"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white"
                    }`}
                  >
                    Free
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentType("paid");
                      if (price === 0 || price === "") {
                        setPrice(99); // default paid amount
                      }
                    }}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${
                      paymentType === "paid"
                        ? "bg-blue-600 text-white"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white"
                    }`}
                  >
                    Paid
                  </button>
                </div>
              </div>
            </div>

            {paymentType === "paid" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Amount (₹)</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={price}
                  onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : "")}
                  placeholder="Enter amount"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 placeholder-gray-700"
                />
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Author</label>
              <select value={authorId} onChange={(e) => setAuthorId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500">
                <option value="">No author</option>
                {authors.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description of this book or notes..." rows={3}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 placeholder-gray-700 resize-none" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">PDF / Book File</label>
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg">
                <div className="flex-1 min-w-0">
                  {fileUploading ? (
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <Loader2 className="animate-spin text-blue-500" size={14} />
                      Uploading file...
                    </div>
                  ) : fileUrl ? (
                    <div className="text-xs text-slate-600 dark:text-slate-300 truncate">
                      <span className="font-semibold text-green-400">✓ Uploaded:</span>{" "}
                      {fileKey ? fileKey.split("/").pop() : "document.pdf"}
                      {fileSize && (
                        <span className="text-[10px] text-slate-500 dark:text-slate-500 ml-1">
                          ({formatFileSize(fileSize)})
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-gray-600">No PDF uploaded</span>
                  )}
                </div>
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={fileUploading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-800 transition-colors">
                  <Upload size={14} /> Upload File
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf,.doc,.docx,.epub" className="hidden" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setActive(!active)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                  active ? "bg-green-950/40 text-green-400 border-green-800/40" : "bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-500 border-slate-200 dark:border-slate-800"
                }`}>
                {active ? <Check size={12} /> : <X size={12} />}
                {active ? "Active" : "Inactive"}
              </button>

              <button type="button" onClick={() => setFeatured(!featured)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                  featured ? "bg-amber-950/40 text-amber-400 border-amber-800/40" : "bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-500 border-slate-200 dark:border-slate-800"
                }`}>
                <Star size={12} />
                {featured ? "Featured" : "Normal"}
              </button>
            </div>

            <div className="flex gap-2 pt-2">
              <button type="submit" disabled={submitting}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-bold rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors">
                {submitting ? <Loader2 className="animate-spin mr-2" size={16} /> : <Save size={16} className="mr-2" />}
                Save Book
              </button>
              {editingBook && (
                <button type="button" onClick={resetForm}
                  className="px-4 py-2 text-sm font-bold rounded-lg text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Books list */}
        <div className="lg:col-span-2 space-y-4">
          {books.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center text-slate-500 dark:text-slate-500 shadow-sm">
              No books or notes added yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {books.map((book) => (
                <div key={book.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col justify-between shadow-sm">
                  <div className="p-5 flex gap-4 items-start">
                    <div className="w-14 h-20 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {book.coverImage ? (
                        <img src={book.coverImage} alt={book.name} className="w-full h-full object-cover" />
                      ) : (
                        <BookOpen className="text-orange-500" size={22} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start gap-1.5">
                        <h3 className="font-bold text-slate-700 dark:text-slate-200 text-sm truncate flex-1">{book.name}</h3>
                        {book.featured && (
                          <Star size={12} className="text-amber-500 flex-shrink-0 mt-0.5" fill="currentColor" />
                        )}
                      </div>
                      {book.author && (
                        <p className="text-xs text-orange-400 font-semibold mt-0.5 truncate">by {book.author.name}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        {book.category && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
                            {book.category}
                          </span>
                        )}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          book.price && book.price > 0
                            ? "bg-green-950/30 text-green-400 border-green-900/30"
                            : "bg-blue-950/30 text-blue-400 border-blue-900/30"
                        }`}>
                          {book.price && book.price > 0 ? `₹${book.price}` : "Free"}
                        </span>
                        {book.fileUrl ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-950/20 text-blue-400 border border-blue-900/30 flex items-center gap-0.5">
                            <Check size={10} /> File
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-950/20 text-red-400 border border-red-900/30">
                            No File
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-950/40 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <button onClick={() => toggleActive(book)}
                      className={`text-xs font-bold transition-all px-2.5 py-1 rounded-full border ${
                        book.active
                          ? "bg-green-950/30 text-green-400 border-green-900/30 hover:bg-green-900/40"
                          : "bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-500 border-slate-200 dark:border-slate-800 hover:text-slate-700 dark:hover:text-slate-300"
                      }`}>
                      {book.active ? "Active" : "Inactive"}
                    </button>
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(book)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Edit Book">
                        <Edit2 size={13} />
                      </button>
                      <button onClick={() => handleDelete(book.id)}
                        className="p-1.5 rounded-lg border border-red-950/40 text-red-400 hover:text-white hover:bg-red-950/40 transition-colors" title="Delete Book">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
