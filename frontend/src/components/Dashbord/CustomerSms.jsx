import React, { useEffect, useState,useContext } from 'react';
import { FaRegMessage, FaTrash } from "react-icons/fa6";
import { useAuthContext } from "../../hooks/useAuthContext";

const CustomerSms = () => {
    const { user } = useAuthContext();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const handleDeleteMessage = async (id) => {
        if (!user) return;
        
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/contact/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to delete message');
            }
            
            setMessages(messages.filter(message => message._id !== id));
        } catch (err) {
            setError(err.message);
        }
    };

    const handleMarkAsSeen = async (id) => {
        if (!user) return;
        
        try {
            const message = messages.find(m => m._id === id);
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/contact/${id}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ unread: message ? (message.unread ? 0 : 1) : 0 })
            });
            
            if (!response.ok) {
                throw new Error('Failed to mark message as seen');
            }
            
            setMessages(messages.map(message => 
                message._id === id ? { ...message, unread: message.unread ? 0 : 1 } : message
            ));
        } catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => { 
        const fetchMessages = async () => {
            if (!user) {
                setError('You must be logged in to view messages');
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/contact`, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    }
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();
                setMessages(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        
        fetchMessages();
    }, []);

    if (!user) return <div className="p-6 text-red-500">Please log in to view messages</div>;
    if (loading) return <div className="p-6">Loading messages...</div>;
    if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

    return (
        <div className='bg-white dark:bg-gray-800 rounded-xl border-l-8 border-[#FF5722] p-6'>
            <h1 className='text-2xl font-bold text-green-700 mb-4'>Customer Messages</h1>
            <div className='space-y-4'>
                {messages.length === 0 && (
                    <div className="text-gray-500">No messages found</div>
                )}
                {messages.map(message => ( 
                    <div key={message._id} className='p-4 rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 flex items-center justify-between'>
                        <div>
                            <h2 className='font-semibold text-white'>{message.name}</h2>
                            <p className='text-sm text-gray-500'>{message.email}</p>
                            <p className='text-sm text-gray-400 mt-1'>{message.message}</p>
                            <span className='text-xs text-gray-500'>
                                {new Date(message.createdAt).toLocaleString()}
                            </span>
                        </div>
                        <div className='flex items-center gap-2'>
                            <div className='bg-orange-100 p-2 rounded-lg relative'>
                                <FaRegMessage size={24} className='text-[#FF5722]' />
                                {message.unread > 0 && (
                                    <span className='absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center'>
                                        {message.unread}
                                    </span>
                                )}
                            </div>
                            <input
                                type="checkbox"
                                checked={!message.unread}
                                onChange={() => handleMarkAsSeen(message._id)}
                                className="w-5 h-5 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                                title={message.unread ? "Mark as read" : "Mark as unread"}
                            />
                            <button 
                                onClick={() => handleDeleteMessage(message._id)}
                                className='p-2 bg-red-100 rounded-lg hover:bg-red-200 transition-colors'
                                title="Delete message"
                            >
                                <FaTrash className='text-red-600' size={20} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default CustomerSms;
