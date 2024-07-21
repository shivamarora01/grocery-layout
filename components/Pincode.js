"use client";
import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import axiosInstance from "@/services/axiosConfig";
import { useStateContext } from "@/context/StateContext";
import axios from "axios";
import { RiCloseCircleFill } from "react-icons/ri"; // Assuming you're using react-icons library
import { storage } from "./Storage";

export default function Pincode({ workspaceData }) {
  const [zipCode, setZipCode] = useState();
  const [LocalDelivery, setLocalDelivery] = useState();
  const [isDeliveriable, setIsDeliveriable] = useState(false);
  const [showtext, setShowText] = useState(false);
  const {
    cartCount,
    increaseCartCount,
    decreaseCartCount,
    showNav,
    setShowNav,
    showCart,
    setShowCart,
    showCheckout,
    setShowCheckout,
    totalCartPrice,
    setTotalCartPrice,
  } = useStateContext();

  const handleZipCodeChange = (event) => {
    setZipCode(event.target.value);
  };

  const handleRemoveZipChecker = () => {
    setLocalDelivery(false);
    handleCloseModal();
    if (showCheckout === true) {
      setShowCart(false);
    } else {
      setShowCart(true);
    }
  };

  const checkPwaModalShown = () => {
    const pwaModalShown = storage.isLocationModalShown();
    return pwaModalShown;
  };

  const handleCloseModal = () => {
    storage.setLocationModalShown(); // Set the flag in session storage
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    fetchCoordinates();
  };

  useEffect(() => {
    setShowCart(false);
    const sellerDetails = workspaceData;
    if (
      sellerDetails &&
      sellerDetails?.shipmentInfo === "Local delivery within Kms"
    ) {
      setLocalDelivery(true);
    }
  }, [zipCode]);
  const fetchCoordinates = async () => {
    if (zipCode) {
      try {
        const postCode = zipCode;
        const response = await axios.get(
          `https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyCxcFWfgcOPdJ4OjL7fE4c46Oel3nPxRRQ&components=postal_code:${postCode}`
        );
        CheckDeliveryValid(
          response?.data?.results[0]?.geometry?.location?.lng,
          response?.data?.results[0]?.geometry?.location?.lat
        );
      } catch (error) {
        console.log("error", error);
      }
    }
  };
  const CheckDeliveryValid = async (coordinate1, coordinate2) => {
    const sellerWorkspace = workspaceData?._id;
    if (coordinate1 && coordinate2) {
      const dataToSend = {
        coordinates: [coordinate1, coordinate2],
        seller: sellerWorkspace,
      };
      const response = await axiosInstance.post(
        "/users/check-deliveriable",
        dataToSend
      );
      console.log(response);
      if (response?.data.data.isDeliveriable) {
        handleCloseModal();
        toast.success("Delivery Available");
        setLocalDelivery(false);
        setShowCart(true);
      } else {
        setShowText(true);
        toast.error("Delivery Not Available");
      }
    }
  };

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />

      {LocalDelivery && !checkPwaModalShown() && (
        <div className="fixed inset-0 z-40 flex items-center justify-center animate-slideIn bg-black bg-opacity-70">
          <div className="bg-white rounded-lg w-11/12 max-w-md shadow-xl p-5 relative">
            <div
              className="absolute  top-2 right-1  pl-10 cursor-pointer"
              onClick={handleRemoveZipChecker}
            >
              <RiCloseCircleFill size={24} color="#FF0000" />
            </div>
            <div className="text-2xl font-semibold mb-3 text-center">
              Product Delivery Availability
            </div>
            {!showtext && (
              <div className="text-center mb-5">
                Want to know if we deliver to your area? Just enter your Pincode
                below and find out!
              </div>)
            }
            {showtext && (
              <>              <div className="text-center mb-5">
                We're Sorry!😊

              </div>
                <div className="text-center mb-5">
                  We currently do not deliver to your entered location. However, you can explore our products, and we will be available in your area soon. Stay tuned!

                </div>
              </>
            )
            }
            <form
              onSubmit={handleSubmit}
              className="flex flex-col items-center"
            >
              <input
                type="text"
                className="border text-center py-2 px-4 rounded-md mb-3 w-full"
                value={zipCode}
                onChange={handleZipCodeChange}
                placeholder="Enter Pin Code"
              />
              <button
                className="bg-[#15803D] text-white rounded-md w-full py-2"
                type="submit"
              >
                Check
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
