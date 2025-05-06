import { useEffect, useState } from "react" 
import CardForm from "../../components/CardForm"
import CardList from "../../components/CardList"
import { useCardsContext } from "../../hooks/useCardsContext"
import { useAuthContext } from "../../hooks/useAuthContext"

const SuccessModal = ({ isOpen, onClose, message }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]" 
             onClick={onClose}
        >
            <div 
                className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full mx-4 transform transition-all duration-300 ease-in-out"
                onClick={e => e.stopPropagation()}
            >
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                        <svg 
                            className="h-6 w-6 text-green-600" 
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
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Success!
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {message}
                    </p>
                </div>
                <div className="mt-5">
                    <button
                        onClick={onClose}
                        className="w-full inline-flex justify-center rounded-md border border-transparent 
                                 shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white 
                                 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
                                 focus:ring-green-500 sm:text-sm transition-colors duration-200"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

const Provider = () => {  
    const { dispatch } = useCardsContext() 
    const { user } = useAuthContext()
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');

    useEffect(() => {
        const fetchCards = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/cards`, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch products');
                }

                const json = await response.json();
                dispatch({type: 'SET_CARDS', payload: json});
            } catch (error) {
                console.error('Error fetching cards:', error);
            }
        };

        if (user) {
            fetchCards();
        }
    }, [dispatch, user]);

    const handleSuccess = (message) => {
        setModalMessage(message);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setModalMessage('');
    };

    return (
        <>
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="lg:w-1/3">
                        <div className="sticky top-4">
                            <CardForm onSuccess={handleSuccess} />
                        </div>
                    </div>
                    <div className="lg:w-2/3">
                        <CardList />
                    </div>
                </div>
            </div>

            <SuccessModal 
                isOpen={showModal}
                onClose={closeModal}
                message={modalMessage}
            />
        </>
    )
}

export default Provider