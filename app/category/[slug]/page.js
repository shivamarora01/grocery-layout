import React from "react";

import CategoryComponent from "@/components/CategoryComponent";
import { getWorkSpaceData } from "@/services/action";

async function page({ params }) {
  const fetchCategoryData = async () => {
    try {
      const workspaceData = await getWorkSpaceData();
      console.log("Single category data workspaceData", workspaceData);
      const response = await fetch(
        `https://api.mulltiply.com/offers/active-offers/${workspaceData?.uri?.uri}?item.categoriesTree=${params.slug}`
      ).then((res) => res.json());
      console.log("Single category data", response);
      return response?.data;
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const categoryData = await fetchCategoryData();

  console.log("Single category data", categoryData);

  return (
    <>
      <CategoryComponent params={params} categoryData={categoryData} />
    </>
  );
}

export default page;
