
import { GoogleGenAI, Type } from "@google/genai";
import { Report } from "../types";

export const generateAIInsights = async (report: Report): Promise<string[]> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return ["AI insights unavailable (no API key)."];

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const salesBreakdown = Object.entries(report.sales)
    .filter(([_, data]) => data.revenue > 0)
    .map(([channel, data]) => `- ${channel}: Revenue ${data.revenue}, Orders ${data.orders}`)
    .join('\n');

  const prompt = `
    Analyze the following daily marketing performance report for the brand "${report.brandName}" and provide exactly 3 concise, actionable, high-level business insights.
    
    Overall Metrics:
    - Platform: ${report.platform}
    - Total Ad Spend: ${report.metrics.totalSpend}
    - Total Revenue: ${report.metrics.totalRevenue}
    - Total Orders: ${report.metrics.totalOrders}
    - ROAS: ${report.metrics.roas.toFixed(2)} (Target: 4.0+)
    - CPO: ${report.metrics.cpo.toFixed(2)}
    
    Ad Spend Details:
    - Awareness: ${report.spend.awareness}
    - Reels: ${report.spend.reels}
    - Sales Campaigns: ${report.spend.sales}
    - Leads: ${report.spend.leads}
    
    Channel Sales Data:
    ${salesBreakdown}

    Provide advice on where to shift budget or which channel is performing exceptionally well.
    Format the response as a JSON array of 3 strings.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    const text = response.text || "[]";
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return [
      "Review high-spend awareness campaigns for better conversion potential.",
      "Consider scaling budget on channels with the lowest CPO.",
      "Monitor daily ROAS trends to optimize platform allocation."
    ];
  }
};
