import React from 'react';
import { useAuthContext } from '../../hooks/useAuthContext';
import { AiOutlineDollar } from 'react-icons/ai';
import { BsFillCalendarDateFill } from 'react-icons/bs';

const ProviderSales = () => {
  const { user } = useAuthContext();
  const [sales, setSales] = React.useState([]);

  React.useEffect(() => {
    const fetchSales = async () => {
      const response = await fetch('/api/purchasehistory/provider/sales', {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setSales(data);
      }
    };
    fetchSales();
  }, [user]);

  return (
    <div className="overflow-x-auto">
      <h1 className="text-2xl font-bold mb-4">Provider Sales</h1>
      <table className="table w-full">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer Email</th>
            <th>Total Amount</th>
            <th>Date</th>
            <th>Items Sold</th>
          </tr>
        </thead>
        <tbody>
          {sales.map((sale) => (
            <tr key={sale._id}>
              <td>{sale.orderId}</td>
              <td>{sale.email}</td>
              <td>
                <AiOutlineDollar className="inline-block mr-1" />
                {sale.total}
              </td>
              <td>
                <BsFillCalendarDateFill className="inline-block mr-1" />
                {new Date(sale.createdAt).toLocaleString()}
              </td>
              <td>
                <ul>
                  {sale.items.map((item, index) => (
                    <li key={index}>
                      {item.name} (x{item.quantity})
                    </li>
                  ))}
                </ul>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProviderSales;
