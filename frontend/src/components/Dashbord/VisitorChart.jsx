import { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const VisitorChart = () => {
  const [visitorData, setVisitorData] = useState({ newVisitors: 0, oldVisitors: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVisitorData = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/chart/admin/visitors`);
        if (!response.ok) {
          throw new Error('Failed to fetch visitor data');
        }
        const data = await response.json();
        setVisitorData(data.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching visitor data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchVisitorData();
  }, []);

  const data = {
    labels: ['New Visitors', 'Returning Visitors'],
    datasets: [
      {
        data: [visitorData.newVisitors, visitorData.oldVisitors],
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 99, 132, 0.8)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#9CA3AF', 
          padding: 20,
          font: {
            size: 16 // Increased font size
          }
        }
      },
      title: {
        display: true,
        text: 'Visitor Distribution',
        color: '#15803d',
        font: {
          size: 20, // Increased title size
          weight: 'bold'
        },
        padding: {
          top: 10,
          bottom: 20
        }
      }
    },
    cutout: '65%' // Reduced cutout percentage to make chart larger
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 mb-2 ml-4 rounded-lg shadow-sm h-80 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 mb-2 ml-4 rounded-lg shadow-sm h-80 flex flex-col items-center justify-center">
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
    <div className="bg-white dark:bg-gray-800 p-4 mb-2 ml-4 rounded-lg shadow-sm h-80 flex items-center justify-center">
      {visitorData.newVisitors === 0 && visitorData.oldVisitors === 0 ? (
        <p className="text-gray-500">No visitor data available</p>
      ) : (
        <Doughnut data={data} options={options} />
      )}
    </div>
  );
};

export default VisitorChart;
