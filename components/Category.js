"use client";
import React, { useCallback } from "react";
import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";
import axiosInstance from "@/services/axiosConfig";
import { useStateContext } from "@/context/StateContext";
import { Base_url } from "@/constants/Links.js";

const Category = ({ categoriesData }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const {
    cartCount,
    increaseCartCount,
    decreaseCartCount,
    showNav,
    setShowNav,
    showCart,
    setShowCart,
    setShowCheckout,
  } = useStateContext();

  //useEffect for fetch categories
  const fetchData = async () => {
    try {
      // const uri = localStorage.getItem("uri");
      // const response = await axiosInstance(
      //   `https://api.mulltiply.com/offers/active-offers-stats-new/${uri}?type=topCategories`
      // );
      // console.log(response);
      const sortedData = categoriesData.sort((a, b) => {
        const categoryA = a.category.toUpperCase();
        const categoryB = b.category.toUpperCase();
        if (categoryA < categoryB) {
          return -1;
        }
        if (categoryA > categoryB) {
          return 1;
        }
        return 0;
      });

      setData(sortedData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  //useffect for cart
  useEffect(() => {
    setLoading(true);
    fetchData();

    setShowCart(true);
    setShowNav(true);
    setShowCheckout(false);
  }, []);

  return (
    <>
      {loading ? (
        // Render shimmer UI for loading state
        <div className="pt-3 ">

          <div className="px-2 mb-3 tracking-wide font-bold text-lg mt-10">
            Shop By Category
          </div>
          <div className="grid grid-cols-4 pt-1 md:grid-cols-10 md:gap-x-4">
            {/* Loop to generate placeholder elements */}
            {[...Array(30)].map((_, index) => (
              <div
                key={index}
                className="animate-pulse flex h-40 md:h-52 flex-col rounded-sm p-1"
              >
                <div className="h-[70%] w-[90px] bg-blue-100 rounded-md p-2"></div>
                <div className="h-[30%] mb-2  px-2"></div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="py-1 sm:w-[639px] md:w-[767px] lg:w-full mt-10 ">

          <div className="px-2 mb-3 tracking-wide font-semibold text-md">
            Shop By Category
          </div>
          <div className="grid px-1 grid-cols-4 pt-1 md:grid-cols-10 md:gap-x-4">
            {data.map((item, index) => (
              <Link
                href={`/category/${item.items[0]?.categoriesTree[0]}`}
                key={index}
              >
                <div className="flex h-40 md:h-52 flex-col rounded-sm p-1">
                  <div className="flex justify-center items-center h-3/5 w-full  border rounded-md p-2 md:p-1">
                    <img
                      className="h-full w-full object-contain rounded-md"
                      src={`${Base_url}${item?.items[0]?.itemImages[0]}`}
                      onError={(e) => {
                        e.target.onerror = null; // Prevent infinite loop if the fallback image fails
                        e.target.src = "/no-img.png"; // Path to the fallback image in the public folder
                      }}
                    />
                  </div>
                  <div className="h-[30%] mb-2 px-2">
                    <p className="text-center mt-1 text-sm line-clamp-2 tracking-wide font-semibold md:text-md md:my-2">
                      {item.category
                        .split(" ")
                        .map(
                          (word) =>
                            word.charAt(0).toUpperCase() +
                            word.slice(1).toLowerCase()
                        )
                        .join(" ")}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default Category;
