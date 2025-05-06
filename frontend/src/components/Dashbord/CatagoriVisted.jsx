import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const CatagoriVisted = () => {
  const [categoriesData, setCategoriesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('6months'); // Added period selection state

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/chart/admin/categoriesVisted?period=${selectedPeriod}`);
        if (!response.ok) {
          throw new Error('Failed to fetch category data');
        }
        const data = await response.json();
        console.log('API Response:', data); // Debug log
        
        if (data.success && data.data) {
          console.log('Raw Data:', data.data); // Debug log
          
          // Sort categories by total purchases and take top 3-4
          const sortedCategories = data.data.sort((a, b) => {
            const totalA = a.months.reduce((sum, month) => sum + month.purchaseCount, 0);
            const totalB = b.months.reduce((sum, month) => sum + month.purchaseCount, 0);
            return totalB - totalA;
          }).slice(0, 4);
          
          console.log('Processed Data:', sortedCategories); // Debug log
          setCategoriesData(sortedCategories);
        } else {
          throw new Error('No data available');
        }
      } catch (error) {
        console.error('Error fetching category data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const options = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#9CA3AF',
          padding: 20,
          font: {
            size: 14
          }
        }
      },
      title: {
        display: true,
        text: 'Top Categories Purchases Over Time',
        color: '#365314',
        font: {
          size: 20,
          weight: 'bold'
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(156, 163, 175, 0.1)'
        },
        ticks: {
          color: '#9CA3AF'
        }
      },
      x: {
        grid: {
          color: 'rgba(156, 163, 175, 0.1)'
        },
        ticks: {
          color: '#9CA3AF'
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-lg">
        <p className="text-red-600">Error: {error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded"
        >
          Try Again
        </button>
      </div>
    );
  }

  const monthNames = {
    '6months': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    '3months': ['Apr', 'May', 'Jun'],
    '1month': ['Jun']
  }[selectedPeriod];
  
  const data = {
    labels: monthNames,
    datasets: categoriesData.map((category, index) => ({
      label: category.name,
      data: category.months.map(month => month.purchaseCount),
      borderColor: `hsl(${index * 90}, 75%, 50%)`,
      backgroundColor: `hsla(${index * 90}, 75%, 50%, 0.2)`,
      tension: 0.3
    }))
  };

  console.log('Chart Data:', data); // Debug log

  return (
    <div className="bg-white dark:bg-gray-800 p-6 ml-4 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Category Visits
        </h3>
        <select 
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="px-3 py-1 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600"
        >
          <option value="6months">Last 6 Months</option>
          <option value="3months">Last 3 Months</option>
          <option value="1month">Last Month</option>
        </select>
      </div>
      <Line options={options} data={data} />
    </div>
  );
};

export default CatagoriVisted;
