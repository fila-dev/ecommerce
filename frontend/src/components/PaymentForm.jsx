import { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/stripe-react-native';
import { useCart } from '../context/CartContext';

const PaymentForm = ({ amount }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { clearCart } = useCart();

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      // Create PaymentIntent
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/payment/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({ amount }),
      });

      const { clientSecret } = await response.json();

      // Confirm payment
      const { error } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
      });

      if (error) {
        setErrorMessage(error.message);
      } else {
        clearCart();
        // Payment successful
        // You can redirect to a success page or show a success message
      }
    } catch (error) {
      console.error('Payment error:', error);
      setErrorMessage('An error occurred while processing your payment.');
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <PaymentElement />
      
      {errorMessage && (
        <div className="text-red-500 mt-4 text-sm">
          {errorMessage}
        </div>
      )}
      
      <button 
        type="submit"
        disabled={isProcessing || !stripe || !elements}
        className={`
          w-full mt-6 px-4 py-2 text-white rounded-md
          ${isProcessing 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700'}
        `}
      >
        {isProcessing ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
};

export default PaymentForm; 