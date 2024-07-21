import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export default function Profile({ email }) {
    return (
            <div className="text-center text-[#AA642C] mt-4 font-book-antiqua">
                {email ? email : <Skeleton width={200} height={18} />}
            </div>
    );
}
