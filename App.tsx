
import React, { useState, useEffect, useRef } from 'react';
import { ProductionOrder, OrderStatus, CreateOrderData } from './types';
import { NewOrderModal } from './components/NewOrderModal';
import { DataManagementModal } from './components/DataManagementModal';
import { ProgressBar } from './components/ProgressBar';
import { predictCompletion } from './services/gemini';
import { Login } from './components/Login';

// --- MOCK DATA INICIAL (Fallback) ---
const INITIAL_ORDERS: ProductionOrder[] = [
  {
    id: '1',
    orderNumber: 'PO-2025-089',
    clientName: 'TRES CIDADE COMERCIO DE GELO LTDA',
    productName: 'SACO Z CONV 60X90CM',
    totalQuantity: 5000,
    producedQuantity: 4850,
    startDate: '2025-11-15',
    status: OrderStatus.IN_PRODUCTION,
    aiPrediction: "Conclusão estimada para amanhã cedo, ritmo acelerado.",
    isPredicting: false
  },
  {
    id: '2',
    orderNumber: 'PO-2025-092',
    clientName: 'GELO SILVA LTDA',
    productName: 'TECIDO PRETO 2,80x80m',
    totalQuantity: 120,
    producedQuantity: 35,
    startDate: '2025-11-20',
    status: OrderStatus.IN_PRODUCTION,
    aiPrediction: null,
    isPredicting: false
  },
  {
    id: '3',
    orderNumber: 'PO-2025-090',
    clientName: 'GRUPO PIANNA',
    productName: 'SACO LAMINADO 65X90CM',
    totalQuantity: 2000,
    producedQuantity: 2000,
    startDate: '2025-11-18',
    status: OrderStatus.COMPLETED,
    aiPrediction: "Concluído dentro do prazo.",
    isPredicting: false
  },
  {
    id: '4',
    orderNumber: 'PO-2025-095',
    clientName: 'EXITO DISTRIBUIDORA E SERVICOS DE TRANSP',
    productName: 'SACO Z LAM 65X100CM',
    totalQuantity: 800,
    producedQuantity: 0,
    startDate: '2025-11-21',
    status: OrderStatus.PENDING,
    aiPrediction: null,
    isPredicting: false
  }
];

const INITIAL_PRODUCTS = [
  'TECIDO PRETO 2,80x80m',
  'TECIDO PRETO 2,80x70m',
  'TECIDO PRETO 3,30x80m',
  'TECIDO PRETO 3,30x100m',
  'TECIDO PRETO 3,00x80m',
  'TECIDO PRETO 3,20x80m',
  'TECIDO PRETO 3,60x80m',
  'TECIDO PRETO 3,00x100m',
  'SACO CONVENCIONAL 60X95CM',
  'SACO LAMINADO 50X80CM',
  'SACO LAMINADO 65X90CM',
  'SACO Z CONV 50X75CM',
  'SACO Z CONV 50X90CM',
  'SACO Z CONV 55X80CM',
  'SACO Z CONV 60X100CM',
  'SACO Z CONV 60X80CM',
  'SACO Z CONV 60X90CM',
  'SACO Z CONV 65X100CM',
  'SACO Z CONV 65X90CM',
  'SACO Z CONV 65X95CM',
  'SACO Z CONV 70X100CM',
  'SACO Z LAM 50X80CM',
  'SACO Z LAM 55X80CM',
  'SACO Z LAM 60X100CM',
  'SACO Z LAM 60X90CM',
  'SACO Z LAM 65X100CM'
];

const INITIAL_CLIENTS = [
  'TRES CIDADE COMERCIO DE GELO LTDA',
  'GELO SILVA LTDA',
  'FV DE ALBUQUERQUE EMBALAGENS - ME',
  'EXITO DISTRIBUIDORA E SERVICOS DE TRANSP',
  'GELO FORT LTDA',
  'IMPORTADORA NOVA OLINDA LTDA',
  'JOSE FREITAS DA SILVA',
  'RAGININNE CACOAL RO',
  'GRUPO PIANNA'
];

// Keys para o LocalStorage (Simulando tabelas do banco)
const DB_KEYS = {
  ORDERS: 'kanban_db_orders',
  PRODUCTS: 'kanban_db_products',
  CLIENTS: 'kanban_db_clients'
};

