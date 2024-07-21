"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/Auth";
import axiosInstance from "@/services/axiosConfig";
import toast, { Toaster } from "react-hot-toast";
import Profile from "@/components/Profile";
import ProfileSide from "@/components/ProfileSide";
import Address from "@/components/Address";
import Orders from "@/components/Orders";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const Page = () => {
  const router = useRouter();
  const { isLogin, logout } = useAuth();
  const [buyerProfile, setBuyerProfile] = useState({});
  const [activeComponent, setActiveComponent] = useState('profile');
  const [RegisterUser , SetRegisterUser] = useState();
  useEffect(() => {
    if (isLogin) {
      fetchData();
    }
  }, [isLogin]);

  const fetchData = async () => {
    const seller_id = localStorage.getItem("SellerWorkspace");
    const res = await axiosInstance.get(`/customers/buyer?sellerWorkspace=${seller_id}`);

    console.log("workspace res");
    console.log(res);
    SetRegisterUser(res?.data.data.length);
    setBuyerProfile(res?.data.data[0]);
  };
 

  const handleLogout = async () => {
    try {
      const response = await axiosInstance.post("/auth/logout", {});
      if (response.status === 200) {
        logout();
        localStorage.removeItem("userDetails");
        localStorage.removeItem("SellerDetails");
        localStorage.removeItem("userToken");
        localStorage.removeItem("userId");
        // localStorage.removeItem("SellerId");
        // localStorage.removeItem("SellerWorkspace")
        localStorage.removeItem("customerWorkspace")
        
        localStorage.removeItem("isFirstTimeLogin")
        localStorage.removeItem("NewUser");
        localStorage.removeItem("customer_id")
        localStorage.removeItem("isLogin")
        toast.success("Logout successful");
        router.push('/auth/login');
      } else {
        toast.error("Logout failed");
      }
    } catch (error) {
      toast.error("Logout error");
    }
  };
  useEffect(() => {
    if (RegisterUser === 0) {
      router.push('/auth/login');
    }
  }, [RegisterUser]);

  if (RegisterUser === 0 ) {
    logout();
    return;
  }
  return (
    <div className="my-10">
      <Toaster />
      <div className="flex justify-center w-full h-full">
        <p className="text-green-700 font-book-antiqua leading-10">MY ACCOUNT</p>
      </div>
      
      <div className="flex justify-center">
        <div className="border-[#9E9E9E]  flex-col lg:border-t w-full  lg:flex-row flex ">
          <ProfileSide setActiveComponent={setActiveComponent} Profile = {buyerProfile} />
          <div className="border-[#9E9E9E] w-full lg:border-l flex flex-col  mt-5 items-center lg:order-2 sm:w-[64rem] ">
            {activeComponent === 'profile' ? (
              <Profile email={buyerProfile.email} />
            ) : activeComponent === 'orders' ? (
              <Orders/>
            ) : (
              <Address addressList={buyerProfile.shippingAddress} billingAddress={buyerProfile.billingAddress} fetchAddresses={fetchData} />
            )}
            <button
              onClick={handleLogout}
              className="mt-4 w-20 rounded-md bg-green-700 py-2.5 text-sm font-semibold text-white hover:bg-[#917c6f]"
            >
              LOGOUT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;


