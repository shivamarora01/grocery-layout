"use client";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useStateContext } from "@/context/StateContext";
import Link from "next/link";
import { Base_url } from "@/constants/Links";
import axios from "axios";
import { useAuth } from "@/context/Auth";
import axiosInstance from "@/services/axiosConfig";

function page({ params }) {
  const [responseData, setResponseData] = useState([]);
  const {
    cartCount,
    increaseCartCount,
    decreaseCartCount,
    setShowNav,
    showItem,
    setShowItem,
    handleHeartClick,
    ItemId,
    clickedHearts,
    setClickedHearts,
    wishlistData,
    setWishlistData,
    setItemId,
    totalCartPrice,
    setTotalCartPrice,
  } = useStateContext();

  const [activeCategory, setActiveCategory] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedItemOfferId, setSelectedItemOfferId] = useState(null);
  const [quantity, setQuantity] = useState(null);
  const [title, setTitle] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isLogin, logout } = useAuth();
  const [cartData, setCartData] = useState({ items: [] });
  const router = useRouter();

  useEffect(() => {
    const cartDataFromStorage = JSON.parse(
      localStorage.getItem("cartData")
    ) || { items: [] };
    setCartData(cartDataFromStorage);
  }, [ItemId]);


  const backToMain = () => {
    router.push("/");
  };

  const handlesubCategory = (id) => {
    setSelectedCategoryId(id);
  };

  const handleShowItem = (id) => {
    setItemId(id);
    setShowItem(true);
  };
  useEffect(() => {
    fetchData2();
  }, []);


  const fetchData2 = async () => {
    try {
      //   console.log(params.slug)
      const uri = localStorage.getItem("uri");

      const response = await axios.get(
        `https://api.mulltiply.com/offers/active-offers-stats-new/${uri}?type=${params.itemname}`
      );
      setResponseData(response?.data?.data[0]?.items);
      console.log(
        "i am fetchdata of categories",
        response?.data?.data[0]?.items
      );
      setTitle(response?.data?.data[0]?.category);
      console.log(
        "i am fetchdata of categories",
        response?.data?.data[0]?.attributeSet?.item?.category?.title
      );
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
    let newitem
      if(responseData[index].sellingUnits.length > 1){
        console.log("selling unit for multiplier 1" , responseData[index]?.sellingUnits[index])
        const sellingUnit = responseData[index]?.sellingUnits?.find(unit =>
          unit.multiplier === 1)
        console.log("selling unit" , sellingUnit)
         newitem = {
          offerId: offerId,
          sellerSKU: sellerSKU,
          quantity: 1,
          addToCartTimestamp: new Date().toISOString(),
          isDeleted: false,
          bidPrice: null,
          sellingUnit: sellingUnit,
        };
      }
      else{
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
    console.log("responseData for item" , responseData[index].sellingUnits.length)
    cartDataFromStorage.items.push(newitem);
    localStorage.setItem("cartData", JSON.stringify(cartDataFromStorage));
    increaseCartCount();
    setTotalCartPrice((prevPrice) => prevPrice + priceOfItem);
    setCartData(cartDataFromStorage); // Update state with new cart data
    setQuantity(1);
  };

  const decrement = (passedOfferId, priceOfItem) => {
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

  const increment = (passedOfferId, availableToSell, priceOfItem) => {
    let updatedCartData = JSON.parse(localStorage.getItem("cartData")) || {
      items: [],
    };
    const item = updatedCartData.items.find(
      (item) => item.offerId === passedOfferId
    );
    if (item && item.quantity < availableToSell) {
      item.quantity++;
      setQuantity(item.quantity);
      const roundedPrice = Math.round(priceOfItem * 100) / 100;
      setTotalCartPrice(
        (prev) => Math.round((prev + roundedPrice) * 100) / 100
      );
      localStorage.setItem("cartData", JSON.stringify(updatedCartData));
      setCartData(updatedCartData); // Update state with new cart data
    }
  };

 

  const storageData = localStorage.getItem("cartData");
  if (!storageData) {
    const cartData = { items: [] };
    localStorage.setItem("cartData", JSON.stringify(cartData));
  }

  return (
    <div className="w-full  ">

      <div className="text-sm font-medium flex justify-between h-full bg-white pt-3 pb-2 text-center">
        <div
          className="h-6 w-6"
          onClick={() => {
            backToMain();
          }}
        >
          <img className="object-fit" src="../back.png" />
        </div>
        <p>
          {title
            ?.split(" ")
            .map(
              (word) =>
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            )
            .join(" ")}
        </p>
        <p></p>
      </div>
      <div className="flex flex-row">
        {/* <div className='w-1/5 flex flex-col'>
            {
                subCategories.map((subcategory)=>(
                    <div className='flex flex-col mx-1 mb-1 rounded-sm' key={subcategory.id} onClick={() => handlesubCategory(subcategory.id)}>
                    <div className={`${selectedCategoryId === subcategory.id  ? 'justify-center items-center h-14 w-14 rounded-md bg-green-300' : 'justify-center h-14 w-14 items-center rounded-md bg-green-100 overflow-hidden'}`}>
                       <img className={`${selectedCategoryId === subcategory.id ? 'w-full object-cover p-2' : 'w-full object-cover p-2  object-top'}` } src={subcategory.pic}/>
                    </div>
                    <p className={`${selectedCategoryId === subcategory.id ? 'text-center text-xs font-medium mt-1 md:text-lg md:my-2' : 'text-center text-xs mt-1 md:text-lg md:my-2'}`}>{subcategory.name}</p>
                  </div>
                ))
            }
        </div> */}
        {loading ? (
          <div className="w-full grid grid-cols-2 sm:grid-cols-6 gap-6 p-1  md:grid-cols-6">
            {[...Array(10)].map((_, index) => (
              <div key={index} className="bg-slate-200 h-48 w-40 rounded-lg"></div>
            ))}
          </div>



        ) : (
          <div className="w-full grid grid-cols-2 p-1  md:grid-cols-6 ">
            {responseData &&
              responseData.map((item, index) => {
                const isClicked = clickedHearts[item?.item?._id];
                return(
                <div className="h-64 bg-white m-1 rounded-md border px-1" key={index}>
                  <div className="relative h-3/5 flex">
                    {item.inventory.availableToSell === 0 && (
                      <div className="absolute top-0 left-0 rounded-md w-full h-full flex justify-center items-center bg-black bg-opacity-50 z-10">
                        <p className="text-white font-semibold text-lg">
                          Out of Stock
                        </p>
                      </div>
                    )}
                    <div className="pl-3">
                      {item?.mrpDiscount > 0 ? (
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
                    <div className="flex h-full">
                        <div
                          className="absolute top-1 right-1 h-6 w-6 bg-white"
                          onClick={() => handleHeartClick(item?.item._id)}
                        >
                          <img
                            src={
                              clickedHearts[item?.item._id]
                                ? "../filledheart.png"
                                : "../heart.png"
                            }
                            className={`w-6 h-6 object-contain ${
                              clickedHearts[item?.item._id] ? "animate-grow" : ""
                            }`}
                          />
                        </div>
                        </div>
                    <div className="p-2 w-full h-full">
                      <img
                        className="h-full w-full object-contain rounded-md"
                        onClick={() => handleShowItem(item?.item._id)}
                        src={`${Base_url}${item?.item?.itemImages[0]}`}
                        onError={(e) => {
                          e.target.onerror = null; // Prevent infinite loop if the fallback image fails
                          e.target.src = "/no-img.png"; // Path to the fallback image in the public folder
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col justify-between h-2/5 p-1">
                    <div
                      className="h-1/2"
                      onClick={() => handleShowItem(item?.item._id)}
                    >
                      <p className="text-sm font-semibold mt-1 line-clamp-2">
                        {" "}
                        {item?.item?.itemName
                          .split(" ")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() +
                              word.slice(1).toLowerCase()
                          )
                          .join(" ")}
                      </p>
                      <p className="text-xs mt-1">
                        {item?.item?.itemVariantInfo?.packaging}
                      </p>
                    </div>
                    <div className="flex justify-between items-center mt-1 text-xs">
                      <div className="flex flex-row w-1/2">
                        <p className="text-sm font-medium">
                          ₹{parseInt(responseData[index]?.price?.pricePerUnit)}
                        </p>
                        {responseData[index]?.price?.pricePerUnit ===
                        responseData[index]?.mrp?.pricePerUnit ? null : (
                          <p className="text-sm font-light decoration-from-font line-through ml-1">
                            ₹{parseInt(responseData[index]?.mrp?.pricePerUnit)}
                          </p>
                        )}
                      </div>
                      <div className="flex justify-center items-center w-20 text-center h-10 rounded-md w-1/2">
                        {cartData &&
                        cartData?.items?.some(
                          (product) =>
                            product.offerId === responseData[index]?.offerId
                        ) ? (
                          <div class="flex items-center justify-center h-full w-full p-1">
                            <button
                              class="w-1/3 h-full text-white text-lg rounded-l bg-green-700"
                              onClick={() =>
                                decrement(
                                  responseData[index]?.offerId,
                                  responseData[index]?.inventory
                                    ?.availableToSell,
                                  responseData[index]?.price?.pricePerUnit
                                )
                              }
                            >
                              -
                            </button>
                            <div className="w-1/3 h-full bg-gray-100 flex items-center justify-center">
                              {quantity !== null &&
                              quantity !== 0 &&
                              responseData[index]?.offerId ===
                                selectedItemOfferId ? (
                                <span
                                  id="quantity"
                                  class=" bg-gray-100 border-solid border-1 border-[#A18168] font-medium text-[#A18168]"
                                >
                                  {quantity}
                                </span>
                              ) : (
                                <span
                                  id="quantity"
                                  class=" border-solid border-1 border-[#A18168] font-medium text-[#A18168]"
                                >
                                  {
                                    cartData.items.find(
                                      (product) =>
                                        responseData[index]?.offerId ===
                                        product.offerId
                                    ).quantity
                                  }
                                </span>
                              )}
                            </div>
                            <button
                              class="w-1/3 h-full text-white rounded-r bg-green-700"
                              onClick={() =>
                                increment(
                                  responseData[index]?.offerId,
                                  responseData[index]?.inventory
                                    ?.availableToSell,
                                  responseData[index]?.price?.pricePerUnit
                                )
                              }
                            >
                              +
                            </button>
                          </div>
                        ) : item?.inventory?.availableToSell === 0 ? null : (
                              <div className="relative inline-block">
                                <button
                                  className="relative px-4 py-1.5 border border-green-600 text-green-600 bg-green-50 rounded-md"
                                  onClick={() => handleShowItem(item?.item?._id)}
                                // onClick={() =>
                                //   handleItemAddButton(
                                //     index,
                                //     responseData[index]?.offerId,
                                //     responseData[index]?.sellerSKU,
                                //     Math.round(
                                //       responseData[index]?.price?.priceWithGST
                                //     )
                                //   )
                                // }
                                >
                                  ADD
                                  {item.item.availableMoreVariants === 0 ? null : (
                                    <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 px-1 bg-green-50 text-[10px] text-gray-500 whitespace-nowrap">
                                      {item.item.availableMoreVariants} option
                                    </span>
                                  )}
                                </button>
                              </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                )
            })}
          </div>
        )}
      </div>
      <div className="h-20 w-full "></div>
    </div>
  );
}

export default page;
