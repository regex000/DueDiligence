import React from "react";
import { EvaluationResult } from "../types";
import { LoadingSpinner } from "./common";

interface EvaluationReportProps {
  results: EvaluationResult[];
  loading: boolean;
}

export const EvaluationReport: React.FC<EvaluationReportProps> = ({ results, loading }) => {
  if (loading) return <LoadingSpinner />;

  const stats = {
    total: results.length,
    exact: results.filter((r) => r.match_type === "EXACT").length,
    partial: results.filter((r) => r.match_type === "PARTIAL").length,
    mismatch: results.filter((r) => r.match_type === "MISMATCH").length,
    avgScore: results.length > 0 ? (results.reduce((sum, r) => sum + r.similarity_score, 0) / results.length * 100).toFixed(1) : 0,
  };

  const exactPercent = stats.total > 0 ? ((stats.exact / stats.total) * 100).toFixed(1) : 0;
  const partialPercent = stats.total > 0 ? ((stats.partial / stats.total) * 100).toFixed(1) : 0;
  const mismatchPercent = stats.total > 0 ? ((stats.mismatch / stats.total) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total" value={stats.total} color="bg-blue-900 text-blue-100" />
        <StatCard label="Exact Match" value={`${stats.exact} (${exactPercent}%)`} color="bg-green-900 text-green-100" />
        <StatCard label="Partial Match" value={`${stats.partial} (${partialPercent}%)`} color="bg-yellow-900 text-yellow-100" />
        <StatCard label="Mismatch" value={`${stats.mismatch} (${mismatchPercent}%)`} color="bg-red-900 text-red-100" />
      </div>

      <div className="bg-slate-900 rounded-lg border border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Average Similarity Score</h3>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="w-full bg-slate-700 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${
                  Number(stats.avgScore) >= 80
                    ? "bg-green-600"
                    : Number(stats.avgScore) >= 60
                      ? "bg-yellow-600"
                      : "bg-red-600"
                }`}
                style={{ width: `${stats.avgScore}%` }}
              />
            </div>
          </div>
          <span className="text-2xl font-bold text-white">{stats.avgScore}%</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-900 rounded-lg border border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Exact Matches</p>
              <p className="text-3xl font-bold text-green-400 mt-1">{stats.exact}</p>
            </div>
            <div className="text-4xl text-green-900">✓</div>
          </div>
        </div>
        <div className="bg-slate-900 rounded-lg border border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Partial Matches</p>
              <p className="text-3xl font-bold text-yellow-400 mt-1">{stats.partial}</p>
            </div>
            <div className="text-4xl text-yellow-900">≈</div>
          </div>
        </div>
        <div className="bg-slate-900 rounded-lg border border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Mismatches</p>
              <p className="text-3xl font-bold text-red-400 mt-1">{stats.mismatch}</p>
            </div>
            <div className="text-4xl text-red-900">✗</div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 rounded-lg border border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-white">Detailed Results</h3>
        </div>
        <table className="w-full">
          <thead className="bg-slate-800 border-b border-slate-700">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Question ID</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Match Type</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Similarity Score</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result) => (
              <tr key={result.question_id} className="border-b border-slate-700 hover:bg-slate-800 transition">
                <td className="px-6 py-4 text-sm font-mono text-slate-300">{result.question_id}</td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      result.match_type === "EXACT"
                        ? "bg-green-900 text-green-200"
                        : result.match_type === "PARTIAL"
                          ? "bg-yellow-900 text-yellow-200"
                          : "bg-red-900 text-red-200"
                    }`}
                  >
                    {result.match_type}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${result.similarity_score * 100}%` }}
                      />
                    </div>
                    <span className="font-semibold text-white">{(result.similarity_score * 100).toFixed(1)}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

interface StatCardProps {
  label: string;
  value: number | string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, color }) => (
  <div className={`${color} rounded-lg p-4 border border-slate-700`}>
    <p className="text-sm font-medium opacity-75">{label}</p>
    <p className="text-2xl font-bold mt-1">{value}</p>
  </div>
);
