import { AlertTriangle, X, CheckCircle, Info } from 'lucide-react';

const variants = {
  success: {
    bgColor: 'bg-green-50',
    textColor: 'text-green-800',
    iconColor: 'text-green-400',
    Icon: CheckCircle,
  },
  error: {
    bgColor: 'bg-red-50',
    textColor: 'text-red-800',
    iconColor: 'text-red-400',
    Icon: AlertTriangle,
  },
  warning: {
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-800',
    iconColor: 'text-yellow-400',
    Icon: AlertTriangle,
  },
  info: {
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-800',
    iconColor: 'text-blue-400',
    Icon: Info,
  },
};

export default function Alert({ variant = 'info', message, onClose }) {
  if (!message) return null;

  const { bgColor, textColor, iconColor, Icon } = variants[variant];

  return (
    <div className={`rounded-md ${bgColor} p-4 mb-4`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon className={`h-5 w-5 ${iconColor}`} aria-hidden="true" />
        </div>
        <div className="ml-3">
          <p className={`text-sm ${textColor}`}>{message}</p>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                className={`inline-flex rounded-md ${bgColor} p-1.5 ${textColor} hover:bg-opacity-70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-${bgColor} focus:ring-${textColor}`}
                onClick={onClose}
              >
                <span className="sr-only">Dismiss</span>
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
