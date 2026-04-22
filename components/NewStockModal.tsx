import React, { useState, useEffect } from 'react';
import { CreateStockData, StockItem } from '../../types';

interface NewStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateStockData) => void;
  initialData?: StockItem | null;
  availableProducts: string[];
}

export const NewStockModal: React.FC<NewStockModalProps> = ({ 
    isOpen, 
    onClose, 
    onSubmit, 
    initialData,
    availableProducts
}) => {
  
  const getLocalDateString = () => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState<CreateStockData>({
    productName: '',
    externoQty: 0,
    galpao2Qty: 0
  });

  const totalQty = formData.externoQty + formData.galpao2Qty;

  useEffect(() => {
    if (isOpen) {
        if (initialData) {
            setFormData({
                productName: initialData.productName,
                externoQty: initialData.externoQty,
                galpao2Qty: initialData.galpao2Qty
            });
        } else {
            setFormData({
                productName: '',
                externoQty: 0,
                galpao2Qty: 0
            });
        }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  const updateQty = (field: 'externoQty' | 'galpao2Qty', value: number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-700">
        <div className="bg-gray-900 p-4 border-b border-gray-700">
            <h2 className="text-white font-bold text-lg">
                {initialData ? 'Editar Estoque' : 'Novo Item de Estoque'}
            </h2>
            <p className="text-gray-400 text-sm">
                {initialData ? 'Ajuste as quantidades do produto' : 'Registre o estoque disponível'}
            </p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Produto *</label>
            <select
              required
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              value={formData.productName}
              onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
            >
                <option value="" disabled>Selecione um produto...</option>
                {availableProducts.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
                {availableProducts.length === 0 && <option disabled>Nenhum produto cadastrado</option>}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Externo Qtd</label>
            <input
              type="text"
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-right font-semibold"
              value={formData.externoQty ? formData.externoQty.toLocaleString('pt-BR') : ''}
              onChange={(e) => {
                const rawValue = e.target.value.replace(/\./g, '').replace(/\D/g, '');
                updateQty('externoQty', rawValue === '' ? 0 : parseInt(rawValue, 10));
              }}
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Galpão 2 Qtd</label>
            <input
              type="text"
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-right font-semibold"
              value={formData.galpao2Qty ? formData.galpao2Qty.toLocaleString('pt-BR') : ''}
              onChange={(e) => {
                const rawValue = e.target.value.replace(/\./g, '').replace(/\D/g, '');
                updateQty('galpao2Qty', rawValue === '' ? 0 : parseInt(rawValue, 10));
              }}
              placeholder="0"
            />
          </div>

          <div className="pt-2">
            <label className="block text-sm font-bold text-green-400 mb-1">Total: {totalQty.toLocaleString('pt-BR')}</label>
            <div className="w-full bg-gray-800 border border-green-600 text-green-400 rounded-lg p-2.5 text-center font-bold text-lg">
              {totalQty.toLocaleString('pt-BR')}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors min-h-[38px]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 shadow-md hover:shadow-lg transition-all min-h-[38px]"
            >
              {initialData ? 'Salvar Alterações' : 'Adicionar ao Estoque'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

