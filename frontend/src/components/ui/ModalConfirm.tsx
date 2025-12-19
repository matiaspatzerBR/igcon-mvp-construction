import { X, AlertCircle } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'primary' | 'danger' | 'success';
}

export const ModalConfirm = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = 'Confirmar',
    cancelLabel = 'Cancelar',
    variant = 'primary'
}: Props) => {
    if (!isOpen) return null;

    const variantStyles = {
        primary: 'bg-blue-600 hover:bg-blue-700 shadow-blue-100',
        danger: 'bg-red-600 hover:bg-red-700 shadow-red-100',
        success: 'bg-green-600 hover:bg-green-700 shadow-green-100'
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm transition-all animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col border border-gray-100 animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-5 flex justify-between items-center bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${variant === 'danger' ? 'bg-red-50 text-red-600' : variant === 'success' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                            <AlertCircle size={20} />
                        </div>
                        <h3 className="font-bold text-gray-900">{title}</h3>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-all">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <p className="text-gray-600 text-sm leading-relaxed">
                        {message}
                    </p>
                </div>

                {/* Footer */}
                <div className="p-5 bg-gray-50/50 border-t flex items-center justify-end gap-3 shrink-0">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 text-sm font-bold text-gray-500 hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 rounded-xl transition-all"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`px-8 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg transition-all active:scale-95 ${variantStyles[variant]}`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};
