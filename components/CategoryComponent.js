"use client";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useStateContext } from "@/context/StateContext";
import { Base_url } from "@/constants/Links";
import axios from "axios";
import { useAuth } from "@/context/Auth";

function CategoryComponent({ params, categoryData }) {
  const [responseData, setResponseData] = useState([]);
  const [responseData2, setResponseData2] = useState([]);
  const {
    cartCount,
    increaseCartCount,
    decreaseCartCount,
    setShowNav,
    setCategoryIdForSorting,
    choosenSortMethod,
    setChoosenSortMethod,
    setShowCheckout,
    clickedHearts,
    handleHeartClick,
    setShowSortingOptions,
    setShowItem,
    filterData,
    setFilterData,
    ItemId,
    setItemId,
    setShowCart,
    setTotalCartPrice,
  } = useStateContext();
  const [activeCategory, setActiveCategory] = useState(false);
  const { isLogin, logout } = useAuth();
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedItemOfferId, setSelectedItemOfferId] = useState(null);
  const [sortingOptions, setSortingOptions] = useState();
  const [filterOptionsData, setFilterOptionsData] = useState([]);
  const [quantity, setQuantity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cartData, setCartData] = useState();
  const [selectItemId, setSelectItemId] = useState();
  const router = useRouter();

  useEffect(() => {
    const cartData1 = JSON.parse(localStorage.getItem("cartData"));
    setCartData(cartData1);
  }, [ItemId]);

  useEffect(() => {
    if (filterData) {
      setResponseData(filterData);
    } else {
      fetchData2();
    }
  }, [filterData]);

  useEffect(() => {
    setShowNav(true);
    setShowCheckout(false);
    setChoosenSortMethod();
    setShowCart(true);
  }, []);

  const backToMain = () => {
    router.push("/");
  };

  const handlesubCategory = (id) => {
    setSelectedCategoryId(id);
  };

  const handleShowItem = (id) => {
    console.log(id);
    setItemId(id);
    setShowCart(true);
    setShowItem(true);
  };

  const handleSort = () => {
    setShowSortingOptions(true);
    setShowCart(false);
    setCategoryIdForSorting(params.slug);
    console.log(params.slug);
  };

  const handleRemoveSort = () => {
    setFilterData(setResponseData2);
    setChoosenSortMethod(null);
  };

  const fetchData2 = async () => {
    try {
      // console.log(params.slug);
      // const uri = localStorage.getItem("uri");
      // const response = await axios.get(
      //   `https://api.mulltiply.com/offers/active-offers/${uri}?item.categoriesTree=${params.slug}`
      // );
      console.log("single categoryData", categoryData);
      setResponseData(categoryData);
      setResponseData2(categoryData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleItemAddButton = (index, offerId, sellerSKU, priceOfItem) => {
    console.group(offerId);
    const cartDataFromStorage = JSON.parse(
      localStorage.getItem("cartData")
    ) || { items: [] };
    let newitem;
    if (responseData[index].attributeSet?.sellingUnits.length > 1) {
      console.log(
        "selling unit for multiplier 1",
        responseData[index]?.attributeSet?.sellingUnits[index]
      );
      const sellingUnit = responseData[index]?.attributeSet?.sellingUnits?.find(
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
      responseData[index]?.attributeSet?.sellingUnits?.length
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

  const storageData = localStorage.getItem("cartData");
  if (!storageData) {
    const cartData = { items: [] };
    localStorage.setItem("cartData", JSON.stringify(cartData));
  }

  return (
    <>
      {
        <div className="w-full  md:z-10 mt-5">

          <div className="text-sm font-medium flex justify-between h-full bg-white  pt-3 pb-2 text-center">
            <div
              className="h-6 w-6"
              onClick={() => {
                backToMain();
              }}
            >
              <img className="object-fit" src="../back.png" />
            </div>
            <p>
              {responseData[0]?.attributeSet?.item?.category?.title
                .split(" ")
                .map(
                  (word) =>
                    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                )
                .join(" ")}
            </p>
            <p></p>
          </div>
          <div className="px-2 pt-2">
            {choosenSortMethod ? (
              <div className="inline-flex flex-row h-8 shadow-md justify-center items-center bg-white rounded-lg px-2">
                <p
                  className="text-xs mx-1 font-medium text-green-700"
                  onClick={() => {
                    handleSort();
                  }}
                >
                  {choosenSortMethod}
                </p>
                <div
                  className="h-full w-2 ml-1 flex justify-center items-center"
                  onClick={() => {
                    handleRemoveSort();
                  }}
                >
                  <img
                    className="h-full w-full object-contain"
                    src="../close.png"
                  />
                </div>
              </div>
            ) : (
              <div
                className="inline-flex flex-row h-8 shadow-md w-1/4 justify-center items-center bg-white rounded-lg"
                onClick={() => {
                  handleSort();
                }}
              >
                <div className="h-full w-3 flex justify-center items-center">
                  <img className="" src="../sort.png" />
                </div>
                <p className="text-xs mx-1">Sort</p>
                <div className="h-full w-3 flex justify-center items-center">
                  <img src="../down.png" />
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-row">
            {loading ? (
              <div className="flex flex-col w-full">
                <div className="w-full grid grid-cols-2 p-1 bg-slate-200 md:grid-cols-6">
                  {[...Array(30)].map((_, index) => (
                    <div
                      key={index}
                      className="animate-pulse flex h-64 md:h-64 flex-col rounded-sm p-1"
                    >
                      <div className="animate-pulse h-64 bg-gray-100 rounded-md"></div>
                    </div>
                  ))}
                </div>
                <div className="h-48 w-full bg-slate-200"></div>
              </div>
            ) : responseData?.length > 0 ? (
              // Render item grid if responseData is not empty and loading is false
              <div className="flex flex-col w-full mt-5">
                <div className="w-full grid grid-cols-2 p-1  md:grid-cols-6">
                  {responseData.map((item, index) => (
                    <div
                      className="h-64 bg-white m-1 rounded-md border px-1"
                      key={index}
                    >
                      <div className="h-3/5 flex relative">
                        {item.attributeSet.inventory.availableToSell === 0 && (
                          <div className="absolute top-0 left-0 rounded-md w-full h-full flex justify-center items-center bg-black bg-opacity-50">
                            <p className="text-white font-semibold text-lg">
                              Out of Stock
                            </p>
                          </div>
                        )}
                        <div className="pl-3">
                          {item?.attributeSet?.mrpDiscount > 0 ? (
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
                                {Math.round(item?.attributeSet?.mrpDiscount)}%
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
                        <div className="flex h-full">
                          <div
                            className="absolute top-1 right-1 h-6 w-6"
                            onClick={() =>
                              handleHeartClick(item?.attributeSet?.item._id)
                            }
                          >
                            <img
                              src={
                                clickedHearts[item?.attributeSet?.item._id]
                                  ? "../filledheart.png"
                                  : "../heart.png"
                              }
                              className={`w-6 h-6 object-contain ${clickedHearts[item?.attributeSet?.item._id]
                                ? "animate-grow"
                                : ""
                                }`}
                            />
                          </div>
                        </div>
                        <div className="p-2 w-full h-full">
                          <img
                            className="h-full w-full object-contain rounded-md"
                            onClick={() =>
                              handleShowItem(item?.attributeSet?.item._id)
                            }
                            src={`${Base_url}${item?.attributeSet?.item?.itemImages[0]}`}
                            onError={(e) => {
                              e.target.onerror = null; // Prevent infinite loop if the fallback image fails
                              e.target.src = "/no-img.png"; // Path to the fallback image in the public folder
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex flex-col justify-between h-2/5">
                        <div className="h-1/2 flex flex-row">
                          <div className="w-full">
                            <div className="flex flex-row">
                              <p
                                className="text-sm font-semibold mt-1 m-1 w-[80%] line-clamp-2"
                                onClick={() =>
                                  handleShowItem(item?.attributeSet?.item._id)
                                }
                              >
                                {" "}
                                {responseData[index]?.attributeSet.item.itemName
                                  .split(" ")
                                  .map(
                                    (word) =>
                                      word.charAt(0).toUpperCase() +
                                      word.slice(1).toLowerCase()
                                  )
                                  .join(" ")}
                              </p>
                            </div>
                            <p className="text-xs mt-1 pl-1">
                              {
                                item?.attributeSet?.item?.customAttributes
                                  ?.weight
                              }
                            </p>
                          </div>
                        </div>
                        <div className="h-1/2 flex justify-between items-center mt-1 text-xs pl-1">
                          <div className="flex flex-row w-1/2">
                            <p className="text-sm font-medium">
                              ₹
                              {parseInt(
                                responseData[index]?.attributeSet?.price
                                  ?.priceWithGST
                              )}

                            </p>
                            {responseData[index]?.attributeSet?.price
                              ?.pricePerUnit ===
                              responseData[index]?.attributeSet?.mrp
                                ?.pricePerUnit ? null : (
                              <p className="text-sm font-light decoration-from-font line-through ml-1">
                                ₹
                                {
                                  responseData[index]?.attributeSet?.mrp
                                    ?.pricePerUnit
                                }
                              </p>
                            )}
                          </div>
                          <div className="flex justify-center items-center w-20 text-center h-10 rounded-md w-1/2">
                            {cartData &&
                              cartData?.items?.some(
                                (product) =>
                                  product.offerId ===
                                  responseData[index]?.identifier?.offerId
                              ) ? (
                              <div class="flex items-center justify-center h-full w-full p-1">
                                <button
                                  class="w-1/3 h-full text-white text-lg rounded-l bg-green-700"
                                  onClick={() =>
                                    decrement(
                                      responseData[index]?.identifier?.offerId,
                                      responseData[index]?.attributeSet
                                        ?.inventory?.availableToSell,
                                      responseData[index]?.attributeSet.price
                                        .pricePerUnit
                                    )
                                  }
                                >
                                  -
                                </button>
                                <div className="w-1/3 h-full bg-gray-100 flex items-center justify-center">
                                  {quantity !== null &&
                                    quantity !== 0 &&
                                    responseData[index]?.identifier?.offerId ===
                                    selectedItemOfferId ? (
                                    <span
                                      id="quantity"
                                      className="bg-gray-100 border-solid border-1 border-[#A18168] font-medium text-[#A18168]"
                                    >
                                      {quantity}
                                    </span>
                                  ) : (
                                    <span
                                      id="quantity"
                                      className="border-solid border-1 border-[#A18168] font-medium text-[#A18168]"
                                    >
                                      {
                                        cartData.items.find(
                                          (product) =>
                                            responseData[index]?.identifier
                                              ?.offerId === product.offerId
                                        ).quantity
                                      }
                                    </span>
                                  )}
                                </div>
                                <button
                                  className="w-1/3 h-full text-white rounded-r bg-green-700"
                                  onClick={() =>
                                    increment(
                                      responseData[index]?.identifier?.offerId,
                                      responseData[index]?.attributeSet
                                        ?.inventory?.availableToSell,
                                      responseData[index]?.attributeSet.price
                                        .pricePerUnit
                                    )
                                  }
                                >
                                  +
                                </button>
                              </div>
                            ) : item.attributeSet.inventory.availableToSell ===
                              0 ? null : (
                              <div className="relative inline-block">
                                {item?.attributeSet?.item.availableMoreVariants === 0 && item?.attributeSet?.sellingUnits.length === 0 ? (
                                  <button
                                    className="relative px-4 py-1.5 border border-green-600 text-green-600 bg-green-50 rounded-md"
                                    onClick={() =>
                                      handleItemAddButton(
                                        index,
                                        responseData[index]?.identifier?.offerId,
                                        responseData[index]?.identifier?.sellerSKU,
                                        responseData[index]?.attributeSet.price
                                          .pricePerUnit
                                      )
                                    }
                                  >
                                    ADD
                                    {item?.attributeSet?.item.availableMoreVariants === 0 ? null : (
                                      <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 px-1 bg-green-50 text-[10px] text-gray-500 whitespace-nowrap">
                                        {item?.attributeSet?.item.availableMoreVariants + 1} option
                                      </span>
                                    )}
                                  </button>) : (
                                  <button
                                    className="relative px-4 py-1.5 border border-green-600 text-green-600 bg-green-50 rounded-md"
                                    onClick={() => handleShowItem(item?.attributeSet?.item._id)}
                                  >
                                    ADD
                                    {item?.attributeSet?.item.availableMoreVariants === 0 ? null : (
                                      <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 px-1 bg-green-50 text-[10px] text-gray-500 whitespace-nowrap">
                                        {item?.attributeSet?.item.availableMoreVariants + 1} option
                                      </span>
                                    )}
                                  </button>
                                )}

                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="h-48 w-full bg-slate-200 sm:hidden block"></div>
              </div>
            ) : (
              <div className="h-full w-full flex justify-center items-center mt-10 p-3">
                <img className="scale-150" src="../no-product-found.png" />
              </div>
            )}
          </div>
        </div>
      }
    </>
  );
}

export default CategoryComponent;
