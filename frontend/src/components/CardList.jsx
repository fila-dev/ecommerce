// this is for home page

import React, { useState, useEffect } from "react";
import { useCardsContext } from "../hooks/useCardsContext";
import { useAuthContext } from "../hooks/useAuthContext";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";

const StarRating = ({ rating }) => (
  <div className="flex items-center gap-2">
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className={`h-4 w-4 ${
            i < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"
          }`}
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M13.8 4.2a2 2 0 0 0-3.6 0L8.4 8.4l-4.6.3a2 2 0 0 0-1.1 3.5l3.5 3-1 4.4c-.5 1.7 1.4 3 2.9 2.1l3.9-2.3 3.9 2.3c1.5 1 3.4-.4 3-2.1l-1-4.4 3.4-3a2 2 0 0 0-1.1-3.5l-4.6-.3-1.8-4.2Z" />
        </svg>
      ))}
    </div>
    <p className="text-sm font-medium text-gray-900 dark:text-white">
      {rating}
    </p>
  </div>
);

const DeleteButton = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute top-2 right-2 p-2 hover:bg-red-100 rounded-full transition-colors duration-200"
    aria-label="Delete product"
  >
    <svg
      className="h-6 w-6 text-red-500"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  </button>
);

const EditButton = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute top-2 right-12 p-2 hover:bg-blue-100 rounded-full transition-colors duration-200"
    aria-label="Edit product"
  >
    <svg
      className="h-6 w-6 text-blue-500"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
      />
    </svg>
  </button>
);

