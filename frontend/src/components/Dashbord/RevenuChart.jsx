import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Daily Revenue Chart',
      color: '#15803d'
    },
  },
  scales: {
    x: {
      title: {
        display: true,
        text: 'Days of Week'
      }
    },
    y: {
      title: {
        display: true,
        text: 'Revenue'
      }
    }
  }
};

const labels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function RevenueChart() {
  const [chartData, setChartData] = useState({
    labels,
    datasets: [
      {
        label: 'Revenue (Without Tax)',
        data: [],
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
      },
      {
        label: 'Revenue (With Tax)',
        data: [],
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/chart/admin/revenue-daily`);
        if (!response.ok) {
          throw new Error('Failed to fetch revenue data');
        }
        const data = await response.json();
        
        if (data.success) {
          const dailyRevenue = labels.map(day => {
            const dayData = data.data.find(d => d.day === day.toLowerCase());
            return dayData ? dayData.revenue : 0;
          });
          const dailyRevenueWithTax = labels.map(day => {
            const dayData = data.data.find(d => d.day === day.toLowerCase());
            return dayData ? dayData.revenue + (dayData.tax || 0) : 0;
          });

          setChartData({
            labels,
            datasets: [
              {
                label: 'Revenue (Without Tax)',
                data: dailyRevenue,
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
              },
              {
                label: 'Revenue (With Tax)',
                data: dailyRevenueWithTax,
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
              }
            ]
          });
        }
      } catch (error) {
        console.error('Error fetching revenue data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueData();
  }, []);
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 h-80 rounded-lg p-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 h-80 rounded-lg p-4 flex flex-col items-center justify-center">
        <p className="text-red-500 mb-4">Error: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 h-80 rounded-lg p-4">
      <Bar options={options} data={chartData} />
    </div>
  );
}
