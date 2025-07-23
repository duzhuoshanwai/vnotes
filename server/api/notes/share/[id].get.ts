import { transformNote } from '../../../utils/transformNote';

export default defineEventHandler(async (event) => {
  const { cloudflare } = event.context;
  const shareId = getRouterParam(event, 'id');

  if (!shareId) {
    throw createError({
      statusCode: 400,
      message: 'Missing share ID',
    });
  }

  try {
    const note = await cloudflare.env.DB.prepare(
      'SELECT * FROM notes WHERE share_id = ?1'
    )
      .bind(shareId)
      .first();

    if (!note) {
      throw createError({
        statusCode: 404,
        message: 'Note not found',
      });
    }

    return transformNote(note);
  } catch (err) {
    console.error('Error fetching note by share ID:', err);
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch note. Please try again.',
    });
  }
});
