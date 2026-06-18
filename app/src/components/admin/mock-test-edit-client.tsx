"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ClipboardList, Plus, Edit2, Trash2, Loader2, Save, X, Settings, FileQuestion, HelpCircle, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select, FormField } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toaster";
import { MockTestForm } from "./mock-test-form";

interface QuestionOption {
  label: string;
  value: string;
}

interface Question {
  id: string;
  testId: string;
  text: string;
  type: "MCQ" | "TRUE_FALSE" | "SHORT_ANSWER";
  options: any; // Stored as Json in Prisma
  answer: string;
  explanation: string | null;
  marks: number;
  order: number;
  subject: string | null;
  topic: string | null;
  createdAt: string;
}

export function MockTestEditClient({ exams, test }: { exams: any[]; test: any }) {
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"details" | "questions">("questions");
  const [questions, setQuestions] = useState<Question[]>(test.questions || []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // Form State
  const [text, setText] = useState("");
  const [type, setType] = useState<"MCQ" | "TRUE_FALSE" | "SHORT_ANSWER">("MCQ");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [answer, setAnswer] = useState("A");
  const [explanation, setExplanation] = useState("");
  const [marks, setMarks] = useState("1");
  const [order, setOrder] = useState("0");
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");

  const handleOpenAddModal = () => {
    setEditingQuestion(null);
    setText("");
    setType("MCQ");
    setOptionA("");
    setOptionB("");
    setOptionC("");
    setOptionD("");
    setAnswer("A");
    setExplanation("");
    setMarks("1");
    setOrder(String(questions.length));
    setSubject("");
    setTopic("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (q: Question) => {
    setEditingQuestion(q);
    setText(q.text);
    setType(q.type);
    
    // Parse options if MCQ
    const opts = q.options as QuestionOption[] | null;
    const optA = opts?.find(o => o.value === "A")?.label || "";
    const optB = opts?.find(o => o.value === "B")?.label || "";
    const optC = opts?.find(o => o.value === "C")?.label || "";
    const optD = opts?.find(o => o.value === "D")?.label || "";
    
    setOptionA(optA);
    setOptionB(optB);
    setOptionC(optC);
    setOptionD(optD);
    setAnswer(q.answer);
    setExplanation(q.explanation || "");
    setMarks(String(q.marks));
    setOrder(String(q.order));
    setSubject(q.subject || "");
    setTopic(q.topic || "");
    setIsModalOpen(true);
  };

  const handleTypeChange = (newType: "MCQ" | "TRUE_FALSE" | "SHORT_ANSWER") => {
    setType(newType);
    if (newType === "MCQ") {
      setAnswer("A");
    } else if (newType === "TRUE_FALSE") {
      setAnswer("True");
    } else {
      setAnswer("");
    }
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      toast({ title: "Validation Error", description: "Question text is required.", variant: "destructive" });
      return;
    }

    if (type === "MCQ" && (!optionA.trim() || !optionB.trim() || !optionC.trim() || !optionD.trim())) {
      toast({ title: "Validation Error", description: "All 4 options are required for MCQ questions.", variant: "destructive" });
      return;
    }

    if (!answer.trim()) {
      toast({ title: "Validation Error", description: "Correct answer is required.", variant: "destructive" });
      return;
    }

    setIsSaving(true);

    const optionsList = type === "MCQ" ? [
      { label: optionA.trim(), value: "A" },
      { label: optionB.trim(), value: "B" },
      { label: optionC.trim(), value: "C" },
      { label: optionD.trim(), value: "D" }
    ] : null;

    const payload = {
      testId: test.id,
      text: text.trim(),
      type,
      options: optionsList,
      answer: answer.trim(),
      explanation: explanation.trim() || null,
      marks: parseInt(marks) || 1,
      order: parseInt(order) || 0,
      subject: subject.trim() || null,
      topic: topic.trim() || null
    };

    try {
      const url = editingQuestion ? `/api/questions/${editingQuestion.id}` : "/api/questions";
      const method = editingQuestion ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || "Failed to save question");

      if (editingQuestion) {
        setQuestions(prev => prev.map(q => q.id === editingQuestion.id ? data.data : q).sort((a, b) => a.order - b.order));
        toast({ title: "Success", description: "Question updated successfully.", variant: "success" });
      } else {
        setQuestions(prev => [...prev, data.data].sort((a, b) => a.order - b.order));
        toast({ title: "Success", description: "Question added successfully.", variant: "success" });
      }

      setIsModalOpen(false);
      router.refresh();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;

    try {
      const res = await fetch(`/api/questions/${id}`, {
        method: "DELETE"
      });

      if (!res.ok) throw new Error("Failed to delete question");

      setQuestions(prev => prev.filter(q => q.id !== id));
      toast({ title: "Deleted", description: "Question removed successfully.", variant: "success" });
      router.refresh();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-gray-800">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <ClipboardList size={24} className="text-blue-500" />
              Edit Test: {test.title}
            </h1>
            <Badge variant="outline" className="border-gray-800 bg-gray-900 text-gray-400 capitalize">
              {test.status.toLowerCase()}
            </Badge>
          </div>
          <p className="text-gray-400 text-sm mt-1.5">
            {test.duration} mins • {test.totalMarks} Marks • {questions.length} questions
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex rounded-xl bg-gray-950 p-1 border border-gray-800">
          <button
            onClick={() => setActiveTab("questions")}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "questions"
                ? "bg-gray-850 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <FileQuestion size={14} />
            Questions ({questions.length})
          </button>
          <button
            onClick={() => setActiveTab("details")}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "details"
                ? "bg-gray-850 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <Settings size={14} />
            Test Settings
          </button>
        </div>
      </div>

      {activeTab === "details" ? (
        <div className="mt-4">
          <MockTestForm exams={exams} initialData={test} mode="edit" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-200">Questions List</h2>
            <Button onClick={handleOpenAddModal} className="flex items-center gap-2">
              <Plus size={16} /> Add Question
            </Button>
          </div>

          {questions.length === 0 ? (
            <div className="bg-gray-950/20 border border-gray-800/80 rounded-2xl p-16 text-center text-gray-400 shadow-sm space-y-4">
              <HelpCircle className="mx-auto text-gray-600" size={48} />
              <h3 className="font-bold text-gray-200">No Questions Added</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                This mock test has no questions yet. Click "Add Question" to create your first multiple choice, true/false, or short answer question.
              </p>
              <Button onClick={handleOpenAddModal} variant="outline" className="mt-2">
                Add Your First Question
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((q, idx) => {
                const isMCQ = q.type === "MCQ";
                const isTF = q.type === "TRUE_FALSE";
                const opts = q.options as QuestionOption[] | null;

                return (
                  <div
                    key={q.id}
                    className="bg-gray-900 border border-gray-800/60 hover:border-gray-800 rounded-xl p-5 space-y-4 transition-colors"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-blue-500 uppercase tracking-wider">
                            Q{idx + 1}
                          </span>
                          <span className="text-[10px] font-bold bg-gray-950 text-gray-400 px-2 py-0.5 rounded border border-gray-850 uppercase">
                            {q.type.replace("_", " ")}
                          </span>
                          <span className="text-[10px] font-bold bg-blue-950/40 text-blue-400 px-2 py-0.5 rounded border border-blue-900/30">
                            {q.marks} {q.marks === 1 ? "Mark" : "Marks"}
                          </span>
                          {q.subject && (
                            <span className="text-[10px] bg-gray-800 text-gray-300 px-2 py-0.5 rounded">
                              {q.subject}
                            </span>
                          )}
                          {q.topic && (
                            <span className="text-[10px] bg-gray-850 text-gray-400 px-2 py-0.5 rounded">
                              {q.topic}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-100 font-medium text-sm leading-relaxed mt-2">
                          {q.text}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => handleOpenEditModal(q)}
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-400 hover:text-white"
                          title="Edit Question"
                        >
                          <Edit2 size={14} />
                        </Button>
                        <Button
                          onClick={() => handleDeleteQuestion(q.id)}
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-950/20"
                          title="Delete Question"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>

                    {/* MCQ Options Display */}
                    {isMCQ && opts && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-4 border-l border-gray-800">
                        {opts.map((o) => {
                          const isCorrect = q.answer === o.value;
                          return (
                            <div
                              key={o.value}
                              className={`flex items-start gap-2.5 p-3 rounded-lg text-xs font-medium border ${
                                isCorrect
                                  ? "bg-green-950/20 border-green-800 text-green-400"
                                  : "bg-gray-950/30 border-gray-850 text-gray-300"
                              }`}
                            >
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${isCorrect ? 'bg-green-900/50 text-green-300' : 'bg-gray-800 text-gray-400'}`}>
                                {o.value}
                              </span>
                              <span className="leading-5">{o.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* True / False Display */}
                    {isTF && (
                      <div className="flex gap-3 pl-4 border-l border-gray-800">
                        {["True", "False"].map((val) => {
                          const isCorrect = q.answer === val;
                          return (
                            <div
                              key={val}
                              className={`px-4 py-2 rounded-lg text-xs font-bold border ${
                                isCorrect
                                  ? "bg-green-950/20 border-green-800 text-green-400"
                                  : "bg-gray-950/30 border-gray-850 text-gray-550"
                              }`}
                            >
                              {val} {isCorrect && "✓"}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Short Answer / Explanation Display */}
                    {!isMCQ && !isTF && (
                      <div className="pl-4 border-l border-gray-800 space-y-1">
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Correct Answer:</p>
                        <p className="text-sm font-bold text-green-400">{q.answer}</p>
                      </div>
                    )}

                    {q.explanation && (
                      <div className="bg-gray-950/40 border border-gray-850 rounded-lg p-3 text-xs text-gray-400 mt-2 pl-4">
                        <span className="font-semibold block text-gray-300 mb-1">Explanation:</span>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Question Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-xl">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-gray-850 pb-3">
              <h3 className="text-lg font-bold text-white">
                {editingQuestion ? "Edit Question" : "Add New Question"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveQuestion} className="space-y-4">
              <FormField label="Question Text" id="q-text" required>
                <Textarea
                  id="q-text"
                  required
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="e.g. Which of the following data structures operates in First In First Out (FIFO) order?"
                  rows={3}
                  className="bg-gray-950 border-gray-800 text-gray-200 text-sm focus:border-blue-500 focus:ring-0"
                />
              </FormField>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Question Type" id="q-type" required>
                  <select
                    id="q-type"
                    value={type}
                    onChange={(e) => handleTypeChange(e.target.value as any)}
                    className="w-full h-10 px-3 py-2 bg-gray-950 border border-gray-850 rounded-lg text-sm text-gray-200 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="MCQ">Multiple Choice (MCQ)</option>
                    <option value="TRUE_FALSE">True / False</option>
                    <option value="SHORT_ANSWER">Short Answer</option>
                  </select>
                </FormField>

                <FormField label="Marks" id="q-marks" required>
                  <Input
                    id="q-marks"
                    type="number"
                    min="1"
                    required
                    value={marks}
                    onChange={(e) => setMarks(e.target.value)}
                    className="bg-gray-950 border-gray-850 text-gray-200"
                  />
                </FormField>
              </div>

              {/* Dynamic Type Configs */}
              {type === "MCQ" && (
                <div className="space-y-3 p-4 bg-gray-950/40 border border-gray-850 rounded-xl">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Options Configuration</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormField label="Option A text" id="opt-a" required>
                      <Input
                        id="opt-a"
                        required
                        value={optionA}
                        onChange={(e) => setOptionA(e.target.value)}
                        placeholder="Option A content"
                        className="bg-gray-950 border-gray-800 text-gray-200"
                      />
                    </FormField>

                    <FormField label="Option B text" id="opt-b" required>
                      <Input
                        id="opt-b"
                        required
                        value={optionB}
                        onChange={(e) => setOptionB(e.target.value)}
                        placeholder="Option B content"
                        className="bg-gray-950 border-gray-800 text-gray-200"
                      />
                    </FormField>

                    <FormField label="Option C text" id="opt-c" required>
                      <Input
                        id="opt-c"
                        required
                        value={optionC}
                        onChange={(e) => setOptionC(e.target.value)}
                        placeholder="Option C content"
                        className="bg-gray-950 border-gray-800 text-gray-200"
                      />
                    </FormField>

                    <FormField label="Option D text" id="opt-d" required>
                      <Input
                        id="opt-d"
                        required
                        value={optionD}
                        onChange={(e) => setOptionD(e.target.value)}
                        placeholder="Option D content"
                        className="bg-gray-950 border-gray-800 text-gray-200"
                      />
                    </FormField>
                  </div>

                  <FormField label="Correct Option" id="q-correct-mcq" required>
                    <select
                      id="q-correct-mcq"
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      className="w-full h-10 px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-sm text-gray-200 focus:border-blue-500 focus:outline-none"
                    >
                      <option value="A">Option A</option>
                      <option value="B">Option B</option>
                      <option value="C">Option C</option>
                      <option value="D">Option D</option>
                    </select>
                  </FormField>
                </div>
              )}

              {type === "TRUE_FALSE" && (
                <FormField label="Correct Answer" id="q-correct-tf" required>
                  <select
                    id="q-correct-tf"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    className="w-full h-10 px-3 py-2 bg-gray-950 border border-gray-850 rounded-lg text-sm text-gray-200 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="True">True</option>
                    <option value="False">False</option>
                  </select>
                </FormField>
              )}

              {type === "SHORT_ANSWER" && (
                <FormField label="Correct Answer (Text)" id="q-correct-short" required>
                  <Input
                    id="q-correct-short"
                    required
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Enter the correct exact answer..."
                    className="bg-gray-950 border-gray-850 text-gray-200"
                  />
                </FormField>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField label="Subject (Optional)" id="q-subject">
                  <Input
                    id="q-subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Computer Science"
                    className="bg-gray-950 border-gray-850 text-gray-200"
                  />
                </FormField>

                <FormField label="Topic (Optional)" id="q-topic">
                  <Input
                    id="q-topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Queue"
                    className="bg-gray-950 border-gray-850 text-gray-200"
                  />
                </FormField>

                <FormField label="Display Order" id="q-order" required>
                  <Input
                    id="q-order"
                    type="number"
                    min="0"
                    required
                    value={order}
                    onChange={(e) => setOrder(e.target.value)}
                    className="bg-gray-950 border-gray-850 text-gray-200"
                  />
                </FormField>
              </div>

              <FormField label="Explanation / Solution" id="q-explanation">
                <Textarea
                  id="q-explanation"
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Provide detailed explanation of the solution..."
                  rows={2}
                  className="bg-gray-950 border-gray-850 text-gray-200 text-sm focus:border-blue-500 focus:ring-0"
                />
              </FormField>

              {/* Modal Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-850">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={isSaving}
                  className="flex items-center gap-1.5"
                >
                  <Save size={16} /> Save Question
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
