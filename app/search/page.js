// SearchResults.js
"use client"
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import axiosInstance from '@/services/axiosConfig';
import { Base_url } from '@/constants/Links';
import { useStateContext } from '@/context/StateContext';

const SearchResults = () => {
    const [searchResults, setSearchResults] = useState([]);
    const searchParams = useSearchParams();
    const params = new URLSearchParams(searchParams.toString());
    const searchString = params.get('q');
    const [quantity, setQuantity] = useState(null)
    const [localData,setLocalData] = useState()
    const [cartData,setCartData] = useState()
    const [selectedItemOfferId, setSelectedItemOfferId] = useState(null)
    const [loading, setLoading] = useState(false);
    const { cartCount, increaseCartCount, decreaseCartCount, setShowNav, setShowCheckout, showItem, setShowItem, ItemId, setItemId, setShowCart, totalCartPrice, setTotalCartPrice } = useStateContext();
    useEffect(()=>{
        const cartData1 = JSON.parse(localStorage.getItem("cartData"))
        setLocalData((cartData1))
        setCartData(cartData1)
      },[])
    
    useEffect(() => {
        const fetchData = async () => {
            setSearchResults([]);
            if (searchString) {
                try {
                    const uri = localStorage.getItem("uri");
                    const response = await axiosInstance.get(`https://api.mulltiply.com/offers/active-offers/${uri}?page=1&limit=100&search=${encodeURIComponent(searchString)}`);
                    setSearchResults(response?.data?.data);
                    setLoading(false);
                } catch (error) {
                    console.error('Error fetching search results:', error);
                    setLoading(false);
                }
            }
        };

        fetchData();
    }, [searchString]);

    const handleItemAddButton = (offerId, sellerSKU, priceOfItem) => {
        console.group(offerId);
        const cartDataFromStorage = JSON.parse(localStorage.getItem("cartData")) || { items: [] };
        const newitem = {
          offerId: offerId,
          sellerSKU: sellerSKU,
          quantity: 1,
          addToCartTimestamp: new Date().toISOString(),
          isDeleted: false,
          bidPrice: null,
          sellingUnit: null,
        };
        cartDataFromStorage.items.push(newitem);
        localStorage.setItem("cartData", JSON.stringify(cartDataFromStorage));
        increaseCartCount();
        const roundedPrice = Math.round(priceOfItem * 100) / 100;
        setTotalCartPrice(prev => Math.round((prev + roundedPrice) * 100) / 100);
        setLocalData(cartDataFromStorage); // Update state with new cart data
        setQuantity(1);
      };

      const decrement = (passedOfferId, availableToSell, priceOfItem) => {
        let updatedCartData = JSON.parse(localStorage.getItem("cartData")) || { items: [] };
        const item = updatedCartData.items.find((item) => item.offerId === passedOfferId);
        if (item) {
          if (item.quantity > 1) {
            item.quantity--;
            setQuantity(item.quantity);
            const roundedPrice = Math.round(priceOfItem * 100) / 100;
            setTotalCartPrice(prev => Math.round((prev - roundedPrice) * 100) / 100);
          } else if (item.quantity === 1) {
            updatedCartData.items = updatedCartData.items.filter((item) => item.offerId !== passedOfferId);
            setQuantity(0);
            decreaseCartCount();
            const roundedPrice = Math.round(priceOfItem * 100) / 100;
            setTotalCartPrice(prev => Math.round((prev - roundedPrice) * 100) / 100);
          }
          localStorage.setItem("cartData", JSON.stringify(updatedCartData));
          setLocalData(updatedCartData); // Update state with new cart data
        }
      };
    
      const increment = (passedOfferId, availableToSell, priceOfItem) => {
        let updatedCartData = JSON.parse(localStorage.getItem("cartData")) || { items: [] };
        const item = updatedCartData.items.find((item) => item.offerId === passedOfferId);
        if (item && item.quantity < availableToSell) {
          item.quantity++;
          setQuantity(item.quantity);
          const roundedPrice = Math.round(priceOfItem * 100) / 100;
          setTotalCartPrice(prev => Math.round((prev + roundedPrice) * 100) / 100);
          localStorage.setItem("cartData", JSON.stringify(updatedCartData));
          setLocalData(updatedCartData); // Update state with new cart data
        }
      };
    const handleShowItem = (id) => {
        setItemId(id);
        setShowCart(true);
        setShowItem(true);
    };

    return (
        <>
            {loading ? (
            <div className='flex flex-col w-full'>
            <div className='w-full grid grid-cols-2 p-1 bg-slate-200 md:grid-cols-6'>
              {[...Array(30)].map((_, index) => (
              <div key={index} className="animate-pulse flex h-64 md:h-64 flex-col rounded-sm p-1">
                              <div className="animate-pulse h-64 bg-gray-100 rounded-md"></div>
              </div>
            ))}
            </div>
            <div className='h-48 w-full bg-slate-200'></div>
          </div>
            ) : searchResults.length > 0 ? (
                <div className='flex flex-col w-full'>
                    <div className='w-full grid grid-cols-2 p-1  md:grid-cols-6'>
                        {searchResults.map((item, index) => (
                            <div className='h-64 bg-white m-1 rounded-md border px-1' key={index}>
                                <div className='h-3/5 p-1 flex justify-center relative'>
                                    {item.attributeSet.inventory.availableToSell === 0 && (
                                        <div className="absolute top-0 left-0 rounded-md w-full h-full flex justify-center items-center bg-black bg-opacity-50">
                                            <p className="text-white font-semibold text-lg">Out of Stock</p>
                                        </div>
                                    )}
                                    <img className='rounded-md h-full object-contain' onClick={() => handleShowItem(item?.attributeSet?.item._id)} src={`${Base_url}${item?.attributeSet?.item?.itemImages[0]}`} 
                                                  onError={(e) => {
                                                    e.target.onerror = null; // Prevent infinite loop if the fallback image fails
                                                    e.target.src = '/no-img.png'; // Path to the fallback image in the public folder
                                                  }}
                                                  alt='Image'
                                    />
                                </div>
                                <div className='flex flex-col justify-between h-2/5'>
                                    <div className='h-1/2'>
                                        <p className='text-sm font-semibold mt-1 m-1 line-clamp-2' onClick={() => handleShowItem(item?.attributeSet?.item._id)}>{item?.attributeSet?.item?.itemName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}</p>
                                        <p className='text-xs mt-1'>{item?.attributeSet?.item?.itemVariantInfo?.packaging}</p>
                                    </div>
                                    <div className='h-1/2 flex justify-between items-center mt-1 text-xs pl-1'>
                                    <div className='flex flex-row w-1/2'>
                                       <p className='text-sm font-medium'>₹{parseInt(item?.attributeSet?.price?.pricePerUnit)}</p>
                                      {
                                       (item?.attributeSet?.price?.pricePerUnit === item?.attributeSet?.mrp?.pricePerUnit) ? (
                                       null
                                       ):(
                                       <p className='text-sm font-light decoration-from-font line-through ml-1'>₹{item?.attributeSet?.mrp?.pricePerUnit}</p>
                                       )
                                     }
                                    </div>
                                        <div className='flex justify-center items-center w-20 text-center h-10 rounded-md w-1/2'>
                                            {(localData && localData?.items?.some(product => product.offerId === item?.identifier?.offerId)) ? (
                                                <div className="flex items-center justify-center h-full w-full p-1">
                                                    <button className="w-1/3 h-full text-white text-lg rounded-l bg-green-700" onClick={() => decrement(item?.identifier?.offerId, item?.attributeSet?.inventory?.availableToSell, item?.attributeSet?.price?.pricePerUnit)}>-</button>
                                                    <div className='w-1/3 h-full bg-gray-100 flex items-center justify-center'>
                                                    {(quantity !== null) && (quantity !== 0) && (item?.identifier?.offerId === selectedItemOfferId) ? (
                                                        <span id="quantity" className="bg-gray-100 border-solid border-1 border-[#A18168] font-medium text-[#A18168]">
                                                            {quantity}
                                                        </span>
                                                    ) : (
                                                        <span id="quantity" className="border-solid border-1 border-[#A18168] font-medium text-[#A18168]">
                                                            {localData.items.find(product => item?.identifier?.offerId === product.offerId).quantity}
                                                        </span>
                                                    )}
                                                    </div>
                                                    <button className="w-1/3 h-full text-white rounded-r bg-green-700" onClick={() => increment(item?.identifier?.offerId, item?.attributeSet?.inventory?.availableToSell, item?.attributeSet?.price?.pricePerUnit)}>+</button>
                                                </div>
                                            ) : (
                                                item?.attributeSet?.inventory?.availableToSell === 0 ? (
                                                    null
                                                ) : (
                                                            <button className='px-5 py-2 border border-solid border-green-600 rounded-md text-sm font-medium text-green-600' onClick={() => handleShowItem(item?.attributeSet?.item._id)}>ADD</button>
                                                )
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className='h-48 w-full bg-slate-200'></div>
                </div>
            ) : searchResults === 0 && searchString !== 0 ?(
                <div className='h-full w-full flex justify-center items-center mt-10 p-3 '>
                    <img className='scale-150' src='../no-product-found.png' alt="No product found" />
                </div>
            ):(null)}
        </>
    );
};

export default SearchResults;
