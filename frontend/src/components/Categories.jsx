import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSmartphone, FiShoppingBag, FiBook, FiHome, FiMonitor, FiWatch, FiMusic, FiTv, FiHeart, FiWifi, FiPrinter, FiSmartphone as FiPhone, FiClock, FiPrinter as FiPrint, FiMonitor as FiProjector, FiHeart as FiSkinCare, FiCamera, FiBriefcase, FiBox } from 'react-icons/fi';

// Categories component that displays a grid of category buttons
// Props:
// - onSelectCategory: Callback function when a category is selected
// - selectedCategory: Currently selected category name
const Categories = ({ onSelectCategory, selectedCategory }) => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]); // Stores fetched categories
  const [loading, setLoading] = useState(true); // Loading state for API call
  const [showAll, setShowAll] = useState(false); // Toggle between showing all or limited categories
  const [selectedTags, setSelectedTags] = useState([]);

  // Modified fetch to include tag filtering
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const tagsQuery = selectedTags.length > 0 ? `?tags=${selectedTags.join(',')}` : '';
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/categories${tagsQuery}`);
        const data = await response.json();
        if (response.ok) {
          setCategories(data.map(cat => ({
            id: cat._id,
            name: cat.name,
            icon: getCategoryIcon(cat.name),
            color: getCategoryColor(cat.name),
            tags: cat.tags || []
          })));
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [selectedTags]);

  // Map category names to their corresponding icons
  const getCategoryIcon = (name) => {
    const icons = {
      'All': <FiBox className="w-6 h-6" />,
      'Electronics': <FiSmartphone className="w-6 h-6" />,
      'Fashion': <FiShoppingBag className="w-6 h-6" />,
      'Books': <FiBook className="w-6 h-6" />,
      'Home & Living': <FiHome className="w-6 h-6" />,
      'Computers': <FiMonitor className="w-6 h-6" />,
      'Watches': <FiWatch className="w-6 h-6" />,
      'Music': <FiMusic className="w-6 h-6" />,
      'TV & Audio': <FiTv className="w-6 h-6" />,
      'Health': <FiHeart className="w-6 h-6" />,
      'Smart Home': <FiWifi className="w-6 h-6" />,
      'Office': <FiPrint className="w-6 h-6" />,
      'Phones': <FiPhone className="w-6 h-6" />,
      'Accessories': <FiClock className="w-6 h-6" />,
      'Projectors': <FiProjector className="w-6 h-6" />,
      'Beauty': <FiSkinCare className="w-6 h-6" />,
      'Cameras': <FiCamera className="w-6 h-6" />,
      'Business': <FiBriefcase className="w-6 h-6" />
    };
    return icons[name] || <FiBox className="w-6 h-6" />; // Default to box icon if category not found
  };

  // Map category names to their background colors
  const getCategoryColor = (name) => {
    const colors = {
      'Electronics': 'bg-blue-500',
      'Fashion': 'bg-pink-500',
      'Books': 'bg-yellow-500',
      'Home & Living': 'bg-green-500',
      'Computers': 'bg-purple-500',
      'Watches': 'bg-indigo-500',
      'Music': 'bg-red-500',
      'TV & Audio': 'bg-teal-500',
      'Health': 'bg-rose-500',
      'Smart Home': 'bg-cyan-500',
      'Office': 'bg-orange-500',
      'Phones': 'bg-sky-500',
      'Accessories': 'bg-amber-500',
      'Projectors': 'bg-violet-500',
      'Beauty': 'bg-fuchsia-500',
      'Cameras': 'bg-emerald-500',
      'Business': 'bg-lime-500'
    };
    return colors[name] || 'bg-gray-500'; // Default to gray if category not found
  };

  // Handle category button clicks
  const handleCategoryClick = (categoryName) => {
    if (categoryName === selectedCategory) {
      // Deselect category if clicking the currently selected one
      onSelectCategory('');
      navigate('/');
    } else {
      // Select new category and update URL
      onSelectCategory(categoryName);
      navigate(`/?category=${categoryName.toLowerCase()}`);
    }
  };

  // Calculate number of categories to show based on screen size
  const getInitialCategoriesToShow = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth >= 1024) return 7; // lg screens
      if (window.innerWidth >= 768) return 4;  // md screens
      if (window.innerWidth >= 640) return 3;  // sm screens
      return 2; // xs screens
    }
    return 4; // Default fallback
  };

  // Show categories based on showAll state and screen size
  const displayedCategories = showAll ? categories : categories.slice(0, getInitialCategoriesToShow());

  // Add tag filter handler
  const handleTagFilter = (tag) => {
    setSelectedTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag);
      }
      return [...prev, tag];
    });
  };

  return (
    <section className="bg-gray-50 py-0 antialiased dark:bg-gray-900 md:py-0">
      <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
        {/* Header section */}
        <div className="mb-4 flex flex-col gap-4 md:mb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
              Shop by category
            </h2>
            
            {categories.length > getInitialCategoriesToShow() && (
              <button 
                onClick={() => setShowAll(!showAll)}
                className="flex items-center text-base font-medium text-gray-900 dark:text-white text-primary-700 hover:underline dark:text-primary-500"
              >
                {showAll ? 'Show less' : 'See more categories'}
                <svg className={`ms-1 h-5 w-5 transform transition-transform ${showAll ? 'rotate-180' : ''}`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 12H5m14 0-4 4m4-4-4-4" />
                </svg>
              </button>
            )}
          </div>

          {/* Tags filter */}
          <div className="flex flex-wrap gap-2">
            {Array.from(new Set(categories.flatMap(cat => cat.tags))).map(tag => (
              <button
                key={tag}
                onClick={() => handleTagFilter(tag)}
                className={`
                  px-3 py-1 rounded-full text-sm font-medium
                  transition-all duration-200
                  ${selectedTags.includes(tag)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}
                `}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Categories grid */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {/* "All" category button */}
          <button
            onClick={() => handleCategoryClick('All')}
            className={`
              flex items-center rounded-lg border border-gray-200 
              bg-white px-4 py-2 hover:bg-gray-50 
              dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 
              transition-all duration-200
              ${selectedCategory === 'All' 
                ? 'ring-2 ring-primary-500 shadow-md' 
                : ''}
            `}
          >
            <div className="bg-gray-500 p-2 rounded-full text-white me-2">
              <FiBox className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              All
            </span>
          </button>
          {/* Map through and display category buttons */}
          {displayedCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.name)}
              className={`
                flex flex-col gap-2 rounded-lg border border-gray-200 
                bg-white p-4 hover:bg-gray-50 
                dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 
                transition-all duration-200
                ${selectedCategory === category.name 
                  ? 'ring-2 ring-primary-500 shadow-md' 
                  : ''}
              `}
            >
              <div className="flex items-center">
                <div className={`${category.color} p-2 rounded-full text-white me-2`}>
                  {category.icon}
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {category.name}
                </span>
              </div>
              {category.tags && category.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {category.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;