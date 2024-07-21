export async function fetchManifestData(subdomain) {
  try {
    const response = await fetch(
      "https://api.mulltiply.com/users/workspace/subdomain",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mulltiplyURL: subdomain,
        }),
      }
    );
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching manifest data:", error);
    throw error;
  }
}
