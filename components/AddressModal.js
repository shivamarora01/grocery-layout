"use client"
import React, { useState , useEffect} from 'react';
import toast from 'react-hot-toast';
import axiosInstance from '@/services/axiosConfig';
import { RxCross2 } from "react-icons/rx";

import { useAuth } from '@/context/Auth';
const AddressModal = ({ closeModal }) => {
    const [formData, setFormData] = useState({
        line1: '',
        line2: '',
        city: '',
        state: '',
        zipCode: '',
        isDefault: false,
    });
    const [userProfile , setUserProfile] = useState();
    const { isLogin } = useAuth();

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };
    const fetchData = async () => {
        const seller_id = localStorage.getItem("SellerWorkspace");
        const res = await axiosInstance.get(`/customers/buyer?sellerWorkspace=${seller_id}`);
    
        setUserProfile(res?.data?.data[0]);
    
    };
    useEffect(() => {
        if (isLogin) {
            fetchData()
        }
    }, [isLogin])
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const customer_id = localStorage.getItem("customer_id");
           
            const seller = localStorage.getItem("SellerWorkspace");
            const updatedAddresses = [...userProfile.shippingAddress , formData]
            await axiosInstance.put(`/customers/buyer/${customer_id}`, {
                shippingAddress: updatedAddresses,
                billingAddress: userProfile?.billingAddress,
                workspace: seller
            });
            toast.success('Address added successfully');
            closeModal();
        } catch (error) {
            toast.error('Failed to add address');
            console.error('Error adding address:', error);
        } finally {
            setLoading(false);
            setFormData({
                line1: '',
                line2: '',
                city: '',
                state: '',
                zipCode: '',
                isDefault: false,
            });
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 px-4 py-10">
            <div className="bg-white h-full p-4 rounded-md flex flex-col items-center justify-center w-[90%] my-10">
                <div className='w-full flex justify-end h-[10%]'>
                <RxCross2 size={24} onClick={closeModal}/>
                </div>
                <div className='flex w-full h-[10%]'>
                    <h2 className="text-lg font-bold ">Add New Address</h2>             
                </div>
                <form onSubmit={handleSubmit}>
                    <input type="text" placeholder="Address Line 1" className="mb-2 w-full text-sm rounded-md border-gray-300 border p-3" name="line1" value={formData.line1} onChange={handleChange} required />
                    <input type="text" placeholder="Address Line 2" className="mb-2 w-full text-sm rounded-md border-gray-300 border p-3" name="line2" value={formData.line2} onChange={handleChange} />
                    <input type="text" placeholder="City" className="mb-2 w-full text-sm rounded-md border-gray-300 border p-3" name="city" value={formData.city} onChange={handleChange} required />
                    <input type="text" placeholder="State" className="mb-2 w-full text-sm rounded-md border-gray-300 border p-3" name="state" value={formData.state} onChange={handleChange} required />
                    <input type="text" placeholder="Zipcode" className="mb-2 w-full text-sm rounded-md border-gray-300 border p-3" name="zipCode" value={formData.zipCode} onChange={handleChange} required />       
                        <button type="submit" className="bg-green-500 text-white w-full px-4 mt-5 py-2 rounded-md" disabled={loading}>Submit</button>
                </form>
            </div>
        </div>
    );
};

export default AddressModal;
