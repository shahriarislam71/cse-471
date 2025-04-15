import React, { useState } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaIdCard, FaNotesMedical } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const ProgramRegistration = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        nid: '',
        medicalHistory: '',
        participantType: 'patient'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Here you would typically send the data to your backend
        console.log('Form submitted:', formData);
        // Show success message and redirect
        alert('Registration successful!');
        navigate('/events/health-camp');
    };

    return (
        <div className="font-sans bg-gray-50 min-h-screen py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    {/* Registration Header */}
                    <div className="bg-blue-600 text-white p-8 text-center">
                        <h1 className="text-3xl font-bold mb-2">Health Program Registration</h1>
                        <p className="text-blue-100">Community Health Initiative • December 15-17, 2023</p>
                    </div>

                    {/* Registration Form */}
                    <div className="p-8">
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                {/* Participant Type */}
                                <div className="md:col-span-2">
                                    <label className="block text-gray-700 font-medium mb-2">
                                        I am registering as:
                                    </label>
                                    <div className="flex space-x-4">
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="participantType"
                                                value="patient"
                                                checked={formData.participantType === 'patient'}
                                                onChange={handleChange}
                                                className="mr-2"
                                            />
                                            Patient/Participant
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="participantType"
                                                value="volunteer"
                                                checked={formData.participantType === 'volunteer'}
                                                onChange={handleChange}
                                                className="mr-2"
                                            />
                                            Volunteer
                                        </label>
                                    </div>
                                </div>

                                {/* Name */}
                                <div className="relative">
                                    <label className="block text-gray-700 font-medium mb-2">
                                        Full Name
                                    </label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                            <FaUser />
                                        </span>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="relative">
                                    <label className="block text-gray-700 font-medium mb-2">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                            <FaEnvelope />
                                        </span>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>

                                {/* Phone */}
                                <div className="relative">
                                    <label className="block text-gray-700 font-medium mb-2">
                                        Phone Number
                                    </label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                            <FaPhone />
                                        </span>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            required
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="+880 1234 567890"
                                        />
                                    </div>
                                </div>

                                {/* NID/Passport */}
                                <div className="relative">
                                    <label className="block text-gray-700 font-medium mb-2">
                                        NID/Passport Number
                                    </label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                            <FaIdCard />
                                        </span>
                                        <input
                                            type="text"
                                            name="nid"
                                            value={formData.nid}
                                            onChange={handleChange}
                                            required
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="1234567890"
                                        />
                                    </div>
                                </div>

                                {/* Medical History (for patients) */}
                                {formData.participantType === 'patient' && (
                                    <div className="md:col-span-2 relative">
                                        <label className="block text-gray-700 font-medium mb-2">
                                            Medical History (if any)
                                        </label>
                                        <div className="relative">
                                            <span className="absolute top-3 left-3 text-gray-400">
                                                <FaNotesMedical />
                                            </span>
                                            <textarea
                                                name="medicalHistory"
                                                value={formData.medicalHistory}
                                                onChange={handleChange}
                                                rows="4"
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Any known medical conditions, allergies, or current medications..."
                                            ></textarea>
                                        </div>
                                    </div>
                                )}

                                {/* Volunteer-specific fields */}
                                {formData.participantType === 'volunteer' && (
                                    <div className="md:col-span-2">
                                        <label className="block text-gray-700 font-medium mb-2">
                                            Areas of Interest
                                        </label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {['Medical', 'Logistics', 'Registration', 'Education'].map(area => (
                                                <label key={area} className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        name={`interest-${area.toLowerCase()}`}
                                                        className="rounded text-blue-600"
                                                    />
                                                    <span>{area}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Terms and Submit */}
                            <div className="flex flex-col md:flex-row justify-between items-center mt-8">
                                <label className="flex items-center mb-4 md:mb-0">
                                    <input
                                        type="checkbox"
                                        required
                                        className="rounded text-blue-600 mr-2"
                                    />
                                    <span className="text-gray-700">
                                        I agree to the <a href="#" className="text-blue-600 hover:underline">terms and conditions</a>
                                    </span>
                                </label>
                                <button
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition w-full md:w-auto"
                                >
                                    Complete Registration
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProgramRegistration;