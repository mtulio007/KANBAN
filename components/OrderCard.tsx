
import React from 'react';
import { ProductionOrder, OrderStatus } from '../types';
import { ProgressBar } from './ProgressBar';

interface OrderCardProps {
  order: ProductionOrder;
  onUpdateStatus: (id: string, newStatus: OrderStatus) => void;
  onUpdateProgress: (id: string, newProduced: number) => void;
  onPredict: (id: string) => void;
  onDelete: (id: string) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({ 
  order, 
  onUpdateStatus, 
  onUpdateProgress, 
  onPredict,
  onDelete
}) => {
  
  const handleIncrement = () => {
    if (order.producedQuantity < order.totalQuantity) {
      onUpdateProgress(order.id, order.producedQuantity + 10); // Increment by 10 for demo ease
    }
  };

  const nextStatus = () => {
    const statuses = Object.values(OrderStatus);
    const currentIndex = statuses.indexOf(order.status);
    if (currentIndex < statuses.length - 1) {
      onUpdateStatus(order.id, statuses[currentIndex + 1]);
    }
  };

  const prevStatus = () => {
    const statuses = Object.values(OrderStatus);
    const currentIndex = statuses.indexOf(order.status);
    if (currentIndex > 0) {
      onUpdateStatus(order.id, statuses[currentIndex - 1]);
    }
  };

  // Helper para formatar data 'YYYY-MM-DD' corretamente sem shift de timezone
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const parts = dateString.split('-'); // Espera YYYY-MM-DD
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateString;
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-4 mb-4 flex flex-col gap-3 hover:shadow-md hover:shadow-black/40 transition-shadow">
      
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold tracking-wide bg-gray-700 text-gray-300 mb-1">
            #{order.orderNumber}
          </span>
          <h3 className="font-semibold text-gray-100 leading-tight">{order.clientName}</h3>
          <div className="text-xs text-blue-300 mt-0.5 font-medium">{order.productName}</div>
        </div>
        <button 
            onClick={() => onDelete(order.id)}
            className="text-gray-500 hover:text-red-400 transition-colors"
            title="Excluir pedido"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
      </div>

      {/* Progress Section */}
      <ProgressBar current={order.producedQuantity} total={order.totalQuantity} />
      
      {/* Controls for Simulation */}
      <div className="flex items-center gap-2 text-xs">
         <button 
           onClick={handleIncrement}
           className="px-2 py-1.5 sm:px-3 sm:py-2 bg-blue-900/50 text-xs sm:text-sm text-blue-300 border border-blue-800 rounded-lg hover:bg-blue-900 font-medium transition-colors flex-1 min-h-[36px]"
         >
           +10 Unid.
         </button>
      </div>

      {/* AI Prediction Section */}
      <div className="bg-blue-900/20 rounded p-3 mt-1 border border-blue-800/50">
        <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-blue-300 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
                IA Insight
            </span>
            <button 
            onClick={() => onPredict(order.id)}
                disabled={order.isPredicting}
                className={`px-2 py-1 text-xs underline decoration-dotted rounded ${order.isPredicting ? 'text-gray-500 cursor-not-allowed bg-gray-800/50' : 'text-blue-400 hover:text-blue-300 hover:bg-blue-900/30'} transition-colors`}
            >
                {order.isPredicting ? 'Analisando...' : 'Atualizar Previsão'}
            </button>
        </div>
        <p className="text-xs text-gray-400 italic leading-relaxed">
            {order.aiPrediction ? order.aiPrediction : "Clique para gerar uma previsão de entrega baseada no ritmo atual."}
        </p>
      </div>

      {/* Footer / Navigation */}
      <div className="flex justify-between items-center pt-2 border-t border-gray-700 mt-1">
         <button 
            onClick={prevStatus} 
            disabled={order.status === OrderStatus.PENDING}
            className="p-1.5 rounded-lg hover:bg-gray-700 disabled:opacity-30 text-gray-400 hover:text-white flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 sm:p-1.5"
         >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
             </svg>
         </button>
         <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
            {formatDate(order.startDate)}
         </span>
         <button 
            onClick={nextStatus}
            disabled={order.status === OrderStatus.COMPLETED}
            className="p-1.5 rounded-lg hover:bg-gray-700 disabled:opacity-30 text-gray-400 hover:text-white flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 sm:p-1.5"
         >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
             </svg>
         </button>
      </div>
    </div>
  );
};
