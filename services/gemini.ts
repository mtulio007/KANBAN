import { GoogleGenAI } from "@google/genai";
import { ProductionOrder } from '../types';

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export const predictCompletion = async (order: ProductionOrder): Promise<string> => {
  try {
    const today = new Date().toLocaleDateString('pt-BR');
    const startDate = new Date(order.startDate).toLocaleDateString('pt-BR');
    const progress = Math.round((order.producedQuantity / order.totalQuantity) * 100);

    const prompt = `
      Atue como um gerente de produção industrial especialista.
      Analise o seguinte pedido de produção e estime a data de conclusão e forneça uma breve justificativa (máximo 2 frases).

      Dados do Pedido:
      - Número: ${order.orderNumber}
      - Cliente: ${order.clientName}
      - Data de Início: ${startDate}
      - Data Atual: ${today}
      - Quantidade Total: ${order.totalQuantity}
      - Quantidade Produzida: ${order.producedQuantity}
      - Progresso Atual: ${progress}%

      Se o progresso for 0%, assuma uma velocidade de produção padrão da indústria para este volume.
      Se o progresso for > 0%, use a velocidade média baseada no tempo decorrido desde a data de início até hoje para projetar o fim.
      
      Retorne APENAS a estimativa de data e a justificativa curta. Não use markdown.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Erro ao gerar predição:", error);
    return "Não foi possível gerar uma estimativa no momento. Verifique sua chave de API.";
  }
};