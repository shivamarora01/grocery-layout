"use client";
import React, { useState, useEffect, useRef } from "react";
import Resgisteration from "@/components/Resgisteration"; // Assuming this is the correct import
import axiosInstance from "@/services/axiosConfig";
import { Base_url } from "@/constants/Links";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/Auth";
import { useStateContext } from "@/context/StateContext";

const Page = () => {
  const router = useRouter();
  const [userData, setUserData] = useState({ phone: "", countryCode: "91" });
  const [showOtp, setShowOtp] = useState(false);
  const { login } = useAuth();
  const [userOtp, setUserOtp] = useState("");
  const [newuser, setNewUser] = useState(undefined);
  const [logoImageUrl, setLogoImageUrl] = useState();
  const [loading, setLoading] = useState(false);
  const otpInputRef = useRef(null);
  const [otpSent, setOtpSent] = useState(false); // State to track if OTP is sent
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

  useEffect(() => {
    setShowNav(false);
    setShowCart(false);
    setShowCheckout(false);
  }, []);

  const handleBack = () => {
    router.push("/");
  };

  const handleEnterToProfile = () => {
    router.push("/myProfileDetails");
  };

  const notify = (message) => toast(message, { icon: "👏" });

  useEffect(() => {
    if (otpSent) {
      otpInputRef.current.focus(); // Set focus to OTP input field when OTP is sent
      otpInputRef.current.click(); // Simulate click event on OTP input field
    }
  }, [otpSent]);

  const handleChange = (e) => {
    let { value, name } = e.target;

    value = value.replace(/\D/g, "");

    value = value.slice(0, 10);

    setUserData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setOtpSent(true);
    setShowOtp(true);
    const res = await axiosInstance.post("/auth/otp-login", userData);
    if (res?.data.statusCode === 200) {
      // notify("OTP sent successfully");
    } else {
      toast.error("Verification failed");
    }
  };

  const getSellerDetails = async () => {
    const seller_id = localStorage.getItem("SellerWorkspace");
    const res = await axiosInstance.get(
      `/customers/buyer?sellerWorkspace=${seller_id}`
    );
    if (res.data.data.length === 0) {
      setNewUser(0); // Set new user if no data is returned
    } else {
      localStorage.setItem(
        "customerWorkspace",
        res.data.data[0].customerWorkspace
      );
      localStorage.setItem("customer_id", res.data.data[0]._id);
      localStorage.setItem("BuyerId", res.data.data[0].customerId);

      setNewUser(1); // Set as existing user
    }
  };
  useEffect(() => {
    const fetchdata = async () => {
      const domain = window?.location?.hostname;
      const subdomain = domain.split(".")[0];
      const response = await axiosInstance.post("/users/workspace/subdomain", {
        mulltiplyURL: subdomain,
      });
      localStorage.setItem("SellerDetails", JSON.stringify(response.data.data));
      localStorage.setItem("SellerId", response.data.data.customerId);
      setLogoImageUrl(response?.data?.data?.businessPhotos[0]);
    };

    fetchdata();
  }, []);
  const handleVerifyToken = async () => {
    setLoading(true);
    const userVerificationData = { ...userData, otp: userOtp };
    try {
      const response = await axiosInstance.post(
        "/auth/otp-login-verify",
        userVerificationData
      );
      if (response.data.data.token) {
        localStorage.setItem("userToken", response.data.data.token);
        localStorage.setItem("userId", response.data.data.user._id);
        localStorage.setItem(
          "userDetails",
          JSON.stringify(response.data.data.user)
        );
        await getSellerDetails();
        if (newuser !== 0) {
          login(); // Update login state if not a new user
        }
        notify("Welcome to Grocery Store");
      } else {
        throw new Error("Verification failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("Verification failed");
    } finally {
      setLoading(false);
    }
  };
  if (newuser === 0) {
    return <Resgisteration />;
  } else if (newuser === 1) {
    router.push("/");
  }

  return (
    <div className="w-full flex flex-col h-screen">
      <div className="h-2/5 w-full relative">
        <img
          className="object-cover w-full h-full"
          src="../scroll2.png"
          alt="Your Image"
        />
        <div
          className="absolute top-4 left-4 bg-white p-3 rounded-3xl"
          onClick={() => handleBack()}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 32 32"
            className="h-6 w-6 text-black"
          >
            <path
              d="M32 15H3.41l8.29-8.29-1.41-1.42-10 10a1 1 0 0 0 0 1.41l10 10 1.41-1.41L3.41 17H32z"
              data-name="4-Arrow Left"
            />
          </svg>
        </div>
      </div>
      <div className="h-3/5 w-full rounded-t-md">
        <div className="h-1/4 w-full flex justify-center items-center ">
          <div className="h-full rounded-lg p-1">
            <img
              className="h-full w-full object-contain rounded-md"
              src={`${Base_url}${logoImageUrl}`}
            />
          </div>
        </div>
        <div className="h-1/4 w-full flex flex-col justify-center items-center py-2">
          <p className=" text-lg font-bold p-1">Your Favourite Local Store</p>
          <p className=" font-semibold text-md p-1">Log in or Sign up</p>
        </div>
        <div className="h-2/4 w-full flex flex-col">
          <form action="#" method="POST" className="" onSubmit={handleSubmit}>
            <div className="px-3">
              <div>
                {
                  <div className="h-1/3 h-full w-full py-2 px-10 flex space-x-2">
                    <span className="inline-flex items-center rounded-l-md border px-3 py-2  bg-[#F0F0F0] text-black text-sm">
                      +91
                    </span>
                    <input
                      className="w-full rounded-r-md border bg-[#F0F0F0] px-3 py-2 text-sm placeholder-black focus:outline-none focus:ring-1 focus:ring-gray-400 focus:ring-offset-1"
                      type="tel"
                      placeholder="Phone Number"
                      name="phone"
                      value={userData.phone}
                      onChange={handleChange}
                    />
                  </div>
                }
              </div>
              {!showOtp && (
                <div className="h-1/3 w-full  py-2 px-10">
                  <button
                    type="submit"
                    className="h-full text-white bg-green-700 rounded-md py-3 px-3 leading-tight focus:outline-none focus:shadow-outline w-full"
                  >
                    Continue
                  </button>
                </div>
              )}
            </div>
            <Toaster />
          </form>
          {showOtp && (
            <div className="flex flex-col px-3">
              <div className="h-full w-full flex items-center justify-center py-1 px-10">
                <input
                  ref={otpInputRef}
                  className="w-full rounded-md border bg-[#F0F0F0] px-3 py-2 text-sm placeholder-black focus:outline-none focus:ring-1 focus:ring-gray-400 focus:ring-offset-1"
                  type="text"
                  placeholder="OTP"
                  name="otp"
                  value={userOtp}
                  onChange={(e) => setUserOtp(e.target.value)}
                />
              </div>
              <div className="w-full pt-2 pb-10 px-10">
                <button
                  className="h-full text-white bg-green-700 rounded-md py-4 px-3 leading-tight focus:outline-none focus:shadow-outline w-full"
                  onClick={handleVerifyToken}
                  disabled={loading}
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;
