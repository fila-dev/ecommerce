import React, { useState, useEffect, useContext } from "react";
import { Link, useParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { formatDistanceToNow } from "date-fns";

const ImageGalleryModal = ({ isOpen, onClose, images, currentIndex, onImageChange }) => {
  // Add keyboard event handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      
      switch(e.key) {
        case 'ArrowLeft':
          onImageChange((currentIndex - 1 + images.length) % images.length);
          break;
        case 'ArrowRight':
          onImageChange((currentIndex + 1) % images.length);
          break;
        case 'Escape':
          onClose();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, images.length, onImageChange, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image Gallery"
    >
      <div className="relative max-w-4xl w-full mx-4" onClick={e => e.stopPropagation()}>
        {/* Main Image */}
        <div className="relative">
          <img
            src={images[currentIndex]}
            alt={`Gallery image ${currentIndex + 1} of ${images.length}`}
            className="w-full h-[70vh] object-contain"
          />
          
          {/* Navigation Buttons */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onImageChange((currentIndex - 1 + images.length) % images.length);
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
            aria-label="Previous image"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onImageChange((currentIndex + 1) % images.length);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
            aria-label="Next image"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
            aria-label="Close gallery"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Image Counter */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-full">
            {currentIndex + 1} / {images.length}
          </div>
        </div>

        {/* Thumbnails */}
        <div className="flex justify-center gap-2 mt-4 overflow-x-auto py-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                onImageChange(index);
              }}
              className={`w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                index === currentIndex ? 'border-blue-500' : 'border-transparent'
              }`}
              aria-label={`View image ${index + 1}`}
              aria-current={index === currentIndex ? 'true' : 'false'}
            >
              <img
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const CardInfo = () => {
  const [comment, setComment] = useState("");
  const [reportType, setReportType] = useState("none");
  const [rating, setRating] = useState(5);
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { id } = useParams();
  const { user, dispatch } = useContext(AuthContext);

  useEffect(() => {
    const fetchCardInfo = async () => {
      if (!user?.token) {
        setError("Unauthorized access. Please log in.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          // `${import.meta.env.VITE_API_BASE_URL}/api/cards/${id}/info`,
           `${import.meta.env.VITE_API_BASE_URL}/api/cards/${id}/info`,
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch card information");
        }

        const data = await response.json();
        console.log('Card Data:', data); // Debug log
        setCard(data);
        setReviews(data.reviews || []);
        // Store the card ID in user context when viewing a card
        dispatch({ type: 'SET_SELECTED_CARD', payload: data._id });
      } catch (err) {
        console.error("Error fetching card info:", err);
        setError(err.message || "An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchCardInfo();
  }, [id, user, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.token) {
      setError("Unauthorized. Please log in.");
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/ratingandreview/${id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({
            itemId: id,
            reportType,
            rating: Number(rating),
            comment: comment.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit review");
      }

      // Refresh the card info to get updated ratings
      const cardResponse = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/cards/${id}/info`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      if (cardResponse.ok) {
        const cardData = await cardResponse.json();
        setCard(cardData);
        setReviews(cardData.reviews || []);
      }

      // Reset form
      setComment("");
      setRating(5);
      setReportType("none");
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to submit review");
    }
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);

  const renderStarRating = (rating, isClickable = false, onClick = null) =>
    [...Array(5)].map((_, i) => (
      <div
        key={i}
        className="relative inline-block"
        onClick={() => isClickable && onClick && onClick(i + 1)}
      >
        <svg
          className={`h-8 w-8 sm:h-10 sm:w-10 ${
            i < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"
          } ${
            isClickable ? "cursor-pointer hover:text-yellow-400" : ""
          } transition-colors duration-200`}
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M13.8 4.2a2 2 0 0 0-3.6 0L8.4 8.4l-4.6.3a2 2 0 0 0-1.1 3.5l3.5 3-1 4.4c-.5 1.7 1.4 3 2.9 2.1l3.9-2.3 3.9 2.3c1.5 1 3.4-.4 3-2.1l-1-4.4 3.4-3a2 2 0 0 0-1.1-3.5l-4.6-.3-1.8-4.2Z" />
        </svg>
        {isClickable && (
          <div className="absolute inset-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 opacity-0 hover:opacity-20 transition-opacity duration-200" />
        )}
      </div>
    ));

  const renderRatingStats = () => {
    if (!card?.rating) return null;

    return (
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <div className="flex">
            {renderStarRating(card.rating.average)}
          </div>
          <span className="text-gray-400">
            ({card.rating.total} {card.rating.total === 1 ? 'review' : 'reviews'})
          </span>
        </div>
        
        {/* Rating Distribution */}
        <div className="mt-2 space-y-1">
          {Object.entries(card.rating.distribution)
            .sort(([a], [b]) => Number(b) - Number(a))
            .map(([stars, count]) => (
              <div key={stars} className="flex items-center gap-2">
                <span className="w-12 text-sm text-gray-400">{stars} stars</span>
                <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400"
                    style={{
                      width: `${card.rating.total ? (count / card.rating.total) * 100 : 0}%`
                    }}
                  />
                </div>
                <span className="w-8 text-sm text-gray-400">{count}</span>
              </div>
            ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="text-white text-center text-xl">Loading...</div>;
  }

  if (error) {
    return (
      <div className="text-red-500 text-center text-xl">Error: {error}</div>
    );
  }

  if (!card) {
    return <div className="text-white text-center text-xl">No card found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-900 text-white">
      <div className="grid md:grid-cols-3 gap-8">
        {/* First Grid: Card Image */}
        <div className="md:col-span-1 flex flex-col items-center space-y-4">
          <div className="relative w-full">
            <img
              src={card.images && card.images.length > 0 ? card.images[currentImageIndex] : ''}
              alt={card.name}
              className="w-full max-w-[80%] h-auto rounded-lg shadow-lg cursor-pointer hover:opacity-90 transition-opacity mx-auto"
              onClick={() => setIsGalleryOpen(true)}
            />
          </div>

          {/* Image Navigation Dots */}
          {card.images && card.images.length > 1 && (
            <div className="flex justify-center gap-2">
              {card.images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentImageIndex 
                      ? 'bg-blue-500 scale-125' 
                      : 'bg-gray-400 hover:bg-gray-300'
                  }`}
                />
              ))}
            </div>
          )}

          <div className="text-center space-y-2">
            {card.provider && (
              <div>
                <span className="text-lg text-gray-400">By: </span>
                <Link 
                  to={`/contact/${card.provider.email}`}
                  className="text-lg text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {card.provider.name}
                </Link>
              </div>
            )}
            <div>
              <span className="text-lg text-gray-400">Store: </span>
              <span className="text-lg text-white">{card.store}</span>
            </div>
          </div>
        </div>

        {/* Second Grid: Card Information, Rate, and Review */}
        <div className="md:col-span-1 space-y-8">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <h1 className="text-3xl font-bold text-white">{card.name}</h1>
            </div>
            {renderRatingStats()}
            <p className="text-2xl font-semibold text-blue-400 mb-4">
              {formatPrice(card.price)}
              {card.discount !== "0%" && (
                <span className="ml-2 text-sm text-red-500">
                  {card.discount}
                </span>
              )}
            </p>
            <div className="mb-4 space-y-2">
              <p className="font-medium text-gray-300">Size: {card.size}</p>
              <p className="font-medium text-gray-300">
                Availability: {card.availability ? "In Stock" : "Out of Stock"}
              </p>
              {card.fastDelivery && (
                <p className="text-green-400 font-medium">
                  Fast Delivery Available
                </p>
              )}
            </div>
          </div>

          {/* Combined Review and Report Form */}
          <div className="space-y-8 bg-gray-800 p-6 rounded-lg">
            <div>
              <h3 className="text-xl font-semibold mb-4 text-white">
                Review & Report
              </h3>

              {/* Unified Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Report Type Section */}
                <div>
                  <label
                    htmlFor="reportType"
                    className="block mb-2 text-gray-300"
                  >
                    Type of Report
                  </label>
                  <select
                    id="reportType"
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    className="w-full p-2 border rounded bg-gray-700 text-white"
                  >
                    <option value="none">No Report</option>
                    <option value="scam">Scam Report</option>
                    <option value="missing">Missing Item</option>
                    <option value="fake">Fake Product</option>
                  </select>
                </div>

                {/* Rating Section */}
                <div>
                  <label className="block mb-2 text-gray-300">
                    Rating our Product
                  </label>
                  <div className="flex">
                    {renderStarRating(rating, true, setRating)}
                  </div>
                </div>

                {/* Comment Section */}
                <div>
                  <label htmlFor="comment" className="block mb-2 text-gray-300">
                    Comment
                  </label>
                  <textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full p-2 border rounded bg-gray-700 text-white"
                    rows="4"
                    required
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full transition-colors"
                >
                  Submit
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Third Grid: All Reviews */}
        <div className="md:col-span-1 bg-gray-800 p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4 text-white">
            Customer Reviews
          </h2>
          {reviews.length === 0 ? (
            <p className="text-gray-400">No reviews yet</p>
          ) : (
            reviews.map((review) => (
              <div key={review._id} className="border-b border-gray-700 py-4">
                <div className="flex items-center mb-2">
                  {renderStarRating(review.rating)}
                </div>
                <p className="text-gray-300">{review.comment}</p>
                <p className="text-sm text-gray-400 mt-2">
                  By:{" "}
                  {review.user?.email || review.user?.firstName || "Anonymous"}
                  <span className="ml-2 text-gray-500">
                    ({review.reportType || "No type specified"})
                  </span>
                  <span className="ml-2 text-gray-500">
                    {formatDistanceToNow(new Date(review.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Image Gallery Modal */}
      <ImageGalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        images={card?.images || []}
        currentIndex={currentImageIndex}
        onImageChange={setCurrentImageIndex}
      />
    </div>
  );
};

export default CardInfo;
