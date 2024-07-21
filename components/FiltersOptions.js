"use client"
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Item_url, Base_url } from '@/constants/Links'
import { useStateContext, StateProvider } from '@/context/StateContext'
import axiosInstance from '@/services/axiosConfig'
import Main4 from './mainpage4'

function FiltersOptions() {
  const [sortingOptions, setSortingOptions] = useState()
  const [offerId, setOfferId] = useState(null)
  const {cartCount, increaseCartCount, decreaseCartCount, setShowNav, showSortingOptions, setShowCheckout, categoryIdForSorting,setCategoryIdForSorting, choosenSortMethod, setChoosenSortMethod, setShowSortingOptions, setFilterData, filterData,  showItem, setShowItem , ItemId, setItemId,  setShowCart, totalCartPrice, setTotalCartPrice } = useStateContext()
  useEffect(()=>{
    fetchSortingOptions();
  },[])

  const fetchSortingOptions = async () => {
    try {
      const uri = localStorage.getItem("uri");
      const response = await axios.get(`https://api.mulltiply.com/sort-filter-new?module=SELL_OFFER&uri=${uri}`);
      setSortingOptions(response?.data?.data);
    } catch (error) {
      console.error("Error while fetching filters", error);
    }
  } 

  const handleRemoveItem = () => {
    setShowCart(true)
    setShowSortingOptions(false)
  }
  
  const handleSort = (sortBy , sortDirection, label) => {
    const SortingData = async () => {
        try {
          const uri = localStorage.getItem("uri");
          const response = await axios.get(`https://api.mulltiply.com/offers/active-offers/${uri}?item.categoriesTree=${categoryIdForSorting}&item.categoriesTree=${categoryIdForSorting}&sortBy=${sortBy}&sortDirection=${sortDirection}&page=1&limit=50`);
          setFilterData(response?.data?.data);
        } catch (error) {
          console.error("Error while fetching filters", error);
        }
      } 
      SortingData()
      setShowCart(true)
      setShowSortingOptions(false)
      setChoosenSortMethod(label)
  }

  return (
    <div>
      {
       showSortingOptions && (
          <div className='fixed bottom-0 z-40 h-screen w-full animate-slideIn'>
            <div className='flex flex-col h-full w-full'>
              <div className='h-[60%] flex items-center justify-center bg-zinc-800 flex justify-center opacity-70 w-full'>
                <div className='h-9 w-9 bg-zinc-750 rounded-3xl' onClick={() => handleRemoveItem()}>
                  <img className='h-full w-full object-cover' src='../cut.png' />
                </div>
              </div>
              <div className='h-[40%] bg-white p-2'>
                <p className='text-xl font-semibold p-3 border-b border-1 border-solid'>Sort By</p>
             <div>
        {
          sortingOptions.map((sort,index)=>(
                (sort.type == "sort") ? (
                    <div key={index} className='mx-1 my-2 flex items-center'>
                    <label className='ml-1 pr-5' onClick={() => handleSort(sort.field, sort.values[0], sort.label)}>
                    <input type="radio" name="sort" className='' value="id" />
                    <span className='ml-2'>{sort.label}</span>
                  </label>
                  </div>
                ): null
          ))
        }
        </div>  
        </div>
            </div>
          </div>
      )}
    </div>
  )
}

export default FiltersOptions
