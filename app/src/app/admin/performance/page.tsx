"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, RefreshCw, BarChart3, Search, Filter, 
  MapPin, GraduationCap, Building2, BookOpen, Clock,
  ArrowUpDown, ChevronRight, Award
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#f43f5e", "#06b6d4"];

export default function AdminPerformanceDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Data states
  const [students, setStudents] = useState<any[]>([]);
  const [branchAggs, setBranchAggs] = useState<any[]>([]);
  const [filterOpts, setFilterOpts] = useState<any>({ colleges: [], branches: [], states: [] });

  // Filter conditions
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCollege, setSelectedCollege] = useState("ALL");
  const [selectedBranch, setSelectedBranch] = useState("ALL");
  const [selectedState, setSelectedState] = useState("ALL");

  // Sort states
  const [sortField, setSortField] = useState<string>("averagePercentage");
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    fetchPerformanceData();
  }, [selectedCollege, selectedBranch, selectedState]);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      setError(null);
      const url = `/api/admin/performance?collegeName=${encodeURIComponent(selectedCollege)}&branch=${encodeURIComponent(selectedBranch)}&state=${encodeURIComponent(selectedState)}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setStudents(json.data.students || []);
        setBranchAggs(json.data.branchAggregates || []);
        setFilterOpts(json.data.filterOptions || { colleges: [], branches: [], states: [] });
      } else {
        throw new Error(json.message || "Failed to load database stats");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  // Client-side filtering for Search query
  const filteredStudents = students.filter(student => {
    const query = searchQuery.toLowerCase();
    return (
      student.name.toLowerCase().includes(query) ||
      student.email.toLowerCase().includes(query)
    );
  });

  // Client-side sorting
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];

    if (typeof valA === "string") {
      return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    
    return sortAsc ? valA - valB : valB - valA;
  });

  return (
    <div className="text-white space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-900 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="text-blue-500" size={24} />
            Student Performance Registry
          </h1>
          <p className="text-gray-400 text-xs mt-1">Review mock test records, accuracy, study metrics, and academic statistics of all enrolled students.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchPerformanceData}
            className="border-gray-800 text-gray-300 hover:text-white"
          >
            <RefreshCw size={14} className="mr-1.5" />
            Reload Data
          </Button>
        </div>
      </div>

      {/* Filter Controls Row */}
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Search field */}
          <div className="space-y-1.5">
            <label htmlFor="search" className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1">
              <Search size={10} /> Search Students
            </label>
            <input
              type="text"
              id="search"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-gray-800 bg-gray-950 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
            />
          </div>

          {/* College Filter */}
          <div className="space-y-1.5">
            <label htmlFor="college" className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1">
              <Building2 size={10} /> Filter by College
            </label>
            <select
              id="college"
              value={selectedCollege}
              onChange={(e) => setSelectedCollege(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-gray-800 bg-gray-950 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
            >
              <option value="ALL">All Colleges</option>
              {filterOpts.colleges.map((c: string) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Branch Filter */}
          <div className="space-y-1.5">
            <label htmlFor="branch" className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1">
              <GraduationCap size={10} /> Filter by Branch
            </label>
            <select
              id="branch"
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-gray-800 bg-gray-950 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
            >
              <option value="ALL">All Branches</option>
              {filterOpts.branches.map((b: string) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* State Filter */}
          <div className="space-y-1.5">
            <label htmlFor="state" className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1">
              <MapPin size={10} /> Filter by State
            </label>
            <select
              id="state"
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-gray-800 bg-gray-950 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
            >
              <option value="ALL">All States</option>
              {filterOpts.states.map((s: string) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

        </CardContent>
      </Card>

      {/* Main Grid: Left side students registry list, right side branch statistics comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Students Table Registry */}
        <Card className="bg-gray-900 border-gray-800 lg:col-span-2 overflow-hidden">
          <CardHeader className="pb-3 border-b border-gray-800">
            <CardTitle className="text-white text-base">Enrolled Students Evaluation</CardTitle>
            <CardDescription className="text-gray-400 text-xs">Students list and mock exam performance metrics</CardDescription>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                <RefreshCw className="animate-spin text-blue-500 mb-3" size={24} />
                <p className="text-xs">Processing student statistics...</p>
              </div>
            ) : sortedStudents.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-16">No student records match the selected filter conditions.</p>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-850 bg-gray-950 text-gray-400 select-none">
                    <th className="p-4 font-semibold cursor-pointer hover:text-white" onClick={() => handleSort("name")}>
                      Student Details <ArrowUpDown size={10} className="inline ml-1" />
                    </th>
                    <th className="p-4 font-semibold text-center cursor-pointer hover:text-white" onClick={() => handleSort("totalTests")}>
                      Tests <ArrowUpDown size={10} className="inline ml-1" />
                    </th>
                    <th className="p-4 font-semibold text-center cursor-pointer hover:text-white" onClick={() => handleSort("averagePercentage")}>
                      Avg Score % <ArrowUpDown size={10} className="inline ml-1" />
                    </th>
                    <th className="p-4 font-semibold text-center cursor-pointer hover:text-white" onClick={() => handleSort("accuracy")}>
                      Accuracy <ArrowUpDown size={10} className="inline ml-1" />
                    </th>
                    <th className="p-4 font-semibold text-center cursor-pointer hover:text-white" onClick={() => handleSort("totalStudyTime")}>
                      Study Time <ArrowUpDown size={10} className="inline ml-1" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedStudents.map((student) => (
                    <tr key={student.id} className="border-b border-gray-850 hover:bg-gray-850/30">
                      <td className="p-4">
                        <p className="text-white font-bold">{student.name}</p>
                        <p className="text-[10px] text-gray-500 truncate max-w-[150px]">{student.email}</p>
                        <div className="flex flex-wrap gap-1 mt-1 text-[9px] font-semibold text-gray-400">
                          <span className="bg-gray-950 px-1 py-0.5 rounded border border-gray-850 flex items-center gap-0.5">
                            <Building2 size={8} /> {student.college}
                          </span>
                          <span className="bg-gray-950 px-1 py-0.5 rounded border border-gray-850 flex items-center gap-0.5">
                            <GraduationCap size={8} /> {student.branch}
                          </span>
                          <span className="bg-gray-950 px-1 py-0.5 rounded border border-gray-850 flex items-center gap-0.5">
                            <MapPin size={8} /> {student.state}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-center text-gray-200 font-semibold">{student.totalTests}</td>
                      <td className="p-4 text-center text-blue-400 font-bold">{student.averagePercentage}%</td>
                      <td className="p-4 text-center text-emerald-400 font-semibold">{student.accuracy}%</td>
                      <td className="p-4 text-center text-purple-400">
                        <div className="flex items-center justify-center gap-1">
                          <Clock size={10} />
                          <span>{Math.round((student.totalStudyTime / 60) * 10) / 10} hrs</span>
                        </div>
                        <span className="text-[9px] text-gray-500 block">{student.totalQuestionsSolved} solved</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        {/* Right Side: Branch aggregates & college distributions */}
        <div className="space-y-6">
          
          {/* Branch performance comparison chart */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-3 border-b border-gray-800">
              <CardTitle className="text-white text-base">Branch ranking comparison</CardTitle>
              <CardDescription className="text-gray-400 text-xs">Averages of branches compared globally</CardDescription>
            </CardHeader>
            <CardContent className="pt-5">
              {loading ? (
                <div className="h-[240px] flex items-center justify-center text-gray-500">
                  <RefreshCw className="animate-spin text-purple-500 mr-2" size={16} />
                  Calculating branch distribution...
                </div>
              ) : branchAggs.length === 0 ? (
                <p className="text-gray-500 text-xs text-center py-20">No branch metrics logged yet.</p>
              ) : (
                <div className="space-y-5">
                  <div className="h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={branchAggs} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                        <XAxis dataKey="branch" stroke="#9ca3af" fontSize={10} />
                        <YAxis stroke="#9ca3af" fontSize={10} allowDecimals={false} domain={[0, 100]} />
                        <Tooltip contentStyle={{ backgroundColor: "#111827", borderColor: "#374151" }} />
                        <Bar dataKey="averagePercentage" name="Avg Score %" radius={[4, 4, 0, 0]} barSize={16}>
                          {branchAggs.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Top branch badge list */}
                  <div className="space-y-2">
                    {branchAggs.map((br: any, idx: number) => (
                      <div key={br.branch} className="flex justify-between items-center text-xs p-2.5 bg-gray-950 border border-gray-850 rounded-xl">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-500">#{idx + 1}</span>
                          <span className="text-white font-semibold">{br.branch}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-blue-400 block">{br.averagePercentage}%</span>
                          <span className="text-[9px] text-gray-500 block">{br.studentCount} students</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
