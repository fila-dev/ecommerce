import { Link, useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <h1 className="text-6xl font-bold text-gray-800 dark:text-gray-200">404</h1>
      <p className="text-xl text-gray-600 dark:text-gray-400 mt-4">Page Not Found</p>
      <p className="text-gray-500 dark:text-gray-500 mt-2">The page you're looking for doesn't exist or has been moved.</p>
      <div className="mt-6 space-x-4">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
        >
          Go Back
        </button>
        <Link
          to="/"
          className="px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;