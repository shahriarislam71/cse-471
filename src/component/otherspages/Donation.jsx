import { useContext, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/Authcontext";

const Donation = () => {
    const { users } = useContext(AuthContext);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [programs, setPrograms] = useState([]);
    const [currencies] = useState([
        { code: 'USD', name: 'US Dollar' },
        { code: 'EUR', name: 'Euro' },
        { code: 'GBP', name: 'British Pound' },
        { code: 'BDT', name: 'Bangladeshi Taka' },
        { code: 'INR', name: 'Indian Rupee' },
    ]);

    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        defaultValues: {
            name: '',
            email: '',
            currency: 'USD',
            amount: '',
            program: '',
            transactionId: ''
        }
    });

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                if (users?.email) {
                    const response = await axios.get(`https://health-and-sanitation-backend.vercel.app/user?email=${users.email}`);
                    setCurrentUser(response.data.data);
                    reset({
                        name: response.data.data.name,
                        email: response.data.data.email,
                        currency: 'USD',
                        amount: '',
                        program: '',
                        transactionId: ''
                    });
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                toast.error("Failed to load user information");
            } finally {
                setLoading(false);
            }
        };

        const fetchPrograms = async () => {
            try {
                const response = await axios.get('https://health-and-sanitation-backend.vercel.app/programs');
                const filteredPrograms = response.data.filter(program => 
                    (program.programName === 'Seminar' || program.programName === 'Health Initiative') &&
                    (program.status === 'ongoing' || program.status === 'quick')
                );
                setPrograms(filteredPrograms);
            } catch (error) {
                console.error("Error fetching programs:", error);
                toast.error("Failed to load programs");
            }
        };

        fetchUserData();
        fetchPrograms();
    }, [users?.email, reset]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#008e48]"></div>
            </div>
        );
    }

    const onSubmit = async (data) => {
        setSubmitting(true);
        try {
            const response = await axios.post('https://health-and-sanitation-backend.vercel.app/donations', {
                ...data,
                transactionId: '',
                status: 'pending' // Empty string as specified
            });
            console.log(response)
            if(response.data?.data){
                window.location.replace(response.data.data)
            }
            
            toast.success("Donation submitted successfully!");
            reset({
                ...data,
                amount: '',
                program: '',
            });
            
        } catch (error) {
            console.error("Donation submission error:", error);
            toast.error("Failed to submit donation");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                        Make a Donation
                    </h2>
                    <p className="mt-4 text-lg leading-6 text-gray-600">
                        Your contribution helps us continue our vital health and sanitation programs.
                    </p>
                </div>

                <div className="bg-white shadow-xl rounded-lg overflow-hidden">
                    <div className="p-6 sm:p-10">
                        <div className="border-b border-gray-200 pb-6">
                            <h3 className="text-lg font-medium text-[#0A3B1E]">
                                Donation Information
                            </h3>
                        </div>

                        {currentUser ? (
                            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
                                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                                    {/* Name Field */}
                                    <div className="sm:col-span-3">
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                            Full Name
                                        </label>
                                        <div className="mt-1">
                                            <input
                                                type="text"
                                                id="name"
                                                {...register("name", { required: "Name is required" })}
                                                readOnly
                                                className="block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 focus:border-[#008e48] focus:ring-[#008e48] sm:text-sm py-2 px-3"
                                            />
                                            {errors.name && (
                                                <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Email Field */}
                                    <div className="sm:col-span-3">
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                            Email Address
                                        </label>
                                        <div className="mt-1">
                                            <input
                                                type="email"
                                                id="email"
                                                {...register("email", { 
                                                    required: "Email is required",
                                                    pattern: {
                                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                        message: "Invalid email address"
                                                    }
                                                })}
                                                readOnly
                                                className="block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 focus:border-[#008e48] focus:ring-[#008e48] sm:text-sm py-2 px-3"
                                            />
                                            {errors.email && (
                                                <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Currency Field */}
                                    <div className="sm:col-span-3">
                                        <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
                                            Currency
                                        </label>
                                        <div className="mt-1">
                                            <select
                                                id="currency"
                                                {...register("currency", { required: "Currency is required" })}
                                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#008e48] focus:ring-[#008e48] sm:text-sm py-2 px-3"
                                            >
                                                {currencies.map((currency) => (
                                                    <option key={currency.code} value={currency.code}>
                                                        {currency.name} ({currency.code})
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.currency && (
                                                <p className="mt-2 text-sm text-red-600">{errors.currency.message}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Amount Field */}
                                    <div className="sm:col-span-3">
                                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                                            Amount
                                        </label>
                                        <div className="mt-1 relative rounded-md shadow-sm">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <span className="text-gray-500 sm:text-sm">$</span>
                                            </div>
                                            <input
                                                type="number"
                                                id="amount"
                                                {...register("amount", { 
                                                    required: "Amount is required",
                                                    min: {
                                                        value: 1,
                                                        message: "Amount must be at least 1"
                                                    }
                                                })}
                                                className="block w-full rounded-md border-gray-300 pl-7 pr-12 focus:border-[#008e48] focus:ring-[#008e48] sm:text-sm py-2 px-3"
                                                placeholder="0.00"
                                                min="1"
                                            />
                                            {errors.amount && (
                                                <p className="mt-2 text-sm text-red-600">{errors.amount.message}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Program Field */}
                                    <div className="sm:col-span-6">
                                        <label htmlFor="program" className="block text-sm font-medium text-gray-700">
                                            Program to Support
                                        </label>
                                        <div className="mt-1">
                                            <select
                                                id="program"
                                                {...register("program", { required: "Please select a program" })}
                                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#008e48] focus:ring-[#008e48] sm:text-sm py-2 px-3"
                                            >
                                                <option value="">Select a program...</option>
                                                {programs.map((program) => (
                                                    <option key={program._id} value={program._id}>
                                                        {program.programName}: {program.title || program.announcementText?.substring(0, 50)}...
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.program && (
                                                <p className="mt-2 text-sm text-red-600">{errors.program.message}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6">
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#008e48] hover:bg-[#0A3B1E] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#008e48] transition-colors duration-300"
                                    >
                                        {submitting ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Processing...
                                            </>
                                        ) : (
                                            "Proceed to Payment"
                                        )}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="mt-8 text-center py-10">
                                <p className="text-red-500">Please log in to make a donation</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-10 bg-white shadow-xl rounded-lg overflow-hidden">
                    <div className="p-6 sm:p-10">
                        <div className="border-b border-gray-200 pb-6">
                            <h3 className="text-lg font-medium text-[#0A3B1E]">
                                Why Donate?
                            </h3>
                        </div>
                        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-[#008e48] text-white">
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <h4 className="text-lg leading-6 font-medium text-gray-900">Make an Impact</h4>
                                    <p className="mt-2 text-base text-gray-600">
                                        Your donation directly supports our health and sanitation initiatives in underserved communities.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-[#008e48] text-white">
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <h4 className="text-lg leading-6 font-medium text-gray-900">Transparent Process</h4>
                                    <p className="mt-2 text-base text-gray-600">
                                        We provide regular reports on how donations are used to ensure complete transparency.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Donation;