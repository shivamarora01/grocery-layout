"use client"
import React, { createContext, useState, useEffect, useContext } from 'react';
import axiosInstance from '@/services/axiosConfig';
const UriContext = createContext();

export const UriProvider = ({ children }) => {
    const [uri, setUri] = useState('');
    const [termsAndConditionsPolicy, setTermsAndConditionsPolicy] = useState('');


    useEffect(() => {
        fetchUri();
    }, []);

    const fetchUri = async () => {
        console.log("API CALL");
        try {

            const response = await axiosInstance.post('/users/workspace/subdomain', {
                mulltiplyURL: 'berkos',
            });
            const fetchedUri = response.data.data.uri.uri;
            const termsPolicy = response.data.data.termsAndConditionsPolicy;
            // console.log('seller detailsss',response)
            localStorage.setItem('uri', fetchedUri);
            setTermsAndConditionsPolicy(termsPolicy);
            setUri(fetchedUri);
        } catch (error) {
            console.error('Error fetching URI:', error);
        }
    };

    return (
        <UriContext.Provider value={{ uri, setUri, termsAndConditionsPolicy }}>
            {children}
        </UriContext.Provider>
    );
};

export const useUri = () => useContext(UriContext);
