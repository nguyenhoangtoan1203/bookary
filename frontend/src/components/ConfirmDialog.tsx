import { useLanguage } from '../context/LanguageContext';

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  title,
  message,
  confirmText,
  cancelText,
  type = 'info',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { t } = useLanguage();
  const defaultConfirmText = confirmText || t('common.confirm');
  const defaultCancelText = cancelText || t('common.cancel');
  const bgColor = {
    danger: 'bg-red-50',
    warning: 'bg-yellow-50',
    info: 'bg-blue-50',
  }[type];

  const iconColor = {
    danger: 'text-red-600',
    warning: 'text-yellow-600',
    info: 'text-blue-600',
  }[type];

  const buttonColor = {
    danger: 'bg-red-600 hover:bg-red-700',
    warning: 'bg-yellow-600 hover:bg-yellow-700',
    info: 'bg-blue-600 hover:bg-blue-700',
  }[type];

  const icon = {
    danger: '⚠️',
    warning: '⚡',
    info: 'ℹ️',
  }[type];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`${bgColor} rounded-lg shadow-2xl max-w-sm w-full p-6 animate-in fade-in zoom-in-95`}>
        <div className="flex items-start gap-4">
          <span className={`text-3xl flex-shrink-0 ${iconColor}`}>{icon}</span>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-900 mb-2">{title}</h2>
            <p className="text-gray-700 text-sm mb-6">{message}</p>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium transition"
          >
            {defaultCancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 ${buttonColor} text-white rounded-lg font-medium transition`}
          >
            {defaultConfirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
