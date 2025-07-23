import { transformNote } from '../../utils/transformNote';

export default defineEventHandler(async (event) => {
  const { cloudflare } = event.context;

  const { results } = await cloudflare.env.DB.prepare(
    `SELECT * FROM notes ORDER BY created_at DESC LIMIT 50;`
  ).all();

  if (!results) {
    return [];
  }

  return results.map(transformNote);
});
