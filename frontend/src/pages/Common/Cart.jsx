import { useCart } from "../../context/CartContext";
import { Link, useNavigate } from "react-router-dom";
import { FaTrash, FaMinus, FaPlus } from "react-icons/fa";
import { useAuthContext } from "../../hooks/useAuthContext";
import { Trash2 } from "lucide-react";

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, getCartTotal } = useCart();
  const { user } = useAuthContext();
  const navigate = useNavigate();

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    updateQuantity(itemId, newQuantity);
  };

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.13; // 13% tax rate
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleCheckout = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      const totalAmount = calculateTotal();
      const paymentData = {
        amount: totalAmount,
        items: cart.map((item) => ({
          id: item._id,
          quantity: item.quantity,
          price: item.price,
          name: item.name,
        })),
      };

      console.log("Sending payment request:", paymentData);

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/payment/create-payment-intent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify(paymentData),
        }
      );

      const data = await response.json();
      console.log("Server response:", data);

      if (!response.ok) {
        throw new Error(data.message || "Payment request failed");
      }

      if (!data.clientSecret) {
        throw new Error("No client secret received from the server");
      }

      console.log("Payment intent created successfully");

      navigate("/checkout", {
        state: {
          clientSecret: data.clientSecret,
          amount: totalAmount,
          cartItems: cart.map((item) => ({
            id: item._id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.images && item.images.length > 0 ? item.images[0] : '',
          })),
        },
      });
    } catch (error) {
      console.error("Checkout error:", error);
      alert(error.message || "Failed to process payment. Please try again.");
    }
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white">
        <svg
          className="w-24 h-24 text-gray-400 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <h2 className="text-3xl font-bold text-white mb-4">
          Your cart is empty
        </h2>
        <Link
          to="/"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-200"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w- mx-auto px-4 sm:px-6 lg:px-8 py-12  min-h-screen">
      <h2 className="text-3xl font-bold text-white mb-8">Shopping Cart</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Product List - Takes up 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {cart.map((item) => (
            <div
              key={item._id}
              className="flex items-center bg-gray-50 py-8 antialiased dark:bg-gray-800 p-6 rounded-lg shadow-sm hover:shadow-md transition duration-200"
            >
              <div className="h-32 w-32 flex-shrink-0 overflow-hidden rounded-md">
                <img
                  src={item.images && item.images.length > 0 ? item.images[0] : ''}
                  alt={item.name}
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="flex-grow ml-6">
                <h3 className="text-xl font-semibold text-white">
                  {item.name}
                </h3>
                <p className="text-lg text-white mt-1">
                  ${item.price.toFixed(2)}
                </p>
                <div className="flex items-center mt-4 space-x-4">
                  <div className="flex items-center border rounded-lg">
                    <button
                      onClick={() =>
                        handleQuantityChange(item._id, item.quantity - 1)
                      }
                      className="p-2 hover:bg-gray-100 rounded-l-lg transition duration-200"
                    >
                      <FaMinus className="text-white" />
                    </button>
                    <span className="px-4 py-2 font-medium text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        handleQuantityChange(item._id, item.quantity + 1)
                      }
                      className="p-2 hover:bg-gray-100 rounded-r-lg transition duration-200"
                    >
                      <FaPlus className="text-white" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="text-red-500 hover:text-red-700 transition duration-200"
                  >
                    <FaTrash size={18} />
                  </button>
                </div>
              </div>
              <div className="text-xl font-bold text-white">
                ${(item.price * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary - Takes up 1 column */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 py-8 antialiased dark:bg-gray-800 p-6 rounded-lg shadow-sm sticky top-4">
            <h3 className="text-xl font-bold text-white mb-6">Order Summary</h3>
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item._id} className="flex justify-between text-white">
                  <span>
                    {item.name} ({item.quantity} x ${item.price.toFixed(2)})
                  </span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="h-px bg-gray-200 my-4"></div>
              <div className="flex justify-between text-xl font-bold text-white">
                <span>Total</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition duration-200"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
