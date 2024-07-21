"use client";
import React, { useEffect, useState } from "react";
import SkeletonLoader from "@/components/CartSkeleton";
import { useAuth } from "@/context/Auth";
import axiosInstance from "@/services/axiosConfig";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import { RxCross2 } from "react-icons/rx";
import { useCart } from "@/context/CartContext";
import { useStateContext } from "@/context/StateContext";
import { FiTag } from "react-icons/fi";
import { DivideCircle } from "lucide-react";
import Checkout from "@/components/Checkout";
import AddressComponent from "@/components/AddressComponent";

function Page() {
  const [localData, setLocalData] = useState(null);
  const [jsonData, setJsonData] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalMrpAmount, setTotalMrpAmount] = useState(0);
  const [Isregister, setIsRegister] = useState();
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState([]);
  const [userProfile, setUserProfile] = useState();
  const [selectedItemOfferId, setSelectedItemOfferId] = useState(null);
  const [quantity, setQuantity] = useState(null);
  const cartData = JSON.parse(localStorage.getItem("cartData"));
  const [totalTax, setTotalTax] = useState();
  const [priceBeforeTax, setPriceBeforeTax] = useState();
  const [selectedCoupon, setSelectedCoupon] = useState(""); // Added state to store the selected coupon
  const [couponCodes, setCouponCodes] = useState([]);
  const [updateCart, setUpdateCart] = useState(false);
  const { isLogin } = useAuth();
  const { cartLength, updateCartLength } = useCart();
  const {
    cartCount,
    increaseCartCount,
    decreaseCartCount,
    setShowCart,
    setShowCheckout,
    showItem,
    setShowItem,
    ItemId,
    NotToCallCart,
    setNotToCallCart,
    setItemId,
    setShowNav,
    totalCartPrice,
    setTotalCartPrice,
  } = useStateContext();
  let count = 1;
  const router = useRouter();
  const Base_url =
    "https://mulltiply.com/cdn-cgi/image/width=800,quality=75/https://files.mulltiply.com/";

  useEffect(() => {
    const reqData = JSON.parse(localStorage.getItem("cartData"));
    setLocalData(reqData);
    setShowCart(false);
    setShowCheckout(true);
    setShowNav(false);
  }, [updateCart]);

  const fetchData = async () => {
    const seller_id = localStorage.getItem("SellerWorkspace");
    const res = await axiosInstance.get(
      `/customers/buyer?sellerWorkspace=${seller_id}`
    );
    console.log("i am user profile");
    setIsRegister(res?.data.data.length);
    setUserProfile(res?.data?.data[0]);
  };

  useEffect(() => {
    if (isLogin) {
      fetchData();
    }
  }, [isLogin]);

  useEffect(() => {
    // Calculate total price whenever jsonData changes
    if (jsonData && jsonData.data && jsonData.data.orderTotal) {
      setTotalPrice(jsonData?.data?.orderTotal?.amount);
    }
  }, [jsonData]);

  useEffect(() => {
    const sendPostRequest = async () => {
      if (localData && !isLogin) {
        try {
          const response = await axiosInstance.post(
            "orders/ghost-cart",
            localData
          );
          console.log("cart jsonData", response?.data);
          console.log(
            "price before tax",
            response?.data?.orderTaxableAmount?.amount
          );
          console.log(
            "price before tax",
            response?.data?.totalGstAmount?.amount
          );
          setJsonData(response?.data);
          setTotalMrpAmount(response?.data?.data?.orderTotal?.amount);
          setPriceBeforeTax(response?.data?.orderTaxableAmount?.amount);
          setTotalTax(response?.data?.totalGstAmount?.amount);
        } catch (error) {
          console.log("Error", error);
        }
      } else if (localData && isLogin) {
        const customerWorkspace = localStorage.getItem("customerWorkspace");
        const buyer_id = localStorage.getItem("BuyerId");
        const updatedData = {
          ...localData,
          buyerWorkspace: customerWorkspace,
          buyerId: buyer_id,
        };
        try {
          const response = await axiosInstance.post("orders/cart", updatedData);
          console.log("cart jsonData", response?.data?.data);
          console.log("cart jsonData", response?.data);
          console.log(
            "price before tax",
            response?.data?.data?.orderTaxableAmount?.amount
          );
          console.log(
            "price before tax",
            response?.data?.data?.totalGstAmount?.amount
          );
          setJsonData(response?.data);
          setTotalMrpAmount(response?.data?.data?.orderTotal?.amount);
          setPriceBeforeTax(response?.data?.data?.orderTaxableAmount?.amount);
          setTotalTax(response?.data?.data?.totalGstAmount?.amount);
        } catch (error) {
          console.log("Error", error);
        }
      }
    };

    sendPostRequest();
  }, [localData]);

  useEffect(() => {
    fetchCouponCodes();
  }, []);

  useEffect(() => {
    // Check if a coupon is already applied
    if (
      jsonData &&
      jsonData.data &&
      jsonData.data.promoCodes &&
      jsonData.data.promoCodes.length > 0
    ) {
      setAppliedCoupon(jsonData.data.promoCodes[0]);
    } else {
      setAppliedCoupon(null);
    }
  }, [jsonData]);

  const fetchCouponCodes = async () => {
    try {
      const sellerWorkspace = localStorage.getItem("SellerWorkspace");
      const response = await axiosInstance.get(
        `/promos?workspace=${sellerWorkspace}&page=1&limit=5`
      );
      console.log("promo", response?.data?.data);
      const promoCodes = response.data.data.map((promo) => promo.promoCode);
      setCouponCodes(promoCodes);
      console.log("promoCodes", promoCodes);
    } catch (error) {
      console.error("Error fetching coupon codes:", error);
    }
  };

  const handleApplyCoupon = async () => {
    try {
      const customerWorkspace = localStorage.getItem("customerWorkspace");
      const buyerId = localStorage.getItem("BuyerId");
      const updatedData = {
        ...localData,
        promoCodes: [selectedCoupon],
        buyerWorkspace: customerWorkspace,
        buyerId: buyerId,
      };
      const updatedCartResponse = await axiosInstance.post(
        "/orders/cart",
        updatedData
      );
      setNotToCallCart(true);
      console.log(
        "Cart data updated successfully",
        updatedCartResponse?.data?.data
      );
      setJsonData(updatedCartResponse?.data);
      console.log(
        "newCart Price after discount",
        updatedCartResponse?.data?.data?.orderTotal?.amount
      );
      console.log(
        "discount",
        updatedCartResponse?.data?.data?.totalDiscount?.amount
      );
      setTotalCartPrice(updatedCartResponse?.data?.data?.orderTotal?.amount);
      const newMrp =
        updatedCartResponse?.data?.data?.orderTotal?.amount +
        updatedCartResponse?.data?.data?.totalDiscount?.amount;
      setTotalMrpAmount(newMrp);
      setAppliedCoupon(selectedCoupon);
      setCouponModalOpen(false);
    } catch (error) {
      console.error("Error applying coupon:", error);
    }
  };

  useEffect(() => {
    localStorage.setItem("Coupon", selectedCoupon);
  }, [selectedCoupon]);

  const handleShowItem = (id) => {
    console.log(id);
    setItemId(id);
    setShowItem(true);
    setShowCart(true);
  };

  const handleRemoveCoupon = async () => {
    setUpdateCart((prev) => !prev);
    try {
      const customerWorkspace = localStorage.getItem("customerWorkspace");
      const buyerId = localStorage.getItem("BuyerId");

      const updatedData = {
        ...localData,
        promoCodes: [],
        buyerWorkspace: customerWorkspace,
        buyerId: buyerId,
      };

      const updatedCartResponse = await axiosInstance.post(
        "/orders/cart",
        updatedData
      );
      setNotToCallCart(false);
      console.log("Cart data updated successfully", updatedCartResponse.data);
      setJsonData(updatedCartResponse?.data);
      setTotalCartPrice(updatedCartResponse?.data?.data?.orderTotal?.amount);
      setAppliedCoupon(null);
    } catch (error) {
      console.error("Error removing coupon:", error);
    }
  };
  useEffect(() => {
    updateCartLength(jsonData?.data.items.length);
  }, [jsonData]);

  const decrement = (
    passedOfferid,
    sellingUnitId,
    sellingUnit,
    priceOfItem,
    mrpPriceOfItem
  ) => {
    console.log("mrpPriceOfItem", mrpPriceOfItem);
    setUpdateCart(!updateCart);

    if (sellingUnit !== null) {
      if (appliedCoupon) {
        handleRemoveCoupon();
      }
      let updatedCartData = JSON.parse(localStorage.getItem("cartData")) || {};
      const quan = updatedCartData?.items?.find(
        (item) => item.sellingUnit?._id === sellingUnitId
      )?.quantity;
      updatedCartData.items = updatedCartData.items
        .map((item) => {
          if (item.sellingUnit?._id === sellingUnitId && item.quantity > 1) {
            item.quantity--;
            setQuantity(quan - 1);
            console.log("decresing the count button");
            setSelectedItemOfferId(sellingUnitId);
            const roundedPrice = Math.round(priceOfItem * 100) / 100;
            setTotalCartPrice(
              (prev) => Math.round((prev - roundedPrice) * 100) / 100
            );
            setTotalMrpAmount((prev) => Math.round(prev - mrpPriceOfItem));
          } else if (
            item.sellingUnit?._id === sellingUnitId &&
            item.quantity === 1
          ) {
            console.log("i gonna remove the count button");
            setQuantity(0);
            decreaseCartCount();
            const roundedPrice = Math.round(priceOfItem * 100) / 100;
            setTotalCartPrice(
              (prev) => Math.round((prev - roundedPrice) * 100) / 100
            );
            setTotalMrpAmount((prev) => Math.round(prev - mrpPriceOfItem));
            return null;
          }
          return item;
        })
        .filter((item) => item !== null);
      localStorage.setItem("cartData", JSON.stringify(updatedCartData));
    } else {
      if (appliedCoupon) {
        handleRemoveCoupon();
      }
      let updatedCartData = JSON.parse(localStorage.getItem("cartData")) || {};
      const quan = updatedCartData?.items?.find(
        (item) => item.offerId === passedOfferid
      )?.quantity;
      updatedCartData.items = updatedCartData.items
        .map((item) => {
          if (item.offerId === passedOfferid && item.quantity > 1) {
            item.quantity--;
            setQuantity(quan - 1);
            console.log("decresing the count button");
            setSelectedItemOfferId(passedOfferid);
            const roundedPrice = Math.round(priceOfItem * 100) / 100;
            setTotalCartPrice(
              (prev) => Math.round((prev - roundedPrice) * 100) / 100
            );
            setTotalMrpAmount((prev) => Math.round(prev - mrpPriceOfItem));
          } else if (item.offerId === passedOfferid && item.quantity === 1) {
            console.log("i gonna remove the count button");
            setQuantity(0);
            decreaseCartCount();
            const roundedPrice = Math.round(priceOfItem * 100) / 100;
            setTotalCartPrice(
              (prev) => Math.round((prev - roundedPrice) * 100) / 100
            );
            setTotalMrpAmount((prev) => Math.round(prev - mrpPriceOfItem));
            return null;
          }
          return item;
        })
        .filter((item) => item !== null);
      localStorage.setItem("cartData", JSON.stringify(updatedCartData));
    }
  };

  const increment = (
    passedOfferid,
    sellingUnitId,
    sellingUnit,
    availableToSell,
    priceOfItem,
    mrpPriceOfItem,
    multiplier
  ) => {
    setUpdateCart(!updateCart);
    if (sellingUnit !== null) {
      console.log(priceOfItem);
      console.log("in this section");

      if (appliedCoupon) {
        handleRemoveCoupon();
      }
      let updatedCartData = JSON.parse(localStorage.getItem("cartData")) || {};
      const quan = updatedCartData?.items?.find(
        (item) => item.sellingUnit?._id === sellingUnitId
      ).quantity;
      console.log(quan);
      updatedCartData.items = updatedCartData.items
        .map((item) => {
          console.log(quan);
          console.log(quan * multiplier);
          if (
            item.sellingUnit?._id === sellingUnitId &&
            quan < availableToSell
          ) {
            item.quantity++;
            if (item.quantity * multiplier < availableToSell) {
              console.log("inside if");
              console.log(item.quantity * multiplier);
              setQuantity(quan + 1);
              console.log(quantity);
              setSelectedItemOfferId(sellingUnitId);
              // setTotalTax(prev => Math.round((prev + roundedtaxOnItem) * 100) / 100);
              const roundedPrice = Math.round(priceOfItem * 100) / 100;
              setTotalCartPrice(
                (prev) => Math.round((prev + roundedPrice) * 100) / 100
              );
              setTotalMrpAmount((prev) => Math.round(prev + mrpPriceOfItem));
            } else {
              item.quantity--;
            }
          }
          return item;
        })
        .filter((item) => item !== null);
      localStorage.setItem("cartData", JSON.stringify(updatedCartData));
      localStorage.setItem("cartData", JSON.stringify(updatedCartData));
    } else {
      console.log(priceOfItem);
      if (appliedCoupon) {
        handleRemoveCoupon();
      }
      let updatedCartData = JSON.parse(localStorage.getItem("cartData")) || {};
      const quan = updatedCartData?.items?.find(
        (item) => item.offerId === passedOfferid
      ).quantity;
      console.log(quan);
      updatedCartData.items = updatedCartData.items
        .map((item) => {
          if (item.offerId === passedOfferid && quan < availableToSell) {
            item.quantity++;
            setQuantity(quan + 1);
            console.log(quantity);
            setSelectedItemOfferId(passedOfferid);
            // setTotalTax(prev => Math.round((prev + roundedtaxOnItem) * 100) / 100);
            const roundedPrice = Math.round(priceOfItem * 100) / 100;
            setTotalCartPrice(
              (prev) => Math.round((prev + roundedPrice) * 100) / 100
            );
            setTotalMrpAmount((prev) => Math.round(prev + mrpPriceOfItem));
          }
          return item;
        })
        .filter((item) => item !== null);
      localStorage.setItem("cartData", JSON.stringify(updatedCartData));
      localStorage.setItem("cartData", JSON.stringify(updatedCartData));
    }
  };

  const backToMain = () => {
    router.push("/");
    setShowCart(true);
  };

  const handleApplyCouponOpen = () => {
    if (isLogin) {
      setCouponModalOpen(true);
    } else {
      router.push("/auth/login");
    }
  };

  return (
    <div className="sm:mt-0 flex justify-end font-book-antiqua ">
      <Toaster />
      {!jsonData ? (
        <SkeletonLoader />
      ) : (
        <div className="w-full bg-slate-200 h-screen mb-10 pb-10 sm:w-[500px]">
          <div className="w-full bg-white py-2 flex justify-between">
            <div
              className="h-6 w-6"
              onClick={() => {
                backToMain();
              }}
            >
              <img className="object-fit" src="../back.png" />
            </div>
            <p className="text-lg font-semibold">My Cart</p>
            <p></p>
          </div>
          <div className="bg-white mt-3 mx-3 py-3 px-3 rounded-md overflow-hidden">
            <div className="flex flex-row mb-3">
              <div className="w-11 h-11">
                <img
                  className="h-full w-full object-cover"
                  src="https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=180/assets/eta-icons/15-mins-filled.png"
                />
              </div>
              <div className="flex flex-col mx-2 tracking-wide justify-center">
                <p className="text-xs">Shipment of {cartLength} items</p>
              </div>
            </div>
            {jsonData?.data?.items?.map((item, index) => (
              <div className="flex flex-row w-full" key={index}>
                {cartData &&
                cartData?.items?.some(
                  (product) => product?.offerId === item?.offerId
                ) ? (
                  <>
                    <div className="w-full flex flex-row">
                      <div className="p-2 w-20 h-20 mx-2 my-4 rounded-md border border-solid border-zinc-300">
                        <img
                          className="h-full w-full object-contain rounded-md"
                          onClick={() => handleShowItem(item?.itemRef)}
                          src={`${Base_url}${item?.itemImages[0]}`}
                          onError={(e) => {
                            e.target.onerror = null; // Prevent infinite loop if the fallback image fails
                            e.target.src = "/no-img.png"; // Path to the fallback image in the public folder
                          }}
                        />
                      </div>
                      <div className="flex flex-col justify-center ml-3 w-[60%]">
                        <p className="text-sm font-semibold w-full line-clamp-2">
                          {item?.itemName
                            ?.split(" ")
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() +
                                word.slice(1).toLowerCase()
                            )
                            .join(" ")}
                        </p>
                        <p className="font-light text-xs mt-0.5">
                          {item?.itemVariantInfo?.packaging}
                        </p>
                        {item?.sellingUnit !== null ? (
                          <div className="flex flex-col">
                            <div>
                              <p className="text-xs mt-1 font-normal text-gray-500">
                                {item?.sellingUnit?.quantity}
                              </p>
                            </div>
                            <div className="flex flex-row">
                              <p className="text-sm mt-1 font-semibold">
                                ₹{Math.round(item?.finalAmountWithGST?.amount)}
                              </p>
                              {item?.mrpDiscount > 0 ? (
                                <p className="pl-1 text-sm mt-1 font-normal line-through text-gray-500">
                                  ₹
                                  {Math.round(
                                    item?.sellingUnit?.multiplier *
                                      item?.mrpPrice?.amount
                                  )}
                                </p>
                              ) : null}
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-row">
                            {item?.finalAmountWithGST?.amount ===
                            item?.mrpPrice?.amount * item?.quantity ? (
                              <p className="text-sm mt-1 font-semibold">
                                ₹{Math.round(item?.mrpPrice?.amount)}
                              </p>
                            ) : (
                              <div className="flex flex-row">
                                <p
                                  className={`text-sm mt-1 font-normal ${
                                    appliedCoupon
                                      ? "text-green-700 font-semibold"
                                      : ""
                                  }`}
                                >
                                  ₹
                                  {Math.round(
                                    item?.finalAmountWithGST?.amount /
                                      item?.quantity
                                  )}
                                </p>
                                {Math.round(
                                  item?.finalAmountWithGST?.amount /
                                    item?.quantity
                                ) !== Math.round(item?.mrpPrice?.amount) ? (
                                  <p className="pl-1 text-sm mt-1 font-normal line-through text-gray-500">
                                    ₹{item?.mrpPrice?.amount}
                                  </p>
                                ) : null}
                                {/* <p className='text-sm mt-1 font-semibold line-through ml-1 '>₹{item.mrpPrice.amount.toFixed(2)}</p> */}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="ml-2 items-center flex justify-end w-[20%] py-5">
                      <div class="flex items-center w-full h-full py-7">
                        <button
                          class="w-1/3 h-full text-white text-lg rounded-l bg-green-700"
                          onClick={() =>
                            decrement(
                              item?.offerId,
                              item?.sellingUnit?._id,
                              item?.sellingUnit,
                              (
                                item?.finalAmountWithGST?.amount /
                                item?.quantity
                              ).toFixed(2),
                              item?.mrpPrice?.amount,
                              item?.sellingUnit?.multiplier
                            )
                          }
                        >
                          -
                        </button>
                        <div className="w-1/3 h-full bg-gray-100 flex items-center justify-center">
                          {quantity !== null &&
                          quantity !== 0 &&
                          jsonData[index]?.identifier?.offerId ===
                            selectedItemOfferId ? (
                            <span
                              id="quantity"
                              class="bg-gray-100 border-solid border-1 border-[#A18168] font-medium text-[#A18168]"
                            >
                              {quantity}
                            </span>
                          ) : (
                            <span
                              id="quantity"
                              class="border-solid border-1 border-[#A18168] font-medium text-[#A18168]"
                            >
                              {
                                cartData.items.find(
                                  (product) =>
                                    item?.sellingUnit?._id ===
                                    product?.sellingUnit?._id
                                )?.quantity
                              }
                            </span>
                          )}
                        </div>
                        <button
                          class="w-1/3 h-full text-white rounded-r bg-green-700"
                          onClick={() =>
                            increment(
                              item?.offerId,
                              item?.sellingUnit?._id,
                              item?.sellingUnit,
                              item?.availableToSell,
                              (
                                item?.finalAmountWithGST?.amount /
                                item?.quantity
                              ).toFixed(2),
                              item?.mrpPrice?.amount,
                              item?.sellingUnit?.multiplier
                            )
                          }
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </>
                ) : null}
              </div>
            ))}
          </div>
          <div className=" flex flex-col w-full   mx-auto md:mr-5 md:mt-0">
            <div className="bg-white py-3 mt-3 rounded-md flex flex-row justify-between px-6 mx-3 md:px-6 md:mt-4 text-sm">
              <div className="flex items-center sm:w-full">
                <FiTag />
                <div className="ml-2">Apply Coupons</div>
              </div>
              {appliedCoupon ? (
                <div className="text-[#FF8103]" onClick={handleRemoveCoupon}>
                  {appliedCoupon}{" "}
                  <RxCross2 className="w-3 h-3 inline-block ml-1" />
                </div>
              ) : (
                <button
                  className={`text-green-600 rounded-md text-semibold border border-green-600 p-1 px-2 ${
                    !isLogin ? "cursor-not-allowed" : "cursor-pointer"
                  }`}
                  onClick={() => handleApplyCouponOpen()}
                >
                  Apply
                </button>
              )}
            </div>
            <div className="bg-white mt-3 mx-3 py-3 px-3 rounded-lg">
              <div className="flex flex-row w-full">
                <div className="w-[80%] mt-1 flex flex-row items-center">
                  <div className="w-4 h-4 rounded-md">
                    <svg
                      viewBox="0 0 24 24"
                      className="object-cover"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                      <g
                        id="SVGRepo_tracerCarrier"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      ></g>
                      <g id="SVGRepo_iconCarrier">
                        {" "}
                        <path
                          d="M10.5 11L17 11"
                          stroke="#1C274C"
                          stroke-width="1.5"
                          stroke-linecap="round"
                        ></path>{" "}
                        <path
                          d="M7 11H7.5"
                          stroke="#1C274C"
                          stroke-width="1.5"
                          stroke-linecap="round"
                        ></path>{" "}
                        <path
                          d="M7 7.5H7.5"
                          stroke="#1C274C"
                          stroke-width="1.5"
                          stroke-linecap="round"
                        ></path>{" "}
                        <path
                          d="M7 14.5H7.5"
                          stroke="#1C274C"
                          stroke-width="1.5"
                          stroke-linecap="round"
                        ></path>{" "}
                        <path
                          d="M17 14.5H16M10.5 14.5H13.5"
                          stroke="#1C274C"
                          stroke-width="1.5"
                          stroke-linecap="round"
                        ></path>{" "}
                        <path
                          d="M17 7.5H14M10.5 7.5H11.5"
                          stroke="#1C274C"
                          stroke-width="1.5"
                          stroke-linecap="round"
                        ></path>{" "}
                        <path
                          d="M21 7V6.37006C21 5.17705 21 4.58055 20.842 4.09946C20.5425 3.18719 19.8468 2.47096 18.9606 2.16261C18.4933 2 17.9139 2 16.755 2H7.24502C6.08614 2 5.50671 2 5.03939 2.16261C4.15322 2.47096 3.45748 3.18719 3.15795 4.09946C3 4.58055 3 5.17705 3 6.37006V15M21 11V20.3742C21 21.2324 20.015 21.6878 19.3919 21.1176C19.0258 20.7826 18.4742 20.7826 18.1081 21.1176L17.625 21.5597C16.9834 22.1468 16.0166 22.1468 15.375 21.5597C14.7334 20.9726 13.7666 20.9726 13.125 21.5597C12.4834 22.1468 11.5166 22.1468 10.875 21.5597C10.2334 20.9726 9.26659 20.9726 8.625 21.5597C7.98341 22.1468 7.01659 22.1468 6.375 21.5597L5.8919 21.1176C5.52583 20.7826 4.97417 20.7826 4.6081 21.1176C3.985 21.6878 3 21.2324 3 20.3742V19"
                          stroke="#1C274C"
                          stroke-width="1.5"
                          stroke-linecap="round"
                        ></path>{" "}
                      </g>
                    </svg>
                  </div>
                  <div className="flex flex-col text-xs ml-2 justify-center">
                    <p className="text-sm font-semibold">Total Amount</p>
                  </div>
                </div>
                <div className="items-center text-sm text-semibold flex justify-end w-[20%]">
                  <div className="rounded-lg flex items-center justify-center px-2">
                    <p>₹{Math.round(totalMrpAmount)}</p>
                  </div>
                </div>
              </div>
              {selectedCoupon ? (
                <div className="flex flex-row w-full">
                  <div className="w-[80%] mt-1 flex flex-row items-center">
                    <div className="w-4 h-4 rounded-md">
                      <svg
                        viewBox="0 0 400 400"
                        className="object-cover"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                        <g
                          id="SVGRepo_tracerCarrier"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        ></g>
                        <g id="SVGRepo_iconCarrier">
                          {" "}
                          <path
                            d="M252.644 56.915C295.342 38.4482 320.69 113.363 271.651 123.522C231.551 131.832 216.845 78.0154 247.144 58.0544"
                            stroke="#000000"
                            stroke-opacity="0.9"
                            stroke-width="16"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          ></path>{" "}
                          <path
                            d="M330.482 265.712C341.911 277.397 345.967 295.564 330.334 311.241C305.977 335.671 271.834 312.649 271.756 285.037"
                            stroke="#000000"
                            stroke-opacity="0.9"
                            stroke-width="16"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          ></path>{" "}
                          <path
                            d="M192.293 285.199C193.35 293.668 190.602 302.807 182.127 311.229C159.576 333.641 128.721 316.163 123.655 291.812"
                            stroke="#000000"
                            stroke-opacity="0.9"
                            stroke-width="16"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          ></path>{" "}
                          <path
                            d="M231 133C206.612 161.128 194.495 179.606 187 209"
                            stroke="#000000"
                            stroke-opacity="0.9"
                            stroke-width="16"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          ></path>{" "}
                          <path
                            d="M231.268 139C230.078 174.935 230.842 200.382 278 181.706"
                            stroke="#000000"
                            stroke-opacity="0.9"
                            stroke-width="16"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          ></path>{" "}
                          <path
                            d="M270.454 181.27C277.648 203.747 292.95 234.179 296.436 257.918"
                            stroke="#000000"
                            stroke-opacity="0.9"
                            stroke-width="16"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          ></path>{" "}
                          <path
                            d="M198.698 209.851C179.8 211.119 147.038 219.427 133.916 234.11C126.125 242.825 100.697 270.714 108.106 285.446C112.07 293.339 163.502 289.662 170.276 288.7C200.718 284.374 240.691 289.662 270.337 285.446C276.764 284.532 267.42 277.198 275.865 277.198C288.469 277.198 350.064 262.896 339.366 250.123C314.559 220.523 257.393 244.451 266.097 274.746"
                            stroke="#000000"
                            stroke-opacity="0.9"
                            stroke-width="16"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          ></path>{" "}
                          <path
                            d="M200.303 212.449C207.9 229.886 214.057 274.576 214.593 278.703"
                            stroke="#000000"
                            stroke-opacity="0.9"
                            stroke-width="16"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          ></path>{" "}
                          <path
                            d="M200.303 208.553C255.045 208.309 257.332 233.927 223.294 274.806"
                            stroke="#000000"
                            stroke-opacity="0.9"
                            stroke-width="16"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          ></path>{" "}
                          <path
                            d="M169.124 213.748C142.024 230.768 99.6067 221.459 67.7939 231.936"
                            stroke="#000000"
                            stroke-opacity="0.9"
                            stroke-width="16"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          ></path>{" "}
                          <path
                            d="M60 128.007C68.4342 143.576 60 224.334 63.5625 228.038"
                            stroke="#000000"
                            stroke-opacity="0.9"
                            stroke-width="16"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          ></path>{" "}
                          <path
                            d="M63.8965 128.233C105.69 123.275 132.857 122.22 136.014 128.233C139.17 134.247 139.17 171.658 130.567 218.945"
                            stroke="#000000"
                            stroke-opacity="0.9"
                            stroke-width="16"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          ></path>{" "}
                        </g>
                      </svg>
                    </div>
                    <div className="flex flex-col text-xs ml-2 justify-center">
                      <p className="text-sm font-semibold text-green-600">
                        Discount
                      </p>
                    </div>
                  </div>
                  <div className="items-center flex justify-end w-[20%]">
                    <div className="rounded-lg flex text-sm font-bold items-center justify-center px-2 text-green-600">
                      <p>
                        ₹{Math.round(jsonData?.data?.totalDiscount?.amount)}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
              <div className="flex flex-row w-full">
                <div className="w-[80%] flex mt-1 flex-row items-center">
                  <div className="w-4 h-4 rounded-md">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="object-cover"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                      <g
                        id="SVGRepo_tracerCarrier"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      ></g>
                      <g id="SVGRepo_iconCarrier">
                        {" "}
                        <path
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="M16.5285 6C16.5098 5.9193 16.4904 5.83842 16.4701 5.75746C16.2061 4.70138 15.7904 3.55383 15.1125 2.65C14.4135 1.71802 13.3929 1 12 1C10.6071 1 9.58648 1.71802 8.88749 2.65C8.20962 3.55383 7.79387 4.70138 7.52985 5.75747C7.50961 5.83842 7.49016 5.9193 7.47145 6H5.8711C4.29171 6 2.98281 7.22455 2.87775 8.80044L2.14441 19.8004C2.02898 21.532 3.40238 23 5.13777 23H18.8622C20.5976 23 21.971 21.532 21.8556 19.8004L21.1222 8.80044C21.0172 7.22455 19.7083 6 18.1289 6H16.5285ZM8 11C8.57298 11 8.99806 10.5684 9.00001 9.99817C9.00016 9.97438 9.00044 9.9506 9.00084 9.92682C9.00172 9.87413 9.00351 9.79455 9.00718 9.69194C9.01451 9.48652 9.0293 9.18999 9.05905 8.83304C9.08015 8.57976 9.10858 8.29862 9.14674 8H14.8533C14.8914 8.29862 14.9198 8.57976 14.941 8.83305C14.9707 9.18999 14.9855 9.48652 14.9928 9.69194C14.9965 9.79455 14.9983 9.87413 14.9992 9.92682C14.9996 9.95134 14.9999 9.97587 15 10.0004C15 10.0004 15 11 16 11C17 11 17 9.99866 17 9.99866C16.9999 9.9636 16.9995 9.92854 16.9989 9.89349C16.9978 9.829 16.9957 9.7367 16.9915 9.62056C16.9833 9.38848 16.9668 9.06001 16.934 8.66695C16.917 8.46202 16.8953 8.23812 16.8679 8H18.1289C18.6554 8 19.0917 8.40818 19.1267 8.93348L19.86 19.9335C19.8985 20.5107 19.4407 21 18.8622 21H5.13777C4.55931 21 4.10151 20.5107 4.13998 19.9335L4.87332 8.93348C4.90834 8.40818 5.34464 8 5.8711 8H7.13208C7.10465 8.23812 7.08303 8.46202 7.06595 8.66696C7.0332 9.06001 7.01674 9.38848 7.00845 9.62056C7.0043 9.7367 7.00219 9.829 7.00112 9.89349C7.00054 9.92785 7.00011 9.96221 7 9.99658C6.99924 10.5672 7.42833 11 8 11ZM9.53352 6H14.4665C14.2353 5.15322 13.921 4.39466 13.5125 3.85C13.0865 3.28198 12.6071 3 12 3C11.3929 3 10.9135 3.28198 10.4875 3.85C10.079 4.39466 9.76472 5.15322 9.53352 6Z"
                          fill="#0F0F0F"
                        ></path>{" "}
                      </g>
                    </svg>
                  </div>
                  <div className="flex flex-col text-xs ml-2 justify-center">
                    <p className="text-sm font-semibold">Delivery Charges</p>
                  </div>
                </div>
                <div className="items-center flex justify-end w-[20%]">
                  <div className="rounded-lg flex text-sm text-semibold items-center justify-center px-2">
                    <p></p>
                  </div>
                </div>
              </div>
              <div className="flex flex-row w-full">
                <div className="w-[80%] mt-1 flex flex-row items-center">
                  <div className="w-4 h-4 rounded-md">
                    <svg
                      viewBox="0 0 400 400"
                      className="object-cover"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                      <g
                        id="SVGRepo_tracerCarrier"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      ></g>
                      <g id="SVGRepo_iconCarrier">
                        {" "}
                        <path
                          d="M252.644 56.915C295.342 38.4482 320.69 113.363 271.651 123.522C231.551 131.832 216.845 78.0154 247.144 58.0544"
                          stroke="#000000"
                          stroke-opacity="0.9"
                          stroke-width="16"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        ></path>{" "}
                        <path
                          d="M330.482 265.712C341.911 277.397 345.967 295.564 330.334 311.241C305.977 335.671 271.834 312.649 271.756 285.037"
                          stroke="#000000"
                          stroke-opacity="0.9"
                          stroke-width="16"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        ></path>{" "}
                        <path
                          d="M192.293 285.199C193.35 293.668 190.602 302.807 182.127 311.229C159.576 333.641 128.721 316.163 123.655 291.812"
                          stroke="#000000"
                          stroke-opacity="0.9"
                          stroke-width="16"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        ></path>{" "}
                        <path
                          d="M231 133C206.612 161.128 194.495 179.606 187 209"
                          stroke="#000000"
                          stroke-opacity="0.9"
                          stroke-width="16"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        ></path>{" "}
                        <path
                          d="M231.268 139C230.078 174.935 230.842 200.382 278 181.706"
                          stroke="#000000"
                          stroke-opacity="0.9"
                          stroke-width="16"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        ></path>{" "}
                        <path
                          d="M270.454 181.27C277.648 203.747 292.95 234.179 296.436 257.918"
                          stroke="#000000"
                          stroke-opacity="0.9"
                          stroke-width="16"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        ></path>{" "}
                        <path
                          d="M198.698 209.851C179.8 211.119 147.038 219.427 133.916 234.11C126.125 242.825 100.697 270.714 108.106 285.446C112.07 293.339 163.502 289.662 170.276 288.7C200.718 284.374 240.691 289.662 270.337 285.446C276.764 284.532 267.42 277.198 275.865 277.198C288.469 277.198 350.064 262.896 339.366 250.123C314.559 220.523 257.393 244.451 266.097 274.746"
                          stroke="#000000"
                          stroke-opacity="0.9"
                          stroke-width="16"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        ></path>{" "}
                        <path
                          d="M200.303 212.449C207.9 229.886 214.057 274.576 214.593 278.703"
                          stroke="#000000"
                          stroke-opacity="0.9"
                          stroke-width="16"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        ></path>{" "}
                        <path
                          d="M200.303 208.553C255.045 208.309 257.332 233.927 223.294 274.806"
                          stroke="#000000"
                          stroke-opacity="0.9"
                          stroke-width="16"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        ></path>{" "}
                        <path
                          d="M169.124 213.748C142.024 230.768 99.6067 221.459 67.7939 231.936"
                          stroke="#000000"
                          stroke-opacity="0.9"
                          stroke-width="16"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        ></path>{" "}
                        <path
                          d="M60 128.007C68.4342 143.576 60 224.334 63.5625 228.038"
                          stroke="#000000"
                          stroke-opacity="0.9"
                          stroke-width="16"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        ></path>{" "}
                        <path
                          d="M63.8965 128.233C105.69 123.275 132.857 122.22 136.014 128.233C139.17 134.247 139.17 171.658 130.567 218.945"
                          stroke="#000000"
                          stroke-opacity="0.9"
                          stroke-width="16"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        ></path>{" "}
                      </g>
                    </svg>
                  </div>
                  <div className="flex flex-col text-xs ml-2 justify-center">
                    <p className="text-sm font-semibold">Round off</p>
                  </div>
                </div>
                <div className="items-center flex justify-end w-[20%]">
                  <div className="rounded-lg flex text-sm text-semibold items-center justify-center px-2">
                    <p>₹{jsonData.data.roundOff}</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-row w-full">
                <div className="w-[80%] flex flex-row items-center">
                  <div className="flex flex-col mt-2 text-md pl-5 justify-center">
                    <p className="text-md font-bold">Grand Total</p>
                  </div>
                </div>
                <div className="items-center flex justify-end w-[20%]">
                  <div className="text-md font-semibold flex items-center px-2">
                    <p>₹{totalCartPrice}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="h-full w-full ">
              <AddressComponent />
            </div>
          </div>
        </div>
      )}
      {couponModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className=" ">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left">
                    <h3
                      className="text-lg leading-6 font-medium text-gray-900"
                      id="modal-title"
                    >
                      Apply Coupon
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Enter your coupon code to avail the discount.
                      </p>
                      <div className="flex flex-col items-center">
                        {couponCodes.map((code, index) => (
                          <div
                            key={index}
                            className="bg-gray-100 my-2 w-full shadow-sm rounded-lg "
                          >
                            <div className="px-4 py-5  ">
                              <input
                                type="checkbox"
                                id={`coupon-${index}`}
                                checked={selectedCoupon === code}
                                onChange={(e) =>
                                  setSelectedCoupon(
                                    e.target.checked ? code : ""
                                  )
                                }
                                className="mb-4 mr-2"
                              />
                              <label
                                htmlFor={`coupon-${index}`}
                                className="text-lg font-semibold  w-[30%] text-center p-2 mx-2  border-dashed border	border-black mb-2"
                              >
                                {code}
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className=" px-4 py-3 sm:px-6 sm:flex  sm:justify-between">
                <button
                  onClick={handleApplyCoupon}
                  type="button"
                  className="w-full inline-flex bg-[#15803D] justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green text-base font-medium text-white hover:bg-[#8A6E53] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Apply Coupon
                </button>
                <button
                  onClick={() => setCouponModalOpen(false)}
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default Page;
