
import React, { useState, useEffect } from 'react';
import { CreateOrderData } from '../types';

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateOrderData) => void;
  initialData?: CreateOrderData | null;
  availableProducts: string[];
  availableClients: string[];
}

export const NewOrderModal: React.FC<NewOrderModalProps> = ({ 
    isOpen, 
    onClose, 
    onSubmit, 
    initialData,
    availableProducts,
    availableClients
}) => {
  
  // Helper para obter data local YYYY-MM-DD
  const getLocalDateString = () => {
    const d = new Date();
    const offset = d.getTimezoneOffset() * 60000;
    const localDate = new Date(d.getTime() - offset);
    return localDate.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState<CreateOrderData>({
    orderNumber: '',
    clientName: '',
    productName: '',
    totalQuantity: 0,
    startDate: getLocalDateString()
  });

  useEffect(() => {
    if (isOpen) {
        if (initialData) {
            setFormData({
                orderNumber: initialData.orderNumber,
                clientName: initialData.clientName,
                productName: initialData.productName,
                totalQuantity: initialData.totalQuantity,
                // Se já vier YYYY-MM-DD do banco, usa direto. Se não, tenta converter.
                startDate: initialData.startDate ? initialData.startDate.split('T')[0] : getLocalDateString()
            });
        } else {
            setFormData({
                orderNumber: '',
                clientName: '',
                productName: '',
                totalQuantity: 0,
                startDate: getLocalDateString()
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

  // Helper para calcular bobinas
  const getCalculatedReels = (quantity: number, product: string): string => {
      if (!quantity || !product) return '';
      const match = product.match(/(\d+)\s*[xX]\s*\d+/);
      if (match) {
          const factor = parseInt(match[1], 10);
          const reels = (quantity * factor) / 1000;
          return Number.isInteger(reels) ? reels.toString() : reels.toFixed(2);
      }
      return '';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-700">
        <div className="bg-gray-900 p-4 border-b border-gray-700">
            <h2 className="text-white font-bold text-lg">
                {initialData ? 'Editar Pedido' : 'Novo Pedido de Produção'}
            </h2>
            <p className="text-gray-400 text-sm">
                {initialData ? 'Atualize os dados do pedido abaixo' : 'Preencha os dados para a tabela'}
            </p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Nº do Pedido</label>
            <input
              type="text"
              required
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-gray-500"
              placeholder="Ex: #PO-2024-001"
              value={formData.orderNumber}
              onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Cliente</label>
            <select
              required
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              value={formData.clientName}
              onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
            >
                <option value="" disabled>Selecione um cliente...</option>
                {availableClients.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
                {availableClients.length === 0 && <option disabled>Nenhum cliente cadastrado</option>}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Produto</label>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Quantidade</label>
                    <input
                    type="text"
                    required
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    value={formData.totalQuantity ? formData.totalQuantity.toLocaleString('pt-BR') : ''}
                    onChange={(e) => {
                        // Allow user to type dots but clean them for state
                        const rawValue = e.target.value.replace(/\./g, '').replace(/\D/g, '');
                        setFormData({ ...formData, totalQuantity: rawValue === '' ? 0 : parseInt(rawValue, 10) });
                    }}
                    placeholder="0"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Bobinas</label>
                    <input
                    type="text"
                    readOnly
                    className="w-full bg-gray-800 border border-gray-600 text-green-400 rounded-lg p-2.5 outline-none font-bold text-center"
                    value={getCalculatedReels(formData.totalQuantity, formData.productName)}
                    placeholder="-"
                    title="Cálculo: (Quantidade x Fator) / 1000"
                    />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Data Início</label>
                <input
                type="date"
                required
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all [color-scheme:dark]"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
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
              className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-md hover:shadow-lg transition-all min-h-[38px]"
            >
              {initialData ? 'Salvar Alterações' : 'Adicionar à Tabela'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