const App: React.FC = () => {
  // --- Inicialização do Estado com Persistência Local ---
  
  const [orders, setOrders] = useState<ProductionOrder[]>(() => {
    const saved = localStorage.getItem(DB_KEYS.ORDERS);
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [products, setProducts] = useState<string[]>(() => {
    const saved = localStorage.getItem(DB_KEYS.PRODUCTS);
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [clients, setClients] = useState<string[]>(() => {
    const saved = localStorage.getItem(DB_KEYS.CLIENTS);
    return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);

  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [draggedOrderIndex, setDraggedOrderIndex] = useState<number | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('isAuthenticated') === 'true';
  });

  const handleLoginSuccess = () => {
    sessionStorage.setItem('isAuthenticated', 'true');
    setIsAuthenticated(true);
  };

  const isInteractingRef = useRef<boolean>(false);
  const lastMutationTimeRef = useRef<number>(0);

  // --- Efeitos para Persistência e Sincronização Local na Rede ---
  // CARREGAMENTO INICIAL
  useEffect(() => {
    // 1. CARREGA PRODUTOS E CLIENTES (JSON LEGADO)
    fetch('/api/db')
      .then(res => res.json())
      .then(data => {
        if (data && data.empty) {
          fetch('/api/db', { method: 'POST', body: JSON.stringify({ products, clients }) }).catch(console.error);
        } else if (data) {
          if (data.products && data.products.length > 0) setProducts(data.products);
          if (data.clients && data.clients.length > 0) setClients(data.clients);
        }
      });

    // 2. CARREGA PEDIDOS (SQLITE)
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        if (!data || data.length === 0) {
          // Se o banco SQLite está limpo, empurra as ordens do LocalStorage para provisionar
          fetch('/api/orders', { method: 'POST', body: JSON.stringify(orders) }).catch(console.error);
        } else {
          setOrders(data);
        }
        setIsReady(true);
      })
      .catch(e => {
        console.error("Falha ao comunicar com BD Orders:", e);
        setIsReady(true);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // SINCRONIZAÇÃO EM TEMPO REAL (POLLING SQLite)
  useEffect(() => {
    if (!isReady) return;
    const interval = setInterval(() => {
      // Pausa se o usuário estiver arrastando/editando campos 
      // ou se houve uma edição local muito recente (evita race-condition de polling buscar tabela velha antes do POST)
      if (isInteractingRef.current || (Date.now() - lastMutationTimeRef.current < 2000)) return; 
      
      fetch('/api/orders')
        .then(res => res.json())
        .then(data => {
           if (!isInteractingRef.current) {
               setOrders(prev => {
                   // Evita re-renders se não houver mudança real
                   if (JSON.stringify(prev) !== JSON.stringify(data)) {
                       return data;
                   }
                   return prev;
               });
           }
        })
        .catch(console.error);
    }, 2500); // 2.5s update rate
    return () => clearInterval(interval);
  }, [isReady]);

  // SALVAMENTO NO SERVIDOR
  useEffect(() => {
    if (!isReady) return;
    localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify(orders));

    // Anota tempo da mutação (para evitar que o poll receba dados velhos durante debounce)
    lastMutationTimeRef.current = Date.now();

    const timer = setTimeout(() => {
      fetch('/api/orders', { method: 'POST', body: JSON.stringify(orders) }).catch(console.error);
    }, 500);
    return () => clearTimeout(timer);
  }, [orders, isReady]);

  useEffect(() => {
    if (!isReady) return;
    localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(products));
    localStorage.setItem(DB_KEYS.CLIENTS, JSON.stringify(clients));

    const timer = setTimeout(() => {
      fetch('/api/db', { method: 'POST', body: JSON.stringify({ products, clients }) }).catch(console.error);
    }, 500);
    return () => clearTimeout(timer);
  }, [products, clients, isReady]);


  // --- Handlers de Lógica de Negócio ---

  const handleDragStart = (e: React.DragEvent, index: number) => {
    isInteractingRef.current = true;
    setDraggedOrderIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedOrderIndex === null || draggedOrderIndex === index) return;
    
    setOrders((prev) => {
      const newOrders = [...prev];
      const draggedOrder = newOrders[draggedOrderIndex];
      newOrders.splice(draggedOrderIndex, 1);
      newOrders.splice(index, 0, draggedOrder);
      setDraggedOrderIndex(index);
      return newOrders;
    });
  };

  const handleDragEnd = () => {
    isInteractingRef.current = false;
    setDraggedOrderIndex(null);
  };

  const addProduct = (item: string) => {
      if (!products.includes(item)) {
          setProducts(prev => [...prev, item].sort());
      }
  };

  const removeProduct = (item: string) => {
      setProducts(prev => prev.filter(p => p !== item));
  };
  
  const addClient = (item: string) => {
      if (!clients.includes(item)) {
          setClients(prev => [...prev, item].sort());
      }
  };

  const removeClient = (item: string) => {
      setClients(prev => prev.filter(c => c !== item));
  };

  const handleSaveOrder = (data: CreateOrderData) => {
    if (editingOrderId) {
        // Editar Existente (UPDATE)
        setOrders(prevOrders => prevOrders.map(order => {
            if (order.id === editingOrderId) {
                return { 
                    ...order, 
                    ...data, 
                    // Garante que produzido não seja maior que total se o total diminuiu
                    producedQuantity: Math.min(order.producedQuantity, data.totalQuantity)
                };
            }
            return order;
        }));
        setEditingOrderId(null);
    } else {
        // Criar Novo (CREATE)
        const newOrder: ProductionOrder = {
            id: Date.now().toString(), // ID único baseado em timestamp
            orderNumber: data.orderNumber,
            clientName: data.clientName,
            productName: data.productName,
            totalQuantity: data.totalQuantity,
            producedQuantity: 0,
            startDate: data.startDate,
            status: OrderStatus.PENDING,
            aiPrediction: null,
            isPredicting: false
        };
        setOrders(prev => [...prev, newOrder]);
    }
  };

  const handleEditClick = (order: ProductionOrder) => {
      setEditingOrderId(order.id);
      setIsModalOpen(true);
  };

  const handleCloseModal = () => {
      setIsModalOpen(false);
      setEditingOrderId(null);
  };

  const handleUpdateStatus = (id: string, e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as OrderStatus;
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
  };

  const handleQuantityChange = (id: string, newQuantity: number) => {
      setOrders(prev => prev.map(o => {
          if (o.id === id) {
              const safeProduced = Math.max(0, Math.min(newQuantity, o.totalQuantity));
              
              // Lógica de atualização automática de status
              let newStatus = o.status;
              if (safeProduced > 0 && o.status === OrderStatus.PENDING) {
                  newStatus = OrderStatus.IN_PRODUCTION;
              }
              if (safeProduced >= o.totalQuantity) {
                  newStatus = OrderStatus.COMPLETED;
              }

              return { ...o, producedQuantity: safeProduced, status: newStatus };
          }
          return o;
      }));
  };

  const handlePredict = async (id: string) => {
    const order = orders.find(o => o.id === id);
    if (!order) return;

    setOrders(prev => prev.map(o => o.id === id ? { ...o, isPredicting: true } : o));
    
    // Chama o serviço do Gemini (que ainda funciona se a API KEY estiver no env)
    const prediction = await predictCompletion(order);

    setOrders(prev => prev.map(o => o.id === id ? { ...o, isPredicting: false, aiPrediction: prediction } : o));
  };

  const confirmDelete = () => {
      if (orderToDelete) {
        // DELETE
        setOrders(prevOrders => prevOrders.filter(o => o.id !== orderToDelete));
        setOrderToDelete(null);
      }
  };

  const resetDatabase = () => {
      if (window.confirm("Isso apagará todos os seus dados locais e restaurará o exemplo inicial. Tem certeza?")) {
          localStorage.removeItem(DB_KEYS.ORDERS);
          localStorage.removeItem(DB_KEYS.PRODUCTS);
          localStorage.removeItem(DB_KEYS.CLIENTS);
          window.location.reload();
      }
  };

  const generatePDF = () => {
    const printWindow = window.open('', '_blank');
    const now = new Date().toLocaleString('pt-BR');
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
<title>Controle de Produção Pra Café</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; font-size: 11px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 2px; text-align: left; margin: 0; }
          th { background-color: #f2f2f2; font-weight: bold; font-size: 10px; }
          .status-pendente { background-color: #f3e5f5; }
          .status-produzindo { background-color: #e1f5fe; }
          .status-concluido { background-color: #fff3e0; }
          .footer { margin-top: 20px; font-size: 9px; text-align: center; color: #666; }
        </style>
      </head>
      <body>
        <div style="display: flex; align-items: center; justify-content: flex-start; padding-left: 40px; margin: 20px 0 30px 20px;">
          <img src="data:image/jpeg;base64,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" alt="Logo" style="height: 50px; margin-right: 15px;" />
          <h1 style="font-size: 24px; font-weight: bold; margin: 0; color: #333;">Controle de Produção Pra Café</h1>
        </div>
        <table>
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Descrição</th>
              <th>QTD</th>
              <th>Produzido</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${orders.map(order => `
              <tr>
                <td>${order.clientName}</td>
                <td>${order.productName}</td>
                <td>${order.totalQuantity.toLocaleString('pt-BR')}</td>
                <td>${order.producedQuantity.toLocaleString('pt-BR')}</td>
                <td class="status-${order.status.toLowerCase().replace(' ', '-')}">${order.status}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div style="margin-top: 20px; font-size: 9px; text-align: right; padding-right: 10px; color: #666;">Gerado em: ${now}</div>
      </body>
      </html>
    `;
    printWindow?.document.write(htmlContent);
    printWindow?.document.close();
    printWindow?.print();
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-gray-100 font-sans">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-30 shadow-md">
        <div className="max-w-full mx-auto px-6">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
                <div className="bg-blue-600 text-white p-2 rounded-lg shadow-lg shadow-blue-500/20">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white tracking-tight">KanbanClient</h1>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-blue-400 uppercase tracking-widest font-semibold">Pracafé - Produção</p>
                      <span className="text-[10px] px-1.5 py-0.5 bg-green-900/50 text-green-300 border border-green-800 rounded">DB: Local</span>
                    </div>
                </div>
            </div>
            
            <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsClientModalOpen(true)}
                  className="hidden sm:inline-flex items-center px-2.5 py-1.5 sm:px-3 sm:py-2 border border-gray-600 text-xs sm:text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Clientes
                </button>
                <button
                  onClick={() => setIsProductModalOpen(true)}
                  className="hidden sm:inline-flex items-center px-2.5 py-1.5 sm:px-3 sm:py-2 border border-gray-600 text-xs sm:text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  Produtos
                </button>
                <button
                  onClick={generatePDF}
                  className="hidden sm:inline-flex items-center px-2.5 py-1.5 sm:px-3 sm:py-2 border border-green-600 text-xs sm:text-sm font-medium rounded-md text-green-300 bg-green-900/50 hover:bg-green-800/50 transition-colors"
                  title="Gerar PDF dos Pedidos"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  PDF
                </button>

                <div className="h-6 w-px bg-gray-700 mx-2"></div>

                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all min-h-[38px]"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Novo
                </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Table Area */}
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-full mx-auto bg-gray-800 rounded-xl shadow-xl border border-gray-700 overflow-hidden">
            <div className="max-h-[85vh] overflow-y-auto overflow-x-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 hover:scrollbar-thumb-gray-500 min-w-0 w-full mx-auto pr-2">
            <table className="min-w-full divide-y divide-gray-700 relative">
<thead className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur-sm shadow-sm">
                <tr>
<th scope="col" className="px-3 py-2 text-left text-[11px] font-bold text-white uppercase tracking-wider w-28" style={{display: 'none'}}>OP</th>
                  <th scope="col" className="px-3 py-2 text-left text-[11px] font-bold text-white uppercase tracking-wider w-full sm:w-[180px] min-w-[120px]">Cliente</th>
                  <th scope="col" className="px-3 py-2 text-left text-[11px] font-bold text-white uppercase tracking-wider w-[160px] sm:w-[240px]">Descrição</th>
                  <th scope="col" className="px-4 py-2 text-center text-[11px] font-bold text-white uppercase tracking-wider w-20">QTD</th>
                  <th scope="col" className="px-3 py-2 text-center text-[11px] font-bold text-white uppercase tracking-wider w-20">Produzido</th>
                  <th scope="col" className="px-2 py-2 text-center text-xs sm:text-[11px] font-bold text-white uppercase tracking-wider w-16 sm:w-24 min-w-[60px]">Status</th>
                  <th scope="col" className="px-3 py-2 text-center text-[11px] font-bold text-white uppercase tracking-wider w-24 sm:w-40">Progresso</th>
                  <th scope="col" className="px-3 py-2 text-right text-[11px] font-bold text-white uppercase tracking-wider w-20 sm:w-28">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {orders.length === 0 ? (
                    <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                            Nenhum pedido cadastrado.
                        </td>
                    </tr>
                ) : (
                orders.map((order, index) => (
                  <tr 
                    key={order.id} 
                    className={`hover:bg-gray-750 transition-colors group cursor-grab active:cursor-grabbing ${draggedOrderIndex === index ? 'opacity-50 bg-gray-700' : ''}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                  >
                    <td className="px-3 py-2 whitespace-nowrap" style={{display: 'none'}}>
                      <div className="flex flex-col">
                        <span className="bg-gray-700 text-gray-200 text-[10px] font-mono py-0.5 px-1.5 rounded border border-gray-600 w-fit">
                            #{order.orderNumber}
                        </span>
                        {order.aiPrediction && (
                            <span className="text-[10px] text-blue-300 mt-1 truncate max-w-[100px] cursor-help" title={order.aiPrediction}>
                                ✨ IA Analisou
                            </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-xs text-gray-200 truncate max-w-[90px] sm:max-w-[160px] leading-tight" title={order.clientName}>{order.clientName}</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-xs text-gray-300 w-[120px] sm:w-[200px] leading-tight hover:truncate" title={order.productName}>{order.productName}</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-center">
                       <div className="text-xs font-bold text-white mx-auto">{order.totalQuantity.toLocaleString('pt-BR')}</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-center mx-auto">
                        <input 
                          type="text"
                          className="mx-auto w-14 bg-gray-900 text-blue-300 border border-gray-600 rounded px-1.5 py-1 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-semibold text-center shadow-inner placeholder-gray-600"
                          value={order.producedQuantity === 0 ? "0" : order.producedQuantity.toLocaleString('pt-BR')}
                          onFocus={() => isInteractingRef.current = true}
                          onBlur={() => isInteractingRef.current = false}
                          onChange={(e) => {
                              const rawValue = e.target.value.replace(/\./g, '').replace(/\D/g, '');
                              const numValue = rawValue === '' ? 0 : parseInt(rawValue, 10);
                              handleQuantityChange(order.id, numValue);
                          }}
                          placeholder="0"
                        />
                    </td>
                    <td className="px-1 sm:px-2 py-2 whitespace-nowrap min-w-[55px]">
                        <select 
                            value={order.status}
                            onFocus={() => isInteractingRef.current = true}
                            onBlur={() => isInteractingRef.current = false}
                            onChange={(e) => handleUpdateStatus(order.id, e)}
                            className={`text-xs font-semibold rounded px-1 py-0.5 sm:px-1.5 sm:py-1 border-0 cursor-pointer outline-none focus:ring-1 focus:ring-blue-500/50 w-full h-[28px] sm:h-[32px] sm:h-auto ${
                                order.status === OrderStatus.PENDING ? 'bg-red-900/60 text-red-200' :
                                order.status === OrderStatus.IN_PRODUCTION ? 'bg-blue-600/60 text-blue-100' :
                                'bg-green-500/60 text-green-100'
                            }`}
                        >
                            {Object.values(OrderStatus).map(status => (
                                <option key={status} value={status} className="bg-gray-800 text-white">
                                    {status}
                                </option>
                            ))}
                        </select>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap align-middle">
                       <ProgressBar current={order.producedQuantity} total={order.totalQuantity} compact={true} />
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-right text-xs font-medium min-w-[72px]">
                      <div className="flex items-center justify-end gap-0.5">

                        <button 
                            type="button"
                            onClick={() => handleEditClick(order)}
                            title="Editar"
                            className="text-gray-400 hover:text-blue-400 transition-colors p-1 rounded-lg hover:bg-gray-700/50 flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 sm:p-1.5"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </button>
                        <button 
                            type="button"
                            onClick={() => setOrderToDelete(order.id)}
                            title="Excluir"
                            className="text-gray-400 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-gray-700/50 flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 sm:p-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Footer removido conforme pedido */}

      <NewOrderModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSaveOrder}
        initialData={editingOrderId ? orders.find(o => o.id === editingOrderId) : null}
        availableProducts={products}
        availableClients={clients}
      />

      {/* Modais de Gestão */}
      <DataManagementModal 
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        title="Gerenciar Produtos"
        items={products}
        onAddItem={addProduct}
        onRemoveItem={removeProduct}
        placeholder="Nome do Produto"
      />

      <DataManagementModal 
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        title="Gerenciar Clientes"
        items={clients}
        onAddItem={addClient}
        onRemoveItem={removeClient}
        placeholder="Nome da Empresa/Cliente"
      />

      {/* Delete Confirmation Modal */}
      {orderToDelete && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm p-4">
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 max-w-sm w-full shadow-2xl">
                <h3 className="text-lg font-bold text-white mb-2">Excluir Pedido?</h3>
                <p className="text-gray-400 text-sm mb-6">
                    Tem certeza que deseja remover este pedido? Esta ação não pode ser desfeita e será salva no banco local.
                </p>
                <div className="flex justify-end gap-3">
                    <button 
                        onClick={() => setOrderToDelete(null)}
                        className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors text-xs sm:text-sm font-medium min-h-[38px]"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={confirmDelete}
                        className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/20 transition-all text-xs sm:text-sm font-medium min-h-[38px]"
                    >
                        Excluir
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default App;
