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

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/chart/provider/categoriesVisted`);
        if (!response.ok) {
          throw new Error('Failed to fetch category data');
        }
        const data = await response.json();
        if (data.success) {
          setCategoriesData(data.data);
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
        text: 'Category Purchases Over Time',
        color: '#9CA3AF',
        font: {
          size: 16,
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
    return <div className="p-6">Loading category data...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">Error: {error}</div>;
  }

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  
  const data = {
    labels: monthNames,
    datasets: categoriesData.map((category, index) => ({
      label: category.name,
      data: category.months.map(month => month.purchaseCount),
      borderColor: `hsl(${index * 60}, 75%, 50%)`,
      backgroundColor: `hsla(${index * 60}, 75%, 50%, 0.2)`,
      tension: 0.3
    }))
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 ml-4 rounded-lg shadow-sm">
      <Line options={options} data={data} />
    </div>
  );
};

export default CatagoriVisted;
