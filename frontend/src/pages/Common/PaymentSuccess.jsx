import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuthContext } from "../../hooks/useAuthContext";
import confetti from "canvas-confetti";
import Receipt from "../../components/Receipt";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const { user } = useAuthContext();
  const [orderDetails, setOrderDetails] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const savePurchaseHistory = async () => {
      if (!user) {
        navigate("/login");
        return;
    } else if (!cart || cart.length === 0) {  
        navigate("/success-message");
        return;
    }
    

      try {
        // Get shipping address from localStorage
        const shippingAddress = JSON.parse(localStorage.getItem('shippingAddress') || '{}');
        
        // Validate shipping address
        if (!shippingAddress.name || !shippingAddress.street || !shippingAddress.city || 
            !shippingAddress.state || !shippingAddress.zipCode || !shippingAddress.phone) {
          throw new Error('Shipping address is incomplete');
        }

        // First, update stock for all items
        const stockUpdatePromises = cart.map(async (item) => {
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/stock/${item._id}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${user.token}`
            },
            body: JSON.stringify({ quantity: item.quantity })
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update stock');
          }

          return response.json();
        });

        // Wait for all stock updates to complete
        await Promise.all(stockUpdatePromises);
        console.log('All stock updates completed successfully');

        // Then proceed with purchase history creation
        const orderId = `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        const subtotal = parseFloat(
          cart
            .reduce((sum, item) => sum + item.price * item.quantity, 0)
            .toFixed(2)
        );
        const tax = parseFloat((subtotal * 0.13).toFixed(2));
        const total = parseFloat((subtotal + tax).toFixed(2));

        const items = cart.map((item) => ({
          id: item._id,
          name: item.name,
          quantity: parseInt(item.quantity),
          price: parseFloat(item.price.toFixed(2)),
          subtotal: parseFloat((item.price * item.quantity).toFixed(2)),
          image: item.image || "",
        }));

        const purchaseData = {
          orderId,
          email: user.email.toLowerCase().trim(),
          items: items.map((item) => ({
            ...item,
            quantity: parseInt(item.quantity),
            price: parseFloat(item.price),
            subtotal: parseFloat(item.subtotal),
          })),
          shippingAddress,
          subtotal: parseFloat(subtotal),
          tax: parseFloat(tax),
          total: parseFloat(total),
          date: new Date().toISOString(),
        };

        // Debug logs
        console.log("Purchase data being sent:", JSON.stringify(purchaseData, null, 2));

        const response = await fetch(
          "${import.meta.env.VITE_API_BASE_URL}/api/purchasehistory/create",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user.token}`,
            },
            body: JSON.stringify(purchaseData),
          }
        );

        const json = await response.json();
        console.log("Server response:", json);

        if (!response.ok) {
          throw new Error(json.error || json.message || "Failed to save purchase history");
        }

        setOrderDetails(json.data);
        // Clear shipping address from localStorage after successful save
        localStorage.removeItem('shippingAddress');
        
        // Show success confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });

        // Clear the cart
        clearCart();
      } catch (error) {
        console.error("Error processing order:", error);
        setError(error.message);
      }
    };

    savePurchaseHistory();
  }, [cart, clearCart, navigate, user]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full">
          <div className="mb-4">
            <svg
              className="mx-auto h-16 w-16 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Error Processing Order
          </h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full">
          <div className="mb-6">
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
          <p className="text-gray-600 mb-4">Thank you for your purchase.</p>
          <p className="text-gray-500 text-sm">Redirecting to home page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="mb-6">
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
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Payment Successful!
          </h2>
          <p className="text-gray-600 mb-8">
            Thank you for your purchase. Your order has been processed
            successfully.
          </p>
        </div>

        {orderDetails && <Receipt order={orderDetails} />}

        <div className="text-center mt-8 space-x-4">
          <button
            onClick={() => navigate("/")}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </button>
          <button
            onClick={() => navigate("/order-history")}
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            View Order History
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
