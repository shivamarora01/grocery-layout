// "use client"
// import { useRouter } from 'next/navigation'
// import React, { useEffect, useState } from 'react'
// import { useStateContext } from '@/context/StateContext'
// import axiosInstance from '@/services/axiosConfig'
// import { useAuth } from '@/context/Auth';
// const LargeScreenCart = () => {

//   const { isLogin } = useAuth();
//   const [localData, setLocalData] = useState()
//   const [cartData, setCartData] = useState()
//   const { cartCount, increaseCartCount, decreaseCartCount, showNav, setShowNav, showCart, setShowCart, setShowItem, setShowCheckout, totalCartPrice, setTotalCartPrice } = useStateContext()
//   const router = useRouter();
//   useEffect(() => {
//     const localData = JSON.parse(localStorage.getItem("cartData"));
//     setCartData(localData);
//     console.log(cartData)
//   }, [])

//   const handleCart = () => {
//     router.push('/cart');
//     setShowItem(false)
//     setShowCart(false)
//   }
//   useEffect(() => {
//     const sendPostRequest = async () => {
//       if (cartData && !isLogin) {
//         try {
//           const response = await axiosInstance.post("orders/ghost-cart", cartData);
//           console.log("Response", response.data.data);
//           // setDataToRender(response?.data);
//           const price = response?.data?.data?.orderTotal?.amount;
//           console.log("price", price)
//           setTotalCartPrice(price)
//         } catch (error) {
//           console.log("Error", error);
//         }
//       }
//       else if (cartData && isLogin) {
//         const customerWorkspace = localStorage.getItem("customerWorkspace");
//         const buyer_id = localStorage.getItem("BuyerId");
//         const updatedData = { ...cartData, buyerWorkspace: customerWorkspace, buyerId: buyer_id }
//         try {
//           const response = await axiosInstance.post("orders/cart", updatedData);
//           console.log("Cart showing data");
//           console.log("Response", response.data);
//           // setDataToRender(response.data);
//           const price = response?.data?.data?.orderTotal?.amount ?? 0;
//           setTotalCartPrice(price)
//         } catch (error) {
//           console.log("Error", error);
//         }
//       }

//     };

//     sendPostRequest();
//   }, [cartData]);


//   return (
//     (cartCount > 0 && showCart) ? (
//       <div className="fixed bottom-0 flex flex-row z-40 mb-8 bg-blue-700 w-full md:h-28 rounded-md pr-5 py-1">
//         <div className='p-1 w-12 bg-green-700 ml-auto h-12 rounded-full flex flex-row justify-between' onClick={() => handleCart()}>
//         <div className='flex flex-row'>
//             <div className='rounded-md p-3 h-full'>
//               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" className='h-full w-full object-cover'><path fill="#ffffff" d="M0 24C0 10.7 10.7 0 24 0H69.5c22 0 41.5 12.8 50.6 32h411c26.3 0 45.5 25 38.6 50.4l-41 152.3c-8.5 31.4-37 53.3-69.5 53.3H170.7l5.4 28.5c2.2 11.3 12.1 19.5 23.6 19.5H488c13.3 0 24 10.7 24 24s-10.7 24-24 24H199.7c-34.6 0-64.3-24.6-70.7-58.5L77.4 54.5c-.7-3.8-4-6.5-7.9-6.5H24C10.7 48 0 37.3 0 24zM128 464a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm336-48a48 48 0 1 1 0 96 48 48 0 1 1 0-96z" /></svg>
//             </div>
//           </div>
//         </div>
//       </div>
//     ) : null
//   )
// }

// export default LargeScreenCart