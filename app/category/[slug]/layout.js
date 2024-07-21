import axios from "axios";
import { Base_url } from "@/constants/Links";
import { headers } from "next/headers";
import axiosInstance from "@/services/axiosConfig";
import { getWorkSpaceData } from "@/services/action";

export async function generateMetadata({ params, searchParams }, parent) {
  const headersList = headers();
  const domain = headersList.get("host"); // to get domain
  const subdomain = domain.split(".")[0];
  console.log("generateMetadata values", params, subdomain);

  const getWorkSpaceId = await getWorkSpaceData();
  console.log("getWorkSpaceId", getWorkSpaceId);
  const response = await fetch(
    `https://api.mulltiply.com/offers/active-offers/${getWorkSpaceId?.uri?.uri}?item.categoriesTree=${params.slug}`,
    {
      next: { revalidate: 360 },
    }
  ).then((res) => res.json());

  const title = await response?.data[0]?.attributeSet?.item?.category?.title
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
  const categoryImage =
    response?.data[0]?.attributeSet?.item?.category?.categoryImage;
  const metaData = {
    title: `${title}`,
    description: title,
    openGraph: {
      images: `${Base_url}${categoryImage}`,
    },
  };
  if (title && response?.data[0]?.attributeSet?.item?.category?.categoryImage) {
    return metaData;
  } else if (title) {
    delete metaData.image;
    return metaData;
  }

  return {
    title: "Category",
    description: "Category",
  };
}

export default function Layout({ children }) {
  return <>{children}</>;
}
