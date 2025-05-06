import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ChapaPayment from '../../components/ChapaPayment';

const CheckoutForm = ({ clientSecret, amount, cartItems }) => {
  const navigate = useNavigate();
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('chapa');
  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    phone: ''
  });

  const handleAddressSubmit = (e) => {
    e.preventDefault();

    // Validate all required fields
    const requiredFields = ['name', 'street', 'city', 'state', 'zipCode', 'phone'];
    const missingFields = requiredFields.filter(field => !shippingAddress[field]);

    if (missingFields.length > 0) {
      setMessage(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    try {
      // Store shipping address in localStorage
      localStorage.setItem('shippingAddress', JSON.stringify(shippingAddress));
      setShowAddressModal(false);
      setMessage(null); // Clear any error messages
    } catch (error) {
      console.error('Error saving shipping address:', error);
      setMessage('Failed to save shipping address. Please try again.');
    }
  };


  return (
    <div className="bg-white py-8 rounded-lg shadow-lg p-6">
      {showAddressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6 border-b pb-2">
                <h3 className="text-2xl font-bold text-green-700">Shipping Details</h3>
                <button
                  onClick={() => navigate('/cart')}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                  aria-label="Back to cart"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleAddressSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
                    value={shippingAddress.name}
                    onChange={(e) => setShippingAddress({...shippingAddress, name: e.target.value})}
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
                    value={shippingAddress.street}
                    onChange={(e) => setShippingAddress({...shippingAddress, street: e.target.value})}
                    placeholder="Enter your street address"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
  <select
    required
    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
    value={shippingAddress.city}
    onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
  >
    <option value="" disabled>Select your city</option>
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
                      value={shippingAddress.state}
                      onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})}
                      placeholder="State"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
                      value={shippingAddress.zipCode}
                      onChange={(e) => setShippingAddress({...shippingAddress, zipCode: e.target.value})}
                      placeholder="ZIP Code"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      required
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
                      value={shippingAddress.phone}
                      onChange={(e) => setShippingAddress({...shippingAddress, phone: e.target.value})}
                      placeholder="Phone number"
                    />
                  </div>
                </div>
                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold
                             hover:bg-green-700 transform hover:-translate-y-0.5 transition duration-200
                             focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    Continue to Payment
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {!showAddressModal && (
        <div className="space-y-6">
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4 text-green-700">Select Payment Method</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label 
                className={`relative flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-all duration-200
                  ${paymentMethod === 'chapa' 
                    ? 'border-blue-600 bg-gray-900 text-white shadow-lg transform scale-105' 
                    : 'border-gray-300 hover:bg-gray-900 hover:text-white hover:border-blue-400'}`}
              >
                <div className="flex items-center space-x-4">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="chapa"
                    checked={paymentMethod === 'chapa'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                  />
                  <div className="flex flex-col">
                    <span className={`text-lg font-semibold ${paymentMethod === 'chapa' ? 'text-white' : 'text-gray-900 group-hover:text-white'}`}>
                      Chapa
                    </span>
                    <span className={`text-sm ${paymentMethod === 'chapa' ? 'text-blue-200' : 'text-gray-500 group-hover:text-blue-200'}`}>
                      Pay with Ethiopian Birr
                    </span>
                  </div>
                  <div className={`ml-auto rounded-lg p-2 ${paymentMethod === 'chapa' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <svg className={`w-6 h-6 ${paymentMethod === 'chapa' ? 'text-blue-400' : 'text-blue-600'}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M9.5 9C9.5 8.17157 10.1716 7.5 11 7.5H13C13.8284 7.5 14.5 8.17157 14.5 9C14.5 9.82843 13.8284 10.5 13 10.5H11C10.1716 10.5 9.5 11.1716 9.5 12C9.5 12.8284 10.1716 13.5 11 13.5H13C13.8284 13.5 14.5 14.1716 14.5 15C14.5 15.8284 13.8284 16.5 13 16.5H11C10.1716 16.5 9.5 15.8284 9.5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 7.5V6M12 18V16.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <ChapaPayment
            amount={amount}
            shippingAddress={shippingAddress}
            cartItems={cartItems}
          />
        </div>
      )}
    </div>
  );
};

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { amount, cartItems } = location.state || {};

  return (
    <div className="min-h-screen bg-gray-100 antialiased dark:bg-gray-700">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-gray-100 antialiased dark:bg-gray-900 rounded-lg shadow-lg p-8">
          <div className="mb-6"> 
          <button
          onClick={() => navigate('/cart')}
          className="flex items-center text-white hover:text-green-800 transition-colors mt-4 mb-4"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Cart
        </button>
        
            <h2 className="text-3xl font-bold text-green-700">Checkout</h2>
          </div>
          
          {/* Order Summary */}
          <div className="mb-8"> 
            
            <h3 className="text-xl font-semibold mb-4 text-green-700">Order Summary</h3>
            <div className="space-y-3">
              {cartItems?.map((item) => (
                <div key={item.id} className="flex justify-between text-green-700">
                  <span>{item.name} (x{item.quantity})</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between font-bold text-green-700">
                  <span>Total</span>
                  <span>${amount?.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <CheckoutForm 
            amount={amount}
            cartItems={cartItems}
          />
        </div>
      </div>
    </div>
  );
};

export default Checkout;
