// lib/api.js
import axios from 'axios';
import axiosInstance from '@/services/axiosConfig';

export const fetchTitle = async () => {
  try {
    const domain = window?.location?.hostname;
    const subdomain = domain.split('.')[0];
    const response = await axiosInstance.post(
      "/users/workspace/subdomain",
      {
        mulltiplyURL: subdomain,
      }
    );
    return response?.data?.data?.title; 
  } catch (error) {
    console.error('Error fetching title:', error);
    return 'Default Title'; // Fallback title
  }
};
