"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Item_url, Base_url } from "@/constants/Links";
import { useStateContext, StateProvider } from "@/context/StateContext";
import Main4 from "./mainpage4";
import { useAuth } from "@/context/Auth";
import axiosInstance from "@/services/axiosConfig";
import { useSwipeable } from "react-swipeable";

function page() {
  const [responseData, setResponseData] = useState();
  const [offerId, setOfferId] = useState(null);
  const [cartData, setCartData] = useState({ items: [] });
  const [selectedSellingUnitIndex, setSelectedSellingUnitIndex] = useState();
  const { isLogin, logout } = useAuth();
  const {
    increaseCartCount,
    decreaseCartCount,
    setTotalCartPrice,
    showItem,
    setShowItem,
    showCheckout,
    clickedHearts,
    handleHeartClick,
    ItemId,
    setItemId,
    showCart,
    setShowNav,
    setShowCart,
  } = useStateContext();
  const [searchItemInGhostCart, setSearchItemInGhostCart] = useState();
  const [quantity, setQuantity] = useState(0);
  const [sellingPrice, setSellingPrice] = useState(null);
  const [multiple, setMulltiple] = useState();
  useEffect(() => {
    const cartDataFromStorage = JSON.parse(
      localStorage.getItem("cartData")
    ) || { items: [] };
    setCartData(cartDataFromStorage);
  }, [ItemId]);

  useEffect(() => {
    fetchData();
  }, [ItemId]);

  useEffect(() => {
    setShowCart(true);
  }, []);

  useEffect(() => {
    handleSelectSellingUnit(0);
  }, [responseData]);

  useEffect(() => {
    if (offerId) {
      let ItemInCart;
      if (responseData?.attributeSet?.sellingUnits?.length > 1) {
        ItemInCart =
          cartData?.items?.length > 0
            ? cartData.items.find(
                (item) =>
                  item?.sellingUnit?._id ===
                  responseData?.attributeSet?.sellingUnits[
                    selectedSellingUnitIndex
                  ]?._id
              )
            : null;
      } else {
        ItemInCart =
          cartData?.items?.length > 0
            ? cartData.items.find((item) => offerId === item.offerId)
            : null;
      }
      console.log("ItemInCart", ItemInCart);
      setSearchItemInGhostCart(ItemInCart);
      setQuantity(ItemInCart ? ItemInCart.quantity : 0);
      if (ItemInCart) {
        console.log("ItemInCart.quantity", ItemInCart.quantity);
      }
    }
  }, [ItemId, offerId, showItem, selectedSellingUnitIndex, cartData]);

  const handleSelectSellingUnit = (index) => {
    console.log("useeffect called");
    console.log(index);
    setSelectedSellingUnitIndex(index); // Update selected unit index
    console.log("selling unit", responseData?.attributeSet?.sellingUnits);
    console.log(
      "selling unit",
      responseData?.attributeSet?.price?.priceWithGST
    );
    const priceWithGST = responseData?.attributeSet?.price?.priceWithGST;
    const multiplier =
      responseData?.attributeSet?.sellingUnits?.[index]?.multiplier;
    setMulltiple(responseData?.attributeSet?.sellingUnits?.[index]?.multiplier);
    const sellingPrice =
      priceWithGST && multiplier
        ? (priceWithGST * multiplier).toFixed(2)
        : "N/A";

    setSellingPrice(sellingPrice);
    console.log(sellingPrice);
  };

  const handleVariantClick = (id) => {
    setItemId(id);
  };

  const fetchData = async () => {
    try {
      const uri = localStorage.getItem("uri");
      const response = await axiosInstance(
        `${Item_url}/${uri}?item._id=${ItemId}`
      );
      setResponseData(response?.data?.data[0]);

      console.log("check kr");
      console.log(response?.data?.data[0]?.attributeSet);
      console.log(response?.data?.data[0]);
      setOfferId(response?.data?.data[0]?.identifier?.offerId);
      if (response?.data?.data[0]?.attributeSet?.sellingUnits.length > 0) {
        setSelectedSellingUnitIndex(0);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleRemoveItem = () => {
    if (showCheckout) {
      setShowNav(false);
      setShowCart(false);
    } else {
      setShowNav(true);
      setShowCart(true);
    }
    setShowItem(false);
    setSelectedSellingUnitIndex(0);
    setItemId(null);
  };
  const handleItemAddButton = (offerId, sellerSKU, priceOfItem) => {
    const cartDataFromStorage = JSON.parse(
      localStorage.getItem("cartData")
    ) || { items: [] };
    if (responseData?.attributeSet?.sellingUnits.length > 0) {
      const newitem = {
        offerId: offerId,
        sellerSKU: sellerSKU,
        quantity: 1,
        addToCartTimestamp: new Date().toISOString(),
        isDeleted: false,
        bidPrice: null,
        sellingUnit:
          responseData?.attributeSet?.sellingUnits[selectedSellingUnitIndex],
      };
      cartDataFromStorage.items.push(newitem);
      localStorage.setItem("cartData", JSON.stringify(cartDataFromStorage));
      increaseCartCount();
      let multiplier;
      if (
        responseData?.attributeSet?.sellingUnits[selectedSellingUnitIndex]
          .multiplier
      ) {
        multiplier =
          responseData?.attributeSet?.sellingUnits[selectedSellingUnitIndex]
            .multiplier;
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
      setCartData(cartDataFromStorage); // Update state with new cart data
      setQuantity(1);
    } else {
      const newitem = {
        offerId: offerId,
        sellerSKU: sellerSKU,
        quantity: 1,
        addToCartTimestamp: new Date().toISOString(),
        isDeleted: false,
        bidPrice: null,
        sellingUnit: null,
      };
      cartDataFromStorage.items.push(newitem);
      localStorage.setItem("cartData", JSON.stringify(cartDataFromStorage));
      increaseCartCount();
      setCartData(cartDataFromStorage); // Update state with new cart data
      setQuantity(1);
    }
  };
  const decrement = (passedOfferId, priceOfItem) => {
    let updatedCartData = JSON.parse(localStorage.getItem("cartData")) || {
      items: [],
    };
    let item;
    if (selectedSellingUnitIndex > -1) {
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
    if (item) {
      if (item.quantity > 1) {
        item.quantity--;
        setQuantity(item.quantity);
        let multiplier;
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
          const roundedPrice =
            (Math.round(priceOfItem * 100) / 100) * multiplier;
          setTotalCartPrice(
            (prev) => Math.round((prev - roundedPrice) * 100) / 100
          );
        } else {
          const roundedPrice = Math.round(priceOfItem * 100) / 100;
          setTotalCartPrice(
            (prev) => Math.round((prev - roundedPrice) * 100) / 100
          );
        }
      } else if (item.quantity === 1) {
        if (selectedSellingUnitIndex > -1) {
          updatedCartData.items = updatedCartData.items.filter(
            (item) =>
              item?.sellingUnit?._id !==
              responseData?.attributeSet?.sellingUnits[selectedSellingUnitIndex]
                ?._id
          );
        } else {
          updatedCartData.items = updatedCartData.items.filter(
            (item) => item.offerId !== passedOfferId
          );
        }
        if (selectedSellingUnitIndex) {
          setQuantity(0);
        } else {
          setQuantity(0);
        }
        decreaseCartCount();
        let multiplier;
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
          const roundedPrice =
            (Math.round(priceOfItem * 100) / 100) * multiplier;
          setTotalCartPrice(
            (prev) => Math.round((prev - roundedPrice) * 100) / 100
          );
        } else {
          const roundedPrice = Math.round(priceOfItem * 100) / 100;
          setTotalCartPrice(
            (prev) => Math.round((prev + roundedPrice) * 100) / 100
          );
        }
      }
      localStorage.setItem("cartData", JSON.stringify(updatedCartData));
      setCartData(updatedCartData); // Update state with new cart data
    }
  };

  const increment = (
    passedOfferId,
    availableToSell,
    priceOfItem,
    multiplier
  ) => {
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
      if (
        item.quantity *
          responseData?.attributeSet?.sellingUnits[selectedSellingUnitIndex]
            ?.multiplier <
        availableToSell
      ) {
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
          const roundedPrice =
            (Math.round(priceOfItem * 100) / 100) * multiplier;
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
      } else if (
        !responseData?.attributeSet?.sellingUnits[selectedSellingUnitIndex]
          ?.multiplier
      ) {
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
          const roundedPrice =
            (Math.round(priceOfItem * 100) / 100) * multiplier;
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const imagesLength = responseData?.attributeSet?.item?.itemImages.length;

  const handleSwipedLeft = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % imagesLength);
  };

  const handleSwipedRight = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + imagesLength) % imagesLength
    );
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: handleSwipedLeft,
    onSwipedRight: handleSwipedRight,
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  const heartIconStyle = {
    position: "absolute",
    top: "2px",
    right: "2px",
  };

  return (
    <div>
      {showItem ? (
        <div className="fixed bottom-0 z-20 h-screen w-full animate-slideIn">
          <div className="flex flex-col h-full w-full">
            <div className="h-[20%] flex items-center justify-center bg-zinc-800 opacity-70 w-full">
              <div
                className="h-9 w-9 bg-zinc-750 rounded-3xl"
                onClick={() => handleRemoveItem()}
              >
                <img className="h-full w-full object-cover" src="../cut.png" />
              </div>
            </div>
            {responseData ? (
              <div className="bg-white overflow-y-auto h-full rounded-t-lg p-3 w-full px-3">
                <div className="relative h-[60%] w-full p-3 overflow-hidden ">
                  <div
                    className="absolute top-2 right-2 h-9 w-9 p-1 z-10"
                    style={heartIconStyle}
                  >
                    <div
                      onClick={() =>
                        handleHeartClick(responseData?.attributeSet?.item._id)
                      }
                    >
                      <img
                        src={
                          clickedHearts[responseData?.attributeSet?.item._id]
                            ? "../filledheart.png"
                            : "../heart.png"
                        }
                        className={`w-8 h-8 object-contain ${
                          clickedHearts[responseData?.attributeSet?.item._id]
                            ? "animate-grow"
                            : ""
                        }`}
                        alt="Heart Icon"
                      />
                    </div>
                  </div>
                  <div
                    className="relative w-full h-full overflow-hidden flex justify-center items-center"
                    {...swipeHandlers}
                  >
                    <div
                      className="flex transition-transform duration-500"
                      style={{
                        transform: `translateX(-${currentIndex * 100}%)`,
                      }}
                    >
                      {responseData?.attributeSet?.item?.itemImages.map(
                        (image, index) => (
                          <div
                            key={index}
                            className="w-full flex-shrink-0 flex justify-center items-center"
                          >
                            <img
                              src={Base_url + image}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "../no-img.png";
                              }}
                              alt={`Image ${index}`}
                              className="w-full h-full sm:h-1/2 sm:w-1/2 object-contain border-0" // Ensuring no border
                            />
                          </div>
                        )
                      )}
                    </div>
                    {responseData?.attributeSet?.item?.itemImages.length >
                      1 && (
                      <div className="absolute bottom-0 left-0 right-0 flex justify-center p-2 space-x-2">
                        {responseData?.attributeSet?.item?.itemImages.map(
                          (_, index) => (
                            <div
                              key={index}
                              className={`w-2 h-2 rounded-full ${
                                index === currentIndex
                                  ? "bg-blue-600"
                                  : "bg-gray-300"
                              }`}
                            ></div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-lg font-semibold px-2">
                    {responseData?.attributeSet?.item?.itemName}
                  </p>
                </div>
                {responseData?.attributeSet?.item?.variants?.length > 0 ? (
                  <div className=" mt-2 mb-1 w-full text-black overflow-hidden pr-2">
                    <div className="h-20">
                      {/* <p className="mb-2 ml-2">Select Variant</p> */}
                      <div className="flex flex-row overflow-x-auto">
                        {responseData?.attributeSet?.item?.variants?.map(
                          (variant, index) => {
                            const itemVariantInfo = variant?.itemVariantInfo;
                            const [firstKey, firstValue] = itemVariantInfo
                              ? Object.entries(itemVariantInfo)[0]
                              : [null, null];

                            return (
                              <div
                                key={index}
                                className={`text-sm font-semibold text-black border cursor-pointer border-gray-500 px-8 py-2 rounded-xl ml-2 flex items-center justify-center ${
                                  responseData?.attributeSet?.item?._id ===
                                  variant?._id
                                    ? "bg-[#F7FFF9]  ring-2 "
                                    : "bg-white"
                                }`}
                                onClick={() => handleVariantClick(variant._id)}
                                style={{
                                  minWidth: "100px", // Adjust as needed for your design
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {firstValue}
                              </div>
                            );
                          }
                        )}
                      </div>
                    </div>
                  </div>
                ) : null}

                {responseData?.attributeSet?.sellingUnits.length > 0 ? (
                  <div className="h-20 mt-2 w-full flex items-center text-black ">
                    <div className="flex flex-col">
                      <p className="mr-2 pl-1 mb-2">Select Selling Unit</p>
                      <div className="flex flex-row overflow-hidden">
                        {responseData?.attributeSet?.sellingUnits?.map(
                          (unit, index) => (
                            <div
                              key={index}
                              value={unit.quantity}
                              className={`text-sm border border-1 flex flex-col border-gray-500 px-2 py-3 rounded-xl ml-2 ${
                                selectedSellingUnitIndex === index
                                  ? "bg-[#F7FFF9]  "
                                  : "bg-white"
                              }`}
                              onClick={() => handleSelectSellingUnit(index)} // Call function on click
                            >
                              {unit.quantity}
                              <span>
                                {" "}
                                ₹
                                {(
                                  unit?.multiplier *
                                  responseData?.attributeSet?.price
                                    ?.priceWithGST
                                ).toFixed(2)}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="mt-2 flex flex-row justify-between text-center items-center">
                  <div className=" flex py-2 rounded-lg items-center justify-center">
                    {/* <p className="text-xs font-normal">
                    {responseData?.attributeSet?.item?.customAttributes?.weight}
                  </p> */}
                    <p className="text-md font-bold line-spacing-2">
                      {sellingPrice !== undefined && sellingPrice !== "N/A"
                        ? `₹${sellingPrice}`
                        : `₹${responseData?.attributeSet?.price?.pricePerUnit}`}
                      {responseData?.attributeSet?.price?.pricePerUnit ===
                      responseData?.attributeSet?.mrp?.pricePerUnit ? null : (
                        <span className="pl-1 font-medium text-gray-500">
                          MRP
                          <span className="pl-1 line-through font-medium decoration-from-font">
                            ₹
                            {responseData?.attributeSet?.mrp?.pricePerUnit *
                              multiple}
                          </span>
                        </span>
                      )}
                    </p>
                    {responseData?.attributeSet?.mrpDiscount > 0 ? (
                      <div className="ml-1 bg-blue-400 w-13 h-5 rounded-md  flex items-center justify-center p-1 text-sm">
                        <p className="text-xs font-semibold text-white">
                          {parseInt(responseData?.attributeSet?.mrpDiscount)}%
                          OFF
                        </p>
                      </div>
                    ) : null}
                  </div>
                  {responseData?.attributeSet.inventory.availableToSell !==
                  0 ? (
                    <div className="bg-green-700 w-25 h-10 text-white font-semibold text-sm p-2 rounded-md cursor-pointer">
                      {quantity > 0 ? (
                        <div class="flex flex-row items-center">
                          <button
                            class="pr-3 py-1 text-white rounded-l bg-green-700 font-semibold"
                            onClick={() =>
                              decrement(
                                responseData?.identifier?.offerId,
                                responseData?.attributeSet?.price?.priceWithGST
                              )
                            }
                          >
                            -
                          </button>
                          {quantity !== 0 ? (
                            <span
                              id="quantity"
                              class=" mx-1 px-1 py-0.5 h-full border-solid border-1 border-[#A18168] text-white font-bold"
                            >
                              {quantity}
                            </span>
                          ) : (
                            <span
                              id="quantity"
                              class="mx-1 px-1 py-0.5 border-solid border-1 border-[#A18168] text-white font-bold"
                            >
                              {
                                cartData?.items?.find(
                                  (product) =>
                                    responseData?.identifier?.offerId ===
                                    product.offerId
                                ).quantity
                              }
                            </span>
                          )}
                          <button
                            class="pl-2 py-1 text-white rounded-r bg-green-700 font-semibold"
                            onClick={() =>
                              increment(
                                responseData?.identifier?.offerId,
                                responseData?.attributeSet?.inventory
                                  ?.availableToSell,
                                responseData?.attributeSet?.price?.priceWithGST,
                                responseData?.attributeSet?.sellingUnits
                              )
                            }
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() =>
                            handleItemAddButton(
                              responseData?.identifier?.offerId,
                              responseData?.identifier?.sellerSKU,
                              responseData?.attributeSet?.price?.priceWithGST
                            )
                          }
                        >
                          Add To Cart
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="bg-red-600 text-white text-md font-medium p-1 rounded-md">
                      Out of Stock !!
                    </div>
                  )}
                </div>
                <div className="mt-3">
                  <p className="text-sm font-medium">Description</p>
                  <ul className="text-xs">
                    {responseData?.identifier?.product?.description}
                    {/* <li className="my-1">
                      Versatile Staple: Enhance Indian cuisine with Onion's
                      unmistakable sharpness and fragrance, elevating every
                      dish.
                    </li>
                    <li className="my-1">
                      Natural Antiseptic: Harness Onion's antimicrobial and
                      antibiotic properties to combat infections and promote
                      healing.
                    </li>
                    <li className="my-1">
                      Natural Antiseptic: Harness Onion's antimicrobial and
                      antibiotic properties to combat infections and promote
                      healing.
                    </li> */}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="bg-white overflow-y-auto flex items-center justify-center h-full rounded-t-lg p-3 w-full px-3">
                <div className="flex justify-center items-center h-screen">
                  <div className="w-8 h-8 border-4 border-t-transparent border-green-500 rounded-full animate-spin"></div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
export default page;
