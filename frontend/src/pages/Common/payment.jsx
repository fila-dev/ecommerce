import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const { clearCart } = useCart();

  useEffect(() => {
    // Clear the cart after successful payment
    clearCart();

    // Redirect to home after 5 seconds
    const timeout = setTimeout(() => {
      navigate('/success-message');
    }, 5000);

    return () => clearTimeout(timeout);
  }, [clearCart, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-red-800 ">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <div className="mb-4">
          <svg
            className="mx-auto h-16 w-16 text-green-500"
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
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Payment Successful!
        </h2>
        <p className="text-gray-600 mb-4">
          Thank you for your purchase. Your order has been confirmed.
        </p>
        <p className="text-sm text-gray-500">
          You will be redirected to the home page in 5 seconds...
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccess;
