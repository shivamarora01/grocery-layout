import React from 'react';

const ProductDetailsSkeleton = () => {
    return (
        <div className="flex flex-col md:flex-row  my-10 md:mx-20 animate-pulse">
            <div className="flex flex-col-reverse sm:flex-row ">
                <div className="flex flex-col mx-3 my-3 md:my-0 ">
                    <div className="w-36 h-36 bg-gray-200 mb-2"></div>
              
                </div>
                <div className='flex justify-center'>
                    <div className="md:w-[500px] md:h-[85vh] w-[350px] h-[60vh] bg-gray-200"></div>
                </div>
            </div>
            <div className="mx-4">
                <div className="mb-2">
                    <div className="w-64 h-8 bg-gray-200 mb-2"></div>
                    <div className="w-32 h-8 bg-gray-200 mb-2"></div>
                    <div className="w-32 h-4 bg-gray-200"></div>
                </div>
          
                <div className="mt-10">
                    <div className="w-full flex justify-evenly">
                        <div className="w-64 h-12 bg-gray-200 mr-2"></div>
                        <div className="w-64 h-12 bg-gray-200 ml-2"></div>
                    </div>
                </div>
                <div className="my-4">
                    <div className="w-48 h-6 bg-gray-200 mb-2"></div>
                    <div className="w-full h-6 bg-gray-200 mb-2"></div>
                    <div className="w-full h-6 bg-gray-200 mb-2"></div>
                    <div className="w-full h-6 bg-gray-200 mb-2"></div>
                    <div className="w-full h-6 bg-gray-200"></div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailsSkeleton;
