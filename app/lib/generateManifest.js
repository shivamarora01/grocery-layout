import { fetchManifestData } from "./fetchManifestData";

export async function generateManifest(domain) {
  const manifestData = await fetchManifestData(domain);
  const manifest = {
    name: manifestData.legalName,
    short_name: manifestData.legalName,
    description: "Next.js App",
    start_url: "/",
    display: "standalone",
    background_color: "#fff",
    theme_color: "#fff",
    icons: [
      {
        src: `https://files.mulltiply.com/${manifestData.sellingProfile.logo}`,
        type: "image/png",
        sizes: "192x192",
      },
      {
        src: `https://files.mulltiply.com/${manifestData.sellingProfile.logo}`,
        type: "image/png",
        sizes: "256x256",
      },
      {
        src: `https://files.mulltiply.com/${manifestData.sellingProfile.logo}`,
        type: "image/png",
        sizes: "512x512",
      },
    ],
  };

  return JSON.stringify(manifest, null, 2);
}
