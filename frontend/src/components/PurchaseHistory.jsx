import { useAuthContext } from "../hooks/useAuthContext";
import { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import Receipt from "./Receipt";

const PurchaseHistory = () => {
  const { user } = useAuthContext();
  const [purchases, setPurchases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [expandedPurchase, setExpandedPurchase] = useState(null);

  useEffect(() => {
    const fetchPurchaseHistory = async () => {
      if (!user) {
        setError("You must be logged in to view purchase history");
        setIsLoading(false);
        return;
      }

      try {
        // Get the ID from the decoded JWT token
        const token = user.token;
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const decodedToken = JSON.parse(window.atob(base64));
        const userId = decodedToken._id;

        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/purchasehistory/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const json = await response.json();

        if (!response.ok) {
          setError(json.error || "Failed to fetch purchase history");
        } else {
          setPurchases(json);
        }
      } catch (err) {
        setError("Failed to fetch purchase history. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPurchaseHistory();
  }, [user]);

  const togglePurchase = (purchaseId) => {
    if (expandedPurchase === purchaseId) {
      setExpandedPurchase(null);
    } else {
      setExpandedPurchase(purchaseId);
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );

  if (error)
    return (
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
        role="alert"
      >
        <strong className="font-bold">Error! </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-8 text-green-700">
        Purchase History
      </h2>
      {purchases.length === 0 ? (
        <div className="bg-gray-50 p-8 rounded-lg text-center">
          <p className="text-gray-600 text-lg">No purchase history found</p>
        </div>
      ) : (
        <div className="space-y-6">
          {purchases.map((purchase) => (
            <div
              key={purchase._id}
              className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div 
                onClick={() => togglePurchase(purchase._id)}
                className="flex justify-between items-center p-6 cursor-pointer hover:bg-gray-50"
              >
                <div>
                  <p className="text-lg font-semibold text-gray-800">
                    Order ID: {purchase.orderId || purchase._id}
                  </p>
                  <p className="text-sm text-gray-600">
                    {purchase.createdAt ? new Date(purchase.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long", 
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }) : "Date not available"}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-xl font-bold text-green-600">
                    ${purchase.total.toFixed(2)}
                  </p>
                  <svg 
                    className={`w-6 h-6 transform transition-transform ${expandedPurchase === purchase._id ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {expandedPurchase === purchase._id && (
                <div className="border-t border-gray-200 p-6">
                  <div className="space-y-3">
                    <p className="font-medium text-gray-700">Items:</p>
                    {purchase.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center bg-gray-50 p-3 rounded"
                      >
                        <p className="text-gray-800">{item.name}</p>
                        <div className="flex items-center gap-4">
                          <span className="text-gray-600">
                            Qty: {item.quantity}
                          </span>
                          <span className="font-medium">
                            ${item.price.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-end mt-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPurchase(purchase);
                        }}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        View Receipt
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {selectedPurchase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-xl my-8 relative">
            <div className="sticky top-0 flex justify-end mb-4">
              <button
                onClick={() => setSelectedPurchase(null)}
                className="text-gray-500 hover:text-gray-700 p-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="max-h-[80vh] overflow-y-auto">
              <Receipt purchase={selectedPurchase} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseHistory;
