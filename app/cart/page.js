"use client";
import { useState } from "react";
import { Radio, RadioGroup } from "@headlessui/react";
import { MdOutlineModeEdit } from "react-icons/md";
import { RxCross2 } from "react-icons/rx";
import { CheckCircleIcon, TrashIcon } from "@heroicons/react/20/solid";
import { useAuth } from "@/context/Auth";
import { useCart } from "@/context/CartContext";
import { useStateContext } from "@/context/StateContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { FiTag } from "react-icons/fi";
import { TailSpin } from "react-loader-spinner";

import Script from "next/script";
import toast, { Toaster } from "react-hot-toast";
import PlacesAutocomplete, {
  geocodeByAddress,
  getLatLng,
} from "react-places-autocomplete";

import axiosInstance from "@/services/axiosConfig";
import SkeletonLoader from "@/components/CartSkeleton";
import axios from "axios";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Example() {
  const [localData, setLocalData] = useState(null);
  const [isDeliveriable, setIsDeliveriable] = useState(false);

  const [loading, setLoading] = useState(false);
  const [QuantityLoader, setQuantityLoader] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showCodInfo, setShowCodInfo] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [jsonData, setJsonData] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalMrpAmount, setTotalMrpAmount] = useState(0);
  const [Isregister, setIsRegister] = useState();
  const [orderPlaceLoading, setOrderPlaceLoading] = useState(false);

  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState([]);
  const [userProfile, setUserProfile] = useState();
  const [selectedItemOfferId, setSelectedItemOfferId] = useState(null);
  const [quantity, setQuantity] = useState(null);
  const cartData = JSON.parse(localStorage.getItem("cartData") ?? "{}");
  const [totalTax, setTotalTax] = useState();
  const [priceBeforeTax, setPriceBeforeTax] = useState();
  const [selectedCoupon, setSelectedCoupon] = useState(""); // Added state to store the selected coupon
  const [couponCodes, setCouponCodes] = useState([]);
  const [updateCart, setUpdateCart] = useState(false);
  const { isLogin } = useAuth();
  const [paymentMode, setPaymentMode] = useState();
  const [userDetails, setUserDetails] = useState();
  const [sellerDetails, setSellerDetails] = useState();
  const [mainAddress, setMainAddress] = useState();

  const [customerId, setCustomerId] = useState();
  const [customerWorkspace, setCustomerWorkspace] = useState();
  const [isNew, setIsNew] = useState(false);
  const { cartLength, updateCartLength } = useCart();
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    line1: "",
    line2: "",
    city: "",
    state: "",
    zipCode: "",
    isDefault: false,
  });

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
    setShowCheckout(false);
    setShowNav(true);
  }, [updateCart]);
  useEffect(() => {
    const { line1, city, state, zipCode } = formData;
    setIsValid(!!(line1 && city && state && zipCode));
  }, [formData]);

  const handleSave = async (e) => {
    e.preventDefault();
    console.log("adress section");
    if (!isValid) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    try {
      const customer_id = localStorage.getItem("customer_id");
      const updatedAddresses = isNew
        ? [...userProfile?.shippingAddress, formData]
        : userProfile?.shippingAddress.map((addr) =>
            addr._id === editId ? { ...formData } : addr
          );
      const seller = localStorage.getItem("SellerWorkspace");
      await axiosInstance.put(`/customers/buyer/${customer_id}`, {
        shippingAddress: updatedAddresses,
        billingAddress: userProfile?.billingadress,
        workspace: seller,
      });
      toast.success(`Address ${isNew ? "added" : "updated"} successfully`);
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update address");
    } finally {
      setLoading(false);
      setEditId(null);
      setIsNew(false);
      setFormData(initialFormData());
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    setUserDetails(localStorage.getItem("userDetails"));
    setSellerDetails(JSON.parse(localStorage.getItem("SellerDetails")));
    setCustomerId(localStorage.getItem("customer_id"));
    setCustomerWorkspace(localStorage.getItem("customerWorkspace"));
  }, []);
  const shippingAddress = userProfile?.shippingAddress?.filter(
    (address) => address._id === selectedAddressId
  );
  console.log(shippingAddress);
  const handleAddress = (addressId) => {
    const updatedAddresses = userProfile?.shippingAddress?.find(
      (addr) => addr._id === addressId
    );
    setMainAddress(updatedAddresses);
    console.log(updatedAddresses);
    console.log(addressId);
    setSelectedAddressId(addressId);
  };
  const fetchData = async () => {
    const seller_id = localStorage.getItem("SellerWorkspace");
    const res = await axiosInstance.get(
      `/customers/buyer?sellerWorkspace=${seller_id}`
    );
    console.log("i am user profile");
    setIsRegister(res?.data.data.length);
    setUserProfile(res?.data?.data[0]);
  };
  const handleRadioClick = (value) => {
    setSelectedOption(value);
    setShowCodInfo(value === "cod");
  };
  const handleApplyButtonClick = (e) => {
    e.preventDefault();
    if (!isLogin) {
      toast.error("Please login first");
    } else {
      setCouponModalOpen(true);
    }
  };
  const handleSelect = async (address) => {
    try {
      const results = await geocodeByAddress(address);
      const { address_components } = results[0];
      let city = "";
      let state = "";
      let zipCode = "";

      address_components.forEach((component) => {
        const { types, long_name } = component;
        if (types.includes("locality")) {
          city = long_name;
        } else if (types.includes("administrative_area_level_1")) {
          state = long_name;
        } else if (types.includes("postal_code")) {
          zipCode = long_name;
        }
      });

      const latLng = await getLatLng(results[0]);

      setFormData((prev) => ({
        ...prev,
        line1: address,
        city,
        state,
        zipCode,
        lat: latLng.lat,
        lng: latLng.lng,
      }));
    } catch (error) {
      console.error("Error fetching address details:", error);
    }
  };
  const initialFormData = () => ({
    line1: "",
    line2: "",
    city: "",
    state: "",
    zipCode: "",
    isDefault: false,
    lat: null,
    lng: null,
  });

  const handleAddressChange = (address) => {
    setFormData((prev) => ({ ...prev, line1: address }));
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

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!isLogin) {
      router.push("/auth/login");
    } else if (localData.items.length === 0) {
      toast.error("cart is empty");
    } else if (isLogin && !isDeliveriable) {
      toast.error("Delivery Not Available");
    } else {
      if (selectedAddressId === null) {
        toast.error("Please select address");
      } else if (
        paymentMode === "RAZORPAY" &&
        isLogin &&
        selectedOption !== "cod"
      ) {
        console.log("xy", jsonData);
        setOrderPlaceLoading(true);
        let uri = localStorage.getItem("uri");

        const orderDetails = {
          identifier: {
            buyerWorkspace: customerWorkspace,
            buyerId: customerId,
            sellerWorkspace: sellerDetails?._id,
            sellerId: sellerDetails?.customerId,
            uri: uri,
            promoCodes: [],
          },
          attributeSet: {
            items: cartData?.items,
            status: "ORDER_PLACED",
            buyerEmail: userDetails?.email ? userDetails.email : "",
            remark: "",
            shippingAddress: shippingAddress[0],
            billingAddress: shippingAddress[0],
            orderTotalWithGST: jsonData.data.orderTotalWithGST,
            orderTotal: jsonData.data.orderTotal,
            finalOrderAmountWithGST: jsonData.data.finalOrderAmountWithGST,
            cod: selectedOption === "cod" ? true : false,
          },
        };

        const sendRequest = async () => {
          if (!orderDetails) {
            console.error("Error: orderDetails is missing");
            return;
          }

          const response = await axiosInstance.post(
            `/razorpay/create-order`,
            orderDetails
          );
          let amount = response?.data.data.option.amount;
          const paymentData = response.data.data.option;

          const options = {
            key: paymentData.key,
            amount: paymentData.amount,
            currency: paymentData.currency,
            name: paymentData.name,
            description: paymentData.description,
            account_id: paymentData.account_id,
            order_id: paymentData.order_id,
            theme: paymentData.theme,
            handler: async (response) => {
              if (response) {
                setPaymentSuccess(true);
                setOrderPlaceLoading(true);
                await placeOrderAfterPayment(orderDetails, response);
              }
            },
            modal: {
              ondismiss: function () {
                toast.error("Payment canceled. Please try again.");
                setOrderPlaceLoading(false);
              },
            },
          };
          const paymentObject = new window.Razorpay(options);
          paymentObject.on("payment.failed", function (response) {
            alert("Payment failed. Please try again. Contact support for help");
            setOrderPlaceLoading(false);
          });

          paymentObject.on("payment.cancel", function (response) {
            alert("Payment canceled. Please try again.");
            setOrderPlaceLoading(false);
          });
          paymentObject.open();
          const placeOrderAfterPayment = async (
            orderDetails,
            paymentSuccessData
          ) => {
            setOrderPlaceLoading(true);
            if (orderDetails) {
              console.log("amount", amount);
              setLoaderImg(true);
              orderDetails.identifier.razorpayPayments = {
                ...paymentSuccessData,
              };
              orderDetails.attributeSet.razorpayMerchantTransactionId =
                paymentSuccessData.razorpay_order_id;
              orderDetails.attributeSet.paymentMethod =
                selectedOption === "cod" ? "COD" : "ONLINE";
              orderDetails.attributeSet.paymentAttachments = {
                paymentAmount: amount / 100,
                paymentMethod: "UPI",
                paymentMethodDetails: "RAZORPAY",
              };
            }

            const vendorData = await JSON.parse(
              localStorage.getItem("vendorData") ?? "{}"
            );

            console.log("Cart vendorData", vendorData);
            if (vendorData && vendorData?.vendorMachineId) {
              (orderDetails.attributeSet.createdByEmployee =
                vendorData?.vendorMachineId),
                (orderDetails.attributeSet.autoAccept = true);
            }
            const response = await axiosInstance.post(`/orders`, orderDetails);

            if (response) {
              setOrderPlaceLoading(false);
              setLoaderImg(false);
              router.push("/success");
            }
          };
        };
        sendRequest();
      } else if (isLogin) {
        let uri = localStorage.getItem("uri");

        const orderDetails = {
          identifier: {
            buyerWorkspace: customerWorkspace,
            buyerId: customerId,
            sellerWorkspace: sellerDetails?._id,
            sellerId: sellerDetails?.customerId,
            uri: uri,
            promoCodes: [],
          },
          attributeSet: {
            items: cartData?.items,
            status: "ORDER_PLACED",
            buyerEmail: userDetails?.email ? userDetails.email : "",
            remark: "",
            shippingAddress: shippingAddress[0],
          },
        };
        const vendorData = await JSON.parse(
          localStorage.getItem("vendorData") ?? "{}"
        );
        if (vendorData && vendorData?.vendorMachineId) {
          (orderDetails.attributeSet.createdByEmployee =
            vendorData?.vendorMachineId),
            (orderDetails.attributeSet.autoAccept = true);
        }
        const sendrequest = async () => {
          if (orderDetails) {
            try {
              const response = await axiosInstance.post(
                `/orders`,
                orderDetails
              );
              console.log("Successfully ordered");
              console.log("Response", response.data);
              if (response) {
                router.push("/success");
              }
            } catch (error) {
              console.log("Error", error);
            }
          }
        };
        sendrequest();
      } else {
        toast.error("Please Login");
      }
    }
  };

  useEffect(() => {
    const sendPostRequest = async () => {
      if (selectedOption === "cod") {
        if (localData && !isLogin) {
          const additional = {
            charges: [
              {
                name: "COD Charges",
                percent:
                  jsonData?.data.orderTotal?.amount >= 3000
                    ? 0
                    : parseFloat(
                        (150 / jsonData?.data.orderTotal?.amount) * 100
                      ).toFixed(2),
                amount: jsonData?.data.orderTotal?.amount >= 3000 ? 0 : 150,

                autoApplied: false,
                flatDiscountAndCharge: true,
              },
            ],
            discounts: [],
          };

          const updatedData = { ...localData };
          try {
            setQuantityLoader(true);

            const response = await axiosInstance.post(
              "orders/ghost-cart",
              updatedData
            );

            setJsonData(response.data);
            setQuantityLoader(false);
          } catch (error) {}
        } else if (localData && isLogin) {
          const customerWorkspace = localStorage.getItem("customerWorkspace");
          const buyer_id = localStorage.getItem("BuyerId");
          const couponCode = localStorage.getItem("Coupon");
          const additional = {
            charges: [
              {
                name: "COD Charges",
                percent:
                  jsonData?.data.orderTotal?.amount >= 3000
                    ? 0
                    : parseFloat(
                        (150 / jsonData?.data.orderTotal?.amount) * 100
                      ).toFixed(2),
                amount: jsonData?.data.orderTotal?.amount >= 3000 ? 0 : 150,

                autoApplied: false,
                flatDiscountAndCharge: true,
              },
            ],
            discounts: [],
          };
          const updatedData = {
            ...localData,
            promoCodes: [couponCode],
            buyerWorkspace: customerWorkspace,
            buyerId: buyer_id,
          };
          try {
            setQuantityLoader(true);

            const response = await axiosInstance.post(
              "orders/cart",
              updatedData
            );

            setJsonData(response.data);
            setQuantityLoader(false);
          } catch (error) {
            console.error("Error", error);
          }
        }
      } else {
        if (localData && !isLogin) {
          try {
            setQuantityLoader(true);

            const response = await axiosInstance.post(
              "orders/ghost-cart",
              localData
            );

            setJsonData(response.data);
            setQuantityLoader(false);
          } catch (error) {}
        } else if (localData && isLogin) {
          const customerWorkspace = localStorage.getItem("customerWorkspace");
          const buyer_id = localStorage.getItem("BuyerId");
          const couponCode = localStorage.getItem("Coupon");
          const updatedData = {
            ...localData,
            promoCodes: [couponCode],
            buyerWorkspace: customerWorkspace,
            buyerId: buyer_id,
          };
          try {
            setQuantityLoader(true);

            const response = await axiosInstance.post(
              "orders/cart",
              updatedData
            );

            setJsonData(response.data);
            setQuantityLoader(false);
          } catch (error) {
            console.error("Error", error);
          }
        }
      }
    };

    sendPostRequest();
  }, [localData, selectedOption]);

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
      setQuantityLoader(true);

      setJsonData(updatedCartResponse?.data);
      setQuantityLoader(false);

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
    try {
      const customerWorkspace = localStorage.getItem("customerWorkspace");
      const buyerId = localStorage.getItem("BuyerId");
      if (selectedOption === "cod") {
        const additional = {
          charges: [
            {
              name: "COD Charges",
              percent:
                jsonData?.data.orderTotal?.amount >= 3000
                  ? 0
                  : parseFloat(
                      (150 / jsonData?.data.orderTotal?.amount) * 100
                    ).toFixed(2),
              amount: jsonData?.data.orderTotal?.amount >= 3000 ? 0 : 150,

              autoApplied: false,
              flatDiscountAndCharge: true,
            },
          ],
          discounts: [],
        };
        const updatedData = {
          ...localData,
          promoCodes: [],
          buyerWorkspace: customerWorkspace,
          buyerId: buyerId,
        };
        setQuantityLoader(true);

        const updatedCartResponse = await axiosInstance.post(
          "/orders/cart",
          updatedData
        );

        setJsonData(updatedCartResponse.data);
        setQuantityLoader(false);
        setAppliedCoupon(null);
      } else {
        const updatedData = {
          ...localData,
          promoCodes: [],
          buyerWorkspace: customerWorkspace,
          buyerId: buyerId,
        };
        setQuantityLoader(true);

        const updatedCartResponse = await axiosInstance.post(
          "/orders/cart",
          updatedData
        );
        setJsonData(updatedCartResponse.data);
        setQuantityLoader(false);
        setAppliedCoupon(null);
      }
    } catch (error) {
      console.error("Error removing coupon:", error);
    }
  };
  useEffect(() => {
    updateCartLength(jsonData?.data.items.length);
  }, [jsonData]);
  const handleRemove = async (id) => {
    setLoading(true);
    try {
      const customer_id = localStorage.getItem("customer_id");
      const updatedAddresses = userProfile?.shippingAddress?.filter(
        (addr) => addr._id !== id
      );
      const seller = localStorage.getItem("SellerWorkspace");
      await axiosInstance.put(`/customers/buyer/${customer_id}`, {
        shippingAddress: updatedAddresses,
        billingAddress: userProfile?.billingAddress,
        workspace: seller,
      });
      toast.success("Address removed successfully");
      fetchData();
    } catch (error) {
      toast.error("Failed to remove address");
      console.error("Error removing address:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleEditClick = (address) => {
    setEditId(editId === address._id ? null : address._id);
    setFormData(editId === address._id ? initialFormData() : { ...address });
    setIsNew(false);
  };
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

  const handleNewClick = () => {
    if (!isLogin) {
      router.push("/auth/login");
    } else {
      setIsNew(!isNew);
      setEditId(null);
      setFormData(initialFormData());
    }
  };

  const handleApplyCouponOpen = () => {
    if (isLogin) {
      setCouponModalOpen(true);
    } else {
      router.push("/auth/login");
    }
  };

  useEffect(() => {
    fetchPaymentOption();
  }, []);

  const fetchPaymentOption = async () => {
    try {
      const urii = localStorage.getItem("uri");
      const response = await axiosInstance.get(`/offers/active-offers/${urii}`);
      setPaymentMode(response?.data?.metaData?.paymentOptions[0]?.mode);
      console.log(response?.data.metaData);
    } catch (error) {
      console.error("Error fetching payment options:", error);
    }
  };
  useEffect(() => {
    const fetchCoordinates = async () => {
      if (mainAddress) {
        try {
          const postCode = mainAddress?.zipCode;
          console.log("mainaddress", mainAddress);
          console.log("zipcode", mainAddress?.zipCode);
          const response = await axios.get(
            `https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyCxcFWfgcOPdJ4OjL7fE4c46Oel3nPxRRQ&components=postal_code:${postCode}`
          );
          console.log(
            "response of coordinates",
            response?.data?.results[0].geometry.location
          );
          const sellerDetails = await JSON.parse(
            localStorage.getItem("SellerDetails") ?? "{}"
          );
          const shipmentOptions = [
            "Ship any where in India",
            "Local delivery within city only",
          ];

          if (shipmentOptions.includes(sellerDetails?.shipmentInfo)) {
            setIsDeliveriable(true);
          } else {
            CheckDeliveryValid(
              response?.data?.results[0]?.geometry?.location?.lng,
              response?.data?.results[0]?.geometry?.location?.lat
            );
          }

          // setLatitude(response?.data?.results[0]?.geometry?.location?.lat)
          // setLongitude(response?.data?.results[0]?.geometry?.location?.lng)
        } catch (error) {
          console.log("error", error);
        }
      }
    };
    const CheckDeliveryValid = async (coordinate1, coordinate2) => {
      const sellerWorkspace = localStorage.getItem("SellerWorkspace");
      console.log("seller", sellerWorkspace);
      if (coordinate1 && coordinate2) {
        const dataToSend = {
          coordinates: [coordinate1, coordinate2],
          seller: sellerWorkspace,
        };
        console.log("dataToSend", dataToSend);
        const response = await axiosInstance.post(
          "/users/check-deliveriable",
          dataToSend
        );
        console.log("DELIVERY HAI AAS PAAS?", response);
        console.log("DELIVERY HAI ?", response?.data?.data?.isDeliveriable);
        response
          ? setIsDeliveriable(response?.data?.data?.isDeliveriable)
          : false;
      }
    };
    fetchCoordinates();
  }, [mainAddress]);

  return (
    <div className="sm:min-w-[82rem]">
      <Toaster />
      <Script
        id="razorpay-checkout-js"
        src="https://checkout.razorpay.com/v1/checkout.js"
      />
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=AIzaSyCxcFWfgcOPdJ4OjL7fE4c46Oel3nPxRRQ&libraries=places&region=IN`}
      />
      {!jsonData ? (
        <SkeletonLoader />
      ) : (
        <div className="mx-auto max-w-2xl px-4 pb-24 pt-16 sm:px-6 lg:max-w-7xl lg:px-8">
          <h2 className="sr-only">Checkout</h2>

          <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
            <div>
              <div className=" flex justify-between mb-1 mx-1 sm:mx-0">
                <h2 className="text-lg font-medium text-gray-900">
                  Select Address
                </h2>
                <button
                  type="button"
                  onClick={handleNewClick}
                  className="text-xs text-white bg-[#5FAC00] cursor-pointer rounded-sm px-3 py-1"
                >
                  {isNew ? "Cancel" : "Add New Address"}
                </button>
              </div>
              {userProfile?.shippingAddress?.length > 0 ? (
                userProfile.shippingAddress.map((address, index) => (
                  <div
                    key={address._id}
                    className={`${
                      selectedAddressId === address._id
                        ? " pr-2 mr-[4px] md:pl-2 flex flex-row my-3 bg-white mt-3 py-2"
                        : "pt-3 pb-4 pl-2 bg-white flex flex-row text-[#723B10] "
                    }`}
                  >
                    <div className="w-1/12 mx-1">
                      <input
                        type="radio"
                        value={address.line1}
                        checked={selectedAddressId === address._id}
                        className="w-5 h-5 rounded-full border-2 border-gray-400 "
                        onClick={() => handleAddress(address._id)}
                      />
                    </div>
                    <div className="w-8/12">
                      <span className="font-medium">{userProfile.name}</span>
                      <p className="text-sm mt-1">
                        {address.line1} , {address.line2} , {address.city} ,{" "}
                        {address.state} , {address.zipCode}
                      </p>
                      {selectedAddressId === address._id ? (
                        <p className="text-sm py-1">
                          MOBILE: +91 {userProfile.phone}
                        </p>
                      ) : null}
                    </div>
                    <div className="w-3/12 flex justify-end gap-1 pr-1">
                      {selectedAddressId === address._id ? (
                        <>
                          <div
                            className="h-5 w-5"
                            onClick={() => handleEditClick(address)}
                          >
                            <MdOutlineModeEdit size={18} />
                          </div>
                          <div
                            className="h-5 w-5 "
                            onClick={() => handleRemove(address._id)}
                          >
                            <RxCross2 size={18} />
                          </div>
                        </>
                      ) : null}
                    </div>
                  </div>
                ))
              ) : (
                <div>NO ADDRESS</div>
              )}
              {userProfile?.shippingAddress?.length === 1 &&
                !selectedAddressId &&
                handleAddress(userProfile.shippingAddress[0]._id)}

              <div>
                <form onSubmit={handleSave}>
                  <div className=" grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                    {(isNew || editId) && (
                      <div className="flex flex-col my-4 p-4  rounded-xxl sm:col-span-2">
                        <PlacesAutocomplete
                          value={formData.line1}
                          onChange={handleAddressChange}
                          onSelect={handleSelect}
                        >
                          {({
                            getInputProps,
                            suggestions,
                            getSuggestionItemProps,
                            loading,
                          }) => (
                            <div className="sm:col-span-2 mt-2">
                              <label
                                htmlFor="line1"
                                className="block text-sm font-medium text-gray-700"
                              >
                                Line 1
                              </label>
                              <input
                                {...getInputProps({
                                  placeholder: "Line 1",
                                  name: "line1",
                                })}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#5FAC00] focus:ring-[#5FAC00] sm:text-sm"
                                required
                              />
                              <div>
                                {loading ? <div>Loading...</div> : null}
                                {suggestions.map((suggestion) => {
                                  const style = {
                                    backgroundColor: suggestion.active
                                      ? "#fafafa"
                                      : "#ffffff",
                                  };
                                  return (
                                    <div
                                      key={suggestion.placeId}
                                      {...getSuggestionItemProps(suggestion, {
                                        style,
                                      })}
                                      className="font-book-antiqua px-1"
                                    >
                                      {suggestion.description}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </PlacesAutocomplete>
                        <div className="sm:col-span-2 mt-2">
                          <label
                            htmlFor="line2"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Line 2
                          </label>
                          <input
                            className="block w-full rounded-md border-gray-300 shadow-sm  focus:border-[#5FAC00] focus:ring-[#5FAC00] sm:text-sm"
                            name="line2"
                            value={formData.line2}
                            onChange={handleChange}
                          />
                        </div>

                        <div className="sm:col-span-2 mt-2">
                          <label
                            htmlFor="city"
                            className="block text-sm font-medium text-gray-700"
                          >
                            City
                          </label>
                          <input
                            className="block w-full rounded-md border-gray-300 shadow-sm  focus:border-[#5FAC00] focus:ring-[#5FAC00] sm:text-sm"
                            placeholder="City"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            required
                          />
                        </div>

                        <div className="sm:col-span-2 mt-2">
                          <label
                            htmlFor="state"
                            className="block text-sm font-medium text-gray-700"
                          >
                            State
                          </label>
                          <input
                            className="block w-full rounded-md border-gray-300 shadow-sm  focus:border-[#5FAC00] focus:ring-[#5FAC00] sm:text-sm"
                            placeholder="State"
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            required
                          />
                        </div>

                        <div className="sm:col-span-2 mt-2">
                          <label
                            htmlFor="zipCode"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Zipcode
                          </label>
                          <input
                            className="block w-full rounded-md border-gray-300 shadow-sm  focus:border-[#5FAC00] focus:ring-[#5FAC00] sm:text-sm"
                            placeholder="Zipcode"
                            name="zipCode"
                            value={formData.zipCode}
                            onChange={handleChange}
                            required
                          />
                        </div>

                        <button
                          type="submit"
                          className="bg-[#5FAC00] text-white font-bold py-2 px-1 rounded mt-4"
                        >
                          {loading
                            ? "Processing..."
                            : isNew
                            ? "Add Address"
                            : "Save Changes"}
                        </button>
                      </div>
                    )}
                  </div>
                </form>
              </div>
              <div className="mt-10 border-t border-gray-200 pt-10">
                <fieldset>
                  <legend className="text-lg font-medium text-gray-900">
                    Payment Options
                  </legend>
                  <div className="flex flex-col">
                    <RadioGroup
                      value={selectedOption}
                      onChange={handleRadioClick}
                      className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4"
                    >
                      <RadioGroup.Option
                        value="cod"
                        aria-label="COD"
                        className={({ checked, focus }) =>
                          classNames(
                            checked ? "border-transparent" : "border-gray-300",
                            focus ? "ring-2 ring-indigo-500" : "",
                            "relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none"
                          )
                        }
                        onChange={() => handleRadioClick("cod")}
                      >
                        {({ checked, focus }) => (
                          <>
                            <span className="flex flex-1">
                              <span className="flex flex-col">
                                <span className="block text-sm font-medium text-gray-900">
                                  COD
                                </span>

                                {/* <span className="mt-6 text-sm font-medium text-gray-900">₹150 Extra</span> */}
                              </span>
                            </span>
                            {checked ? (
                              <CheckCircleIcon
                                className="h-5 w-5 text-[#5FAC00] "
                                aria-hidden="true"
                              />
                            ) : null}
                            <span
                              className={classNames(
                                checked
                                  ? "border-[#5FAC00]"
                                  : "border-transparent",
                                focus ? "border" : "border-2",
                                "pointer-events-none absolute -inset-px rounded-lg"
                              )}
                              aria-hidden="true"
                            />
                          </>
                        )}
                      </RadioGroup.Option>
                      <RadioGroup.Option
                        value="payOnline"
                        aria-label="Pay Online"
                        className={({ checked, focus }) =>
                          classNames(
                            checked ? "border-transparent" : "border-gray-300",
                            focus ? "ring-2 ring-[#5FAC00]" : "",
                            "relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none",
                            !paymentMode ? "opacity-50 cursor-not-allowed" : "" // Disable styling
                          )
                        }
                        onChange={() => handleRadioClick("payOnline")}
                        disabled={!paymentMode} // Disable condition
                      >
                        {({ checked, focus }) => (
                          <>
                            <span className="flex flex-1">
                              <span className="flex flex-col">
                                <span className="block text-sm font-medium text-gray-900">
                                  Pay Online
                                </span>
                              </span>
                            </span>
                            {checked ? (
                              <CheckCircleIcon
                                className="h-5 w-5 text-[#5FAC00]"
                                aria-hidden="true"
                              />
                            ) : null}
                            <span
                              className={classNames(
                                checked
                                  ? "border-[#5FAC00]"
                                  : "border-transparent",
                                focus ? "border" : "border-2",
                                "pointer-events-none absolute -inset-px rounded-lg"
                              )}
                              aria-hidden="true"
                            />
                          </>
                        )}
                      </RadioGroup.Option>
                    </RadioGroup>
                  </div>
                </fieldset>{" "}
              </div>
            </div>

            {/* Order summary */}
            <div className="mt-10 lg:mt-0">
              <h2 className="text-lg font-medium text-gray-900">
                Order summary
              </h2>

              <div className="mt-4 rounded-lg border border-gray-200 bg-white shadow-sm">
                <h3 className="sr-only">Items in your cart</h3>
                <ul role="list" className="divide-y divide-gray-200">
                  {jsonData?.data?.items?.map((item, index) => (
                    <li key={index} className="flex px-4 py-6 sm:px-6 ">
                      <div className="flex-shrink-0 ">
                        <img
                          className="w-20 h-16 rounded-md object-contain "
                          onClick={() => handleShowItem(item?.itemRef)}
                          src={`${Base_url}${item?.itemImages[0]}`}
                          onError={(e) => {
                            e.target.onerror = null; // Prevent infinite loop if the fallback image fails
                            e.target.src = "/no-img.png"; // Path to the fallback image in the public folder
                          }}
                        />
                      </div>

                      <div className="ml-6 flex flex-row w-full ">
                        <div className="flex flex-col min-w-[50%]">
                          <div className="w-full ">
                            <h4 className="text-sm font-medium text-gray-700 hover:text-gray-800">
                              {item?.itemName
                                ?.split(" ")
                                .map(
                                  (word) =>
                                    word.charAt(0).toUpperCase() +
                                    word.slice(1).toLowerCase()
                                )
                                .join(" ")}
                            </h4>
                            <p className="mt-1 text-sm font-medium text-gray-900">
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
                                    ₹
                                    {Math.round(
                                      item?.finalAmountWithGST?.amount
                                    )}
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
                            {/* <p className="mt-1 text-sm text-gray-500">{product.color}</p>
                                                    <p className="mt-1 text-sm text-gray-500">{product.size}</p> */}
                          </div>

                          {/* <div className="ml-4 flow-root flex-shrink-0">
                                                    <button
                                                        type="button"
                                                        className="-m-2.5 flex items-center justify-center bg-white p-2.5 text-gray-400 hover:text-gray-500"
                                                    >
                                                        <span className="sr-only">Remove</span>
                                                        <TrashIcon className="h-5 w-5" aria-hidden="true" />
                                                    </button>
                                                </div> */}
                        </div>

                        <div class="flex items-start  h-8  ml-4 w-full">
                          <button
                            class="w-1/3 h-full text-white text-lg rounded-l bg-green-700"
                            onClick={(e) => {
                              e.preventDefault();
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
                              );
                            }}
                          >
                            -
                          </button>
                          <div className="w-1/3 h-full bg-gray-100 flex items-center justify-center">
                            {QuantityLoader ? (
                              <TailSpin
                                height="20"
                                width="20"
                                color="#A18168"
                                ariaLabel="loading"
                              />
                            ) : (
                              <span
                                id="quantity"
                                className="border-solid border-1 border-[#A18168] font-medium text-[#A18168]"
                              >
                                {item.quantity}
                              </span>
                            )}
                          </div>
                          <button
                            class="w-1/3 h-full text-white rounded-r bg-green-700"
                            onClick={(e) => {
                              e.preventDefault();
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
                              );
                            }}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-row justify-between   mt-2 text-sm">
                  <div className="flex items-center mx-4">
                    <FiTag />
                    <div className="text-sm text-gray-600">Apply Coupons</div>
                  </div>
                  {appliedCoupon ? (
                    <div
                      className="text-[#FF8103] mx-4"
                      onClick={handleRemoveCoupon}
                    >
                      {appliedCoupon}{" "}
                      <RxCross2 className="w-3 h-3 inline-block ml-1" />
                    </div>
                  ) : (
                    <button
                      className={`text-gray-600 rounded-md border mx-4 my-2 border-black py-1 px-1 ${
                        !isLogin ? "cursor-not-allowed" : "cursor-pointer"
                      }`}
                      onClick={handleApplyButtonClick}
                    >
                      View All Coupons
                    </button>
                  )}
                </div>
                <dl className="space-y-6 border-t border-gray-200 px-4 py-6 sm:px-6">
                  <div className="flex items-center justify-between">
                    <dt className="text-sm">Total Amount</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      ₹
                      {jsonData?.data.effectiveOrderTotalWithOutGST?.amount?.toFixed(
                        2
                      )}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-sm">Tax</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      ₹{jsonData?.data?.totalGstAmount?.amount?.toFixed(2)}
                    </dd>
                  </div>
                  {jsonData &&
                    jsonData.data &&
                    jsonData.data.discounts &&
                    jsonData.data.discounts.length > 0 && (
                      <div>
                        <div className="md:mt-3 text-sm">Discounts</div>
                        {jsonData?.data?.discounts.map((discount, index) => (
                          <div
                            key={index}
                            className="flex flex-row justify-between mt-2 md:mt-3 text-xs"
                          >
                            <div className="text-[#C1660B]">
                              {discount.name}
                            </div>
                            <div className="text-[#C1660B]">
                              -₹{discount.amount}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  {jsonData &&
                    jsonData?.data &&
                    jsonData?.data?.charges &&
                    jsonData?.data.charges.length > 0 && (
                      <div>
                        <div className="md:mt-3 text-sm">Charges</div>

                        {jsonData.data.charges.map((charge, index) => (
                          <div
                            key={index}
                            className="flex flex-row justify-between mt-2 md:mt-3 text-sm"
                          >
                            <div className="text-[#C1660B]">{charge.name}</div>
                            <div className="text-[#C1660B]">
                              +₹{charge.amount}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  <div className="flex items-center justify-between">
                    <dt className="text-sm">Round Off</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      ₹{jsonData?.data?.roundOff?.toFixed(2)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between border-t border-gray-200 pt-6">
                    <dt className="text-base font-medium">Final Amount</dt>
                    <dd className="text-base font-medium text-gray-900">
                      ₹{jsonData?.data?.orderTotal?.amount}
                    </dd>
                  </div>
                </dl>

                <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                  <button
                    onClick={handleCheckout}
                    className="w-full rounded-md border border-transparent bg-green-700 px-4 py-3 text-base font-medium text-white shadow-sm  focus:outline-none focus:ring-2  focus:ring-offset-2 focus:ring-offset-gray-50"
                  >
                    {isLogin
                      ? isDeliveriable
                        ? "Confirm order"
                        : "Delivery not available"
                      : "Login to confirm order"}{" "}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {couponModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
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
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
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
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#5FAC00] text-base font-medium text-white  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
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
