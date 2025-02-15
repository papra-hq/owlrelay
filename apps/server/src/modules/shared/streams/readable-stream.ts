export async function collectReadableStreamToString({ stream }: { stream: ReadableStream }) {
  return await new Response(stream).text();
}
