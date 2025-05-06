import { FaRegCheckCircle } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import { useEffect } from "react";
import Receipt from "../../components/Receipt";

const SuccessMessage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const orderDetails = location.state?.orderDetails;

  useEffect(() => {
    // Show success animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, []);

  const handleNavigation = (path) => {
    navigate(path);
  };



  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="mb-6">
            <FaRegCheckCircle className="mx-auto h-16 w-16 text-green-500" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Payment Successful!</h2>
          <p className="text-gray-600 mb-8">
            Thank you for your purchase. Your order has been processed successfully.
          </p>
        </div>

        {orderDetails && <Receipt order={orderDetails} />}

        <div className="text-center mt-8 space-x-4">

          <button
            onClick={() => handleNavigation("/")}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </button>
          <button
            onClick={() => handleNavigation("/order-history")}
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            View Order History
          </button>

        </div>
      </div>
    </div>
  );
};

export default SuccessMessage;
