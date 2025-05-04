import { Link } from "react-router-dom";

const Success = () => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-[#008e48]/10 to-white flex items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-white rounded-xl shadow-2xl overflow-hidden">
                <div className="bg-[#008e48] p-6 text-center">
                    <svg 
                        className="w-20 h-20 mx-auto text-white" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24" 
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                        />
                    </svg>
                    <h1 className="text-3xl font-bold text-white mt-4">Donation Successful!</h1>
                </div>
                
                <div className="p-8 sm:p-10 text-center">
                    <div className="text-[#0A3B1E] mb-8">
                        <p className="text-xl font-medium mb-2">Thank you for your generous contribution!</p>
                        <p className="text-gray-600">
                            Your donation will help us continue our vital health and sanitation programs.
                            A receipt has been sent to your email.
                        </p>
                    </div>

                    <div className="mb-10">
                        <div className="inline-flex items-center justify-center bg-[#008e48]/10 rounded-full p-4">
                            <svg 
                                className="w-16 h-16 text-[#008e48]" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24" 
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={1} 
                                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                                />
                            </svg>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Link 
                            to="/" 
                            className="inline-block w-full sm:w-auto px-8 py-3 bg-[#008e48] hover:bg-[#0A3B1E] text-white font-medium rounded-lg shadow-md transition duration-300 transform hover:scale-105"
                        >
                            Return to Home
                        </Link>
                        
                        <p className="text-sm text-gray-500 mt-4">
                            Need help? <a href="mailto:support@example.com" className="text-[#008e48] hover:underline">Contact our support team</a>
                        </p>
                    </div>
                </div>

                <div className="bg-gray-50 px-6 py-4 text-center">
                    <p className="text-sm text-gray-500">
                        Transaction ID: #DON-{Math.random().toString(36).substring(2, 10).toUpperCase()}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Success;