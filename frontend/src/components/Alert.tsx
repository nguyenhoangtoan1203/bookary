import { useEffect } from 'react';

export interface AlertProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose: () => void;
}

export default function Alert({ message, type, duration = 4000, onClose }: AlertProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200',
  }[type];

  const textColor = {
    success: 'text-green-800',
    error: 'text-red-800',
    warning: 'text-yellow-800',
    info: 'text-blue-800',
  }[type];

  const icon = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
  }[type];

  const borderColor = {
    success: 'border-green-200',
    error: 'border-red-200',
    warning: 'border-yellow-200',
    info: 'border-blue-200',
  }[type];

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${bgColor} ${borderColor} border-l-4 px-4 py-3 rounded shadow-lg max-w-sm animate-in fade-in slide-in-from-bottom-4`}>
      <div className={`flex items-start gap-3 ${textColor}`}>
        <span className="text-lg flex-shrink-0">{icon}</span>
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          onClick={onClose}
          className={`flex-shrink-0 text-lg leading-none hover:opacity-70 transition`}
        >
          ×
        </button>
      </div>
    </div>
  );
}
