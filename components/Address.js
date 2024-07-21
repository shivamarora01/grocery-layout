import React, { useState, useEffect } from 'react';
import axiosInstance from '@/services/axiosConfig';
import toast from 'react-hot-toast';
export default function Address({ addressList, billingadress, fetchAddresses }) {
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({
        line1: '',
        line2: '',
        city: '',
        state: '',
        zipCode: '',
        isDefault: false,
    });
    const [isNew, setIsNew] = useState(false);
    const [isValid, setIsValid] = useState(false);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        // Validate form data whenever it changes
        const { line1, city, state, zipCode } = formData;
        setIsValid(!!(line1 && city && state && zipCode));
    }, [formData]);
    const handleEditClick = (address) => {
        setEditId(editId === address._id ? null : address._id);
        setFormData(editId === address._id ? initialFormData() : { ...address });
        setIsNew(false);
    };
    const handleNewClick = () => {
        setIsNew(!isNew);
        setEditId(null);
        setFormData(initialFormData());
    };
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };
    const initialFormData = () => ({
        line1: '', line2: '', city: '', state: '', zipCode: '', isDefault: false
    });
    const handleSave = async () => {
        if (!isValid) {
            toast.error('Please fill in all required fields.');
            return;
        }
        setLoading(true);
        try {
            const customer_id = localStorage.getItem("customer_id");
            const updatedAddresses = isNew
                ? [...addressList, formData]
                : addressList.map((addr) => (addr._id === editId ? { ...formData } : addr));
            const seller = localStorage.getItem("SellerWorkspace");
            await axiosInstance.put(`/customers/buyer/${customer_id}`, {
                shippingAddress: updatedAddresses,
                billingAddress: billingadress,
                workspace: seller
            });
            toast.success(`Address ${isNew ? 'added' : 'updated'} successfully`);
            fetchAddresses();
        } catch (error) {
            toast.error('Failed to update address');
        } finally {
            setLoading(false);
            setEditId(null);
            setIsNew(false);
            setFormData(initialFormData());
        }
    };
    const handleRemove = async (id) => {
        setLoading(true);
        try {
            const customer_id = localStorage.getItem("customer_id");
            const updatedAddresses = addressList.filter((addr) => addr._id !== id);
            const seller = localStorage.getItem("SellerWorkspace");
            await axiosInstance.put(`/customers/buyer/${customer_id}`, {
                shippingAddress: updatedAddresses,
                billingAddress: billingadress,
                workspace: seller
            });
            toast.success('Address removed successfully');
            fetchAddresses();
        } catch (error) {
            toast.error('Failed to remove address');
            console.error('Error removing address:', error);
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="min-w-full md:w-[850px] font-book-antiqua h-auto flex flex-col p-2 rounded-md">
            <div className='flex justify-between rounded-md items-center'>
                <p className="text-[16px]">SAVED ADDRESSES</p>
                <button onClick={handleNewClick} className="border bg-green-700 text-white text-sm px-4 py-2 rounded">
                    {isNew ? 'Cancel' : 'Add New Address'}
                </button>
            </div>
            <div className="">
                {(isNew || editId) && (
                    <div className='flex flex-col my-4 p-4 border rounded-lg'>
                        <input className='my-2 p-1 border' placeholder='Line 1' name="line1" value={formData.line1} onChange={handleChange} required />
                        <input className='my-2 p-1 border' placeholder='Line 2' name="line2" value={formData.line2} onChange={handleChange} />
                        <input className='my-2 p-1 border' placeholder='City' name="city" value={formData.city} onChange={handleChange} required />
                        <input className='my-2 p-1 border' placeholder='State' name="state" value={formData.state} onChange={handleChange} required />
                        <input className='my-2 p-1 border' placeholder='Zipcode' name="zipCode" value={formData.zipCode} onChange={handleChange} required />
                        <button onClick={handleSave} disabled={!isValid || loading} className="bg-[#A18168] hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                            {loading ? 'Processing...' : (isNew ? 'Add Address' : 'Save Changes')}
                        </button>
                    </div>
                )}
                {addressList && addressList.map((address) => (
                    <div key={address._id} className="mt-4 p-4 flex justify-between border rounded-lg">
                        <div>
                            <p className='font-semibold'>{address.line1}</p>
                            {address.line2 && <p>{address.line2}</p>}
                            <p>{`${address.city}, ${address.state} ${address.zipCode}`}</p>
                        </div>
                        <div className="flex flex-col">
                            <div onClick={() => handleEditClick(address)} className="border h-7 w-7 bg-green-600 text-white text-sm my-1 px-1 py-1 rounded">
                               <img className='h-full w-full object-cover' src='../edit2.png'/>
                            </div>
                            <div onClick={() => handleRemove(address._id)} className="border h-7 w-7 bg-green-600 text-white text-sm my-1 px-1 py-1 rounded">
                               <img className='h-full w-full object-cover' src='../bin2.png'/>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}