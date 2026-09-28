import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

// Inicializamos el SDK de Gemini. Asegúrate de tener GEMINI_API_KEY en tu archivo .env
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'MISSING_KEY' });

export async function negotiateDeliveryFee(distanceKm: number, weather: string, traffic: string): Promise<any> {
    const prompt = `
    Eres un Agente Logístico Autónomo de un protocolo descentralizado. 
    Tu objetivo es calcular una tarifa de entrega JUSTA y CERO-COMISIONES, sin extraer valor como UberEats o Rappi.
    
    Variables actuales del entorno:
    - Distancia del envío: ${distanceKm} kilómetros.
    - Clima actual: ${weather}.
    - Tráfico: ${traffic}.

    Reglas de cálculo (simuladas en moneda local, ej. MXN):
    - Base: $15 MXN
    - Por kilómetro: $5 MXN
    - Multiplicador por Clima Lluvioso: 1.2x
    - Multiplicador por Tráfico Alto: 1.1x

    Devuelve ÚNICAMENTE un objeto JSON válido con la siguiente estructura (sin comillas invertidas ni formateo markdown):
    {
      "deliveryFee": 32.50,
      "breakdown": {
        "base": 15.0,
        "distance": 12.5,
        "weather": 2.0,
        "traffic": 3.0,
        "reason": "Explicación breve (ej. tarifa calculada para 2.5km con clima lluvioso)"
      }
    }
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
        });
        
        const rawText = response.text?.replace(/```json/g, '').replace(/```/g, '').trim() || "{}";
        const result = JSON.parse(rawText);
        
        if (!result.deliveryFee || result.deliveryFee <= 0) {
            throw new Error("Invalid format");
        }
        
        return result;
    } catch (error) {
        console.error("Error al consultar Gemini:", error);
        return {
          deliveryFee: 25.0,
          breakdown: { base: 15.0, distance: 10.0, weather: 0, traffic: 0, reason: "Tarifa de contingencia aplicada por alta demanda en la red (Fallback)" }
        };
    }
}
