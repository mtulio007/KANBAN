export enum OrderStatus {
  PENDING = 'Pendente',
  IN_PRODUCTION = 'Produzindo',
  COMPLETED = 'Concluído'
}

export interface ProductionOrder {
  id: string;
  orderNumber: string;
  clientName: string;
  productName: string; // Novo campo
  totalQuantity: number;
  producedQuantity: number;
  startDate: string; // ISO Date string
  status: OrderStatus;
  aiPrediction: string | null;
  isPredicting: boolean;
}

export interface CreateOrderData {
  orderNumber: string;
  clientName: string;
  productName: string; // Novo campo
  totalQuantity: number;
  startDate: string;
}
