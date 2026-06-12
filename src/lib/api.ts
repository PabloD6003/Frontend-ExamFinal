// Cliente de API para el módulo de reporte de fraudes.
//
// La URL base del Backend se lee de la variable de entorno VITE_API_URL.
// En local suele ser algo como "http://localhost:5000" (revise el puerto que
// expone su Backend .NET). En producción será la URL pública del API en
// Monster ASP.NET (Parte 5 del examen).
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

// El controlador .NET con [Route("api/[controller]")] y un FraudController
// expone la ruta "api/Fraud". Si su controlador usa otro nombre o ruta,
// ajuste esta constante.
const FRAUDS_ENDPOINT = `${API_URL}/api/Fraud`;

// Forma de un reporte tal como lo devuelve el Backend (GET).
// System.Text.Json en .NET serializa en camelCase por defecto, por eso las
// propiedades van en minúscula inicial. Si su API devuelve PascalCase,
// ajuste estos nombres.
export interface Fraud {
  id: number;
  impostorDetails: string;
  contactInfo: string;
  comments: string;
  createdAt: string;
}

// Datos que se envían al crear un reporte (POST). No se manda Id ni CreatedAt:
// esos los genera el Backend / la base de datos.
export interface NewFraud {
  impostorDetails: string;
  contactInfo: string;
  comments: string;
}

// Crea un reporte de fraude (POST).
export async function createFraud(data: NewFraud): Promise<Fraud> {
  const response = await fetch(FRAUDS_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    // Intentamos leer un mensaje de error del Backend (400, etc.).
    let message = `Error ${response.status} al enviar el reporte.`;
    try {
      const body = await response.json();
      if (body?.message) message = body.message;
    } catch {
      // El cuerpo no era JSON; usamos el mensaje genérico.
    }
    throw new Error(message);
  }

  return response.json();
}

// Obtiene todos los reportes de fraude (GET).
export async function getFraudes(): Promise<Fraud[]> {
  const response = await fetch(FRAUDS_ENDPOINT, { method: "GET" });

  if (!response.ok) {
    throw new Error(`Error ${response.status} al consultar los reportes.`);
  }

  return response.json();
}
