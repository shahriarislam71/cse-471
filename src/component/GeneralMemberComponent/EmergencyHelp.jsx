import { useState, useEffect, useContext } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthContext } from '../../context/Authcontext';
import Swal from 'sweetalert2';

const EmergencyHelp = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [calamities, setCalamities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {users} = useContext(AuthContext)
  console.log(calamities)

  useEffect(() => {
    const fetchCalamities = async () => {
      try {
        const response = await axios.get('https://health-and-sanitation-backend.vercel.app/calamity', {
          params: { status: 'Ongoing' }
        });
        console.log(response)
        setCalamities(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching calamities:', error);
        toast.error('Failed to load crisis options');
        setIsLoading(false);
      }
    };

    fetchCalamities();
  }, []);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      
      const userEmail = users?.email
      
      if (!userEmail) {
        throw new Error('User not authenticated');
      }

      const submissionData = {
        ...data,
        userEmail,
        status: 'Pending',
        isRescued: 'No',
        createdAt: new Date().toISOString()
      };

      await axios.post('https://health-and-sanitation-backend.vercel.app/emergencyHelp', submissionData);
      Swal.fire({
              position: "top-end",
              icon: "success",
              title: 'Emergency request submitted successfully! Help is on the way.',
              showConfirmButton: false,
              timer: 3000
            });
      reset();
    } catch (error) {
      console.error('Error submitting emergency request:', error);
      toast.error('Failed to submit emergency request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f0f9f4] to-[#e0f2e9] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-[#0A3B1E] sm:text-4xl">
            Emergency Assistance Request
          </h1>
          <p className="mt-3 text-lg text-[#008e48]">
            Fill out this form to request immediate help during a crisis
          </p>
        </div>

        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="bg-[#008e48] p-4">
            <h2 className="text-xl font-bold text-white">Request Form</h2>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 sm:p-8">
            <div className="space-y-6">
              {/* Phone Number Field */}
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="tel"
                    id="phoneNumber"
                    {...register('phoneNumber', { 
                      required: 'Phone number is required',
                      pattern: {
                        value: /^[0-9]{10,15}$/,
                        message: 'Please enter a valid phone number'
                      }
                    })}
                    className={`block w-full px-4 py-3 rounded-md border ${errors.phoneNumber ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-[#008e48] focus:border-[#008e48]'} focus:ring-2 focus:ring-opacity-50`}
                    placeholder="Enter your phone number"
                  />
                </div>
                {errors.phoneNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.phoneNumber.message}</p>
                )}
              </div>

              {/* Location Field */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Your Location <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="location"
                    {...register('location', { required: 'Location is required' })}
                    className={`block w-full px-4 py-3 rounded-md border ${errors.location ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-[#008e48] focus:border-[#008e48]'} focus:ring-2 focus:ring-opacity-50`}
                    placeholder="Enter your current location"
                  />
                </div>
                {errors.location && (
                  <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
                )}
              </div>

              {/* Crisis For Field */}
              <div>
                <label htmlFor="crisisFor" className="block text-sm font-medium text-gray-700">
                  Crisis Type <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  {isLoading ? (
                    <div className="animate-pulse h-12 bg-gray-200 rounded-md"></div>
                  ) : (
                    <select
                      id="crisisFor"
                      {...register('crisisFor', { required: 'Please select a crisis type' })}
                      className={`block w-full px-4 py-3 rounded-md border ${errors.crisisFor ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-[#008e48] focus:border-[#008e48]'} focus:ring-2 focus:ring-opacity-50`}
                      defaultValue=""
                    >
                      <option value="" disabled>Select crisis type</option>
                      {calamities.map((calamity) => (
                        <option key={calamity._id} value={calamity._id}>
                          {calamity.title} - {calamity.location}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                {errors.crisisFor && (
                  <p className="mt-1 text-sm text-red-600">{errors.crisisFor.message}</p>
                )}
                {calamities.length === 0 && !isLoading && (
                  <p className="mt-1 text-sm text-yellow-600">No ongoing crises found</p>
                )}
              </div>

              {/* Message Field */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                  Message <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <textarea
                    id="message"
                    rows={4}
                    {...register('message', { 
                      required: 'Message is required',
                      minLength: {
                        value: 20,
                        message: 'Message should be at least 20 characters'
                      }
                    })}
                    className={`block w-full px-4 py-3 rounded-md border ${errors.message ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-[#008e48] focus:border-[#008e48]'} focus:ring-2 focus:ring-opacity-50`}
                    placeholder="Describe your emergency situation in detail"
                  />
                </div>
                {errors.message && (
                  <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || isLoading || calamities.length === 0}
                  className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white ${isSubmitting || isLoading || calamities.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#0A3B1E] hover:bg-[#008e48]'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#008e48] transition-colors duration-200`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    'Request Emergency Help'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="mt-8 bg-[#f8fffa] border border-[#d1f0de] rounded-lg p-6">
          <h3 className="text-lg font-medium text-[#0A3B1E] mb-3">What happens after submission?</h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <svg className="h-5 w-5 text-[#008e48] mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Your request will be immediately sent to our emergency response team</span>
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-[#008e48] mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>A volunteer will contact you within 15 minutes</span>
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-[#008e48] mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Stay at your current location if it's safe to do so</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EmergencyHelp;