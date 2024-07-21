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

const AddressComponent = () => {
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
          const vendorData = await JSON.parse(
            localStorage.getItem("vendorData") ?? "{}"
          );
          if (vendorData && vendorData?.vendorMachineId) {
            (orderDetails.attributeSet.createdByEmployee =
              vendorData?.vendorMachineId),
              (orderDetails.attributeSet.autoAccept = true);
          }
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
          CheckDeliveryValid(
            response?.data?.results[0]?.geometry?.location?.lng,
            response?.data?.results[0]?.geometry?.location?.lat
          );
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
      {cartCount > 0 && showCheckout && isLogin && !selectTheAddress && (
        <div className="shadow-xl rounded-md  flex flex-col items-center w-full h-40  px-2  ">
          <div className="w-fulltext-center pt-1 flex items-center justify-center sm:w-96  ">
            {mainAddress ? (
              isDeliveriable ? null : (
                <div className="text-xs font-semibold w-48 text-center text-red-700 flex flex-row py-1 px-3 rounded-t-md rounded-b-none bg-white">
                  <div className="h-4 w-4 mx-2">
                    {" "}
                    <img src="../err.png" />
                  </div>
                  <div>unserviceable location</div>
                </div>
              )
            ) : null}
          </div>
          <div className="w-full flex flex-row h-1/2 px-1 pt-1 pb-2 rounded-md items-center justify-center border-solid border-b border-1 border-gray-300 sm:w-96 ">
            {mainAddress ? (
              <>
                <div className="w-2/12 h-full flex items-center justify-center">
                  <img className="scale-125" src="../location.svg" />
                </div>
                <div className="h-full w-8/12 flex flex-col pl-1 justify-center overflow-hidden">
                  <div>
                    <p className="text-black text-sm font-semibold">
                      Delivering to{" "}
                      <span className="font-bold">{buyerProfile.name}</span>
                    </p>
                  </div>
                  <p className="text-black text-sm overflow-hidden line-clamp-2">
                    {mainAddress.line1} , {mainAddress.line2} ,{" "}
                    {mainAddress.zipCode}, {mainAddress.city} ,{" "}
                    {mainAddress.state}
                  </p>
                </div>
                <div className="w-2/12 flex h-full text-right justify-end">
                  <button
                    className="text-blue-700 pr-2 text-xs my-2"
                    onClick={() => removeTheAddressSelection()}
                  >
                    Change
                  </button>
                </div>
              </>
            ) : (
              <div
                className="w-full h-3/4 bg-green-700 rounded-md flex items-center justify-center text-white font-md text-lg"
                onClick={ModalHandler}
              >
                Add Address
              </div>
            )}
          </div>
        </div>
      )}
      {cartCount > 0 && showCheckout && isLogin && selectTheAddress && (
        <div className="h-full w-full flex flex-col bottom-0 fixed animate-slideIn ">
          <div className="h-1/4 w-full bg-white opacity-90 flex justify-center items-center p-10">
            <div className="h-10" onClick={() => removeTheAddressSelection()}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-full w-full object-cover"
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
                    d="M16 8L8 16M8.00001 8L16 16M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                    stroke="#000000"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  ></path>{" "}
                </g>
              </svg>
            </div>
          </div>
          <div className="h-3/4 bg-slate-200 w-full flex flex-col border-t rounded-lg px-2 overflow-y-auto">
            <p className="font-medium text-lg mt-3 mb-2">
              Select delivery address
            </p>
            <button
              className="bg-white p-3 rounded-md mt-4 mb-3 text-green-600 font-semibold text-md"
              onClick={ModalHandler}
            >
              {" "}
              Add a new address
            </button>
            <div className="bg-slate-200 text-black h-full w-full">
              <p className="mx-2 my-1">Your saved address</p>
              <div class="flex flex-col gap-2  overflow-y-scroll">
                {allAddresses &&
                  allAddresses.map((address, index) => (
                    <div
                      className="bg-white rounded-md flex flex-row items-center justify-center"
                      onClick={() => handleAddressSelection(index)}
                    >
                      <div className=" h-9 w-9 bg-green-600 flex items-center justify-center rounded-md my-2 mx-2">
                        <img
                          className="w-full h-full object-cover"
                          src="https://cdn.grofers.com/assets/ui/saved_address_type_home.png"
                        />
                      </div>
                      <div
                        key={index}
                        className="w-9/12 rounded-md my-2 mx-2 overflow-hidden line-clamp-2"
                      >
                        {address.line1}, {address.line2}, {address.zipCode},{" "}
                        {address.city}, {address.state}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {showModal && <AddressModal closeModal={ModalHandler} />}
    </>
  );
};

export default AddressComponent;
