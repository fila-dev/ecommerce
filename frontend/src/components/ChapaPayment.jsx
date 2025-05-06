import React, { useEffect, useState, useRef } from 'react';
import { useChapaPay } from "chapa-inline-hook";

const ChapaPayment = ({ amount, shippingAddress, cartItems, user, onSuccess, onFailed, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const chapaContainerRef = useRef(null);

  const { error: chapaError, isPaymentSuccessful, isPaymentFailed, isPaymentClosed } =
    useChapaPay({
      amount: amount,
      public_key: import.meta.env.VITE_CHAPA_PUBLIC_KEY,
      classIdName: "chapa-inline-form",
      styles: `
        /* Reset any potential conflicting styles */
        .chapa-form input {
          all: revert !important;
        }
        
        .chapa-pay-button { 
          background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%) !important;
          color: white !important;
          padding: 12px 24px !important;
          border-radius: 8px !important;
          border: none !important;
          font-weight: 600 !important;
          transition: all 0.3s ease !important;
          width: 100% !important;
          cursor: pointer !important;
        }
        
        .chapa-pay-button:hover { 
          background: linear-gradient(135deg, #45a049 0%, #3d8b40 100%) !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 4px 12px rgba(76, 175, 80, 0.2) !important;
        }
        
        #chapa-loading-container {
          position: absolute !important;
          top: 0% !important;
          margin: 0px !important;
          padding: 0px !important;
          background: var(--form-bg) !important;
          opacity: 0.95 !important;
          width: 100% !important;
          left: 0px !important;
          backdrop-filter: blur(4px) !important;
          height: 100% !important;
          justify-content: center !important;
          align-items: center !important;
          flex-direction: column !important;
          border-radius: 15px !important;
          z-index: 1000 !important;
        }
        
        .chapa-form {
          background-color: var(--form-bg) !important;
          padding: 20px !important;
          border-radius: 10px !important;
        }
        
        /* Input styles with color scheme support */
        .chapa-form input[type="text"],
        .chapa-form input[type="tel"],
        .chapa-form input[type="email"],
        .chapa-form input[type="number"] {
          display: block !important;
          width: 100% !important;
          padding: 12px 16px !important;
          margin-bottom: 15px !important;
          font-size: 16px !important;
          line-height: 1.5 !important;
          color: var(--input-text) !important;
          -webkit-text-fill-color: var(--input-text) !important;
          background: var(--input-bg) !important;
          border: 2px solid var(--input-border) !important;
          border-radius: 8px !important;
          box-shadow: none !important;
          appearance: none !important;
          -webkit-appearance: none !important;
          -moz-appearance: none !important;
          caret-color: var(--input-text) !important;
        }
        
        .chapa-form input[type="text"]:focus,
        .chapa-form input[type="tel"]:focus,
        .chapa-form input[type="email"]:focus,
        .chapa-form input[type="number"]:focus {
          border-color: #4CAF50 !important;
          outline: none !important;
          box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.2) !important;
        }
        
        .chapa-form input[type="text"]::placeholder,
        .chapa-form input[type="tel"]::placeholder,
        .chapa-form input[type="email"]::placeholder,
        .chapa-form input[type="number"]::placeholder {
          color: var(--placeholder) !important;
          opacity: 1 !important;
        }
        
        .chapa-form label {
          color: var(--label-text) !important;
          font-weight: 500 !important;
          margin-bottom: 8px !important;
          display: block !important;
        }
      `,
      showPaymentMethodsNames: false,
      currency: "ETB",
      availablePaymentMethods: ["telebirr", "cbebirr", "ebirr", "mpesa", "chapa"],
      callbackUrl: `${window.location.origin}/api/payment/chapa-webhook`,
      returnUrl: `${window.location.origin}/payment-success?payment_method=chapa`,
    });

  useEffect(() => {
    if (isPaymentSuccessful) {
      onSuccess?.();
    }
    if (isPaymentFailed) {
      onFailed?.(chapaError);
    }
    if (isPaymentClosed) {
      onClose?.();
    }
  }, [isPaymentSuccessful, isPaymentFailed, isPaymentClosed, chapaError, onSuccess, onFailed, onClose]);

  const initializePayment = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Generate a unique transaction reference
      const tx_ref = 'tx-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);

      // Create order in our backend
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/payment/create-chapa-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          amount: amount.toString(),
          currency: 'ETB',
          email: shippingAddress.email,
          first_name: shippingAddress.firstName || shippingAddress.name.split(' ')[0],
          last_name: shippingAddress.lastName || shippingAddress.name.split(' ').slice(1).join(' ') || 'Customer',
          tx_ref,
          return_url: `${window.location.origin}/payment-success?payment_method=chapa&tx_ref=${tx_ref}`,
          callback_url: `${window.location.origin}/api/payment/chapa-webhook`,
          meta: {
            order_items: cartItems.map(item => ({
              id: item._id,
              name: item.name,
              quantity: item.quantity,
              price: item.price
            }))
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to initialize payment');
      }

      const data = await response.json();
      
      // Store the transaction reference for verification
      sessionStorage.setItem('chapa_tx_ref', tx_ref);

    } catch (err) {
      console.error('Chapa payment error:', err);
      setError(err.message || 'Failed to process payment');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
        background: "var(--bg-gradient, linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%))",
      }}
    >
      <style>
        {`
          @media (prefers-color-scheme: dark) {
            :root {
              --bg-gradient: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
              --form-bg: #333333;
              --input-bg: #444444;
              --input-border: #555555;
              --input-text: #ffffff;
              --label-text: #ffffff;
              --placeholder: #888888;
              --shadow: rgba(0, 0, 0, 0.3);
            }
          }
          
          @media (prefers-color-scheme: light) {
            :root {
              --bg-gradient: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
              --form-bg: #ffffff;
              --input-bg: #ffffff;
              --input-border: #e9ecef;
              --input-text: #000000;
              --label-text: #495057;
              --placeholder: #adb5bd;
              --shadow: rgba(0, 0, 0, 0.1);
            }
          }
        `}
      </style>
      <div
        style={{
          backgroundColor: "var(--form-bg)",
          borderRadius: "15px",
          width: "90%",
          maxWidth: "400px",
          padding: "20px",
          position: "relative",
          boxShadow: "0 10px 20px var(--shadow)",
        }}
      >
        <div
          id="chapa-inline-form"
          style={{
            backgroundColor: "var(--form-bg)",
            borderRadius: "10px",
            padding: "15px",
          }}
        ></div>
        {error && (
          <div 
            style={{ 
              color: "#ff6b6b",
              marginTop: "15px",
              padding: "10px",
              backgroundColor: "rgba(255, 107, 107, 0.1)",
              borderRadius: "5px",
              fontSize: "14px",
              textAlign: "center",
              border: "1px solid #ff6b6b"
            }}
          >
            {error}
          </div>
        )}
        <button
          onClick={initializePayment}
          disabled={isLoading}
          className={`w-full py-3 px-4 rounded-lg ${
            isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700'
          } text-white font-medium transition-colors duration-200 flex items-center justify-center space-x-2`}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Processing...</span>
            </>
          ) : (
            <>
              {/* <span>Proceed to Payment</span> */}
              {/* <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg> */}
            </>
          )
          }
        </button>
      </div>
    </div>
  );
};

export default ChapaPayment;
