import { generateManifest } from "../lib/generateManifest";

export async function GET(request) {
  const host = request.headers.get('host');
  const subdomain = host.split('.')[0];

  const manifest = await generateManifest(subdomain);

  return new Response(manifest, {
    headers: {
      "Content-Type": "application/manifest+json",
    },
  });
}