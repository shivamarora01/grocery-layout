export default function Check () {

 return (
    <div
         className={`${t.visible ? 'animate-enter' : 'animate-leave'
            } max-w-xs w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
    >
        <div className="flex p-4">
            <div className="flex flex-col">
                <div className="flex justify-center">
                    <img
                        className="h-24 w-24 "
                        // src={`${Base_url}${Data?.attributeSet?.item?.itemImages[0]}`}
                        alt=""
                    />
                </div>
                <div className="ml-3 flex justify-center font-book-antiqua">
                    <p className="mt-1 text-sm text-gray-500">
                        Item Added To Cart Succesfully                 </p>
                </div>
            </div>
        </div>
    </div>
);
}