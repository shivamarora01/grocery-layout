export default function Custom() {
  return (
    <div className="flex flex-col items-center mb-5">
      <div className="mb-8">
        <img src="image20.svg"></img>
      </div>
      <div className="relative">
        <img src="image21.svg"></img>
        <div className="absolute inset-0 opacity-50 pt-[340px] px-[340px]">
          <p className="border border-solid border-opacity-90 bg-opacity-70 border-gray-400 bg-rose-200 text-black text-center font-book-antiqua text-3xl font-normal leading-164">
            Stretch Slim fit Top
          </p>
          <p className="border border-solid border-opacity-90 bg-opacity-70 border-gray-400 bg-rose-200 text-black font-book-antiqua text-base font-normal leading-164">
            Our Clothes are made in a custom facility built from the ground up.
            It&apos;s quality over numbers, every single day.
          </p>
        </div>
      </div>
    </div>
  );
}
