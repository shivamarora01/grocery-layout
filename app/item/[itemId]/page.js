
"use client"
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Item_url,Base_url } from '@/constants/Links'
import { useStateContext,StateProvider } from '@/context/StateContext'

function page({params}) {
  const [responseData, setResponseData] = useState()
  const [offerId,setOfferId] = useState(null)
  const [cartData,setCartData] = useState()
  const {increaseCartCount,decreaseCartCount,setTotalCartPrice, setShowNav} = useStateContext()
  const searchItemInGhostCart = cartData.items.length > 0 ? cartData.items.find(item => offerId === item.offerId) : null;
  console.log("searchGhostCartItem", searchItemInGhostCart)
  const [quantity,setQuantity] = useState(0)  
  console.log("quantity", quantity)

  useEffect(()=>{
    const cartData1 = JSON.parse(localStorage.getItem("cartData"))
    setCartData((cartData1))
  },[])

  useEffect(()=>{
    setQuantity(searchItemInGhostCart? searchItemInGhostCart.quantity:0)
  },[searchItemInGhostCart]);

  useEffect(()=>{
    fetchData();
    setShowNav(true)
  },[])

  const fetchData = async () => {
    try {
      const uri = localStorage.getItem("uri")
      const response = await axiosInstance(
        `${Item_url}/${uri}?item._id=${id}`
      );

      setResponseData(response?.data?.data[0]);
      console.log(response?.data?.data[0])
      setOfferId(response?.data?.data[0]?.identifier?.offerId)
      console.log(response?.data?.data[0].identifier?.offerId)
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handletemAddButton = (offerId,priceOfItem) => {
    console.group(offerId)
    const cartData = JSON.parse(localStorage.getItem("cartData"))
    // const itemToAdd = items?.find(item => item.id === id)
    const { identifier } = responseData;
    const newitem = {
      offerId: identifier?.offerId,
      sellerSKU: identifier?.sellerSKU,
      quantity: 1,
      addToCartTimestamp: new Date().toISOString(),
      isDeleted: false,
      bidPrice: null,
      sellingUnit: null,
    };
    cartData.items.push(newitem)
    localStorage.setItem("cartData", JSON.stringify(cartData))
    increaseCartCount()
    const roundedPrice = Math.round(priceOfItem * 100) / 100;
    setTotalCartPrice(prev => Math.round((prev + roundedPrice) * 100) / 100);
    setQuantity(1)
  }
  const decrement = (passedOfferid,priceOfItem) => { 
    let updatedCartData = JSON.parse(localStorage.getItem("cartData")) || {};
    const quan = updatedCartData?.items?.find((item)=>item.offerId === passedOfferid).quantity;
      updatedCartData.items = updatedCartData.items.map((item) => {
        if (item.offerId === passedOfferid && item.quantity > 1) {
          item.quantity--;
          setQuantity(quan-1);
          const roundedPrice = Math.round(priceOfItem * 100) / 100;
          setTotalCartPrice(prev => Math.round((prev - roundedPrice) * 100) / 100);
        }
        else if(item.offerId === passedOfferid && item.quantity === 1){
          console.log("i gonna remove the count button")
          setQuantity(0)
          decreaseCartCount()
          const roundedPrice = Math.round(priceOfItem * 100) / 100;
          setTotalCartPrice(prev => Math.round((prev - roundedPrice) * 100) / 100);
          return null;
        }
        return item;
      }).filter((item) => item !== null); ;
      localStorage.setItem("cartData", JSON.stringify(updatedCartData)); 
  };
  const increment = (passedOfferid,priceOfItem) => {
    console.log(passedOfferid)
    let updatedCartData = JSON.parse(localStorage.getItem("cartData")) || {};
    const quan = updatedCartData?.items?.find((item)=>item.offerId === passedOfferid).quantity;
    console.log(quan)
      updatedCartData.items = updatedCartData.items.map((item) => {
        if (item.offerId === passedOfferid) {
          item.quantity++;
          setQuantity(quan+1);
          console.log(quantity)
          const roundedPrice = Math.round(priceOfItem * 100) / 100;
          setTotalCartPrice(prev => Math.round((prev + roundedPrice) * 100) / 100);
        }
        return item;
      });
      localStorage.setItem("cartData", JSON.stringify(updatedCartData));
  };
  return (
    <div>
        {
            responseData ? (
                <div className='h-screen w-full px-3'>
                <div className='h-[50%] w-full p-2 flex flex-nowrap overflow-x-auto'>
                {responseData?.attributeSet?.item?.itemImages.map((image, index) => (
                  <img
                        className="h-full w-full object-cover hover:cursor-pointer image-variants"
                        key={index}
                        src={Base_url + image}
                        alt={`Image ${index}`}
                   />
                     ))}
                    </div>
                    <div className='mt-3'><p className='text-sm font-medium'>{responseData?.attributeSet?.item?.itemName}</p></div>
                    <div className='mt-2'><p className='text-xs font-light'>{responseData?.attributeSet?.item?.itemVariantInfo?.packaging}</p></div>
                    <div className='mt-1 flex flex-row justify-between text-center items-center'>
                     <p className='text-sm font-medium'>MRP {responseData?.attributeSet?.mrp.pricePerUnit}</p>
                     {
                        responseData.attributeSet.inventory.availableToSell !== 0 ? (
                        <div className='bg-green-700 w-25 h-10 text-white font-semibold text-sm p-2 rounded-md cursor-pointer'>
                        {
                          quantity > 0 ? (
                            <div class="flex flex-row items-center">
                            <button class="pr-2 py-1 text-white rounded-l bg-green-700 font-semibold" onClick={()=>decrement(searchItemInGhostCart.offerId,responseData?.attributeSet?.mrp.pricePerUnit)}>-</button>
                            {(quantity !== null) &&  (quantity !== 0) && (searchItemInGhostCart) && (searchItemInGhostCart.offerId === offerId)? (
                               <span id="quantity" class=" mx-1 px-1 py-0.5 h-full border-solid border-1 border-[#A18168] text-white font-bold">
                                 {quantity}
                               </span>
                               ) : (
                                <span id="quantity" class="mx-1 px-1 py-0.5 border-solid border-1 border-[#A18168] text-white font-bold">
                                {cartData.items.find(product => offerId === product.offerId).quantity}
                                 </span>
                              )}
                            <button class="pl-1 py-1 text-white rounded-r bg-green-700 font-semibold" onClick={()=>increment(searchItemInGhostCart.offerId,responseData?.attributeSet?.mrp.pricePerUnit)}>+</button>
                        </div>
                          ):(<button onClick={()=>handletemAddButton(responseData?.identifier?.offerId, responseData?.attributeSet?.mrp.pricePerUnit)}>Add To Cart</button>)
                        }
                       </div>):(
                        <div className='bg-red-600 text-white text-md font-medium p-1 rounded-md'>Out of Stock !!</div>
                       )
                     }
                    </div>
                    <div className='mt-3'>
                      <p className='text-sm font-medium'>Description</p>
                      <ul className='text-xs'>
                        <li className='my-1'>Versatile Staple: Enhance Indian cuisine with Onion's unmistakable sharpness and fragrance, elevating every dish.</li>
                        <li className='my-1'>Natural Antiseptic: Harness Onion's antimicrobial and antibiotic properties to combat infections and promote healing.</li>
                        <li className='my-1'>Natural Antiseptic: Harness Onion's antimicrobial and antibiotic properties to combat infections and promote healing.</li>                          
                      </ul>
                    </div>
                </div>
            ) : null
        }
    </div>
);
}

export default page
