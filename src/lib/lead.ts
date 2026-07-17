/**
 * Entrega de leads del formulario de contacto.
 *
 * Este módulo es SOLO server-side (se importa desde /api/contact). Las
 * credenciales se leen de `process.env` en tiempo de ejecución, así que
 * nunca llegan al navegador.
 *
 * Estrategia de entrega (en orden de preferencia):
 *   1. CRM propio  — si CRM_API_URL está configurada, se hace POST del lead.
 *                    ESTE ES EL DESTINO FINAL cuando la API del CRM esté lista.
 *   2. Correo      — si hay credenciales SMTP, se envía un correo con el lead.
 *                    Puente temporal mientras el CRM no expone API.
 *   3. Dev fallback — en desarrollo, si no hay nada configurado, se registra
 *                     en consola para poder probar la UI. En producción lanza
 *                     error para NO fingir un envío exitoso.
 */

import nodemailer from 'nodemailer';

export interface Lead {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  type?: string;
  message: string;
  /** Metadatos útiles para el CRM / trazabilidad. */
  source?: string;
  submittedAt: string;
}

const env = process.env;

/**
 * Envía el lead a la API del CRM propio.
 * Actívalo definiendo CRM_API_URL (y opcionalmente CRM_API_KEY).
 *
 * 👉 Cuando tengas la API del CRM lista, ajusta el `body` / headers de abajo
 *    al contrato real de tu endpoint. Es el único punto que hay que tocar.
 */
async function sendToCrm(lead: Lead): Promise<void> {
  const url = env.CRM_API_URL!;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(env.CRM_API_KEY ? { Authorization: `Bearer ${env.CRM_API_KEY}` } : {}),
    },
    body: JSON.stringify({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      projectType: lead.type,
      message: lead.message,
      source: lead.source ?? 'web-oficial',
      submittedAt: lead.submittedAt,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`CRM respondió ${res.status}: ${detail.slice(0, 300)}`);
  }
}

/** Puente por correo vía SMTP (nodemailer). */
async function sendByEmail(lead: Lead): Promise<void> {
  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: Number(env.SMTP_PORT ?? 587),
    secure: env.SMTP_SECURE === 'true', // true para el puerto 465
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  });

  const to = env.LEAD_TO || env.SMTP_USER!;
  const from = env.LEAD_FROM || `Eden Labs Web <${env.SMTP_USER}>`;

  await transporter.sendMail({
    from,
    to,
    replyTo: lead.email,
    subject: `Nuevo lead — ${lead.name}${lead.company ? ` (${lead.company})` : ''}`,
    text: [
      `Nombre:   ${lead.name}`,
      `Correo:   ${lead.email}`,
      `Teléfono: ${lead.phone || '—'}`,
      `Empresa:  ${lead.company || '—'}`,
      `Tipo:     ${lead.type || '—'}`,
      `Origen:   ${lead.source || 'web-oficial'}`,
      `Fecha:    ${lead.submittedAt}`,
      '',
      'Mensaje:',
      lead.message,
    ].join('\n'),
  });
}

const hasCrm = () => Boolean(env.CRM_API_URL);
const hasSmtp = () => Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);

/**
 * Entrega el lead por el mejor canal disponible.
 * Lanza si no logra entregarlo (para que el endpoint devuelva error real).
 */
export async function deliverLead(lead: Lead): Promise<void> {
  if (hasCrm()) {
    await sendToCrm(lead);
    return;
  }

  if (hasSmtp()) {
    await sendByEmail(lead);
    return;
  }

  // Nada configurado.
  if (import.meta.env.DEV) {
    console.warn(
      '[lead] Sin canal de entrega configurado (CRM_API_URL o SMTP_*). ' +
        'Lead registrado solo en consola:\n',
      lead
    );
    return;
  }

  throw new Error(
    'No hay canal de entrega de leads configurado. Define CRM_API_URL o las variables SMTP_*.'
  );
}