const EditModal = ({ isOpen, onClose, card, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    size: '',
    price: '',
    discount: '',
    store: '',
    quantity: '',
    availability: true,
    fastDelivery: false,
    images: []
  });
  const [previewImages, setPreviewImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (card) {
      setFormData({
        name: card.name || '',
        size: card.size || '',
        price: card.price || '',
        discount: card.discount || '0',
        store: card.store || '',
        quantity: card.quantity || 0,
        availability: card.availability || true,
        fastDelivery: card.fastDelivery || false,
        images: card.images || []
      });
      setPreviewImages(card.images || []);
    }
  }, [card]);

  const validateForm = () => {
    const errors = {};
    if (!formData.name?.trim()) errors.name = 'Name is required';
    if (!formData.size?.trim()) errors.size = 'Size is required';
    if (!formData.price || formData.price <= 0) errors.price = 'Valid price is required';
    if (!formData.store?.trim()) errors.store = 'Store name is required';
    if (formData.quantity < 0) errors.quantity = 'Quantity cannot be negative';
    return errors;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      if (files[0].size > 5 * 1024 * 1024) {
        setValidationErrors(prev => ({
          ...prev,
          images: 'Image size should be less than 5MB'
        }));
        return;
      }
      setFormData(prev => ({ ...prev, images: files }));
      setPreviewImages(files.map(file => URL.createObjectURL(file)));
      setValidationErrors(prev => ({ ...prev, images: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setValidationErrors({});

    try {
      const errors = validateForm();
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        throw new Error('Please fix the validation errors');
      }

      await onSave(formData);
      onClose();
    } catch (error) {
      setValidationErrors(prev => ({
        ...prev,
        submit: error.message
      }));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 w-full max-w-[90vw] max-h-[90vh] overflow-y-auto shadow-2xl transform transition-all duration-300 scale-100">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            Edit Product
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full p-2 transition-colors duration-200"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="Enter product name"
              />
              {validationErrors.name && (
                <p className="text-red-500 text-sm mt-2">{validationErrors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Size</label>
              <input
                type="text"
                name="size"
                value={formData.size}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="Enter size"
              />
              {validationErrors.size && (
                <p className="text-red-500 text-sm mt-2">{validationErrors.size}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Price</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="0.00"
                />
                {validationErrors.price && (
                  <p className="text-red-500 text-sm mt-2">{validationErrors.price}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Discount (%)</label>
                <input
                  type="number"
                  name="discount"
                  value={formData.discount}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Store</label>
                <select
                  name="store"
                  value={formData.store}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                >
                  <option value="" disabled>Select your Store</option>
                  {/* <option value="Addis Ababa">Addis Ababa</option> */}
                  <option value="Adigrat">Adigrat</option>
                  <option value="Adwa">Adwa</option>
                  <option value="Alamata">Alamata</option>
                  <option value="Axum">Axum</option>
                  <option value="Bizet">Bizet</option>
                  <option value="Dansha">Dansha</option>
                  {/* <option value="Debre Berhan">Debre Berhan</option> */}
                  {/* <option value="Dessie">Dessie</option> */}
                  <option value="Enticho">Enticho</option>
                  <option value="Humera">Humera</option>
                  {/* <option value="Kombolcha">Kombolcha</option> */}
                  <option value="Korem">Korem</option>
                  <option value="Maychew">Maychew</option>
                  <option value="Maykadra">Maykadra</option>
                  <option value="Mekelle">Mekelle</option>
                  <option value="Shire (Indasilassie)">Shire (Indasilassie)</option>
                  {/* <option value="Woldiya">Woldiya</option> */}
                  <option value="Wukro">Wukro</option>
                </select>
                {validationErrors.store && (
                  <p className="text-red-500 text-sm mt-2">{validationErrors.store}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="0"
                />
                {validationErrors.quantity && (
                  <p className="text-red-500 text-sm mt-2">{validationErrors.quantity}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="availability"
                  checked={formData.availability}
                  onChange={handleInputChange}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition duration-150"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Available</span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="fastDelivery"
                  checked={formData.fastDelivery}
                  onChange={handleInputChange}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition duration-150"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Fast Delivery</span>
              </label>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Update Image</label>
              <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-500 transition-colors duration-200">
                <div className="space-y-2 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                      <span>Upload a file</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="sr-only"
                        multiple
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                </div>
              </div>
              {validationErrors.images && (
                <p className="text-red-500 text-sm mt-2">{validationErrors.images}</p>
              )}
              {previewImages.length > 0 && (
                <div className="mt-4">
                  <div className="grid grid-cols-3 gap-4">
                    {previewImages.map((preview, index) => (
                      <div key={index} className="relative">
                        <img 
                          src={preview} 
                          alt={`Preview ${index + 1}`} 
                          className="h-32 w-full object-cover rounded-lg border-2 border-gray-300 shadow-lg hover:shadow-xl transition-shadow duration-300" 
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewImages(prev => prev.filter((_, i) => i !== index));
                            setFormData(prev => ({
                              ...prev,
                              images: prev.images.filter((_, i) => i !== index)
                            }));
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors duration-200"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {validationErrors.submit && (
              <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded">
                <p className="text-red-700">{validationErrors.submit}</p>
              </div>
            )}

            <div className="flex justify-end gap-4 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

const CardList = ({ onUpdateSuccess, refreshCards }) => {
  const { cards, dispatch } = useCardsContext();
  const { user } = useAuthContext();
  const [editingCard, setEditingCard] = useState(null);
  const [error, setError] = useState(null);

  const handleSaveEdit = async (updatedData) => {
    try {
      const formData = new FormData();
      
      // Append all form fields to FormData
      Object.keys(updatedData).forEach(key => {
        if (key === 'images' && updatedData[key].length > 0) {
          updatedData[key].forEach((file, index) => {
            formData.append('images', file);
          });
        } else {
          // Convert boolean values to strings
          if (typeof updatedData[key] === 'boolean') {
            formData.append(key, updatedData[key].toString());
          } else {
            formData.append(key, updatedData[key]);
          }
        }
      });

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/cards/${editingCard._id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
          body: formData
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update product");
      }

      const json = await response.json();
      
      // Update local state
      dispatch({ type: "UPDATE_CARD", payload: json });
      
      // Close the modal
      setEditingCard(null);
      
      // Refresh the entire list
      await refreshCards();
      
      // Show success message
      onUpdateSuccess("Product updated successfully!");
    } catch (err) {
      console.error("Update error:", err);
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/cards/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (response.ok) {
        dispatch({ type: 'DELETE_CARD', payload: { _id: id } });
        // Refresh the list after deletion
        await refreshCards();
        onUpdateSuccess("Product deleted successfully!");
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const handleEdit = (e, card) => {
    e.preventDefault();
    setEditingCard(card);
  };

  if (!cards) {
    return <div className="text-center py-4">Loading products...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 py-4">{error}</div>;
  }

  return (
    <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Products List
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {cards?.map((card) => (
          <Link to={`/product/${card._id}`} key={card._id}>
            <article
              className="relative border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 rounded-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
            >
              <div className="h-56 w-full aspect-w-16 aspect-h-9 bg-gray-100 dark:bg-gray-800">
                <img
                  className="w-full h-full object-contain p-4"
                  src={card.images && card.images.length > 0 ? card.images[0] : ''}
                  alt={card.name}
                  loading="lazy"
                />
              </div>

              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {card.name}
                  </h3>
                  {card.discount > 0 && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                      {card.discount}% OFF
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <StarRating rating={card.rating} />
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    ({card.reviews} reviews)
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${card.price}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {card.createdAt &&
                      formatDistanceToNow(new Date(card.createdAt), {
                        addSuffix: true,
                      })}
                  </p>
                </div>

                <EditButton onClick={(e) => handleEdit(e, card)} />
                <DeleteButton onClick={(e) => {
                  e.preventDefault();
                  handleDelete(card._id);
                }} />
              </div>
            </article>
          </Link>
        ))}
      </div>

      <EditModal
        isOpen={!!editingCard}
        onClose={() => setEditingCard(null)}
        card={editingCard}
        onSave={handleSaveEdit}
      />
    </section>
  );
};

export default CardList;
