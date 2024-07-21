"use client"
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { useStateContext } from '@/context/StateContext';
import Link from 'next/link';
import { Base_url } from '@/constants/Links';
import axios from 'axios';

function page({params}) {
  const [responseData, setResponseData] = useState([]);
  const {cartCount, increaseCartCount, decreaseCartCount, setShowNav,  totalCartPrice, setTotalCartPrice } = useStateContext()
  const [activeCategory,setActiveCategory] = useState(false)
  const [selectedCategoryId,setSelectedCategoryId] = useState(null)
  const [selectedItemOfferId,setSelectedItemOfferId] = useState(null)
  const [itemId,setItemId] = useState(null)
  const [quantity,setQuantity] = useState(null)
  const [loading , setLoading] = useState(true);
  const cartData = JSON.parse(localStorage.getItem("cartData"))
  const router = useRouter();
  useEffect(() => {
    fetchData2();
    setShowNav(true)
  }, []);

  const backToMain = () =>{
    router.push('/')
  }

  const handlesubCategory = (id) => {
    setSelectedCategoryId(id);
  }

  const handletemAddButton = (passedOfferid,index,priceOfItem) => {
    console.log(passedOfferid)
    const cartData = JSON.parse(localStorage.getItem("cartData"))
    const particularItem = responseData[index]
    // const itemToAdd = items?.find(item => item.id === id)
    console.log(particularItem)
    const { identifier } = particularItem;
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
    console.log("newitem",newitem)
    localStorage.setItem("cartData", JSON.stringify(cartData))
    console.log(totalCartPrice)
    setTotalCartPrice(prev => prev + priceOfItem)
    console.log("totalPrice" , totalCartPrice)
    increaseCartCount()
    // console.log("items in cart",cartCount)
    setSelectedItemOfferId(passedOfferid)
    setQuantity(1)
  }

  const fetchData2 = async () => {
    try {
      console.log(params.slug)
      const uri = localStorage.getItem("uri");

      const response = await axios.get(`https://api.mulltiply.com/offers/active-offers-stats-new/${uri}?type=topViews`
      );
     
      setResponseData(response?.data?.data[0]?.items);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  
  const decrement = (passedOfferid,priceOfItem) => { 
    let updatedCartData = JSON.parse(localStorage.getItem("cartData")) || {};
    const quan = updatedCartData?.items?.find((item)=>item.offerId === passedOfferid).quantity;
      updatedCartData.items = updatedCartData.items.map((item) => {
        if (item.offerId === passedOfferid && item.quantity > 1) {
          item.quantity--;
          setQuantity(quan-1);
          console.log("decresing the count button")
          setSelectedItemOfferId(passedOfferid)
          console.log(totalCartPrice)
          setTotalCartPrice(prev => prev-priceOfItem)
        }
        else if(item.offerId === passedOfferid && item.quantity === 1){
          console.log("i gonna remove the count button")
          setQuantity(0)
          decreaseCartCount()
          console.log(totalCartPrice)
          setTotalCartPrice(prev => prev-priceOfItem)
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
          setSelectedItemOfferId(passedOfferid);
          console.log(totalCartPrice)
          setTotalCartPrice(prev => prev+priceOfItem)
        }
        return item;
      }).filter((item) => item !== null); ;
      localStorage.setItem("cartData", JSON.stringify(updatedCartData)); 
      localStorage.setItem("cartData", JSON.stringify(updatedCartData));
  };

  

  const storageData = localStorage.getItem("cartData")
  if(!storageData){
    const cartData = {"items":[]}
    localStorage.setItem("cartData",JSON.stringify(cartData));
  }
  
  return (
    <div className='w-full'>
      <div className='text-sm font-medium flex justify-between mt-3 mb-4 mx-2 text-center'>
        <div className='h-6 w-6' onClick={()=>{backToMain()}}>    
        <img className='object-fit' src='../back.png'/>      
        </div>
        <p>{responseData[0]?.attributeSet?.item?.category?.title.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}</p>
        <p></p>
      </div>
      <div className='flex flex-row'>
        {
        loading ? (
            <div className='flex flex-col w-full'>
              <div className='w-full grid grid-cols-2 bg-slate-200'>
                <div className="animate-pulse h-64 bg-gray-100 px-1 ml-1 m-1 rounded-md"></div>
                <div className="animate-pulse h-64 bg-gray-100 px-1 ml-1 m-1 rounded-md"></div>
                <div className="animate-pulse h-64 bg-gray-100 px-1 ml-1 m-1 rounded-md"></div>
              </div>
              <div className='h-48 w-full bg-slate-200'></div>
            </div>
          ) : responseData?.length > 0 ? (
            // Render item grid if responseData is not empty and loading is false
            <div className='flex flex-col w-full'>
            <div className='w-full bg-slate-200'>
            {
                   responseData.map((item,index) => (
                  <div className='h-64 bg-white px-1 ml-1 m-1 rounded-md' key={index}>
                        <Link href={`/item/${item.attributeSet.item._id}`}>
                        {/* <div className='h-3/5 p-1 flex justify-center'>
                            <img className='rounded-md h-full object-cover' src={`${Base_url}${responseData[index]?.attributeSet.item.itemImages[0]}`}
    />
                        </div> */}
                        <div className='h-3/5 p-1 flex justify-center relative'>
        {item.attributeSet.inventory.availableToSell === 0 && (
            <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50">
                <p className="text-white font-semibold text-lg">Out of Stock</p>
            </div>
        )}
        <img className='rounded-md h-full object-cover' src={`${Base_url}${responseData[index]?.attributeSet.item.itemImages[0]}`} />
    </div>
    
                        </Link>
                        <div className='flex flex-col justify-between h-2/5'>
                        <Link href={`/item/${item.attributeSet.item._id}`}>
                        <div className=''>
                            <p className='text-sm font-semibold mt-1'> {responseData[index]?.attributeSet.item.itemName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}</p>
                            <p className='text-xs mt-1'>{item?.attributeSet?.item?.itemVariantInfo?.packaging}</p>
                        </div>
                        </Link>
                        <div className='justify-between flex flex-row items-center m-1 text-xs'>
                            <p className='text-sm font-medium'>₹ {responseData[index]?.attributeSet.price.pricePerUnit}</p>
                            <div className='border-solid border-green flex justify-center items-center border-2 w-12 text-center h-7 rounded-md'>
                           { 
                                (cartData && cartData?.items?.some(product => product.offerId === responseData[index]?.identifier?.offerId))? (
                                    <div class="flex items-center">
                                        <button class="px-1 py-0.5 text-white rounded-l bg-green-700" onClick={()=>decrement(responseData[index]?.identifier?.offerId, responseData[index]?.attributeSet.price.pricePerUnit)}>-</button>
                                        {(quantity !== null) &&  (quantity !== 0) && (responseData[index]?.identifier?.offerId === selectedItemOfferId)? (
                                           <span id="quantity" class="px-1 py-0.5 bg-gray-100 border-solid border-1 border-[#A18168] font-medium text-[#A18168]">
                                             {quantity}
                                           </span>
                                           ) : (
                                            <span id="quantity" class="px-1 py-0.5 bg-gray-100 border-solid border-1 border-[#A18168] font-medium text-[#A18168]">
                                            {cartData.items.find(product => responseData[index]?.identifier?.offerId === product.offerId).quantity}
                                             </span>
                                          )}
                                        <button class="px-1 py-0.5 text-white rounded-r bg-green-700" onClick={()=>increment(responseData[index]?.identifier?.offerId, responseData[index]?.attributeSet.price.pricePerUnit)}>+</button>
                                    </div>
                                ):
                                (
                                  item.attributeSet.inventory.availableToSell === 0 ? (
                                    null
                                  ) : (
                                    <button className='px-3 py-1 text-green-600' onClick={()=>handletemAddButton(responseData[index]?.identifier?.offerId,index, responseData[index]?.attributeSet.price.pricePerUnit)}>ADD</button>
                                  )
                                )
                            }
                            </div>
                        </div>
                        </div>
                  </div> ))
                }
            </div>
            <div className='h-48 w-full bg-slate-200'></div>
            </div>
          ) : (<div className='h-full w-full flex justify-center items-center mt-10 p-3 bg-red-600'>
          <img className='scale-150' src='../no-product-found.png'/>
        </div>)
        }
      </div>
    </div>
  )
}

export default page