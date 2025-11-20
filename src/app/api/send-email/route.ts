// NOTIFICACIÓN POR CORREO ELECTRÓNICO (Resend Service)
// --- INSTRUCCIONES DE INSTALACIÓN ---
// 1. Instalar la dependencia de Resend:
//    pnpm install resend
//
// 2. Colocar la clave API secreta en el archivo .env.local:
//    RESEND_API_KEY=re_TU_CLAVE_SECRETA
//
// 3. (Opcional) Si se usa un dominio propio, este debe estar verificado en Resend.
// --------------------------------------

import { Resend } from "resend";
import { NextResponse } from "next/server";

/**
 * @name POST /api/send-email
 * @description Maneja la solicitud POST para enviar una notificación de tarea asignada.
 * Se llama desde la función createTask en src/lib/firebase/tasks.ts.
 * * @param {Request} request Contiene los datos JSON con el destinatario y la tarea.
 * @returns {NextResponse} Respuesta JSON indicando éxito o fracaso.
 */
export async function POST(request: Request) {
  // La clave API de Resend se accede aquí. Debe estar en .env.local
  const apiKey = process.env.RESEND_API_KEY;

  try {
    // 1. VERIFICACIÓN DE CONFIGURACIÓN
    if (!apiKey) {
      console.error("Error: RESEND_API_KEY no se cargó correctamente.");
      // CÓMO CAMBIAR ESTO: Asegurarse de que el servidor Next.js esté reiniciado y que la variable RESEND_API_KEY esté definida en .env.local.
      return NextResponse.json(
        { error: "Configuración API key faltante" },
        { status: 500 }
      );
    }

    // Inicialización de Resend: Debe estar dentro del manejador de ruta (POST) para asegurar que process.env esté cargado.
    const resend = new Resend(apiKey);

    const { recipientEmail, recipientName, taskTitle } = await request.json();

    // 2. VERIFICACIÓN DE DATOS DEL DESTINATARIO
    if (!recipientEmail) {
      return NextResponse.json(
        { error: "Faltan datos (email del destinatario)" },
        { status: 400 }
      );
    }

    // 3. PREPARACIÓN DEL OBJETO EMAIL
    const emailData = {
      // CÓMO CAMBIAR ESTO: Si la organización tiene un dominio verificado en Resend (ej: 'Sistemas@tt-arquitectos.com'), usarlo aquí.
      // 'onboarding@resend.dev' es un dominio de prueba válido.
      from: "TTask Notificaciones <onboarding@resend.dev>",
      to: recipientEmail,
      subject: `[TTask] Nueva tarea asignada: ${taskTitle}`,
      html: `
        <html>
          <body>
            <h1>👋 ¡Hola ${recipientName || "usuario"}!</h1>
                <p>Te han asignado una nueva tarea en TTask.</p>
                <p><strong>Tarea:</strong> ${taskTitle}</p>
                <br>
                <p>Por favor, revisa tu dashboard de tareas.</p>
                    <a href='http://localhost:3000/dashboard' style="background-color: #f59e0b; color: white; padding: 10px 20px; border: none; border-radius: 5px; text-decoration: none; display: inline-block;">
                      Ver Tarea en TTask
                    </a>
            </body>
          </html>
            `,
    };

    // 4. ENVÍO
    const result = (await resend.emails.send(emailData)) as any;

    if (result.error) {
      console.error("Resend Error:", result.error);
      const errorMessage =
        typeof result.error === "string"
          ? result.error
          : result.error?.message ?? "Unknown Resend error";
      throw new Error(errorMessage);
    }

    // 5. RESPUESTA EXITOSA
    console.log("Correo enviado. Resend ID:", result.data.id);
    return NextResponse.json({
      success: true,
      message: "Correo enviado",
      resendId: result.data.id,
    });
  } catch (error) {
    // 6. MANEJO DE ERRORES INTERNOS/DE RESEND
    console.error("Error al enviar correo con Resend:", error);
    const details = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Fallo en el envío", details },
      { status: 500 }
    );
  }
}
