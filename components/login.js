import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/services/axiosConfig";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "@/context/Auth";
import Resgisteration from "@/components/Resgisteration";

export default function Login() {
  const router = useRouter();
  const [userData, setUserData] = useState({ phone: "", countryCode: "91" });
  const [userOtp, setUserOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [isNewUser, setIsNewUser] = useState();
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const notify = (message) => toast(message, { icon: "👏" });

  const handleChange = (e) => {
    const { value, name } = e.target;
    setUserData((prevState) => ({ ...prevState, [name]: value }));
  };

  const getSellerDetails = async () => {
    try {
      const response = await axiosInstance.post("/users/workspace/subdomain", {
        mulltiplyURL: "stomize",
      });
      localStorage.setItem("SellerDetails", JSON.stringify(response.data.data));
      localStorage.setItem("SellerWorkspace", response.data.data._id);
      const seller_id = localStorage.getItem("SellerWorkspace");
      const res = await axiosInstance.get(
        `/customers/buyer?sellerWorkspace=${seller_id}`
      );

      localStorage.setItem(
        "customerWorkspace",
        res?.data.data[0].customerWorkspace
      );
    } catch (error) {
      console.error("Failed to fetch seller details:", error);
      toast.error("Failed to fetch seller details");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await axiosInstance.post("/auth/otp-login", userData);
    if (res?.data.statusCode === 200) {
      setShowOtp(true);
      toast.success("OTP sent successfully");
    } else {
      toast.error("Verification failed");
    }
  };
  const handleVerifyToken = async () => {
    setLoading(true);

    const userVerificationData = { ...userData, otp: userOtp };
    try {
      const response = await axiosInstance.post(
        "/auth/otp-login-verify",
        userVerificationData
      );
      console.log(response);
      localStorage.setItem("userToken", response.data.data.token);
      localStorage.setItem("userId", response.data.data.user._id);
      localStorage.setItem(
        "userDetails",
        JSON.stringify(response.data.data.user)
      );
      await getSellerDetails();
      login(); // Update login state

      notify("Login successful");
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
      toast.error("Verification failed");
    }
  };
  return (
    <div className="mb-10 pb-4">
      <div className="mb-10 mt-10">Contact information</div>
      <div className="tracking-wide">SIGN IN / REGISTER ACCOUNT</div>
      <div>
        <p className="text-sm mt-1">
          We will verify your mobile number through OTP
        </p>
      </div>
      <form className="mt-6" onSubmit={handleSubmit}>
        {!showOtp ? (
          <>
            <input
              type="text"
              id="mobilenum"
              name="phone"
              placeholder="Mobile Number"
              className="mt-2 w-full lg:w-1/2 rounded-md border bg-[#F0F0F0] px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
              value={userData.phone}
              onChange={handleChange}
            />
            <br />
            <br />
            <button type="submit" className="text-[#A18168] mt-4">
              Send OTP
            </button>
          </>
        ) : (
          <>
            <label htmlFor="otp">OTP:</label>
            <br />
            <input
              type="text"
              id="otp"
              name="otp"
              placeholder="******"
              className="mt-2 w-full lg:w-1/2 rounded-md border bg-[#F0F0F0] px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
              value={userOtp}
              onChange={(e) => setUserOtp(e.target.value)}
            />
            <br />
            <br />
            <button
              onClick={handleVerifyToken}
              disabled={loading}
              className="text-[#A18168] mt-4"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </>
        )}
      </form>
      <Toaster />
    </div>
  );
}
