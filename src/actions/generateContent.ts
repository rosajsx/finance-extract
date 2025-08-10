"use server";
import { GoogleGenAI } from "@google/genai";

export async function generateContent(values: string) {
  "use server";
  const genAi = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY });

  const prompt = `
    Gere um relatório detalhado com base nos seguintes dados financeiros: 
    ${values}

    - Analise padrões de comportamento financeiro
    - Identifique tendências de gastos e receitas
    - Destaque categorias de maior impacto financeiro
    - Sugira recomendações para otimização financeira

    - Ignore entradas como pagamento online, pois é um pagamento de fatura e não infere nos gastos.

    O relatório deve vir em formato de JSON, com as seguintes chaves:
    - title: Titulo do relatório
    - summary: Resumo do relatório
    - insights: Insights importantes sobre os dados
      - se o valor for um número, formate em reais (R$)
      - se o valor for uma porcentagem, formate como porcentagem
      - se o valor for uma data, formate como "dd/mm/yyyy"
      - se o valor for um texto, mantenha o texto original
      - se o valor for uma lista de textos, converta em uma string unica. 
      - seu formato, deve ser uma lista de strings (um array)
    - recommendations: Recomendações baseadas nos dados
    - conclusion: Conclusão do relatório
    - chartData: Dados formatados para gráficos (se aplicável)
    `;

  const response = await genAi.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      thinkingConfig: {
        thinkingBudget: 0, // Disables thinking
      },
    },
  });

  console.log("metadata", response.usageMetadata);
  console.log("text", response.text);

  return response.text;
}
