import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../../hooks/useAuthContext';
import { AiOutlineDelete } from 'react-icons/ai';
import { FaUserCircle } from 'react-icons/fa';

const UseronProvider = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuthContext();

    useEffect(() => {
        const fetchUsers = async () => {
            if (!user) {
                setError('Authentication required');
                setLoading(false);
                return;
            }

            try {
                if (!user.token) {
                    setError('User token not available');
                    setLoading(false);
                    return;
                }

                // Get the ID from the decoded JWT token
                try {
                    const token = user.token;
                    const base64Url = token.split(".")[1];
                    if (!base64Url) {
                        throw new Error('Invalid token format');
                    }
                    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
                    const decodedToken = JSON.parse(window.atob(base64));
                    const userId = decodedToken._id;

                    if (!userId) {
                        throw new Error('User ID not found in token');
                    }

                    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/buyers/provider/${userId}`, {
                        method: 'GET',
                        credentials: 'include',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        }
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || 'Failed to fetch users');
                    }

                    const responseData = await response.json();
                    if (responseData.success && Array.isArray(responseData.data)) {
                        setUsers(responseData.data);
                    } else {
                        setUsers([]);
                    }
                    setError(null);
                } catch (tokenError) {
                    console.error('Token decode error:', tokenError);
                    setError('Invalid authentication token');
                }
            } catch (err) {
                console.error('Error fetching users:', err);
                setError(err.message || 'Failed to fetch users');
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [user]);

    const handleDelete = async (userId) => {
        if (!user?.token) {
            setError('Authentication required');
            return;
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/buyers/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete user');
            }

            setUsers(users.filter(u => u._id !== userId));
        } catch (err) {
            console.error('Error deleting user:', err);
            setError('Failed to delete user');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-red-500 text-center p-4">
                {error}
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Customer Management</h2>
            {users.length === 0 ? (
                <div className="text-center text-gray-600 dark:text-gray-400 py-8">
                    No customers found
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Phone</th>
                                    {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th> */}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200 dark:divide-gray-700 dark:bg-gray-800">
                                {users.map((customer) => (
                                    <tr key={customer._id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <FaUserCircle className="h-10 w-10 text-gray-400" />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {customer.name || customer.email.split('@')[0]}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 dark:text-white">
                                                {customer.email}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 dark:text-white">
                                                {customer.phone || 'N/A'}
                                            </div>
                                        </td>
                                        {/* <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleDelete(customer._id)}
                                                className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
                                            >
                                                <AiOutlineDelete className="h-5 w-5" />
                                            </button>
                                        </td> */}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UseronProvider;