interface ConfirmDialogProps {
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

export function ConfirmDialog({
  title,
  description,
  onConfirm,
  onCancel,
  confirmText = 'Sim',
  cancelText = 'Cancelar',
}: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl p-6 w-full max-w-[320px] shadow-2xl flex flex-col gap-4 transform transition-all">
        <div className="flex flex-col gap-1.5 text-center">
          <h4 className="text-lg font-bold text-gray-900 m-0">{title}</h4>
          <p className="text-xs font-medium text-gray-500 m-0">{description}</p>
        </div>
        <div className="flex gap-3 mt-2">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 text-xs font-bold uppercase tracking-wide text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 active:scale-95 transition-all cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 text-xs font-bold uppercase tracking-wide text-white bg-red-500 rounded-xl hover:bg-red-600 shadow-md active:scale-95 transition-all cursor-pointer"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
