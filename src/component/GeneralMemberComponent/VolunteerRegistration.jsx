import { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useForm, useWatch } from 'react-hook-form';
import { AuthContext } from '../../context/Authcontext';
import Swal from 'sweetalert2';

const VolunteerRegistration = () => {
    const { register, handleSubmit, control, formState: { errors } } = useForm();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [volunteerData, setVolunteerData] = useState(null);
    const { users } = useContext(AuthContext);
    
    // Watch the volunteerFor field
    const volunteerFor = useWatch({
      control,
      name: "volunteerFor",
    });

    // Fetch volunteer data after successful submission
    useEffect(() => {
      const fetchVolunteerData = async () => {
        if (submitSuccess && users?.email) {
          try {
            const response = await axios.get(`https://health-and-sanitation-backend.vercel.app/volunteers/${users.email}`);
            if (response.data.success) {
              setVolunteerData({
                ...response.data.data,
                registrationDate: new Date(response.data.data.createdAt || new Date()).toLocaleDateString()
              });
            }
          } catch (error) {
            console.error("Error fetching volunteer data:", error);
          }
        }
      };
  
      fetchVolunteerData();
    }, [submitSuccess, users?.email]);
  
    const onSubmit = async (data) => {
      setIsSubmitting(true);
      setSubmitError('');
      
      try {
        const response = await axios.post('https://health-and-sanitation-backend.vercel.app/volunteerss', {
          ...data,
          status: 'pending',
          email: users?.email
        });
        
        if (response.status === 201) {
          setSubmitSuccess(true);
          Swal.fire({
            position: "top-end",
            icon: "success",
            title: "Volunteer Registration Successful",
            showConfirmButton: false,
            timer: 1500
          });
        }
      } catch (error) {
        console.log(error)
        setSubmitError(error.response?.data?.message || 'Registration failed. Please try again.');
        Swal.fire({
          icon: "error",
          title: "Registration Failed",
          text: error.response?.data?.message || 'Registration failed. Please try again.',
        });
      } finally {
        setIsSubmitting(false);
      }
    };

  if (submitSuccess && volunteerData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#008E48]/10 to-[#0A3B1E]/10 py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-[#008E48] mb-3">Registration Complete!</h1>
            <p className="text-lg text-gray-600">Thank you for joining our volunteer team</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Status Banner */}
            <div className={`bg-[#008E48] text-white p-4 text-center`}>
              <h2 className="text-2xl font-bold">Your Volunteer Status</h2>
              <div className="mt-2 flex items-center justify-center">
                <span className={`px-4 py-1 rounded-full bg-white text-[#008E48] font-semibold text-sm flex items-center`}>
                  {volunteerData.status === 'pending' && (
                    <>
                      <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2 animate-pulse"></span>
                      Pending Approval
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* Volunteer Information */}
            <div className="p-6 md:p-8">
              <h3 className="text-xl font-semibold text-[#008E48] mb-6 pb-2 border-b border-[#008E48]/20">
                Your Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoCard label="Full Name" value={volunteerData.name} />
                <InfoCard label="Contact Number" value={volunteerData.contactNumber} />
                <InfoCard label="Emergency Contact" value={volunteerData.emergencyContact} />
                <InfoCard label="Volunteer Role" value={volunteerData.volunteerFor} />
                {volunteerData.specialization && <InfoCard label="Specialized In" value={volunteerData.specialization} />}
                <InfoCard label="Education" value={volunteerData.education} />
                <InfoCard label="Occupation" value={volunteerData.occupation} />
              </div>

              <div className="mt-6">
                <InfoCard label="Permanent Address" value={volunteerData.permanentAddress} fullWidth />
                <InfoCard label="Present Address" value={volunteerData.presentAddress} fullWidth className="mt-4" />
              </div>

              <div className="mt-8 pt-6 border-t border-[#008E48]/20">
                <p className="text-gray-600 text-center">
                  We'll review your application and contact you soon. Thank you for your willingness to serve!
                </p>
                <div className="flex justify-center mt-6">
                  <button
                    onClick={() => setSubmitSuccess(false)}
                    className="px-6 py-2 bg-[#008E48] text-white rounded-lg hover:bg-[#0A3B1E] transition"
                  >
                    Back to Form
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br mt-10 bg-[#D9D9D9] py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#008E48] mb-2">Volunteer Registration</h1>
          <p className="text-gray-600">Join our team and make a difference in your community</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {submitError && (
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {submitError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                {...register("name", { required: "Name is required" })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#008e48] focus:border-[#008E48] ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="John Doe"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>

            {/* Contact Number */}
            <div>
              <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Contact Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="contactNumber"
                {...register("contactNumber", { 
                  required: "Contact number is required",
                  pattern: {
                    value: /^[0-9]{10,15}$/,
                    message: "Please enter a valid phone number"
                  }
                })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#008e48] focus:border-[#008E48] ${errors.contactNumber ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="1234567890"
              />
              {errors.contactNumber && <p className="mt-1 text-sm text-red-600">{errors.contactNumber.message}</p>}
            </div>

            {/* Emergency Contact */}
            <div>
              <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700 mb-1">
                Emergency Contact Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="emergencyContact"
                {...register("emergencyContact", { 
                  required: "Emergency contact is required",
                  pattern: {
                    value: /^[0-9]{10,15}$/,
                    message: "Please enter a valid phone number"
                  }
                })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#008e48] focus:border-[#008E48] ${errors.emergencyContact ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="9876543210"
              />
              {errors.emergencyContact && <p className="mt-1 text-sm text-red-600">{errors.emergencyContact.message}</p>}
            </div>

            {/* Education */}
            <div>
              <label htmlFor="education" className="block text-sm font-medium text-gray-700 mb-1">
                Educational Information <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="education"
                {...register("education",{required: 'Education Info required'})}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008e48] focus:border-[#008E48] ${errors.education ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Bachelor's Degree in Computer Science"
              />
              {errors.education && <p className="mt-1 text-sm text-red-600">{errors.education.message}</p>}
            </div>

            {/* Occupation */}
            <div>
              <label htmlFor="occupation" className="block text-sm font-medium text-gray-700 mb-1">
                Occupation  <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="occupation"
                {...register("occupation",{required: 'Occupation is required'})}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008e48] focus:border-[#008E48] ${errors.occupation ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Software Engineer"
              />
              {errors.occupation && <p className="mt-1 text-sm text-red-600">{errors.occupation.message}</p>}
            </div>

            {/* Volunteer For */}
            <div>
              <label htmlFor="volunteerFor" className="block text-sm font-medium text-gray-700 mb-1">
                Volunteer As <span className="text-red-500">*</span>
              </label>
              <select
                id="volunteerFor"
                {...register("volunteerFor", { required: "Please select a role" })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#008e48] focus:border-[#008E48] ${errors.volunteerFor ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">Select a role</option>
                <option value="Teacher">Teacher</option>
                <option value="Doctor">Doctor</option>
                <option value="General Volunteer">General Volunteer</option>
              </select>
              {errors.volunteerFor && <p className="mt-1 text-sm text-red-600">{errors.volunteerFor.message}</p>}
            </div>

            {/* Specialization (shown only when Doctor is selected) */}
            {volunteerFor === "Doctor" && (
              <div>
                <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-1">
                  Specialized In <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="specialization"
                  {...register("specialization", { required: "Specialization is required for doctors" })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#008e48] focus:border-[#008E48] ${errors.specialization ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Cardiology, Pediatrics, etc."
                />
                {errors.specialization && <p className="mt-1 text-sm text-red-600">{errors.specialization.message}</p>}
              </div>
            )}
          </div>

          {/* Permanent Address */}
          <div>
            <label htmlFor="permanentAddress" className="block text-sm font-medium text-gray-700 mb-1">
              Permanent Address <span className="text-red-500">*</span>
            </label>
            <textarea
              id="permanentAddress"
              {...register("permanentAddress", { required: "Permanent address is required" })}
              rows={3}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#008e48] focus:border-[#008E48] ${errors.permanentAddress ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="123 Main St, City, Country"
            />
            {errors.permanentAddress && <p className="mt-1 text-sm text-red-600">{errors.permanentAddress.message}</p>}
          </div>

          {/* Present Address */}
          <div>
            <label htmlFor="presentAddress" className="block text-sm font-medium text-gray-700 mb-1">
              Present Address  <span className="text-red-500">*</span>
            </label>
            <textarea
              id="presentAddress"
              {...register("presentAddress", { required: "Present address is required" })}
              rows={3}
              className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008e48] focus:border-[#008E48] ${errors.presentAddress ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="456 Current St, City, Country (if different from permanent address)"
            />
            {errors.presentAddress && <p className="mt-1 text-sm text-red-600">{errors.presentAddress.message}</p>}
          </div>

          <div className="flex items-center justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-[#008E48] text-white font-medium rounded-lg hover:bg-[#0A3B1E] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : 'Submit Registration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Reusable InfoCard component for the success view
const InfoCard = ({ label, value, fullWidth = false, className = '' }) => (
  <div className={`${fullWidth ? 'col-span-2' : ''} ${className}`}>
    <p className="text-sm font-medium text-gray-500">{label}</p>
    <p className="mt-1 text-lg font-medium text-gray-900 break-words">
      {value || <span className="text-gray-400">Not provided</span>}
    </p>
  </div>
);

export default VolunteerRegistration;