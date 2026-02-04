import React from "react";
import { AnswerStatus } from "../types";

interface AnswerStatusBadgeProps {
  status: AnswerStatus;
}

export const AnswerStatusBadge: React.FC<AnswerStatusBadgeProps> = ({ status }) => {
  const colors: Record<AnswerStatus, string> = {
    [AnswerStatus.GENERATED]: "bg-blue-900 text-blue-200",
    [AnswerStatus.CONFIRMED]: "bg-green-900 text-green-200",
    [AnswerStatus.REJECTED]: "bg-red-900 text-red-200",
    [AnswerStatus.MANUAL_UPDATED]: "bg-purple-900 text-purple-200",
  };

  return <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors[status]}`}>{status}</span>;
};

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = "md" }) => {
  const sizeClass = { sm: "w-4 h-4", md: "w-8 h-8", lg: "w-12 h-12" }[size];
  return <div className={`${sizeClass} border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin`} />;
};

interface ErrorAlertProps {
  message: string;
  onDismiss?: () => void;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ message, onDismiss }) => (
  <div className="bg-red-900 bg-opacity-30 border border-red-700 text-red-100 px-4 py-3 rounded-lg">
    <div className="flex justify-between items-center">
      <span>{message}</span>
      {onDismiss && <button onClick={onDismiss} className="text-red-100 hover:text-red-50">✕</button>}
    </div>
  </div>
);

interface SuccessAlertProps {
  message: string;
  onDismiss?: () => void;
}

export const SuccessAlert: React.FC<SuccessAlertProps> = ({ message, onDismiss }) => (
  <div className="bg-green-900 bg-opacity-30 border border-green-700 text-green-100 px-4 py-3 rounded-lg">
    <div className="flex justify-between items-center">
      <span>{message}</span>
      {onDismiss && <button onClick={onDismiss} className="text-green-100 hover:text-green-50">✕</button>}
    </div>
  </div>
);

interface InfoAlertProps {
  message: string;
  onDismiss?: () => void;
}

export const InfoAlert: React.FC<InfoAlertProps> = ({ message, onDismiss }) => (
  <div className="bg-blue-900 bg-opacity-30 border border-blue-700 text-blue-100 px-4 py-3 rounded-lg">
    <div className="flex justify-between items-center">
      <span>{message}</span>
      {onDismiss && <button onClick={onDismiss} className="text-blue-100 hover:text-blue-50">✕</button>}
    </div>
  </div>
);

interface WarningAlertProps {
  message: string;
  onDismiss?: () => void;
}

export const WarningAlert: React.FC<WarningAlertProps> = ({ message, onDismiss }) => (
  <div className="bg-yellow-900 bg-opacity-30 border border-yellow-700 text-yellow-100 px-4 py-3 rounded-lg">
    <div className="flex justify-between items-center">
      <span>{message}</span>
      {onDismiss && <button onClick={onDismiss} className="text-yellow-100 hover:text-yellow-50">✕</button>}
    </div>
  </div>
);

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description, icon = "📭" }) => (
  <div className="text-center py-12">
    <div className="text-4xl mb-4">{icon}</div>
    <h3 className="text-lg font-semibold text-white">{title}</h3>
    {description && <p className="text-slate-400 mt-2">{description}</p>}
  </div>
);

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ value, max = 100, label, showPercentage = true }) => {
  const percentage = (value / max) * 100;
  return (
    <div>
      {label && <p className="text-sm font-medium text-slate-300 mb-2">{label}</p>}
      <div className="w-full bg-slate-700 rounded-full h-2">
        <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${percentage}%` }} />
      </div>
      {showPercentage && <p className="text-xs text-slate-400 mt-1">{percentage.toFixed(0)}%</p>}
    </div>
  );
};
