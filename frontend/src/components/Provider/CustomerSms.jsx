import React from 'react';
import { FaRegMessage } from "react-icons/fa6";

const CustomerSms = () => {
    // Sample customer messages data
    const messages = [
        {
            id: 1,
            name: "John Smith",
            accountType: "Premium",
            email: "john.smith@gmail.com",
            count: 15,
            unread: 5,
            latest: "Need help with my order #1234"
        },
        {
            id: 2,
            name: "Sarah Wilson", 
            accountType: "Basic",
            email: "sarah.w@gmail.com",
            count: 8,
            unread: 2,
            latest: "When will my package arrive?"
        },
        {
            id: 3,
            name: "Mike Johnson",
            accountType: "Premium",
            email: "mike.j@gmail.com", 
            count: 12,
            unread: 3,
            latest: "Product inquiry about electronics"
        }
    ];

    return (
        <div className='bg-white dark:bg-gray-800 rounded-xl border-l-8 border-[#FF5722] p-6'>
            <h1 className='text-2xl font-bold text-green-700 mb-4'>Customer Messages</h1>
            <div className='space-y-4'>
                {messages.map(message => ( 
                    // rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800
                    <div key={message.id} className=' p-4 rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 flex items-center justify-between'>
                        <div>
                            <h2 className='font-semibold text-white'>{message.name}</h2>
                            <p className='text-sm text-gray-600'>{message.accountType} Account</p>
                            <p className='text-sm text-gray-500'>{message.email}</p>
                            <p className='text-sm text-gray-400 mt-1'>Latest: {message.latest}</p>
                            <span className='text-xs text-gray-500'>Messages: {message.count} ({message.unread} Unread)</span>
                        </div>
                        <div className='bg-orange-100 p-2 rounded-lg relative'>
                            <FaRegMessage size={24} className='text-[#FF5722]' />
                            {message.unread > 0 && (
                                <span className='absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center'>
                                    {message.unread}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default CustomerSms
