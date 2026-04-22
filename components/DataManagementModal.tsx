
import React, { useState } from 'react';

interface DataManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  items: string[];
  onAddItem: (item: string) => void;
  onRemoveItem: (item: string) => void;
  placeholder: string;
}

export const DataManagementModal: React.FC<DataManagementModalProps> = ({
  isOpen,
  onClose,
  title,
  items,
  onAddItem,
  onRemoveItem,
  placeholder
}) => {
  const [newItem, setNewItem] = useState('');

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItem.trim()) {
      onAddItem(newItem.trim().toUpperCase());
      setNewItem('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-700 flex flex-col max-h-[80vh]">
        <div className="bg-gray-900 p-4 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-white font-bold text-lg">{title}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
        
        <div className="p-4 border-b border-gray-700 bg-gray-800">
            <form onSubmit={handleAdd} className="flex gap-2">
                <input
                    type="text"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    placeholder={placeholder}
                    className="flex-1 bg-gray-700 border border-gray-600 text-white rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none uppercase"
                />
                <button 
                    type="submit"
                    disabled={!newItem.trim()}
                    className="bg-blue-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-xs sm:text-sm min-h-[38px]"
                >
                    Adicionar
                </button>
            </form>
        </div>

        <div className="overflow-y-auto p-4 flex-1 space-y-2">
            {items.length === 0 ? (
                <p className="text-center text-gray-500 py-4">Nenhum item cadastrado.</p>
            ) : (
                items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center bg-gray-700/50 p-3 rounded border border-gray-600 group hover:border-blue-500/50 transition-colors">
                        <span className="text-gray-200 font-medium">{item}</span>
                        <button 
                            onClick={() => onRemoveItem(item)}
                            className="text-gray-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center h-8 w-8"
                            title="Remover"
                        >
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                ))
            )}
        </div>
      </div>
    </div>
  );
};
