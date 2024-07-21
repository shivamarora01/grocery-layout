"use client"
import React, { useEffect } from 'react'
import { useAuth } from './Auth';
import axiosInstance from '@/services/axiosConfig';
import { useState, createContext, useContext } from 'react'
import { useRouter } from "next/navigation";
const StateContext = createContext();


//wrapper export
export const StateProvider = ({children}) => {

  const [cartData,setCartData] = useState()
  const [cartCount,setCartCount] = useState(0);
  const { isLogin, logout } = useAuth();
  const [wishlistData, setWishlistData] = useState();
  const [clickedHearts, setClickedHearts] = useState({});
  const router = useRouter();
    // Handling cartData
    useEffect(()=>{
      const cartDataString = typeof window !== 'undefined' ? localStorage.getItem("cartData") : null;
      const cartData1 = cartDataString ? JSON.parse(cartDataString) : { items: [] };
      setCartData(cartData1)
      setCartCount(cartData1?.items?.length ?? 0)
    },[])

    useEffect(()=>{
      const fetchDataForWishlist = async () => {
        try {
          const uri = localStorage.getItem("uri");
          if(uri){
            const response = await axiosInstance.get(`/offers/wish-list?uri=${uri}`);
            console.log("wishlist get data", response?.data?.data);
            setWishlistData(response?.data?.data);
          }
        } catch (error) {
          console.log("error while fetching wishlist Data", error)
        }
      };
      fetchDataForWishlist();
    },[])

    useEffect(() => {
      // Initialize clickedHearts state with IDs of items in the wishlist
      if (wishlistData) {
        const initialClickedHearts = wishlistData.reduce((acc, item) => {
          const itemId = item.attributeSet?.item?._id; // Get the nested item ID
          if (itemId) {
            acc[itemId] = true;
          }
          return acc;
        }, {});
        setClickedHearts(initialClickedHearts);
      }
    }, [wishlistData]);

    const updateWishlist = async (ItemId, action) => {
      const uri = localStorage.getItem("uri");
      const dataToSend = {
        uri: uri,
        item: ItemId,
      };
      try {
        let response;
        if (action === "add") {
          response = await axiosInstance.post("/offers/wish-list", dataToSend);
        } else if (action === "remove") {
          response = await axiosInstance.post(
            "/offers/wish-list/remove-item",
            dataToSend
          );
        }
        console.log("wishlist data", response?.data);
      } catch (error) {
        console.log("error", error);
      }
    };
  
    const handleHeartClick = async (itemId) => {
      console.log("itemId", itemId);
      setClickedHearts((prevState) => ({
        ...prevState,
        [itemId]: !prevState[itemId],
      }));
  
      if (isLogin) {
        const action = clickedHearts[itemId] ? "remove" : "add";
        console.log("action", action);
        await updateWishlist(itemId, action);
      } else {
        console.log("Login", isLogin);
        router.push("/auth/login");
      }
    };

// Handling cartLength
  const [showNav,setShowNav]= useState(true)
  const [showCart,setShowCart] = useState(true)
  const [showCheckout,setShowCheckout] = useState(false)
  const [showSortingOptions,setShowSortingOptions] = useState(false)
  const [NotToCallCart,setNotToCallCart] = useState(false)
  const [filterData, setFilterData] = useState()
  const [totalCartPrice,setTotalCartPrice] = useState(0);
  const [showItem , setShowItem] = useState(false)
  const [choosenSortMethod,setChoosenSortMethod] = useState(0)
  const [categoryIdForSorting,setCategoryIdForSorting] = useState()
  const [ItemId, setItemId] = useState(null)
  
  const increaseCartCount = () => {
    setCartCount(prevCount => prevCount + 1);
    console.log("state count of cart increasing",cartCount)
  };

  const decreaseCartCount = () => {
    setCartCount(prevCount => (prevCount > 0 ? prevCount - 1 : 0));
    console.log("state count of cart decreasing",cartCount)
  };
  return (
    <StateContext.Provider value={{cartCount,setCartCount, increaseCartCount, NotToCallCart, handleHeartClick, clickedHearts,setClickedHearts, wishlistData,setWishlistData, setNotToCallCart, decreaseCartCount, categoryIdForSorting,setCategoryIdForSorting, showSortingOptions, setShowSortingOptions, filterData, setFilterData, showNav,setShowNav, showItem, choosenSortMethod, setChoosenSortMethod, setShowItem , ItemId, setItemId, showCart, setShowCart,showCheckout,setShowCheckout,totalCartPrice,setTotalCartPrice}}>
        {children}
    </StateContext.Provider>
  )
}
//hook export
export const useStateContext = () => useContext(StateContext)