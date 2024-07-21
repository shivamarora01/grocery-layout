"use client";
import React, { useState, useEffect } from "react";
import axiosInstance from "@/services/axiosConfig";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { Base_url } from "@/constants/Links";

const Registeration = () => {
  const [logoImageUrl, setLogoImageUrl] = useState();
  const [formData, setFormData] = useState({
    name: "",
    ownerName: "",
    legalName: "",
    workspaceType: "INDIVIDUAL",
    email: "",
    gstNumber: "",
    shippingAddress: [],
    phone: "",
  });

  const [sellerType, setSellerType] = useState("b2c");
  const route = useRouter(); // For redirecting
  const notify = (message) => toast(message, { icon: "👏" });

  useEffect(() => {
    const storedSellerDetails = localStorage.getItem("SellerDetails");
    if (storedSellerDetails) {
      const sellerDetails = JSON.parse(storedSellerDetails);
      setSellerType(sellerDetails.sellerType || "b2c");
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const domain = window?.location?.hostname;
        const subdomain = domain.split(".")[0];
        const response = await axiosInstance.post(
          "/users/workspace/subdomain",
          {
            mulltiplyURL: subdomain,
          }
        );
        setLogoImageUrl(response?.data?.data?.businessPhotos[0]);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const workspaceData = {
      attributeSet: { ...formData, ownerName: formData.name },
    };

    try {
      const workspaceResponse = await axiosInstance.post(
        "/users/workspace",
        workspaceData
      );
      const sellerId = localStorage.getItem("SellerWorkspace");
      const finalData = {
        ...workspaceResponse?.data?.data.attributeSet,
        ...workspaceResponse?.data?.data.identifier,
        workspace: sellerId,
      };
      const vendorData = await JSON.parse(
        localStorage.getItem("vendorData") ?? "{}"
      );
      if (vendorData && vendorData?.vendorId) {
        finalData.salesPerson = [vendorData?.vendorId];
      }

      const customerResponse = await axiosInstance.post(
        "/customers/buyer",
        finalData
      );

      // Clear form data
      setFormData({
        name: "",
        ownerName: "",
        legalName: "",
        workspaceType: "INDIVIDUAL",
        email: "",
        gstNumber: "",
        shippingAddress: [],
        phone: "",
      });

      // Show success toast
      toast.success("Customer created successfully!");

      console.log("Customer created:", customerResponse.data);
      const seller_id = localStorage.getItem("SellerWorkspace");
      const res = await axiosInstance.get(
        `/customers/buyer?sellerWorkspace=${seller_id}`
      ); // Redirect to home page
      localStorage.setItem(
        "customerWorkspace",
        res.data.data[0].customerWorkspace
      );
      localStorage.setItem("customer_id", res.data.data[0]._id);
      localStorage.setItem("BuyerId", res.data.data[0].customerId);
      setTimeout(() => {
        route.push("/");
      }, 1000);
    } catch (error) {
      console.error("Error in process:", error);
      // Show error toast
      // toast.error("Error creating customer.");
    }
  };

  return (
    <div className="flex h-screen justify-center items-center font-book-antiqua">
      <div className="w-full lg:w-[70%] lg:max-w-[70%] flex flex-col lg:flex-row">
        <div className=" w-full lg:w-1/2 items-center justify-center p-4 hidden lg:flex">
          <img
            src="/loginpage.svg"
            alt="Registration Page Illustration"
            className="max-w-full h-auto"
          />
        </div>
        <div className="w-full lg:w-1/2 p-4">
          <div className="flex justify-center py-8 px-4 rounded-xl">
            <img
              src={`${Base_url}${logoImageUrl}`}
              alt="Logo"
              className="max-w-full object-cover h-auto rounded-xl"
            />
          </div>
          <div className="px-4 lg:px-10 pt-3">
            <h1 className="text-2xl leading-normal">Register</h1>
            <form onSubmit={handleSubmit} className="mt-5">
              <div className="space-y-5">
                {sellerType === "b2c" ? (
                  <>
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-base font-medium text-gray-900"
                      >
                        Name
                      </label>
                      <input
                        className="mt-2 w-full rounded-md border bg-[#F0F0F0] px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
                        type="text"
                        placeholder="Full Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                      />
                    </div>
                    {/* <div>
                      <label
                        htmlFor="email"
                        className="block text-base font-medium text-gray-900"
                      >
                        Email Address
                      </label>
                      <input
                        className="mt-2 w-full rounded-md border bg-[#F0F0F0] px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
                        type="email"
                        placeholder="Email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div> */}
                  </>
                ) : (
                  <>
                    <div>
                      <label
                        htmlFor="legalName"
                        className="block text-base font-medium text-gray-900"
                      >
                        Legal Name
                      </label>
                      <input
                        className="mt-2 w-full rounded-md border bg-[#F0F0F0] px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
                        type="text"
                        placeholder="Legal Name"
                        name="legalName"
                        value={formData.legalName}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="gstNumber"
                        className="block text-base font-medium text-gray-900"
                      >
                        GST Number
                      </label>
                      <input
                        className="mt-2 w-full rounded-md border bg-[#F0F0F0] px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
                        type="text"
                        placeholder="GST Number"
                        name="gstNumber"
                        value={formData.gstNumber}
                        onChange={handleChange}
                      />
                    </div>
                  </>
                )}
                <button
                  type="submit"
                  className="mt-4 w-full rounded-md bg-green-700 py-2.5 text-sm font-semibold text-white hover:bg-green-800"
                >
                  REGISTER
                </button>
              </div>
              <Toaster />
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Registeration;
