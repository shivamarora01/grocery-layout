import { headers } from "next/headers";
import axiosInstance from "./axiosConfig";
import { api_url } from "@/constants/Links";

export async function getWorkSpaceData() {
  const headersList = headers();
  const domain = headersList.get("host"); // to get domain
  const subdomain = domain.split(".")[0];

  const workspaceData = await fetch(`${api_url}/users/workspace/subdomain`, {
    method: "POST", // *GET, POST, PUT, DELETE, etc.
    mode: "cors", // no-cors, *cors, same-origin
    credentials: "same-origin", // include, *same-origin, omit
    headers: {
      "Content-Type": "application/json",
    },
    next: { revalidate: 360 },
    redirect: "follow", // manual, *follow, error
    referrerPolicy: "no-referrer",
    body: JSON.stringify({ mulltiplyURL: subdomain }),
  }).then((res) => res.json());

  console.log("subdomain data", workspaceData?.data);

  return workspaceData?.data;
}

export async function getCategories(workspace) {
  const uri = workspace?.uri?.uri;
  const categoriesData = await fetch(
    `${api_url}/offers/active-offers-stats-new/${uri}?type=topCategories`,
    {
      next: { revalidate: 360 },
    }
  ).then((res) => res.json());

  if (categoriesData?.data) return categoriesData?.data;
  else return null;
}

export async function getBannerData(workspace) {
  try {
    const response = await fetch(
      `${api_url}/offers/active-offers/banner?workspace=${workspace?._id}`,
      {
        next: { revalidate: 360 },
      }
    ).then((res) => res.json());

    if (response.data  && response.data.banners) {
      return response.data.banners;
    }
  } catch (error) {
    console.error("Error fetching images:", error);
    return null;
  }
}

export async function getTopViewsProducts(workspace) {
  const uri = workspace?.uri?.uri;
  try {
    const response = await fetch(
      `${api_url}/offers/active-offers-stats-new/${uri}?type=topViews`,
      {
        next: { revalidate: 360 },
      }
    ).then((res) => res.json());
    if (response?.data) return response?.data;
    else return null;
  } catch (error) {
    console.error("Error fetching images:", error);
    return null;
  }
}

export async function getTopOrders(workspace) {
  const uri = workspace?.uri?.uri;
  try {
    const response = await fetch(
      `${api_url}/offers/active-offers-stats-new/${uri}?type=topOrders`,
      {
        next: { revalidate: 360 },
      }
    ).then((res) => res.json());
    if (response?.data) return response?.data;
    else return null;
  } catch (error) {
    console.error("Error fetching images:", error);
    return null;
  }
}
