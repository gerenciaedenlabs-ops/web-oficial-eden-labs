import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Colección "blog" — artículos en Markdown en src/content/blog/.
 * El nombre del archivo (sin extensión) es el slug de la URL: /blog/<slug>.
 */
const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default('Equipo Eden Labs'),
    tags: z.array(z.string()).default([]),
    /** Imagen de portada opcional (ruta en /public o URL). */
    cover: z.string().optional(),
    /** Marca un artículo como borrador: no se publica en producción. */
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
