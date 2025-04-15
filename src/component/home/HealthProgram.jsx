
import { FaCalendarAlt, FaMapMarkerAlt, FaUserMd, FaUsers, FaStethoscope, FaPills, FaHeartbeat } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const HealthProgram = () => {
    // Program data
    const program = {
        title: "Community Health Initiative",
        coverImage: "https://cdn.expresshealthcare.in/wp-content/uploads/2020/01/03174832/Medical-camp-750x409.jpg",
        description: [
            "Our Community Health Initiative is a comprehensive program designed to provide free medical services to underserved populations. The program brings together healthcare professionals, volunteers, and community members to create a healthier society.",
            "This initiative focuses on preventive care, health education, and basic medical services. We aim to reach those who have limited access to healthcare facilities and provide them with quality medical attention."
        ],
        startDate: "2023-12-15",
        endDate: "2023-12-17",
        time: "09:00 AM - 04:00 PM",
        location: "Central Community Park, Dhaka",
        doctors: [
            { name: "Dr. Sarah Johnson", specialty: "General Physician", image: "https://randomuser.me/api/portraits/women/65.jpg" },
            { name: "Dr. Michael Chen", specialty: "Pediatrician", image: "https://randomuser.me/api/portraits/men/32.jpg" },
            { name: "Dr. Fatima Ahmed", specialty: "Dermatologist", image: "https://randomuser.me/api/portraits/women/44.jpg" }
        ],
        services: [
            { name: "Free medical checkups", icon: <FaStethoscope className="text-blue-500" /> },
            { name: "Basic diagnostic tests", icon: <FaHeartbeat className="text-green-500" /> },
            { name: "Health education sessions", icon: <FaUserMd className="text-purple-500" /> },
            { name: "Medication distribution", icon: <FaPills className="text-red-500" /> },
            { name: "Nutrition counseling", icon: <FaUsers className="text-yellow-500" /> }
        ],
        registrationLink: "/register/health-camp",
        organizer: "Health & Sanitation Foundation",
        contactEmail: "healthcamp@example.com",
        contactPhone: "+880 1234 567890"
    };

    return (
        <div className="font-sans bg-gray-50">
            {/* Cover Photo Section with Gradient Overlay */}
            <div className="relative h-96 w-full overflow-hidden">
                <img 
                    src={program.coverImage} 
                    alt={program.title} 
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-80"></div>
                <div className="absolute inset-0 flex items-end pb-16 justify-center px-4">
                    <div className="text-center max-w-4xl">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            {program.title}
                        </h1>
                        <div className="flex justify-center space-x-4 text-white">
                            <span className="flex items-center">
                                <FaCalendarAlt className="mr-2" />
                                {new Date(program.startDate).toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric' 
                                })}
                                {program.endDate && ` - ${new Date(program.endDate).toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric' 
                                })}`}
                            </span>
                            <span className="flex items-center">
                                <FaMapMarkerAlt className="mr-2" />
                                {program.location}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Container */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Program Highlights */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-blue-500 transform hover:-translate-y-1 transition duration-300">
                        <div className="flex items-center mb-4">
                            <div className="bg-blue-100 p-3 rounded-full mr-4">
                                <FaCalendarAlt className="text-blue-500 text-xl" />
                            </div>
                            <h3 className="text-xl font-semibold">Date & Time</h3>
                        </div>
                        <p className="text-gray-700">
                            {new Date(program.startDate).toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                            })}
                            {program.endDate && ` - ${new Date(program.endDate).toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                            })}`}
                            <br />
                            <span className="font-medium">{program.time}</span>
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-green-500 transform hover:-translate-y-1 transition duration-300">
                        <div className="flex items-center mb-4">
                            <div className="bg-green-100 p-3 rounded-full mr-4">
                                <FaMapMarkerAlt className="text-green-500 text-xl" />
                            </div>
                            <h3 className="text-xl font-semibold">Location</h3>
                        </div>
                        <p className="text-gray-700 mb-2">{program.location}</p>
                        <a 
                            href="#" 
                            className="text-blue-600 hover:underline inline-flex items-center"
                        >
                            View on map
                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                            </svg>
                        </a>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-purple-500 transform hover:-translate-y-1 transition duration-300">
                        <div className="flex items-center mb-4">
                            <div className="bg-purple-100 p-3 rounded-full mr-4">
                                <FaUsers className="text-purple-500 text-xl" />
                            </div>
                            <h3 className="text-xl font-semibold">Organizer</h3>
                        </div>
                        <p className="text-gray-700 mb-1">{program.organizer}</p>
                        <p className="text-gray-600 text-sm">{program.contactEmail}</p>
                        <p className="text-gray-600 text-sm">{program.contactPhone}</p>
                    </div>
                </div>

                {/* Program Details Section */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden mb-12">
                    <div className="p-8">
                        <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-2">Program Details</h2>
                        <div className="prose max-w-none">
                            {program.description.map((paragraph, index) => (
                                <p key={index} className="text-gray-700 mb-4 text-lg">
                                    {paragraph}
                                </p>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Services and Doctors - Side by Side */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    {/* Services Offered */}
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                        <div className="p-8">
                            <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-2">Services Offered</h2>
                            <ul className="space-y-4">
                                {program.services.map((service, index) => (
                                    <li key={index} className="flex items-start">
                                        <span className="bg-blue-50 rounded-full p-2 mr-4">
                                            {service.icon}
                                        </span>
                                        <span className="text-gray-700 text-lg flex-1">{service.name}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Participating Doctors */}
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                        <div className="p-8">
                            <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-2">Participating Doctors</h2>
                            <div className="space-y-6">
                                {program.doctors.map((doctor, index) => (
                                    <div key={index} className="flex items-center">
                                        <img 
                                            src={doctor.image} 
                                            alt={doctor.name} 
                                            className="w-16 h-16 rounded-full object-cover mr-4 border-2 border-blue-200"
                                        />
                                        <div>
                                            <h3 className="font-semibold text-lg">{doctor.name}</h3>
                                            <p className="text-gray-600">{doctor.specialty}</p>
                                            <div className="flex mt-2 space-x-2">
                                                <button className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">
                                                    View Profile
                                                </button>
                                                <button className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded">
                                                    Book Appointment
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Gallery Section (Placeholder) */}
                <div className="mb-12">
                    <h2 className="text-3xl font-bold mb-6 text-gray-800">Event Gallery</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((item) => (
                            <div key={item} className="bg-gray-200 rounded-lg overflow-hidden aspect-square">
                                {/* Placeholder for gallery images */}
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    Photo {item}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Registration CTA */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-8 text-center text-white">
                    <h2 className="text-3xl font-bold mb-4">Ready to Participate?</h2>
                    <p className="text-blue-100 mb-6 max-w-2xl mx-auto text-lg">
                        Register now to secure your spot in this health initiative. Both medical professionals and community members are welcome to join.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link
                            to={program.registrationLink}
                            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition text-lg"
                        >
                            Register as Participant
                        </Link>
                        <Link
                            to="/volunteer"
                            className="inline-block bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition text-lg"
                        >
                            Volunteer Instead
                        </Link>
                    </div>
                    <p className="text-blue-200 mt-4">
                        Registration closes on {new Date(program.endDate).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default HealthProgram;