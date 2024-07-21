"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import axiosInstance from "@/services/axiosConfig";
import { BsCart2 } from "react-icons/bs";
import { useAuth } from "@/context/Auth";
import { Base_url } from "@/constants/Links.js";
import { useStateContext } from "@/context/StateContext";
import { HiOutlineUserCircle } from "react-icons/hi2";
import { MdOutlineInstallDesktop } from "react-icons/md";
import { BiLogInCircle } from "react-icons/bi";
import { IoSearchOutline } from "react-icons/io5";
import { IoMdHeartEmpty } from "react-icons/io";
import { IoIosArrowRoundBack } from "react-icons/io";
import { usePathname } from "next/navigation";
import { storage } from "./Storage";
import { disableConsoleInProduction } from "@/utils/helpers";

function Nav() {
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const [logoImageUrl, setLogoImageUrl] = useState();
  const { isLogin, onSetupComplete } = useAuth();
  const [cartData, setCartData] = useState();
  const { cartCount, showNav, setShowItem, setTotalCartPrice } =
    useStateContext();
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    disableConsoleInProduction();
    const localData = JSON.parse(localStorage.getItem("cartData"));
    setCartData(localData);
  }, []);

  const handleCart = () => {
    router.push("/cart");
    setShowItem(false);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      console.log("router.query", params.get("vendorId"));
      if (params.get("vendorId") && params.get("vendorMachineId")) {
        // This code will run only on the client side
        localStorage.setItem(
          "vendorData",
          JSON.stringify({
            vendorId: params.get("vendorId"),
            vendorMachineId: params.get("vendorMachineId"),
          })
        );
        if (!isLogin && !localStorage?.getItem("userToken")) {
          router.push("/auth/login");
        }
      }
    }
  }, []);
  useEffect(() => {
    const sendPostRequest = async () => {
      if (cartData && !isLogin) {
        try {
          const response = await axiosInstance.post(
            "orders/ghost-cart",
            cartData
          );
          const price = response?.data?.data?.orderTotal?.amount;

          setTotalCartPrice(price);
        } catch (error) {
          console.log("Error", error);
        }
      } else if (cartData && isLogin) {
        const customerWorkspace = localStorage.getItem("customerWorkspace");
        const buyer_id = localStorage.getItem("BuyerId");
        const updatedData = {
          ...cartData,
          buyerWorkspace: customerWorkspace,
          buyerId: buyer_id,
        };
        try {
          const response = await axiosInstance.post("orders/cart", updatedData);
          console.log("Response", response.data);
          // setDataToRender(response.data);
          const price = response?.data?.data?.orderTotal?.amount ?? 0;
          setTotalCartPrice(price);
        } catch (error) {
          console.log("Error", error);
        }
      }
    };

    sendPostRequest();
  }, [cartData]);

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const domain = window?.location?.hostname;
        const subdomain = domain.split(".")[0];
        console.log("subdomain", subdomain);
        const response = await axiosInstance.post(
          "/users/workspace/subdomain",
          {
            mulltiplyURL: subdomain,
          }
        );
        console.log("response for title", response);
        localStorage.setItem("uri", response?.data?.data?.uri?.uri);
        localStorage.setItem("COD", response.data.data.cod);
        localStorage.setItem(
          "PartialPayment",
          response.data.data.partialPaymentPercentageOnCod
        );
        localStorage.setItem(
          "SellerDetails",
          JSON.stringify(response.data.data)
        );
        localStorage.setItem("SellerWorkspace", response.data.data._id);
        localStorage.setItem("SellerWorkspace", response.data.data._id);
        localStorage.setItem("SellerId", response.data.data.customerId);
        setLogoImageUrl(response?.data?.data?.sellingProfile.logo);
        console.log(response?.data?.data?.businessPhotos[0]);
        onSetupComplete(true);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData().then(() => {
      if (typeof window !== "undefined" && window.localStorage) {
        const storedCartData = localStorage.getItem("cartData");
        const sellerWorkspace = localStorage.getItem("SellerWorkspace");
        const sellerId = localStorage.getItem("SellerId");
        const uri = localStorage.getItem("uri");

        // If cartData doesn't exist or items array doesn't exist, initialize cartData
        if (!storedCartData) {
          const cartData = {
            items: [],
            buyerEmail: "",
            buyerGST: "",
            sellerWorkspace: sellerWorkspace,
            sellerId: sellerId,
            uri: uri,
            promoCodes: [],
          };
          localStorage.setItem("cartData", JSON.stringify(cartData));
        } else if (uri !== null) {
          const storedCartData = JSON.parse(localStorage.getItem("cartData"));
          storedCartData.uri = uri;
          localStorage.setItem("cartData", JSON.stringify(storedCartData));
        } else if (sellerWorkspace === null || sellerId === null) {
          const storedCartData = JSON.parse(localStorage.getItem("cartData"));
          const sellerWorkspace = localStorage.getItem("SellerWorkspace");
          const sellerId = localStorage.getItem("SellerId");
          storedCartData.sellerWorkspace = sellerWorkspace;
          storedCartData.sellerId = sellerId;
          localStorage.setItem("cartData", JSON.stringify(storedCartData));
        }
      }
    });
  }, []);

  let delayedSearch = null;

  const handleSearch = (query) => {
    setSearchQuery(query);
    clearTimeout(delayedSearch);
    delayedSearch = setTimeout(() => {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }, 2000);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault(); // Prevent form submission
      handleSearch(searchQuery); // Call handleSearch with the current searchQuery
    }
  };
  const handleSearchIconClick = () => {
    if (pathname === "/search") {
      router.push("/");
    } else {
      router.push("/search");
    }
  };

  const handleProfile = () => {
    setIsOpen(!isOpen);
    // if (!isLogin) {
    //   router.push("/auth/login");
    // } else {
    //   router.push("/userProfile");
    // }
  };
  const handleWislist = () => {
    if (!isLogin) {
      router.push("/auth/login");
    } else {
      router.push("/wishlist");
    }
  };

  const [prompt, setPrompt] = useState(null);
  const [logo, setLogo] = useState(null);

  const checkPwaModalShown = () => {
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  };

  useEffect(() => {
    checkPwaModalShown();
  }, []);

  const handleBeforeInstallPrompt = (event) => {
    event.preventDefault();
    setPrompt(event);
  };

  useEffect(() => {
    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const isIOS = () => {
    return /iPhone|iPad|iPod/i.test(navigator.userAgent) && !window.MSStream;
  };

  const handleInstallClick = () => {
    console.log("handleInstallClick", prompt);
    setIsOpen(false);
    if (isIOS()) {
      setShowInstallPrompt(true);
    } else {
      // Handle other install logic here
      if (prompt) {
        prompt.prompt();
      }
    }
  };

  const menuDropDown = () => {
    return (
      <div className="relative">
        <div
          className="text-black text-2xl cursor-pointer flex flex-row justify-center items-center"
          onClick={handleProfile}
        >
          <HiOutlineUserCircle size={34} />
        </div>
        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
            <button
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              onClick={() => {
                setIsOpen(false);
                if (!isLogin) {
                  router.push("/auth/login");
                } else {
                  router.push("/userProfile");
                }
              }}
            >
              {isLogin ? (
                <HiOutlineUserCircle className="mr-2" />
              ) : (
                <BiLogInCircle className="mr-2" />
              )}{" "}
              {isLogin ? "Profile" : "Login"}
            </button>
            <button
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              onClick={handleInstallClick}
            >
              <MdOutlineInstallDesktop className="mr-2" /> Install App
            </button>
          </div>
        )}
        {showInstallPrompt && (
          <div className="fixed bottom-0 left-0 right-0 bg-blue-500 text-white p-4 flex flex-col items-center z-50">
            <p>
              To install this app, tap <span className="font-bold">Share</span>{" "}
              and then <span className="font-bold">Add to Home Screen</span>.
            </p>
            <button
              className="mt-2 bg-white text-blue-500 px-4 py-2 rounded"
              onClick={() => setShowInstallPrompt(false)}
            >
              Dismiss
            </button>
          </div>
        )}
      </div>
    );
  };
  return showNav ? (
    <div className="h-28 w-full md:border md:border-b md:border-solid md:border-gray-200 px-2 py-3 bg-white  md:z-20">
      <div className="w-full h-1/2 flex justify-between items-center">
        {logoImageUrl ? (
          <Link href="/">
            <div
              className="w-[40%] rounded-md h-full pt-5 
               md:w-[30%]  "
            >
              <img
                className="max-h-[300px] object-contain rounded-md py-4"
                src={`${Base_url}${logoImageUrl}`}
              />
            </div>
          </Link>
        ) : (
          <div className="w-full rounded-md h-full bg-white md:w-1/12 animate-pulse">
            <div className="bg-slate-200 h-full w-2/5 rounded-md animate-pulse"></div>
          </div>
        )}
        <div className="hidden md:block relative w-2/4 ">
          <input
            type="text"
            placeholder="Search for your favorite grocery item"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            required
            className="search_input text-sm w-full rounded-md pl-10 pr-6 pb-1 h-12 bg-gray-100 border border-gray-300 shadow-md"
          />
          <button
            onClick={handleSearchIconClick}
            className="absolute top-0 left-0 mt-3 ml-3 w-5 h-5 text-gray-500"
          >
            {pathname === "/search" ? (
              <IoIosArrowRoundBack size={22} />
            ) : (
              <IoSearchOutline size={22} />
            )}
          </button>
        </div>
        <div
          className="text-black text-2xl cursor-pointer flex flex-row justify-center items-center mr-2"
          onClick={() => handleWislist()}
        >
          <IoMdHeartEmpty size={34} />
        </div>
        {/* <div
          className="text-black text-2xl cursor-pointer flex flex-row justify-center items-center"
          onClick={() => handleProfile()}
        >
          <HiOutlineUserCircle size={34} />
        </div> */}
        {menuDropDown()}
        <div className="hidden md:block w-36 h-16 p-1">
          <div
            className="p-2 bg-green-700 w-full h-full rounded-xl flex flex-row justify-between"
            onClick={() => handleCart()}
          >
            <div className="flex flex-row w-full">
              <div className="bg-green-500 rounded-md p-3 h-full">
                <BsCart2 className="text-white" />
              </div>
              <div className="flex flex-col mx-2  text-sm font-medium text-white justify-center">
                <div className="flex flex-row">
                  <p>{cartCount} item</p>
                </div>
                {/* <div className="flex">
                  <p>₹{totalCartPrice}</p>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="md:hidden relative w-full mt-5">
        <input
          type="text"
          placeholder="Search for your favorite grocery item"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          required
          className="search_input text-sm w-full rounded-md pl-10 pr-6 pb-1 h-12 bg-gray-100 border border-gray-300 shadow-md"
        />
        <button
          onClick={handleSearchIconClick}
          className="absolute top-0 left-0 mt-3 ml-3 w-5 h-5 text-gray-500"
        >
          {pathname === "/search" ? (
            <IoIosArrowRoundBack size={22} />
          ) : (
            <IoSearchOutline size={22} />
          )}
        </button>
      </div>
    </div>
  ) : null;
}

export default Nav;
