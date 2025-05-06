import React, { useState, useEffect } from 'react';
import { AiOutlineDollar } from "react-icons/ai";
import { BsFillCalendarDateFill } from "react-icons/bs";

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchSales = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          if (isMounted) {
            setError('No authentication token found. Please log in.');
            setIsLoading(false);
          }
          return;
        }

        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/purchasehistory/sales`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          if (isMounted) {
            setError(errorData.error || 'Failed to fetch sales data');
          }
          return;
        }

        const data = await response.json();
        if (isMounted) {
          setSales(data);
        }
      } catch (error) {
        if (isMounted) {
          setError(error.message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchSales();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
        <strong className="font-bold">Error! </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="table w-full">
        <thead>
          <tr>
            <th>Purchase ID</th>
            <th>Payment</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {sales.map((sale) => (
            <tr key={sale._id}>
              <td>{sale.orderId}</td>
              <td>
                <AiOutlineDollar className="inline-block mr-1" />
                {sale.total}
              </td>
              <td>
                <BsFillCalendarDateFill className="inline-block mr-1" />
                {new Date(sale.createdAt).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Sales;
