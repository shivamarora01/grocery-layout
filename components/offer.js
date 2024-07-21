"use client"
export default function Offer() {
  return (
    <div className="bg-cream flex flex-col sm:flex-row justify-between my-4 sm:my-10 mx-20 sm:mx-10 py-1 sm:py-5">
      <div className="flex flex-row items-center justify-center mb-2">
        <div className="m-2">
          <img src="/image22.svg" alt="Free World Delivery" className="object-cover h-3 sm:h-6" />
        </div>
        <div className="m-2 text-center">
          <p className="text-brown font-book-antiqua font-bold text-xs sm:text-md leading-relaxed">
            Free World Delivery
          </p>
          <p className="text-brown font-book-antiqua text-xs sm:text-md leading-relaxed">
            Orders Over $200
          </p>
        </div>
      </div>

      <div className="flex flex-row items-center justify-center mb-2">
        <div className="m-2">
          <img src="/image23.svg" alt="Money Back Guarantee" className="object-cover h-3 sm:h-6" />
        </div>
        <div className="m-2 text-center">
          <p className="text-brown font-book-antiqua font-bold text-xs sm:text-md leading-relaxed">
            Money Back Guarantee
          </p>
          <p className="text-brown font-book-antiqua text-xs sm:text-md leading-relaxed">
            Within 30 Days
          </p>
        </div>
      </div>

      <div className="flex flex-row items-center justify-center mb-2">
        <div className="m-2">
          <img src="/image24.svg" alt="Best Online Support" className="object-cover h-3 sm:h-6" />
        </div>
        <div className="m-2 text-center">
          <p className="text-brown font-book-antiqua font-bold text-xs sm:text-md leading-relaxed">
            Best Online Support
          </p>
          <p className="text-brown font-book-antiqua text-xs sm:text-md leading-relaxed">
            Hours: 8am - 11 pm
          </p>
        </div>
      </div>

      <div className="flex flex-row items-center justify-center mb-2">
        <div className="m-2">
          <img src="/image25.svg" alt="Free Returns" className="object-cover h-3 sm:h-6" />
        </div>
        <div className="m-2 text-center">
          <p className="text-brown font-book-antiqua font-bold text-xs sm:text-md leading-relaxed">
            Free Returns
          </p>
          <p className="text-brown font-book-antiqua text-xs sm:text-md leading-relaxed">
            Hours: 8am - 11 pm
          </p>
        </div>
      </div>
    </div>
  );
}
