"use client";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useStateContext } from "@/context/StateContext";
import axiosInstance from "@/services/axiosConfig";
import axios from "axios";
import { useAuth } from "@/context/Auth";
import Link from "next/link";
import { Base_url } from "@/constants/Links";
import AddressModal from "./AddressModal";

const Checkout = () => {
  const [cartData, setCartData] = useState();
  const { isLogin, logout } = useAuth();
  const [loaderImg, setLoaderImg] = useState(false);

  const [jsonData, setJsonData] = useState(null);
  const [buyerProfile, setBuyerProfile] = useState({});
  const [mainAddress, setMainAddress] = useState();
  const [selectTheAddress, setSelectTheAddress] = useState(false);
  const [allAddresses, setAllAddresses] = useState();
  const [selectedOption, setSelectedOption] = useState(null);
  const [showCodInfo, setShowCodInfo] = useState(false);
  const [latitude, setLatitude] = useState();
  const [longitude, setLongitude] = useState();
  const [orderPlaceLoading, setOrderPlaceLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const [isDeliveriable, setIsDeliveriable] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState();
  const [paymentMode, setPaymentMode] = useState();
  const [showModal, setShowModal] = useState(false);
  const {
    cartCount,
    increaseCartCount,
    decreaseCartCount,
    showNav,
    NotToCallCart,
    setNotToCallCart,
    setShowNav,
    showCart,
    setShowCart,
    showCheckout,
    setShowCheckout,
    totalCartPrice,
    setTotalCartPrice,
  } = useStateContext();
  const router = useRouter();
  const [userDetails, setUserDetails] = useState();
  const [sellerDetails, setSellerDetails] = useState();
  const [customerId, setCustomerId] = useState();
  const [customerWorkspace, setCustomerWorkspace] = useState();

  useEffect(() => {
    if (!NotToCallCart) {
      const localData = JSON.parse(localStorage.getItem("cartData"));
      setCartData(localData);
      setUserDetails(localStorage.getItem("userDetails"));
      setSellerDetails(JSON.parse(localStorage.getItem("SellerDetails")));
      setCustomerId(localStorage.getItem("customer_id"));
      setCustomerWorkspace(localStorage.getItem("customerWorkspace"));
    }
  }, [selectedOption, totalCartPrice]);

  const shippingAddress = buyerProfile?.shippingAddress?.filter(
    (address) => address._id === selectedAddressId
  );

  const handleLogin = () => {
    router.push("/auth/login");
  };
  useEffect(() => {
    if (isLogin) {
      fetchData();
    }
  }, [isLogin, showModal]);

  useEffect(() => {
    const sendPostRequest = async () => {
      if (cartData && !isLogin && !NotToCallCart) {
        try {
          const response = await axiosInstance.post(
            "orders/ghost-cart",
            cartData
          );
          setJsonData(response?.data);
          const priceOfCart = response?.data?.data?.orderTotal?.amount;
          // setTotalCartPrice(priceOfCart);
        } catch (error) {
          console.log("Error", error);
        }
      } else if (cartData && isLogin && !NotToCallCart) {
        const customerWorkspace = localStorage.getItem("customerWorkspace");
        const buyer_id = localStorage.getItem("BuyerId");
        const updatedData = {
          ...cartData,
          buyerWorkspace: customerWorkspace,
          buyerId: buyer_id,
        };
        try {
          const response = await axiosInstance.post("orders/cart", updatedData);
          setJsonData(response?.data);
          console.log(
            "setting amount",
            response?.data?.data?.orderTotal?.amount
          );
          setTotalCartPrice(response?.data?.data?.orderTotal?.amount);
        } catch (error) {
          console.log("Error", error);
        }
      }
    };

    sendPostRequest();
  }, [cartData, selectedOption]);

  const fetchData = async () => {
    const seller_id = localStorage.getItem("SellerWorkspace");
    const res = await axiosInstance.get(
      `/customers/buyer?sellerWorkspace=${seller_id}`
    );
    console.log("res", res);
    setBuyerProfile(res?.data.data[0]);
    setMainAddress(res?.data?.data[0]?.shippingAddress[0]);
    setAllAddresses(res?.data?.data[0]?.shippingAddress);
    console.log("setalladresss", res?.data?.data[0]?.shippingAddress);
  };

  const handleAddressSelection = (index) => {
    setMainAddress(allAddresses[index]);
    setSelectedAddressId(allAddresses[index]._id);
    console.log(index);
    console.log(allAddresses[index]);
    setSelectTheAddress((prevState) => !prevState);
  };

  const removeTheAddressSelection = () => {
    setSelectTheAddress((prevState) => !prevState);
  };

  useEffect(() => {
    fetchPaymentOption();
  }, []);

  const fetchPaymentOption = async () => {
    const uri = localStorage.getItem("uri");
    const response = await axiosInstance.get(`/offers/active-offers/${uri}`);

    response?.data?.metaData?.paymentOptions?.length &&
      setPaymentMode(response?.data.metaData.paymentOptions[0]?.mode);
    console.log("payment");
    console.log(response?.data.metaData.paymentOptions[0]?.mode);
  };

  const handleCheckout = () => {
    if (selectedAddressId === null) {
      toast.error("Please select address");
    } else if (paymentMode === "RAZORPAY" && isLogin) {
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
      console.log("orderDetails", orderDetails);
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
      const sendrequest = async () => {
        if (orderDetails) {
          try {
            const response = await axiosInstance.post(`/orders`, orderDetails);
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
          if (
            sellerDetails &&
            (sellerDetails?.shipmentInfo === "Ship any where in India" ||
              sellerDetails?.shipmentInfo === "Local delivery within city only")
          ) {
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

  const handleRadioClick = (value) => {
    setSelectedOption(value);
    setShowCodInfo(value === "cod");
  };

  const ModalHandler = () => {
    setShowModal(!showModal);
  };

  return (
    <>
      {cartCount > 0 && showCheckout && !isLogin && (
        <div className=" rounded-md fixed bottom-0 flex flex-col justify-center items-center w-full h-20 px-2 py-3 ">
          <div
            className="bg-green-700 rounded-md w-full text-lg h-full font-md text-white text-center flex items-center cursor-pointer justify-center md:w-72"
            onClick={() => handleLogin()}
          >
            Login
          </div>
        </div>
      )}
      {cartCount > 0 && showCheckout && isLogin && !selectTheAddress && (
        <div className="shadow-xl rounded-md  flex flex-col items-center w-full h-40 px-2">
          <div className="w-full flex flex-row fixed bottom-0 rounded-sm items-center px-1 py-2 sm:w-72 ">
            <div className="w-2/5 flex flex-col">
              <div>
                <input
                  type="radio"
                  id="codRadio"
                  value="cod"
                  checked={selectedOption === "cod"}
                  onChange={() => handleRadioClick("cod")}
                  className="mr-2"
                />
                <label htmlFor="codRadio">COD</label>
              </div>
              <div>
                <input
                  type="radio"
                  id="payOnlineRadio"
                  value="payOnline"
                  checked={selectedOption === "payOnline"}
                  onChange={() => handleRadioClick("payOnline")}
                  className="mr-2"
                />
                <label htmlFor="payOnlineRadio">Pay Online</label>
              </div>
            </div>
            <button
              className={`${
                isDeliveriable ? "bg-green-700" : "bg-slate-400 disable"
              } w-3/5 h-full rounded-md px-2 p-2 flex flex-row justify-between items-center`}
              onClick={isDeliveriable ? () => handleCheckout() : null}
            >
              <div className="flex flex-col">
                <p className="text-white text-md font-semibold">
                  ₹ {totalCartPrice?.toFixed(2)}
                </p>
                <p className="text-white text-xs">TOTAL</p>
              </div>
              <div className="text-white flex justify-center items-center">
                <p className="text-white text-md font-semibold">Place Order</p>
              </div>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Checkout;
