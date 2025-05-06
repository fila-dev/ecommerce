//  This cardDetails component is for Home page 

import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { MdVerified } from 'react-icons/md';

const CardDetails = ({ cards }) => {
  const { cart, addToCart } = useCart();
  const [notification, setNotification] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Early return if no cards
  if (!cards?.length) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">No products found in this category</p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Try adjusting your search or filter to find what you're looking for.</p>
        </div>
      </div>
    );
  }

  // Helper function to render star rating
  const renderStarRating = (rating) => {
    return [...Array(5)].map((_, i) => (
      <svg 
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'} transition-colors duration-200`}
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M13.8 4.2a2 2 0 0 0-3.6 0L8.4 8.4l-4.6.3a2 2 0 0 0-1.1 3.5l3.5 3-1 4.4c-.5 1.7 1.4 3 2.9 2.1l3.9-2.3 3.9 2.3c1.5 1 3.4-.4 3-2.1l-1-4.4 3.4-3a2 2 0 0 0-1.1-3.5l-4.6-.3-1.8-4.2Z" />
      </svg>
    ));
  };

  // Helper function to format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  // Helper function to check if item is in cart
  const isInCart = (cardId) => {
    return cart.some(item => item._id === cardId);
  };

  const handleAddToCart = (e, card) => {
    e.preventDefault(); // Prevent link navigation when clicking add to cart
    if (!card.availability) return;
    
    addToCart({
      _id: card._id,
      name: card.name,
      price: card.price,
      images: card.images,
      quantity: 1,
      stock: card.stock
    });
    
    setNotification(`${card.name} added to cart`);
    setTimeout(() => setNotification(null), 2000);
  };

  // Add search results message
  const renderSearchMessage = () => {
    const searchParams = new URLSearchParams(window.location.search);
    const searchQuery = searchParams.get('search');
    
    if (searchQuery && cards.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            No products found matching "{searchQuery}"
          </p>
        </div>
      );
    } else if (searchQuery && cards.length > 0) {
      return (
        <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          Showing results for "{searchQuery}"
        </div>
      );
    }
    return null;
  };

  // Add stock status helper function
  const getStockStatus = (quantity) => {
    if (quantity <= 0) return { text: 'Out of Stock', color: 'text-red-500' };
    if (quantity <= 5) return { text: `Only ${quantity} left!`, color: 'text-orange-500' };
    if (quantity <= 10) return { text: `${quantity} in stock`, color: 'text-yellow-500' };
    return { text: 'In Stock', color: 'text-green-500' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {notification && (
        <div className="fixed top-4 right-4 bg-green-500 dark:bg-green-600 text-white px-6 py-3 rounded-lg shadow-xl z-50 animate-fade-in-out transform transition-all duration-300 hover:scale-105">
          <div className="flex items-center space-x-2">
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">{notification}</span>
          </div>
        </div>
      )}
      
      <section className="py-12 antialiased md:py-16">
        <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
          {renderSearchMessage()}
          {/* Filter and Sort Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex gap-4">
              <button 
                data-modal-toggle="filterModal" 
                data-modal-target="filterModal" 
                type="button" 
                className="inline-flex items-center rounded-lg bg-blue-600 dark:bg-blue-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg hover:bg-blue-700 dark:hover:bg-blue-600 focus:ring-4 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                <svg className="mr-2.5 h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M18.796 4H5.204a1 1 0 0 0-.753 1.659l5.302 6.058a1 1 0 0 1 .247.659v4.874a.5.5 0 0 0 .2.4l3 2.25a.5.5 0 0 0 .8-.4v-7.124a1 1 0 0 1 .247-.659l5.302-6.059c.566-.646.106-1.658-.753-1.658Z" />
                </svg>
                Filters
              </button>

              <button 
                id="sortDropdownButton"
                className="inline-flex items-center rounded-lg bg-blue-600 dark:bg-blue-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg hover:bg-blue-700 dark:hover:bg-blue-600 focus:ring-4 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                <svg className="mr-2.5 h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4v16M7 4l3 3M7 4 4 7m9-3h6l-6 6h6m-6.5 10 3.5-7 3.5 7M14 18h4" />
                </svg>
                Sort
              </button>
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {cards.map((card) => (
              <Link 
                to={`/card-info/${card._id}`}
                key={card._id} 
                className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-md transition-all duration-300 hover:shadow-xl hover:translate-y-[-4px]"
              >
                {/* Product Image */}
                <div className="relative h-72 overflow-hidden bg-gray-100 dark:bg-gray-700">
                  <img 
                    className="h-full w-full object-contain p-6 transition-transform duration-500 group-hover:scale-110" 
                    src={card.images && card.images.length > 0 ? card.images[selectedImageIndex] : ''}
                    alt={card.name}
                    loading="lazy"
                  />
                  {card.discount > 0 && (
                    <span className="absolute right-3 top-3 rounded-full bg-red-500 dark:bg-red-600 px-4 py-1.5 text-xs font-bold text-white shadow-lg">
                      {card.discount}% OFF
                    </span>
                  )}
                  {!card.availability && (
                    <div className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-[2px] flex items-center justify-center">
                      <span className="text-white font-bold text-xl">Out of Stock</span>
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                      {card.name}
                    </h2>
                    {card.isVerifiedProvider && (
                      <MdVerified className="h-5 w-5 text-green-500 dark:text-green-400 ml-2" />
                    )}
                  </div>

                  {/* Rating */}
                  <div className="mb-4 flex items-center gap-2">
                    <div className="flex">
                      {renderStarRating(card.rating)}
                    </div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      ({card.reviews})
                    </span>
                  </div>

                  {/* Stock Status */}
                  <div className="mb-2">
                    {card.availability ? (
                      <span className={`text-sm font-medium ${getStockStatus(card.quantity).color}`}>
                        {getStockStatus(card.quantity).text}
                      </span>
                    ) : (
                      <span className="text-sm font-medium text-red-500">
                        Out of Stock
                      </span>
                    )}
                  </div>

                  {/* Price and Cart Button */}
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex flex-col">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatPrice(card.price)}
                      </p>
                      {card.discount > 0 && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-through">
                          {formatPrice(card.price * (1 + card.discount/100))}
                        </p>
                      )}
                    </div>
                    <button 
                      type="button"
                      onClick={(e) => handleAddToCart(e, card)}
                      className={`
                        inline-flex items-center rounded-lg px-4 py-2.5 text-sm font-medium shadow-lg
                        ${!card.availability || card.quantity <= 0 || isInCart(card._id)
                          ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 focus:ring-blue-500'}
                        transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2
                        transform hover:scale-105 active:scale-95
                      `}
                      disabled={!card.availability || card.quantity <= 0 || isInCart(card._id)}
                    >
                      {!card.availability || card.quantity <= 0
                        ? 'Out of Stock' 
                        : isInCart(card._id)
                          ? 'In Cart'
                          : (
                            <>
                              <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              Add to cart
                            </>
                          )}
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default CardDetails;