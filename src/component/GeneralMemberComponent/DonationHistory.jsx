import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/Authcontext";
import axios from "axios";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const DonationHistory = () => {
    const { users } = useContext(AuthContext);
    const currentEmail = users?.email;
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDonationHistory = async () => {
            try {
                setLoading(true);
                if (!currentEmail) return;

                // Fetch only successful donations for the current user
                const donationsResponse = await axios.get(
                    `https://health-and-sanitation-backend.vercel.app/donations?email=${currentEmail}`
                );
                
                // Fetch program details for each donation
                const donationsWithPrograms = await Promise.all(
                    donationsResponse.data.map(async (donation) => {
                        try {
                            const programResponse = await axios.get(
                                `https://health-and-sanitation-backend.vercel.app/program/${donation.program}`
                            );
                            return {
                                ...donation,
                                programDetails: programResponse.data
                            };
                        } catch (error) {
                            console.error("Error fetching program details:", error);
                            return null; // Skip donations with missing program details
                        }
                    })
                );

                // Filter out null values (donations with missing program details)
                setDonations(donationsWithPrograms.filter(donation => donation !== null));
            } catch (error) {
                console.error("Error fetching donation history:", error);
                toast.error("Failed to load donation history");
            } finally {
                setLoading(false);
            }
        };

        fetchDonationHistory();
    }, [currentEmail]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#008e48]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-extrabold text-[#0A3B1E] sm:text-4xl">
                        Your Donation History
                    </h1>
                    <p className="mt-4 text-lg text-gray-600">
                        View all your successful contributions to our programs
                    </p>
                </div>

                {donations.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="mx-auto h-24 w-24 text-[#008e48] mb-6">
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor"
                            >
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={1.5} 
                                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                                />
                            </svg>
                        </div>
                        <h3 className="text-xl font-medium text-gray-900">
                            No successful donations yet
                        </h3>
                        <p className="mt-2 text-gray-600">
                            Your successful donations will appear here once processed.
                        </p>
                        <div className="mt-6">
                            <Link
                                to="/donate"
                                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-[#008e48] hover:bg-[#0A3B1E] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#008e48]"
                            >
                                Make a Donation
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                            <div className="divide-y divide-gray-200">
                                {donations.map((donation) => (
                                    <div key={donation._id} className="py-5 sm:py-6 px-4 sm:grid sm:grid-cols-12 sm:gap-4">
                                        {donation.programDetails?.bannerImage ? (
                                            <div className="sm:col-span-2 mb-4 sm:mb-0">
                                                <img
                                                    className="w-full h-32 object-cover rounded-lg"
                                                    src={donation.programDetails.bannerImage}
                                                    alt={donation.programDetails.title}
                                                    onError={(e) => {
                                                        e.target.onerror = null; 
                                                        e.target.src = "https://via.placeholder.com/150";
                                                    }}
                                                />
                                            </div>
                                        ) : (
                                            <div className="sm:col-span-2 mb-4 sm:mb-0 flex items-center justify-center bg-gray-100 rounded-lg">
                                                <svg 
                                                    className="h-20 w-20 text-gray-400" 
                                                    fill="none" 
                                                    viewBox="0 0 24 24" 
                                                    stroke="currentColor"
                                                >
                                                    <path 
                                                        strokeLinecap="round" 
                                                        strokeLinejoin="round" 
                                                        strokeWidth={1} 
                                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                                                    />
                                                </svg>
                                            </div>
                                        )}
                                        
                                        <div className="sm:col-span-7">
                                            <div className="flex items-center space-x-2">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                    donation.status === 'Success' 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {donation.status}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {new Date(donation.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-medium text-[#0A3B1E] mt-1">
                                                {donation.programDetails?.title || "Unknown Program"}
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {donation.programDetails?.programName || "Program"}
                                            </p>
                                            <p className="text-sm text-gray-600 mt-2">
                                                Transaction ID: {donation.transactionId}
                                            </p>
                                        </div>
                                        
                                        <div className="sm:col-span-3 mt-4 sm:mt-0 flex flex-col sm:items-end">
                                            <div className="text-xl font-bold text-[#008e48]">
                                                {donation.currency} {donation.amount}
                                            </div>
                                            <div className="mt-2 flex-shrink-0 flex">
                                                <Link
                                                    to={`/program/${donation.program}`}
                                                    className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-[#008e48] bg-[#008e48]/10 hover:bg-[#008e48]/20"
                                                >
                                                    View Program
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {donations.length > 0 && (
                    <div className="mt-10 bg-[#008e48]/5 p-6 rounded-lg border border-[#008e48]/10">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-[#008e48] p-3 rounded-full">
                                <svg 
                                    className="h-6 w-6 text-white" 
                                    fill="none" 
                                    viewBox="0 0 24 24" 
                                    stroke="currentColor"
                                >
                                    <path 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        strokeWidth={2} 
                                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" 
                                    />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-medium text-[#0A3B1E]">
                                    Your Impact Matters
                                </h3>
                                <p className="mt-1 text-sm text-gray-600">
                                    Thank you for supporting our health and sanitation initiatives. 
                                    Your donations help create healthier communities.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DonationHistory;