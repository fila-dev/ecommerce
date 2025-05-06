import React, { useState, useEffect } from 'react';
import { useCardsContext } from '../hooks/useCardsContext';
import { useAuthContext } from '../hooks/useAuthContext';

const SuccessModal = ({ isOpen, onClose, message }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]" 
             onClick={onClose}
        >
            <div 
                className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full mx-4 transform transition-all duration-300 ease-in-out"
                onClick={e => e.stopPropagation()} // Prevent modal from closing when clicking inside
            >
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                        <svg 
                            className="h-6 w-6 text-green-600" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth="2" 
                                d="M5 13l4 4L19 7" 
                            />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Success!
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {message}
                    </p>
                </div>
                <div className="mt-5">
                    <button
                        onClick={onClose}
                        className="w-full inline-flex justify-center rounded-md border border-transparent 
                                 shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white 
                                 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
                                 focus:ring-green-500 sm:text-sm transition-colors duration-200"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

const CardForm = ({ onSuccess }) => {
    const { dispatch } = useCardsContext();
    const { user } = useAuthContext();
    const [categories, setCategories] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        size: '',
        price: '',
        images: [],
        discount: '0',
        quantity: '0',
        availability: true,
        fastDelivery: false,
        store: '',
        category: ''
    });
    const [error, setError] = useState(null);
    const [emptyFields, setEmptyFields] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/categories`, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    }
                });
                const json = await response.json();
                if (response.ok) {
                    setCategories(json);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        if (user) {
            fetchCategories();
        }
    }, [user]);

    const handleInputChange = (e) => {
        const { id, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        
        // Validate number of files
        if (files.length > 5) {
            setError('Maximum 5 images allowed');
            return;
        }

        // Validate file sizes and types
        const validFiles = files.filter(file => {
            if (file.size > 5 * 1024 * 1024) {
                setError('Each image must be less than 5MB');
                return false;
            }
            if (!file.type.startsWith('image/')) {
                setError('Only image files are allowed');
                return false;
            }
            return true;
        });

        if (validFiles.length === 0) {
            return;
        }

        // Create preview URLs
        const previews = validFiles.map(file => URL.createObjectURL(file));
        setImagePreviews(previews);
        setFormData(prev => ({ ...prev, images: validFiles }));
        setError(null);
    };

    const removeImage = (index) => {
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const validateForm = () => {
        const newEmptyFields = [];
        const requiredFields = ['name', 'size', 'price', 'category', 'quantity', 'store'];
        
        requiredFields.forEach(field => {
            if (!formData[field]) newEmptyFields.push(field);
        });

        if (formData.images.length === 0) {
            newEmptyFields.push('images');
        }

        if (formData.price && isNaN(Number(formData.price))) {
            setError('Price must be a valid number');
            return false;
        }

        if (formData.discount && (isNaN(Number(formData.discount)) || Number(formData.discount) < 0 || Number(formData.discount) > 100)) {
            setError('Discount must be a number between 0 and 100');
            return false;
        }

        if (formData.quantity && (isNaN(Number(formData.quantity)) || Number(formData.quantity) < 0)) {
            setError('Quantity must be a positive number');
            return false;
        }

        if (newEmptyFields.length > 0) {
            setEmptyFields(newEmptyFields);
            setError('Please fill in all required fields');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setEmptyFields([]);
        setIsLoading(true);

        if (!user) {
            setError('Please login to add a product');
            setIsLoading(false);
            return;
        }

        if (!validateForm()) {
            setIsLoading(false);
            return;
        }

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            formDataToSend.append('size', formData.size);
            formDataToSend.append('price', formData.price);
            formDataToSend.append('discount', formData.discount);
            formDataToSend.append('quantity', formData.quantity);
            formDataToSend.append('availability', formData.availability);
            formDataToSend.append('fastDelivery', formData.fastDelivery);
            formDataToSend.append('store', formData.store);
            formDataToSend.append('category', formData.category);

            // Append each image file
            formData.images.forEach((image, index) => {
                formDataToSend.append('images', image);
            });

            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/cards`, {
                method: 'POST',
                body: formDataToSend,
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            const json = await response.json();

            if (!response.ok) {
                throw new Error(json.error || 'Failed to create card');
            }

            setFormData({
                name: '',
                size: '',
                price: '',
                images: [],
                discount: '0',
                quantity: '0',
                availability: true,
                fastDelivery: false,
                store: '',
                category: ''
            });
            setImagePreviews([]);
            dispatch({ type: 'CREATE_CARD', payload: json });
            onSuccess('Product added successfully!');

        } catch (error) {
            console.error('Error submitting form:', error);
            setError(error.message || 'Failed to connect to server');
        } finally {
            setIsLoading(false);
        }
    };

    const getInputClassName = (fieldName) => `
        mt-1 block w-full rounded-lg border 
        ${emptyFields.includes(fieldName) ? 'border-red-500' : 'border-gray-300'} 
        p-2 text-sm focus:border-primary-500 focus:ring-primary-500 
        dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400
        ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
    `;

    return (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Add New Product</h2>
            
            <div className="space-y-6">
                {/* Group basic info */}
                <div className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Product Name *
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            disabled={isLoading}
                            className={getInputClassName('name')}
                            placeholder="Enter product name"
                        />
                    </div>

                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Category *
                        </label>
                        <select
                            id="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            disabled={isLoading}
                            className={getInputClassName('category')}
                        >
                            <option value="">Select a category</option>
                            {categories.map(category => (
                                <option key={category._id} value={category._id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="size" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Size *
                        </label>
                        <input
                            type="text"
                            id="size"
                            value={formData.size}
                            onChange={handleInputChange}
                            disabled={isLoading}
                            className={getInputClassName('size')}
                            placeholder="Enter size"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Price *
                            </label>
                            <input
                                type="number"
                                id="price"
                                value={formData.price}
                                onChange={handleInputChange}
                                disabled={isLoading}
                                className={getInputClassName('price')}
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                            />
                        </div>

                        <div>
                            <label htmlFor="discount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Discount %
                            </label>
                            <input
                                type="number"
                                id="discount"
                                value={formData.discount}
                                onChange={handleInputChange}
                                disabled={isLoading}
                                className={getInputClassName('discount')}
                                min="0"
                                max="100"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Quantity *
                            </label>
                            <input
                                type="number"
                                id="quantity"
                                value={formData.quantity}
                                onChange={handleInputChange}
                                disabled={isLoading}
                                className={getInputClassName('quantity')}
                                min="0"
                                placeholder="Enter quantity"
                            />
                        </div>

                        <div>
                            <label htmlFor="store" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Store *
                            </label>
                            <select
                                id="store"
                                name="store"
                                value={formData.store}
                                onChange={handleInputChange}
                                disabled={isLoading}
                                className={getInputClassName('store')}
                            >
                                <option value="" disabled>Select your Store</option>
                                <option value="Addis Ababa">Addis Ababa</option>
                                <option value="Adigrat">Adigrat</option>
                                <option value="Adwa">Adwa</option>
                                <option value="Alamata">Alamata</option>
                                <option value="Axum">Axum</option>
                                <option value="Bizet">Bizet</option>
                                <option value="Dansha">Dansha</option>
                                <option value="Debre Berhan">Debre Berhan</option>
                                <option value="Dessie">Dessie</option>
                                <option value="Enticho">Enticho</option>
                                <option value="Humera">Humera</option>
                                <option value="Kombolcha">Kombolcha</option>
                                <option value="Korem">Korem</option>
                                <option value="Maychew">Maychew</option>
                                <option value="Maykadra">Maykadra</option>
                                <option value="Mekelle">Mekelle</option>
                                <option value="Shire (Indasilassie)">Shire (Indasilassie)</option>
                                <option value="Woldiya">Woldiya</option>
                                <option value="Wukro">Wukro</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="images" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Product Images *
                        </label>
                        <input
                            type="file"
                            id="images"
                            onChange={handleImageChange}
                            disabled={isLoading}
                            className={getInputClassName('images')}
                            accept="image/*"
                            multiple
                        />
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Maximum 5 images allowed, each should be less than 5MB.
                        </p>
                    </div>
                </div>

                {/* Checkboxes group */}
                <div className="flex gap-6">
                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="availability"
                            checked={formData.availability}
                            onChange={handleInputChange}
                            disabled={isLoading}
                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Available</span>
                    </label>

                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="fastDelivery"
                            checked={formData.fastDelivery}
                            onChange={handleInputChange}
                            disabled={isLoading}
                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Fast Delivery</span>
                    </label>
                </div>

                {/* Image Preview Section */}
                {imagePreviews.length > 0 && (
                    <div className="mt-4">
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Image Previews
                        </h3>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                            {imagePreviews.map((preview, index) => (
                                <div key={index} className="relative group">
                                    <img
                                        src={preview}
                                        alt={`Preview ${index + 1}`}
                                        className="w-full h-24 object-cover rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 
                                                 hover:bg-red-600 transition-colors duration-200 opacity-0 group-hover:opacity-100"
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

                {error && (
                    <div className="mt-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                        {error}
                    </div>
                )}

                <button 
                    type="submit"
                    disabled={isLoading}
                    className={`
                        w-full mt-6 px-4 py-2 text-sm font-medium text-white 
                        bg-blue-600 rounded-lg hover:bg-blue-700 
                        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                        disabled:opacity-50 disabled:cursor-not-allowed
                        transition-colors duration-200
                    `}
                >
                    {isLoading ? 'Adding Product...' : 'Add Product'}
                </button>
            </div>
        </form>
    );
};

export default CardForm;
