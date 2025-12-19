import { Router } from 'express';
import { Pool } from 'pg';
import { z } from 'zod';
import env from '@/config/env';
import { addMatchingJob, getQueueStats } from '@/services/matching/processors/queue';
import { generateEmbedding } from '@/services/matching/embeddingService';
import { checkRateLimit } from '@/utils/ai/checkRateLimit';

const router = Router();
const pool = new Pool({ connectionString: env.DATABASE_URL });

router.post('/run', async (req, res) => {
  const schema = z.object({
    type: z.enum(['full', 'project', 'proposal', 'team', 'profile']).default('full'),
    entityId: z.string().optional(),
    priority: z.number().int().min(0).max(10).optional(),
  });

  const body = schema.parse(req.body || {});

  await addMatchingJob({ type: body.type, entityId: body.entityId }, { priority: body.priority ?? 1 });
  res.json({ ok: true });
});

router.get('/stats', async (_req, res) => {
  const stats = await getQueueStats();
  res.json(stats);
});

router.post('/search', async (req, res) => {
  const schema = z.object({
    userId: z.string().optional(),
    type: z.enum(['projects', 'proposals', 'teams']).default('projects'),
    query: z.string().min(1),
    limit: z.number().int().min(1).max(50).default(20),
    filters: z
      .object({
        industry: z.array(z.string()).optional(),
        tags: z.array(z.string()).optional(),
        stage: z.array(z.string()).optional(),
        location: z.array(z.string()).optional(),
      })
      .optional(),
  });

  const body = schema.parse(req.body || {});

  const rateLimited = await checkRateLimit(
    {
      headers: {
        get: (key: string) => {
          const headerValue = req.headers[key.toLowerCase()]
          if (Array.isArray(headerValue)) {
            return headerValue[0]
          }
          return headerValue as string | undefined
        },
      },
    },
    { RPM: 60, RPD: 2000 }
  );

  if (rateLimited instanceof Response) {
    const text = await rateLimited.text();
    return res.status(rateLimited.status).type('application/json').send(text);
  }

  const vector = await generateEmbedding(body.query);

  let sql = '';
  const params: any[] = [vector, body.limit];

  if (body.type === 'projects') {
    sql = `
      SELECT p.id, p.name, p.description, p.tags, p.industry,
             1 - (p.embedding <=> $1::vector) AS similarity
      FROM projects p
      WHERE p.is_public = true AND p.is_active = true AND p.embedding IS NOT NULL
      ORDER BY p.embedding <=> $1::vector
      LIMIT $2
    `;
  } else if (body.type === 'proposals') {
    sql = `
      SELECT pr.id, pr.title, pr.short_summary AS description, pr.industry,
             1 - (pr.embedding <=> $1::vector) AS similarity
      FROM proposals pr
      WHERE pr.visibility = 'PUBLIC' AND pr.embedding IS NOT NULL
      ORDER BY pr.embedding <=> $1::vector
      LIMIT $2
    `;
  } else {
    sql = `
      SELECT t.id, t.name, t.description, t.industry, t.skills,
             1 - (t.embedding <=> $1::vector) AS similarity
      FROM teams t
      WHERE t.is_active = true AND t.embedding IS NOT NULL
      ORDER BY t.embedding <=> $1::vector
      LIMIT $2
    `;
  }

  const result = await pool.query(sql, params);
  const filters = body.filters || {};

  const filtered = result.rows.filter((row) => {
    let ok = true;

    if (filters.industry?.length) {
      const rowInd = (row.industry || []).map((x: string) => x.toLowerCase());
      ok &&= filters.industry.some((i) => rowInd.includes(i.toLowerCase()));
    }

    if (filters.tags?.length && row.tags) {
      const rowTags = (row.tags || []).map((x: string) => x.toLowerCase());
      ok &&= filters.tags.some((t) => rowTags.includes(t.toLowerCase()));
    }

    return ok;
  });

  res.json(filtered);
});

export default router;

