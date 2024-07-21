"use client";
import React, { useState, useEffect } from "react";
import axiosInstance from "@/services/axiosConfig";
import { Base_url } from "@/constants/Links";
import { useStateContext } from "@/context/StateContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/Auth";

export default function Main4({ topViewsOrdersData }) {
  const [responseData, setResponseData] = useState([]);
  const router = useRouter();
  const { isLogin, logout } = useAuth();
  const [selectedItemOfferId, setSelectedItemOfferId] = useState(null);
  const [quantity, setQuantity] = useState(0);
  const [cartData, setCartData] = useState({ items: [] });
  const [title, setTitle] = useState(null);
  const {
    increaseCartCount,
    decreaseCartCount,
    setTotalCartPrice,
    showItem,
    setShowItem,
    clickedHearts,
    handleHeartClick,
    ItemId,
    setItemId,
    setShowNav,
  } = useStateContext();

  useEffect(() => {
    const cartDataFromStorage = JSON.parse(
      localStorage.getItem("cartData")
    ) || { items: [] };
    setCartData(cartDataFromStorage);
  }, [ItemId]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // const uri = localStorage.getItem("uri");
      // const response = await axiosInstance.get(
      //   `https://api.mulltiply.com/offers/active-offers-stats-new/${uri}?type=topViews`
      // );
      if (topViewsOrdersData?.length > 0) {
        setTitle(topViewsOrdersData[0]?.category);
        setResponseData(topViewsOrdersData[0]?.items || []);
        console.log(
          "fetching responseDatafor MainPage4",
          topViewsOrdersData[0]
        );
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleShowItem = (id) => {
    setItemId(id);
    setShowItem(true);
  };

  const handleItemAddButton = (index, offerId, sellerSKU, priceOfItem) => {
    console.group(offerId);
    const cartDataFromStorage = JSON.parse(
      localStorage.getItem("cartData")
    ) || { items: [] };
    let newitem;
    if (responseData[index].sellingUnits.length > 1) {
      console.log(
        "selling unit for multiplier 1",
        responseData[index]?.sellingUnits[index]
      );
      const sellingUnit = responseData[index]?.sellingUnits?.find(
        (unit) => unit.multiplier === 1
      );
      console.log("selling unit", sellingUnit);
      newitem = {
        offerId: offerId,
        sellerSKU: sellerSKU,
        quantity: 1,
        addToCartTimestamp: new Date().toISOString(),
        isDeleted: false,
        bidPrice: null,
        sellingUnit: sellingUnit,
      };
    } else {
      newitem = {
        offerId: offerId,
        sellerSKU: sellerSKU,
        quantity: 1,
        addToCartTimestamp: new Date().toISOString(),
        isDeleted: false,
        bidPrice: null,
        sellingUnit: null,
      };
    }
    console.log(
      "responseData for item",
      responseData[index].sellingUnits.length
    );
    cartDataFromStorage.items.push(newitem);
    localStorage.setItem("cartData", JSON.stringify(cartDataFromStorage));
    increaseCartCount();
    setTotalCartPrice((prevPrice) => prevPrice + priceOfItem);
    setCartData(cartDataFromStorage); // Update state with new cart data
    setQuantity(1);
  };

  const decrement = (passedOfferId, availableToSell, priceOfItem) => {
    let updatedCartData = JSON.parse(localStorage.getItem("cartData")) || {
      items: [],
    };
    const item = updatedCartData.items.find(
      (item) => item.offerId === passedOfferId
    );
    if (item) {
      if (item.quantity > 1) {
        item.quantity--;
        setQuantity(item.quantity);
        const roundedPrice = Math.round(priceOfItem * 100) / 100;
        setTotalCartPrice(
          (prev) => Math.round((prev - roundedPrice) * 100) / 100
        );
      } else if (item.quantity === 1) {
        updatedCartData.items = updatedCartData.items.filter(
          (item) => item.offerId !== passedOfferId
        );
        setQuantity(0);
        decreaseCartCount();
        const roundedPrice = Math.round(priceOfItem * 100) / 100;
        setTotalCartPrice(
          (prev) => Math.round((prev - roundedPrice) * 100) / 100
        );
      }
      localStorage.setItem("cartData", JSON.stringify(updatedCartData));
      setCartData(updatedCartData); // Update state with new cart data
    }
  };

  // const increment = (passedOfferId, availableToSell, priceOfItem) => {
  //   let updatedCartData = JSON.parse(localStorage.getItem("cartData")) || {
  //     items: [],
  //   };
  //   const item = updatedCartData.items.find(
  //     (item) => item.offerId === passedOfferId
  //   );
  //   if (item && item.quantity < availableToSell) {
  //     item.quantity++;
  //     setQuantity(item.quantity);
  //     const roundedPrice = Math.round(priceOfItem * 100) / 100;
  //     setTotalCartPrice(
  //       (prev) => Math.round((prev + roundedPrice) * 100) / 100
  //     );
  //     localStorage.setItem("cartData", JSON.stringify(updatedCartData));
  //     setCartData(updatedCartData); // Update state with new cart data
  //   }
  // };

  const increment = (passedOfferId, availableToSell, priceOfItem) => {

    let updatedCartData = JSON.parse(localStorage.getItem("cartData")) || {
      items: [],
    };
    let item;
    if (responseData?.attributeSet?.sellingUnits.length > 0) {
      item = updatedCartData.items.find(
        (item) =>
          item.offerId === passedOfferId &&
          item?.sellingUnit?.quantity ===
          responseData?.attributeSet?.sellingUnits[selectedSellingUnitIndex]
            ?.quantity
      );
    } else {
      item = updatedCartData.items.find(
        (item) => item.offerId === passedOfferId
      );
    }
    if (item && item.quantity < availableToSell) {

      item.quantity++;
      if (item.quantity * (responseData?.attributeSet?.sellingUnits[selectedSellingUnitIndex]
        ?.multiplier) < availableToSell) {
        setQuantity(item.quantity);
        let multiplier;
        console.log(
          "multiplier",
          responseData?.attributeSet?.sellingUnits[selectedSellingUnitIndex]
            ?.multiplier
        );
        if (
          responseData?.attributeSet?.sellingUnits[selectedSellingUnitIndex]
            ?.multiplier
        ) {
          multiplier =
            responseData?.attributeSet?.sellingUnits[selectedSellingUnitIndex]
              ?.multiplier;
        } else {
          multiplier = 1;
        }
        if (multiplier > 1) {
          const roundedPrice = (Math.round(priceOfItem * 100) / 100) * multiplier;
          setTotalCartPrice(
            (prev) => Math.round((prev + roundedPrice) * 100) / 100
          );
        } else {
          const roundedPrice = Math.round(priceOfItem * 100) / 100;
          setTotalCartPrice(
            (prev) => Math.round((prev + roundedPrice) * 100) / 100
          );
        }
        localStorage.setItem("cartData", JSON.stringify(updatedCartData));
        setCartData(updatedCartData);
      }
      else if (!responseData?.attributeSet?.sellingUnits[selectedSellingUnitIndex]
        ?.multiplier) {
        setQuantity(item.quantity);
        let multiplier;
        console.log(
          "multiplier",
          responseData?.attributeSet?.sellingUnits[selectedSellingUnitIndex]
            ?.multiplier
        );
        if (
          responseData?.attributeSet?.sellingUnits[selectedSellingUnitIndex]
            ?.multiplier
        ) {
          multiplier =
            responseData?.attributeSet?.sellingUnits[selectedSellingUnitIndex]
              ?.multiplier;
        } else {
          multiplier = 1;
        }
        if (multiplier > 1) {
          const roundedPrice = (Math.round(priceOfItem * 100) / 100) * multiplier;
          setTotalCartPrice(
            (prev) => Math.round((prev + roundedPrice) * 100) / 100
          );
        } else {
          const roundedPrice = Math.round(priceOfItem * 100) / 100;
          setTotalCartPrice(
            (prev) => Math.round((prev + roundedPrice) * 100) / 100
          );
        }
        localStorage.setItem("cartData", JSON.stringify(updatedCartData));
        setCartData(updatedCartData);
      }
      // Update state with new cart data
    }
  };

  return (
    <div className="py-1 sm:w-[639px] md:w-[767px] lg:w-full ">
      <div className="flex flex-row justify-between items-center px-2 ">
        {responseData ? (
          <p className="mt-2 mb-2 tracking-wide font-semibold text-md">
            {title}
          </p>
        ) : null}
        <Link href={`/items/${"topViews"}`}>
          <p className="text-green-600 text-sm">see all</p>
        </Link>
      </div>
      <div className="px-1 py-1 h-64 md:h-80 flex flex-row gap-1 overflow-x-scroll overflow-y-hidden w-full">
        <div className="px-1 py-1 bg-white h-full flex flex-row gap-1">
          {responseData &&
            responseData.map((item, index) => {
              const isClicked = clickedHearts[item?.item?._id];
              return (
                <div
                  key={index}
                  className="h-full w-32 bg-white rounded-md p-1 md:w-40"
                >
                  <div className="relative h-[60%] border border-solid  border-slate-300 rounded-md">
                    {item?.inventory?.availableToSell === 0 && (
                      <div className="absolute top-0 left-0 rounded-md w-full h-full flex justify-center items-center bg-black bg-opacity-50">
                        <p className="text-white font-semibold text-lg">
                          Out of Stock
                        </p>
                      </div>
                    )}
                    <div className="pl-3">
                      {item.mrpDiscount > 0 ? (
                        <svg
                          width="29"
                          height="28"
                          viewBox="0 0 29 28"
                          xmlns="http://www.w3.org/2000/svg"
                          className="absolute"
                        >
                          <path
                            d="M28.9499 0C28.3999 0 27.9361 1.44696 27.9361 2.60412V27.9718L24.5708 25.9718L21.2055 27.9718L17.8402 25.9718L14.4749 27.9718L11.1096 25.9718L7.74436 27.9718L4.37907 25.9718L1.01378 27.9718V2.6037C1.01378 1.44655 0.549931 0 0 0H28.9499Z"
                            fill="#256fef"
                          />
                          <text
                            x="5"
                            y="12"
                            fill="white"
                            font-size="9"
                            font-weight="bold"
                            font-family="Arial"
                          >
                            {Math.round(item?.mrpDiscount)}%
                          </text>
                          <text
                            x="5"
                            y="22"
                            fill="white"
                            font-size="9"
                            font-weight="bold"
                            font-family="Arial"
                          >
                            OFF
                          </text>
                        </svg>
                      ) : null}
                    </div>
                    <div className="flex justify-end pr-2 pt-1">
                      {
                        <div
                          className="h-4 w-4 absolute"
                          onClick={() => handleHeartClick(item?.item?._id)}
                        >
                          <img
                            src={
                              clickedHearts[item?.item?._id]
                                ? "./filledheart.png"
                                : "./heart.png"
                            }
                            className={`w-4 h-4 object-contain ${clickedHearts[item?.item?._id]
                              ? "animate-grow"
                              : ""
                              }`}
                          />
                        </div>
                      }
                    </div>
                    <div className="p-2 w-full h-full ">
                      <img
                        className="h-full w-full object-contain rounded-md"
                        src={`${Base_url}${item?.item?.itemImages[0]}`}
                        onClick={() => handleShowItem(item?.item?._id)}
                        onError={(e) => {
                          e.target.onerror = null; // Prevent infinite loop if the fallback image fails
                          e.target.src = "/no-img.png"; // Path to the fallback image in the public folder
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex mt-1 flex-col h-[25%] py-1 px-1">
                    <p className="font-semibold text-sm overflow-hidden line-clamp-2">
                      {item?.item?.itemName
                        .split(" ")
                        .map(
                          (word) =>
                            word.charAt(0).toUpperCase() +
                            word.slice(1).toLowerCase()
                        )
                        .join(" ")}
                    </p>
                    <p className="text-xs overflow-hidden">
                      {item?.item?.itemVariantInfo?.packaging}
                    </p>
                  </div>
                  <div className="flex flex-row justify-between h-[15%] px-1 items-center">
                    <div className="flex flex-col">
                      <p className="text-sm font-semibold">
                        ₹{parseInt(item?.price?.priceWithGST)}
                      </p>
                      {item?.price?.priceWithGST ===
                        item?.mrp?.pricePerUnit ? null : (
                        <p className="text-xs font-semibold line-through text-slate-500">
                          ₹{item?.mrp?.pricePerUnit}
                        </p>
                      )}
                    </div>
                    <div className="rounded-md text-xs font-semibold text-green-600">
                      {cartData &&
                        cartData.items.length > 0 &&
                        cartData?.items?.some(
                          (product) =>
                            product.offerId === responseData[index]?.offerId
                        ) ? (
                        <div className="flex items-center">
                          <button
                            className="px-2 py-1.5 text-white rounded-l bg-green-700"
                            onClick={() =>
                              decrement(
                                responseData[index]?.offerId,
                                responseData[index]?.inventory?.availableToSell,
                                responseData[index]?.price?.priceWithGST
                              )
                            }
                          >
                            -
                          </button>
                          {quantity !== null &&
                            quantity !== 0 &&
                            responseData[index]?.offerId ===
                            selectedItemOfferId ? (
                            <span
                              id="quantity"
                              className="px-1 py-1.5 bg-gray-100 border-solid border-1 font-medium text-[#A18168]"
                            >
                              {quantity}
                            </span>
                          ) : (
                            <span
                              id="quantity"
                              className="px-1 py-1.5 bg-gray-100 border-solid border-1 font-medium text-[#A18168]"
                            >
                              {
                                cartData.items.find(
                                  (product) =>
                                    responseData[index]?.offerId ===
                                    product.offerId
                                )?.quantity
                              }
                            </span>
                          )}
                          <button
                            className="text-white rounded-r bg-green-700 px-2 py-1.5"
                            onClick={() =>
                              increment(
                                responseData[index]?.offerId,
                                responseData[index]?.inventory?.availableToSell,
                                responseData[index]?.price.priceWithGST
                              )
                            }
                          >
                            +
                          </button>
                        </div>
                      ) : item?.inventory?.availableToSell === 0 ? null : (
                        <div className="relative inline-block">
                          {item.item.availableMoreVariants === 0 && item.sellingUnits.length === 0 ? (

                            <button
                              className="relative px-4 py-1.5 border border-green-600 text-green-600 bg-green-50 rounded-md"
                              onClick={() =>
                                handleItemAddButton(
                                  index,
                                  responseData[index]?.offerId,
                                  responseData[index]?.sellerSKU,
                                  Math.round(
                                    responseData[index]?.price?.priceWithGST
                                  )
                                )
                              }
                            >
                              ADD
                              {item.item.availableMoreVariants === 0 ? null : (
                                <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 px-1 bg-green-50 text-[10px] text-gray-500 whitespace-nowrap">
                                  {item.item.availableMoreVariants} option
                                </span>
                              )}
                            </button>) : (
                            <button
                              className="relative px-4 py-1.5 border border-green-600 text-green-600 bg-green-50 rounded-md"
                              onClick={() => handleShowItem(item?.item?._id)}
                            >
                              ADD
                              {item.item.availableMoreVariants === 0 ? null : (
                                <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 px-1 bg-green-50 text-[10px] text-gray-500 whitespace-nowrap">
                                  {item.item.availableMoreVariants + 1} option
                                </span>
                              )}
                            </button>
                          )}

                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
        <div className="h-2 w-full"></div>
      </div>
    </div>
  );
}
