import type { APIRoute } from 'astro';
import { deliverLead, type Lead } from '../../lib/lead';

// Este endpoint se renderiza en el servidor (no se prerenderiza).
export const prerender = false;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ request }) => {
  let data: Record<string, unknown>;
  try {
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      data = await request.json();
    } else {
      const form = await request.formData();
      data = Object.fromEntries(form.entries());
    }
  } catch {
    return json({ ok: false, error: 'Cuerpo de la petición inválido.' }, 400);
  }

  // Honeypot: campo oculto que solo los bots rellenan.
  if (typeof data.website === 'string' && data.website.trim() !== '') {
    return json({ ok: true }); // fingimos éxito para no dar pistas al bot
  }

  const name = String(data.name ?? '').trim();
  const email = String(data.email ?? '').trim();
  const message = String(data.message ?? '').trim();
  const company = String(data.company ?? '').trim();
  const type = String(data.type ?? '').trim();
  const phone = String(data.phone ?? '').trim();

  const errors: Record<string, string> = {};
  if (!name) errors.name = 'El nombre es obligatorio.';
  if (!email) errors.email = 'El correo es obligatorio.';
  else if (!EMAIL_RE.test(email)) errors.email = 'El correo no es válido.';
  if (!message) errors.message = 'El mensaje es obligatorio.';
  if (message.length > 5000) errors.message = 'El mensaje es demasiado largo.';

  if (Object.keys(errors).length > 0) {
    return json({ ok: false, errors }, 400);
  }

  const lead: Lead = {
    name,
    email,
    phone: phone || undefined,
    company: company || undefined,
    type: type || undefined,
    message,
    source: 'web-oficial',
    submittedAt: new Date().toISOString(),
  };

  try {
    await deliverLead(lead);
    return json({ ok: true });
  } catch (err) {
    console.error('[api/contact] Error al entregar el lead:', err);
    return json(
      { ok: false, error: 'No pudimos enviar tu mensaje. Intenta de nuevo o escríbenos directamente.' },
      502
    );
  }
};
