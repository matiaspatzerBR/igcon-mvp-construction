import { useState } from 'react';
import { AlertTriangle, X, Trash2, CheckSquare, Square } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface Props {
    isOpen: boolean;
    sectorName: string;
    onClose: () => void;
    onConfirm: () => void;
}

export const DeleteSectorModal = ({ isOpen, sectorName, onClose, onConfirm }: Props) => {
    const [confirmed, setConfirmed] = useState(false);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-red-100 animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-red-50 p-6 flex flex-col items-center text-center border-b border-red-100 italic relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-red-300 hover:text-red-500 hover:bg-red-100/50 rounded-full transition-all"
                    >
                        <X size={20} />
                    </button>
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4 shadow-inner">
                        <AlertTriangle size={32} />
                    </div>
                    <h3 className="text-xl font-black text-red-900 leading-tight">Zona de Perigo!</h3>
                    <p className="text-red-700/70 text-sm font-medium">Ação Irreversível de Engenharia</p>
                </div>

                {/* Body */}
                <div className="p-8 space-y-6">
                    <div className="space-y-3">
                        <p className="text-gray-600 text-sm leading-relaxed">
                            Você está prestes a excluir o setor <strong className="text-gray-900 bg-gray-100 px-1.5 py-0.5 rounded">"{sectorName}"</strong>.
                        </p>
                        <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                            <p className="text-xs text-red-800 font-bold flex items-center gap-2">
                                <Trash2 size={14} /> ISSO APAGARÁ PERMANENTEMENTE:
                            </p>
                            <ul className="mt-2 text-[11px] text-red-700/80 font-medium list-disc list-inside space-y-1">
                                <li>Todas as Unidades (Aptos) vinculadas.</li>
                                <li>Todas as Tarefas e Alocações desta torre.</li>
                                <li>Histórico de produção vinculado.</li>
                            </ul>
                        </div>
                    </div>

                    <label className="flex items-start gap-3 cursor-pointer group select-none">
                        <button
                            onClick={() => setConfirmed(!confirmed)}
                            className={cn(
                                "mt-0.5 shrink-0 transition-all",
                                confirmed ? "text-red-600" : "text-gray-300 group-hover:text-red-300"
                            )}
                        >
                            {confirmed ? <CheckSquare size={20} /> : <Square size={20} />}
                        </button>
                        <div className="flex-1">
                            <span className="text-xs font-black text-gray-800 uppercase tracking-tighter">Confirmação de Segurança</span>
                            <p className="text-[10px] text-gray-500 font-medium leading-tight mt-0.5">
                                Entendo que esta ação é irreversível e excluirá todos os dados vinculados a este setor.
                            </p>
                        </div>
                    </label>
                </div>

                {/* Footer */}
                <div className="p-6 bg-gray-50 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 text-sm font-black text-gray-500 hover:bg-gray-200 rounded-2xl transition-all"
                    >
                        CANCELAR
                    </button>
                    <button
                        onClick={() => {
                            if (confirmed) {
                                onConfirm();
                                onClose();
                            }
                        }}
                        disabled={!confirmed}
                        className={cn(
                            "flex-[2] py-3 text-sm font-black rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95",
                            confirmed
                                ? "bg-red-600 text-white hover:bg-red-700 shadow-red-100"
                                : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                        )}
                    >
                        <Trash2 size={18} /> EXCLUIR DEFINITIVAMENTE
                    </button>
                </div>
            </div>
        </div>
    );
};
