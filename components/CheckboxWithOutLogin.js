<div className="bg-white rounded-md fixed bottom-0 flex flex-col w-full h-32 rounded-md px-2 py-1 md:hidden">
<div className='w-full bg-white flex flex-row h-1/2 rounded-md my-1 border-solid border-b border-1 border-gray-300'>
    {
        mainAddress ? (
            <>
            <div className='w-2/12 h-full flex items-center justify-center'>
            <img className='scale-125' src='../location.svg'/>
                  </div>
                  <div className=' h-full w-8/12 flex flex-col pl-1 justify-center overflow-hidden'>
                  <div><p className='text-black text-sm font-semibold'>Delivering to <span className='font-bold'>{buyerProfile.name}</span></p></div>
                  <p className='text-black text-sm overflow-hidden'>{mainAddress.line1} , {mainAddress.line2} , {mainAddress.zipCode}, {mainAddress.city} , {mainAddress.state}</p>
                  </div>
                  <div className='w-2/12 flex h-full text-right justify-end'>
                  <button className='text-blue-700 pr-2 my-2'>Change</button>
                  </div>
                  </>
        ) : (<div className='w-full h-full bg-green-600 rounded-md flex items-center justify-center text-white font-md text-lg'>Add Address</div>)
    } 
</div>
<div className='w-full bg-white h-1/2 flex flex-row rounded-sm items-center p-1'>
    <div className='w-2/5 h-1/2'>
        Payment
    </div>
<div className='bg-green-700 w-3/5 h-full rounded-md px-2 flex flex-row justify-between items-center
' onClick={()=>handleCart()}>
    <div className='flex flex-col'>
            <p className='text-white text-md font-semibold'>₹ {totalCartPrice}</p>
            <p className='text-white text-xs'>TOTAL</p>
        </div>
    <div className='text-white flex justify-center items-center'>
        <p className='text-white text-md font-semibold'>Place Order</p>
    </div>
</div>
</div>
</div>