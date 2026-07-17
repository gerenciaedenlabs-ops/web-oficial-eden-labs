/**
 * Configuración central del sitio.
 *
 * Los valores sensibles (API keys, SMTP) NUNCA van aquí: viven en variables de
 * entorno del servidor y se leen dentro de `src/lib/lead.ts` (código server-side).
 *
 * Aquí solo van valores públicos, seguros de exponer en el navegador.
 */

/**
 * URL del CRM propio de Edén Labs.
 * Configurable vía la variable de entorno pública PUBLIC_CRM_URL.
 */
export const CRM_URL: string =
  import.meta.env.PUBLIC_CRM_URL || 'https://crm.edenlabs.dev';

/** Datos de contacto públicos de la empresa. */
export const SITE = {
  name: 'Edén Labs',
  email: 'gerenciaedenlabs@gmail.com',
  /** Teléfono en formato para enlaces tel: (E.164). */
  phoneHref: '+573145486712',
  /** Teléfono para mostrar. */
  phoneDisplay: '+57 314 548 6712',
  location: 'Envigado, Antioquia · Colombia',
} as const;

/** Redes sociales oficiales. */
export const SOCIALS = [
  { name: 'Instagram', href: 'https://www.instagram.com/somosedenlabs' },
  { name: 'TikTok', href: 'https://www.tiktok.com/@somosedenlabs' },
  { name: 'LinkedIn', href: 'https://www.linkedin.com/in/somosedenlabs' },
  { name: 'Facebook', href: 'https://www.facebook.com/share/18v6Xv7NhV/' },
] as const;
