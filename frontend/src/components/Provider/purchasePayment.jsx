import React, { useState, useEffect } from 'react';
import { Package2, CreditCard, CheckCircle, XCircle, DollarSign, Calendar, User, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuthContext } from '../../hooks/useAuthContext';
import { format } from 'date-fns';

const PurchasePayment = () => {
  const [payments, setPayments] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('payments');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedItems, setExpandedItems] = useState({});
  const { user } = useAuthContext();

  useEffect(() => {
    if (activeTab === 'payments') {
      fetchPayments();
    } else {
      fetchOrders();
    }
  }, [user, activeTab]);

  const fetchPayments = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/transaction/provider/payments`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch payments');
      }
      
      const data = await response.json();
      setPayments(data.payments);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/transaction/provider/orders`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      
      const data = await response.json();
      setOrders(data.orders);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  // Function to get status color
  const getStatusColor = (status) => {
    switch(status) {
      case 'pending':
        return 'text-yellow-300';
      case 'processing':
        return 'text-blue-300'; 
      case 'in_transit':
        return 'text-purple-300';
      case 'out_for_delivery':
        return 'text-orange-300';
      case 'delivered':
        return 'text-green-300';
      case 'cancelled':
        return 'text-red-300';
      default:
        return 'text-gray-300';
    }
  };

  const toggleExpand = (id) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getPaymentStatus = (order) => {
    if (order.isPaid) {
      return (
        <div className="flex items-center gap-1 text-green-400 bg-green-400/10 px-2 py-1 rounded">
          <CheckCircle className="w-4 h-4" />
          <span className="text-xs font-medium">Payment Received</span>
        </div>
      );
    } else if (order.status === 'cancelled') {
      return (
        <div className="flex items-center gap-1 text-red-400 bg-red-400/10 px-2 py-1 rounded">
          <XCircle className="w-4 h-4" />
          <span className="text-xs font-medium">Order Cancelled</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-1 text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded">
          <CreditCard className="w-4 h-4" />
          <span className="text-xs font-medium">Awaiting Payment</span>
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Provider Dashboard</h2>
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'payments'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-700 text-gray-300'
            }`}
          >
            Payments
          </button>
          {/* <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'orders'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-700 text-gray-300'
            }`}
          >
            Orders
          </button> */}
        </div>
      </div>

      {activeTab === 'payments' ? (
        <div className="grid gap-4">
          {payments.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              No payments found
            </div>
          ) : (
            payments.map((payment) => (
              <div
                key={payment.orderId}
                className="bg-gray-800/50 rounded-lg p-4"
              >
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleExpand(payment.orderId)}
                >
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-6 h-6 text-green-500" />
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        Order #{payment.orderId}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {format(new Date(payment.date), 'PPP')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-semibold text-green-400">
                        ${payment.totalEarnings.toFixed(2)}
                      </p>
                      <div className="flex items-center gap-1 text-green-400 bg-green-400/10 px-2 py-1 rounded">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-xs font-medium">Paid</span>
                      </div>
                    </div>
                    {expandedItems[payment.orderId] ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>

                {expandedItems[payment.orderId] && (
                  <div className="mt-4 space-y-2">
                    {payment.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-2 rounded bg-gray-700/30"
                      >
                        <span className="text-gray-300">{item.name}</span>
                        <span className="text-gray-400">
                          {item.quantity} × ${item.price}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {orders.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              No orders found
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.orderId}
                className="bg-gray-800/50 rounded-lg p-4"
              >
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleExpand(order.orderId)}
                >
                  <div className="flex items-center gap-3">
                    <Package2 className="w-6 h-6 text-blue-500" />
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        Order #{order.orderId}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {format(new Date(order.createdAt), 'PPP')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300">{order.customerInfo.email}</span>
                      </div>
                      {getPaymentStatus(order)}
                    </div>
                    {expandedItems[order.orderId] ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>

                {expandedItems[order.orderId] && (
                  <div className="mt-4">
                    {order.storeOrders.map((storeOrder, index) => (
                      <div key={index} className="mt-4 p-3 bg-gray-700/30 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-300">{storeOrder.storeName}</span>
                          </div>
                          <span className={`${getStatusColor(storeOrder.status)} text-sm`}>
                            {storeOrder.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 mb-2">
                          Packing ID: {storeOrder.packingId}
                        </p>
                        <div className="space-y-2">
                          {storeOrder.items.map((item, itemIndex) => (
                            <div
                              key={itemIndex}
                              className="flex justify-between items-center p-2 rounded bg-gray-700/30"
                            >
                              <span className="text-gray-300">Item #{item.id}</span>
                              <span className="text-gray-400">
                                {item.quantity} × ${item.price}
                              </span>
                            </div>
                          ))}
                        </div>
                        {storeOrder.trackingInfo && (
                          <div className="mt-2 text-sm text-gray-400">
                            <p>Carrier: {storeOrder.trackingInfo.carrier || 'N/A'}</p>
                            <p>Tracking #: {storeOrder.trackingInfo.trackingNumber || 'N/A'}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default PurchasePayment;
