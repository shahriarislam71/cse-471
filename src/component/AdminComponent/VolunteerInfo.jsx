import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const VolunteerInfo = () => {
    const [volunteers, setVolunteers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedVolunteer, setSelectedVolunteer] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchVolunteers();
    }, []);

    const fetchVolunteers = async () => {
        try {
            const response = await axios.get('https://health-and-sanitation-backend.vercel.app/volunteers');
            setVolunteers(response.data.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching volunteers:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to fetch volunteer data',
            });
            setLoading(false);
        }
    };

    const updateUserVolunteerType = async (email, volunteerFor) => {
        try {
            // Map the volunteerFor to match your backend enum values
            let volunteerType;
            switch(volunteerFor) {
                case 'Teacher':
                    volunteerType = 'Teacher';
                    break;
                case 'Doctor':
                    volunteerType = 'Doctor';
                    break;
                case 'General Volunteer':
                    volunteerType = 'General Volunteer';
                    break;
                default:
                    volunteerType = 'General';
            }

            await axios.put(`https://health-and-sanitation-backend.vercel.app/user?email=${email}`, {
                volunteer_type: volunteerType
            });
        } catch (error) {
            console.error("Error updating user volunteer type:", error);
            throw error;
        }
    };

    const handleApprove = async (id, email, volunteerFor) => {
        try {
            // First update the volunteer status
            await axios.patch(`https://health-and-sanitation-backend.vercel.app/volunteers/${id}`, { status: 'approved' });
            
            // Then update the user's volunteer_type
            await updateUserVolunteerType(email, volunteerFor);

            Swal.fire({
                icon: 'success',
                title: 'Approved!',
                text: 'Volunteer has been approved and user role updated',
                timer: 1500
            });
            fetchVolunteers();
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'Failed to approve volunteer',
            });
        }
    };

    const handleReject = async (id) => {
        try {
            await axios.patch(`https://health-and-sanitation-backend.vercel.app/volunteers/${id}`, { status: 'rejected' });
            Swal.fire({
                icon: 'success',
                title: 'Rejected!',
                text: 'Volunteer has been rejected',
                timer: 1500
            });
            fetchVolunteers();
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'Failed to reject volunteer',
            });
        }
    };

    const openDetailsModal = (volunteer) => {
        setSelectedVolunteer(volunteer);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedVolunteer(null);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#008E48]/10 to-[#0A3B1E]/10 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="p-6 bg-[#008E48] text-white">
                        <h1 className="text-2xl font-bold">Volunteer Requests</h1>
                        <p className="opacity-90">Review and manage volunteer applications</p>
                    </div>

                    <div className="p-6">
                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#008E48]"></div>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {volunteers.map((volunteer, index) => (
                                            <tr key={volunteer._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{volunteer.name}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{volunteer.volunteerFor}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                                        volunteer.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                        volunteer.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                        'bg-red-100 text-red-800'
                                                    }`}>
                                                        {volunteer.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <button
                                                        onClick={() => openDetailsModal(volunteer)}
                                                        className="mr-2 text-[#008E48] hover:text-[#0A3B1E]"
                                                    >
                                                        Details
                                                    </button>
                                                    <button
                                                        onClick={() => handleApprove(volunteer._id, volunteer.email, volunteer.volunteerFor)}
                                                        disabled={volunteer.status === 'approved'}
                                                        className={`mr-2 ${volunteer.status === 'approved' ? 'text-gray-400 cursor-not-allowed' : 'text-green-600 hover:text-green-800'}`}
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(volunteer._id)}
                                                        disabled={volunteer.status === 'rejected'}
                                                        className={`${volunteer.status === 'rejected' ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 hover:text-red-800'}`}
                                                    >
                                                        Reject
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Details Modal */}
            {showModal && selectedVolunteer && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 bg-[#008E48] text-white">
                            <h2 className="text-xl font-bold">Volunteer Details</h2>
                            <button 
                                onClick={closeModal}
                                className="absolute top-4 right-4 text-white hover:text-gray-200"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <DetailItem label="Full Name" value={selectedVolunteer.name} />
                                <DetailItem label="Contact Number" value={selectedVolunteer.contactNumber} />
                                <DetailItem label="Emergency Contact" value={selectedVolunteer.emergencyContact} />
                                <DetailItem label="Email" value={selectedVolunteer.email} />
                                <DetailItem label="Volunteer Role" value={selectedVolunteer.volunteerFor} />
                                <DetailItem label="Status" value={selectedVolunteer.status} />
                                <DetailItem label="Education" value={selectedVolunteer.education} />
                                <DetailItem label="Occupation" value={selectedVolunteer.occupation} />
                            </div>
                            <div className="mt-6">
                                <DetailItem label="Permanent Address" value={selectedVolunteer.permanentAddress} fullWidth />
                                <DetailItem label="Present Address" value={selectedVolunteer.presentAddress} fullWidth className="mt-4" />
                            </div>
                            <div className="mt-8 flex justify-end space-x-4">
                                <button
                                    onClick={() => {
                                        handleApprove(selectedVolunteer._id, selectedVolunteer.email, selectedVolunteer.volunteerFor);
                                        closeModal();
                                    }}
                                    disabled={selectedVolunteer.status === 'approved'}
                                    className={`px-4 py-2 rounded-lg ${selectedVolunteer.status === 'approved' ? 
                                        'bg-gray-300 text-gray-600 cursor-not-allowed' : 
                                        'bg-green-600 text-white hover:bg-green-700'}`}
                                >
                                    Approve
                                </button>
                                <button
                                    onClick={() => {
                                        handleReject(selectedVolunteer._id);
                                        closeModal();
                                    }}
                                    disabled={selectedVolunteer.status === 'rejected'}
                                    className={`px-4 py-2 rounded-lg ${selectedVolunteer.status === 'rejected' ? 
                                        'bg-gray-300 text-gray-600 cursor-not-allowed' : 
                                        'bg-red-600 text-white hover:bg-red-700'}`}
                                >
                                    Reject
                                </button>
                                <button
                                    onClick={closeModal}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const DetailItem = ({ label, value, fullWidth = false, className = '' }) => (
    <div className={`${fullWidth ? 'col-span-2' : ''} ${className}`}>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="mt-1 text-base text-gray-900 break-words">
            {value || <span className="text-gray-400">Not provided</span>}
        </p>
    </div>
);

export default VolunteerInfo;