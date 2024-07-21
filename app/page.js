import Banner from "@/components/Banner";
import Category from "@/components/Category";
import PwaModal from "@/components/PWAModal";
import Main4 from "@/components/mainpage4";
import Main5 from "@/components/mainpage5";
import { Base_url } from "@/constants/Links";
import {
  getBannerData,
  getCategories,
  getTopOrders,
  getTopViewsProducts,
  getWorkSpaceData,
} from "@/services/action";
import Pincode from "@/components/Pincode";

export async function generateMetadata({ params, searchParams }, parent) {
  const workspaceData = await getWorkSpaceData();
  // console.log("workspaceData", workspaceData?.data?.data?.sellingProfile?.logo);

  return {
    title: workspaceData?.name,
    description: workspaceData?.name,
    openGraph: {
      images: `${Base_url}${workspaceData?.businessPhotos[0]}`,
    },
  };
}

export default async function Home() {
  const workspaceData = await getWorkSpaceData();

  const categoriesData = workspaceData && (await getCategories(workspaceData));

  const bannerData = workspaceData && (await getBannerData(workspaceData));

  const topViewsOrdersData =
    workspaceData && (await getTopViewsProducts(workspaceData));

  const topOrdersData = workspaceData && (await getTopOrders(workspaceData));

  return (
    <>
      <Pincode workspaceData={workspaceData} />
      <PwaModal workspaceData={workspaceData} />
      <Banner bannerData={bannerData ?? null} />
      <Category categoriesData={categoriesData} />
      <Main4 topViewsOrdersData={topViewsOrdersData} />
      <Main5 topOrdersData={topOrdersData} />
    </>
  );
}
