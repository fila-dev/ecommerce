import { useState, useEffect } from "react"
import { useAuthContext } from "../hooks/useAuthContext"
import { Package2, MapPin, CheckCircle, ChevronRight, Truck, Calendar, Clock } from "lucide-react"
import { motion } from "framer-motion"

// List of possible cities for tracking route
const CITIES = [
  "Addis Ababa",
  "Debre Berhan", 
  "Dessie",
  "Kombolcha",
  "Woldiya",
  "Alamata",
  "Korem",
  "Maychew",
  "Mekelle",
  "Maykadra",
  "Wukro",
  "Adigrat",
  "Bizet",
  "Enticho",
  "Adwa",
  "Axum",
  "Shire (Indasilassie)",
  "Dansha",
  "Humera",
]

const LoadingScreen = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-900">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

const ErrorScreen = ({ message }) => (
  <div className="flex items-center justify-center min-h-screen bg-gray-900">
    <div className="text-red-500 text-xl">{message}</div>
  </div>
);

const EmptyState = ({ message }) => (
  <div className="flex items-center justify-center min-h-screen bg-gray-900">
    <div className="text-gray-500 text-xl">{message}</div>
  </div>
);

// Generate tracking steps following the predefined CITIES path
const generateTrackingSteps = (storeCity, shippingCity) => {
  const startIndex = CITIES.indexOf(storeCity)
  const endIndex = CITIES.indexOf(shippingCity)

  // If cities are not found, show direct route
  if (startIndex === -1 || endIndex === -1) {
    return [
      { city: storeCity, status: "pending", date: new Date().toLocaleDateString(), time: "8:00 AM" },
      { city: shippingCity, status: "delivered", date: new Date().toLocaleDateString(), time: "5:00 PM" },
    ]
  }

  const routeCities = []
  const currentDate = new Date()

  // If shipping from north to south (reverse order needed)
  if (startIndex > endIndex) {
    for (let i = startIndex; i >= endIndex; i--) {
      routeCities.push(CITIES[i])
    }
  } else {
    for (let i = startIndex; i <= endIndex; i++) {
      routeCities.push(CITIES[i])
    }
  }

  return routeCities.map((city, index, array) => {
    const stepDate = new Date(currentDate)
    stepDate.setHours(8 + index * 2)
    
    return {
      city,
      status: index === 0 ? "pending" : index === array.length - 1 ? "delivered" : "in_transit",
      date: stepDate.toLocaleDateString(),
      time: stepDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  })
}

const OrderTracking = () => {
  const { user } = useAuthContext()
  const [orders, setOrders] = useState([])
  const [currentOrderIndex, setCurrentOrderIndex] = useState(0)
  const [trackingSteps, setTrackingSteps] = useState([])
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isSimulating, setIsSimulating] = useState(false)

  // Fetch orders and their current state from the database
  const fetchOrderStatus = async () => {
    if (!user) return;

    try {
      const token = user.token;
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      const userId = decodedToken._id;

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/ordertracking/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch order status');
      }

      const data = await response.json();
      return data.orders;
    } catch (error) {
      console.error('Error fetching order status:', error);
      return null;
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        setError("You must be logged in to view order tracking")
        setLoading(false)
        return
      }

      try {
        // Fetch current order status from database
        const currentOrders = await fetchOrderStatus();
        if (!currentOrders) {
          throw new Error('Failed to fetch orders');
        }

        setOrders(currentOrders);
        
        if (currentOrders.length > 0) {
          const firstOrder = currentOrders[0];
          const steps = generateTrackingSteps(firstOrder.storeName, firstOrder.city);
          setTrackingSteps(steps);

          // Set the current step based on the database state
          if (firstOrder.status === 'delivered') {
            setCurrentStep(steps.length - 1);
            setIsSimulating(false);
          } else {
            const currentLocation = firstOrder.trackingInfo?.currentLocation;
            const currentStepIndex = steps.findIndex(step => step.city === currentLocation);
            setCurrentStep(currentStepIndex !== -1 ? currentStepIndex : 0);
            // Only start simulation if order is not delivered
            setIsSimulating(firstOrder.status !== 'delivered');
          }
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  // Add a periodic refresh for orders
  useEffect(() => {
    if (!user) return;

    // Initial fetch
    fetchOrderStatus().then(updatedOrders => {
      if (updatedOrders) {
        setOrders(updatedOrders);
      }
    });

    // Set up periodic refresh every 5 seconds
    const refreshInterval = setInterval(async () => {
      const updatedOrders = await fetchOrderStatus();
      if (updatedOrders) {
        setOrders(updatedOrders);
      }
    }, 5000);

    return () => clearInterval(refreshInterval);
  }, [user]);

  // Handle order selection
  const handleOrderSelect = async (index) => {
    setCurrentOrderIndex(index);
    const selectedOrder = orders[index];
    
    // Fetch the latest status from the database
    const updatedOrders = await fetchOrderStatus();
    if (updatedOrders) {
      const updatedOrder = updatedOrders.find(o => o._id === selectedOrder._id);
      if (updatedOrder) {
        const steps = generateTrackingSteps(updatedOrder.storeName, updatedOrder.city);
        setTrackingSteps(steps);

        if (updatedOrder.status === 'delivered') {
          setCurrentStep(steps.length - 1);
          setIsSimulating(false);
        } else {
          const currentLocation = updatedOrder.trackingInfo?.currentLocation;
          const currentStepIndex = steps.findIndex(step => step.city === currentLocation);
          setCurrentStep(currentStepIndex !== -1 ? currentStepIndex : 0);
          setIsSimulating(updatedOrder.status !== 'delivered');
        }
      }
    }
  };

  // Function to update tracking info
  const updateTracking = async (order, stepIndex, steps) => {
    if (!user || !order) return;

    try {
      // Determine the appropriate status based on step index
      let status;
      if (stepIndex === 0) {
        status = 'processing';
      } else if (stepIndex === steps.length - 1) {
        status = 'delivered';
      } else if (stepIndex === steps.length - 2) {
        status = 'out_for_delivery';
      } else {
        status = 'in_transit';
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/ordertracking/order/${order._id}/tracking`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          },
          body: JSON.stringify({
            storeIndex: 0,
            currentLocation: steps[stepIndex].city,
            status
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update tracking info');
      }

      const updatedData = await response.json();
      
      // If this was the final step or we got a delivered status, refresh orders
      if (status === 'delivered' || stepIndex === steps.length - 1) {
        const updatedResponse = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/ordertracking/${order.userId}`,
          {
            headers: {
              'Authorization': `Bearer ${user.token}`
            }
          }
        );
        
        if (updatedResponse.ok) {
          const ordersData = await updatedResponse.json();
          setOrders(ordersData.orders);
          setIsSimulating(false);
        }
      }

      return updatedData;
    } catch (error) {
      console.error('Error updating tracking:', error);
      return { error: 'Failed to update tracking info' };
    }
  };

  // Simulation effect
  useEffect(() => {
    if (!user || !orders.length || !isSimulating) return;

    const order = orders[currentOrderIndex];
    if (!order || order.status === 'delivered') {
      setIsSimulating(false);
      return;
    }

    const steps = trackingSteps;
    let stepIndex = currentStep;

    const timer = setInterval(async () => {
      if (stepIndex < steps.length - 1) {
        try {
          const response = await updateTracking(order, stepIndex + 1, steps);
          
          if (response.error) {
            console.log('Tracking update stopped:', response.error);
            setIsSimulating(false);
            clearInterval(timer);
            
            // If the order is already delivered, update the UI accordingly
            if (response.deliveryDetails) {
              setCurrentStep(steps.length - 1);
              
              // Refresh orders to get latest state
              const updatedOrders = await fetchOrderStatus();
              if (updatedOrders) {
                setOrders(updatedOrders);
              }
            }
          } else {
            setCurrentStep(stepIndex + 1);
            stepIndex++;
          }
        } catch (error) {
          console.error('Error updating tracking:', error);
          setIsSimulating(false);
          clearInterval(timer);
        }
      } else {
        setIsSimulating(false);
        clearInterval(timer);
        
        // Refresh orders after completion
        const updatedOrders = await fetchOrderStatus();
        if (updatedOrders) {
          setOrders(updatedOrders);
        }
      }
    }, 2000);

    return () => clearInterval(timer);
  }, [currentOrderIndex, orders, isSimulating, user, currentStep, trackingSteps]);

  if (loading) return <LoadingScreen />
  if (error) return <ErrorScreen message={error} />
  if (orders.length === 0) return <EmptyState message="No orders found" />

  const currentOrder = orders[currentOrderIndex]

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <h1 className="text-3xl font-bold p-6">Order Tracking</h1>

      {loading ? (
        <LoadingScreen />
      ) : error ? (
        <ErrorScreen message={error} />
      ) : orders.length === 0 ? (
        <EmptyState message="No orders found" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-100px)]">
          {/* Order List - Left Side */}
          <div className="lg:col-span-1 bg-gray-800/50 rounded-lg p-4 overflow-y-auto max-h-[calc(100vh-100px)]">
            {orders.map((order, index) => (
              <OrderCard
                key={`${order._id}-${order.storeName}`}
                order={order}
                isActive={index === currentOrderIndex}
                onClick={() => handleOrderSelect(index)}
              />
            ))}
          </div>

          {/* Tracking Steps - Right Side */}
          <div className="lg:col-span-2 bg-gray-800/50 rounded-lg overflow-hidden">
            <div className="p-6 bg-gray-800 border-b border-gray-700">
              <div className="flex items-center gap-4">
                <div className="bg-blue-500 rounded-xl p-3">
                  <Package2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    {currentOrder?.storeName || "Loading..."}
                  </h2>
                  <p className="text-gray-400">
                    Tracking order to {currentOrder?.city || "..."}
                  </p>
                </div>
              </div>
            </div>

            {/* Scrollable Tracking Steps */}
            <div className="p-6 overflow-y-auto max-h-[calc(100vh-250px)]">
              {trackingSteps.map((step, index) => (
                <TrackingStep
                  key={step.city}
                  step={step}
                  index={index}
                  isLast={index === trackingSteps.length - 1}
                  reached={index <= currentStep}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const OrderCard = ({ order, isActive, onClick }) => {
  // Function to get status color
  const getStatusColor = (status) => {
    switch(status) {
      case 'pending':
        return 'text-yellow-300';
      case 'packed':
        return 'text-blue-300';
      case 'in_transit':
        return 'text-purple-300';
      case 'delivered':
        return 'text-green-300';
      default:
        return 'text-gray-300';
    }
  };

  // Function to get status icon
  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending':
        return <Package2 className="w-6 h-6" />;
      case 'packed':
        return <Package2 className="w-6 h-6" />;
      case 'in_transit':
        return <Truck className="w-6 h-6" />;
      case 'delivered':
        return <CheckCircle className="w-6 h-6" />;
      default:
        return <Package2 className="w-6 h-6" />;
    }
  };

  // Ensure we're using the correct packing status
  const packingStatus = order.status === 'delivered' ? 'delivered' : (order.packingStatus || 'pending');

  return (
    <motion.div
      className={`p-4 mb-4 rounded-lg cursor-pointer transition-all ${
        isActive ? 'bg-blue-600' : 'bg-gray-800'
      }`}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Order #{order.orderId}</h3>
          <p className="text-gray-300">Store: {order.storeName}</p>
          <p className="text-gray-300">Packing ID: {order.packingId || 'N/A'}</p>
          <p className={getStatusColor(packingStatus)}>
            Packing Status: {packingStatus.toUpperCase()}
          </p>
          {order.trackingInfo?.lastUpdated && (
            <p className="text-gray-400 text-sm">
              Last Updated: {new Date(order.trackingInfo.lastUpdated).toLocaleString()}
            </p>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className={`${getStatusColor(packingStatus)}`}>
            {getStatusIcon(packingStatus)}
          </div>
          <ChevronRight className={`w-6 h-6 ${isActive ? 'text-white' : 'text-gray-400'}`} />
        </div>
      </div>
    </motion.div>
  );
};

const TrackingStep = ({ step, index, isLast, reached }) => {
  const isDelivered = isLast && reached

  return (
    <div className="flex items-center mb-8 last:mb-0">
      <div className="flex flex-col items-center mr-4">
        <div
          className={`w-10 h-10 flex items-center justify-center rounded-full border-2 
            ${reached 
              ? isDelivered
                ? 'bg-green-500 border-green-500'
                : 'bg-blue-500 border-blue-500'
              : 'border-gray-600 bg-gray-800'
            }`}
        >
          {isDelivered ? (
            <CheckCircle className="w-6 h-6 text-white" />
          ) : reached ? (
            <Truck className="w-6 h-6 text-white" />
          ) : (
            <Package2 className="w-6 h-6 text-gray-400" />
          )}
        </div>
        {!isLast && (
          <div
            className={`w-0.5 h-16 ${
              reached ? 'bg-blue-500' : 'bg-gray-600'
            }`}
          />
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`text-lg font-medium ${
              reached 
                ? isDelivered
                  ? 'text-green-400'
                  : 'text-blue-400'
                : 'text-gray-400'
            }`}>
              {step.city}
            </h3>
            <div className="flex items-center gap-4 mt-1">
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>{step.date}</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>{step.time}</span>
              </div>
            </div>
            {isDelivered && (
              <p className="text-green-400 text-sm mt-1">
                Successfully delivered
              </p>
            )}
          </div>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full 
            ${reached 
              ? isDelivered
                ? 'bg-green-500/20 text-green-500'
                : 'bg-blue-500/20 text-blue-500'
              : 'bg-gray-800 text-gray-600'
            }`}
          >
            {isDelivered ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <MapPin className="w-5 h-5" />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderTracking
