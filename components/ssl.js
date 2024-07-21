import React from "react";
import Link from "next/link";

const Ssl = () => {
  return (
    <footer className="">
      <div className="border-t border-gray-200 p-10 bg-[#F9F3EF]">
        <div className="flex flex-wrap justify-between">
          <div className="w-full md:w-1/5 mb-6 md:mb-0">
            <h5 className="uppercase text-[#A18168] font-book-antiqua text-base font-bold leading-[26px] mb-2">
              Why Stomize
            </h5>
            <p className="text-black font-book-antiqua text-base font-normal leading-[26px] pr-10">
              Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean
              commodo ligula eget dolor. Aenean massa. Cum sociis natoque
              penatibus et magnis Learn More
            </p>
          </div>

          <div className="w-full md:w-1/5 mb-6 md:mb-0">
            <h5 className="uppercase text-[#A18168] font-book-antiqua text-base font-bold leading-[26px]">
              Manage
            </h5>
            <ul className="list-disc text-black font-book-antiqua text-base font-normal leading-[28px] footer-links">
              <li className="mb-2">Home</li>
              <li className="mb-2">New Arrivals</li>
              <li className="mb-2">Clothing</li>
              <li className="mb-2">Collections</li>
              <li className="mb-2">Gift Card</li>
              <li className="mb-2">About Us</li>
            </ul>
          </div>
          <div className="w-full md:w-1/5 mb-6 md:mb-0">
            <h5 className="uppercase text-[#A18168] font-book-antiqua text-base font-bold leading-[26px]">
              Know more
            </h5>
            <ul className="list-disc text-black font-book-antiqua text-base font-normal leading-[28px] footer-links">
              <li className="mb-2">Terms & Conditions</li>
              <li className="mb-2">Privacy Policy</li>
              <li className="mb-2">Cancellation & Refund</li>
              <li className="mb-2">Shipping & Delivery</li>
              <li className="mb-2">Contact Us</li>
            </ul>
          </div>
          <div className="w-full md:w-1/5 mb-6 md:mb-0">
            <h5 className="uppercase text-[#A18168] font-book-antiqua text-base font-bold leading-[26px]">
              Get in Touch
            </h5>
            <p className="text-black font-book-antiqua text-base font-normal leading-[28px]">
              Buildings Alyssa,
              <br />
              Begonia and Clover situated in Embassy
              <br />
              Outer Ring Road,
              <br />
              Devarabeesanahalli Village,Varthur Hobli,
              <br />
              Bengaluru – 560103, India
            </p>
          </div>
          <div className="w-full md:w-1/5 mb-6 md:mb-0">
            <h5 className="uppercase text-[#A18168] font-book-antiqua text-base font-bold  mb-2">
              Follow us on
            </h5>
            <div className="flex flex-col">
              <div className="flex flex-row  mb-2 sm:mb-0">
                <img src="/instagram.svg" alt="Instagram" className="mr-2" />
                <span className="text-black font-book-antiqua text-base font-normal leading-[30px]">
                  Instagram
                </span>
              </div>
              <div className="flex flex-row items-center">
                <img src="/instagram.svg" alt="Facebook" className="mr-2" />
                <span className="text-black font-book-antiqua text-base font-normal leading-[30px]">
                  Facebook
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="p-5 border-t-2 bg-[#4F3825]">
        <p class="flex justify-center text-white text-right font-book-antiqua text-sm font-normal leading-6 mb-2">
          <span class="md:mr-[700px]">Powered by Stomize</span>
          <span>
            Create your store with Mulltiply. For inquires and questions{" "}
          </span>
        </p>

        <p class="flex justify-center text-white text-right font-book-antiqua text-sm font-normal leading-6">
          <span class="md:mr-[820px]">© 2024 Stomize. All rights reserved.</span>
          <span> Call us on+91-7703781804 </span>
        </p>
      </div>
    </footer>
  );
};

export default Ssl;
