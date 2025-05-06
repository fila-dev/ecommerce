import React, { useEffect, useState } from 'react';
import { FiUsers } from 'react-icons/fi';
import { BsGraphUp, BsBox } from 'react-icons/bs';
import { AiOutlineEye } from 'react-icons/ai';

const Report = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/chart/admin/report`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        if (data.success) {
          setReportData({
            totalSales: data.data.totalSales || 0,
            totalRevenue: data.data.totalRevenue || 0,
            totalProducts: data.data.totalProducts || 0,
            totalUsers: data.data.totalUsers || 0,
            growth: {
              revenue: data.data.growth?.revenue || 0
            }
          });
        }
      } catch (error) {
        console.error('Error fetching report data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, []);

  const formatNumber = (num) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return <div className="p-6">Loading report data...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">Error: {error}</div>;
  }

  if (!reportData) {
    return <div className="p-6">No report data available</div>;
  }

  return (
    <div className="grid grid-cols-4 gap-4 p-6">
      {/* Total Sales Card */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Total Sales</p>
            <h3 className="text-2xl font-bold">{formatNumber(reportData.totalSales)}</h3>
            <span className="text-green-500 text-sm">+8.1%</span>
          </div>
          <div className="bg-blue-100 p-3 rounded-full">
            <AiOutlineEye className="text-blue-600 text-xl" />
          </div>
        </div>
      </div>

      {/* Total Profit Card */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Total Revenue</p>
            <h3 className="text-2xl font-bold">{formatCurrency(reportData.totalRevenue)}</h3>
            <span className={`${reportData.growth.revenue >= 0 ? 'text-green-500' : 'text-red-500'} text-sm`}>
              {reportData.growth.revenue >= 0 ? '+' : ''}{reportData.growth.revenue}%
            </span>
          </div>
          <div className="bg-green-100 p-3 rounded-full">
            <BsGraphUp className="text-green-600 text-xl" />
          </div>
        </div>
      </div>

      {/* Total Products Card */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Total Products</p>
            <h3 className="text-2xl font-bold">{formatNumber(reportData.totalProducts)}</h3>
            <span className="text-green-500 text-sm">Active</span>
          </div>
          <div className="bg-purple-100 p-3 rounded-full">
            <BsBox className="text-purple-600 text-xl" />
          </div>
        </div>
      </div>

      {/* Total Users Card */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Total Users</p>
            <h3 className="text-2xl font-bold">{formatNumber(reportData.totalUsers)}</h3>
            <span className="text-green-500 text-sm">Active</span>
          </div>
          <div className="bg-orange-100 p-3 rounded-full">
            <FiUsers className="text-orange-600 text-xl" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;
