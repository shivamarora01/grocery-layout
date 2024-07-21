"use client"
import Link from "next/link";
import { useEffect } from "react";
import { useStateContext } from '@/context/StateContext';


const Page = () => {
  const { cartCount, setCartCount, increaseCartCount, decreaseCartCount, setShowNav, setShowCheckout, categoryIdForSorting, setCategoryIdForSorting, choosenSortMethod, setChoosenSortMethod, showSortingOptions, setShowSortingOptions, showItem, setShowItem, filterData, setFilterData, ItemId, setItemId, setShowCart, totalCartPrice, setTotalCartPrice } = useStateContext()

  useEffect(() => {
    setShowCart(false)
    setShowNav(true)
    setShowCheckout(false);
    const updatedCartData = JSON.parse(localStorage.getItem("cartData"))
    updatedCartData.items = [];
    localStorage.setItem("cartData", JSON.stringify(updatedCartData));
    setTotalCartPrice(0)
    setCartCount(0)
  })

  return (
    <div className="flex flex-col items-center justify-center h-screen ">
      <div className="w-full flex flex-col items-center justify-center  rounded-lg p-4 md:p-8 ">
        <div className="w-20 h-20 animate-customPing">
          <img src="./success.png" />
        </div>
        <h1 className="text-green-500 font-semibold text-2xl md:text-4xl mt-8 mb-2">Successfully orderded</h1>
        <p className="text-green-700 font-medium text-base md:text-lg text-center">We have received your purchase request, we'll be in touch shortly!</p>
      </div>
      <div className="flex flex-row gap-3 py-2 w-full justify-center items-center md:space-y-0 md:flex-row md:justify-between md:space-x-4">
        <Link href="/">
          <button className="border border-solid border-green-700 px-2 py-3 text-green-600 text-center rounded-lg font-book-antiqua text-xs md:text-sm font-bold leading-[18px] uppercase w-full md:w-auto" >Continue Shopping</button>
        </Link>
        <Link href="/Orders">
          <button className="border border-solid border-green-700 px-2 py-3 text-green-600 text-center rounded-lg font-book-antiqua text-xs md:text-sm font-bold leading-[18px] uppercase w-full md:w-auto" >Order History</button>
        </Link>
      </div>
    </div>
  );
};

export default Page;
