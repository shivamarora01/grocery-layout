import React from 'react';

export default function ProfileSide({ setActiveComponent , Profile }) {
    return (
        <div className="px-2 lg:order-1 order-2  min-w-[15%] ">
            <div className="font-book-antiqua text-sm md:text-[14px]">
                <p onClick={() => setActiveComponent('profile')} className="text-[#AA642C] leading-7  md:leading-[28px] font-[400] text-[16px] xl:text-[20px] border-b border-[#9E9E9E] py-4">
                    Hello {Profile.name} 
                </p>
                <p onClick={() => setActiveComponent('orders')}  className="hover:text-[#AA642C] cursor-pointer font-[400] border-b border-[#9E9E9E] leading-7 md:leading-[28px] py-4">
                    MY ORDER
                </p>
             
            </div>
            <div className="font-book-antiqua text-sm md:text-[14px] border-[#9E9E9E] border-b">
                <p className="leading-10 md:leading-[42px]">ACCOUNT</p>
                <ul className="text-[#717171]">
                    <li onClick={() => setActiveComponent('profile')} className="leading-10 md:leading-[42px] cursor-pointer">
                        Profile
                    </li>
                    <li onClick={() => setActiveComponent('address')} className="leading-10 md:leading-[42px] cursor-pointer">
                        Addresses
                    </li>
                </ul>
            </div>
            <div className="font-book-antiqua text-sm md:text-[14px]">
                <p className="leading-10  md:leading-[42px]">LEGAL</p>
                <ul className="text-[#717171]">
                    <li className="leading-10 md:leading-[42px]">Terms and conditions</li>
                    <li className="leading-10 md:leading-[42px]">Privacy Policy</li>
                </ul>
            </div>
        </div>
    );
}
