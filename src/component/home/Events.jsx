

const Events = () => {
    // Sample events data
    const events = [
        {
            id: 1,
            title: "Community Health Camp",
            description: "Free health checkups and consultations for all community members. Basic medicines will be provided.",
            image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
            date: "15 June 2023",
            location: "Central Park, Downtown",
            donationGoal: 5000,
            raised: 3200
        },
        {
            id: 2,
            title: "Sanitation Workshop",
            description: "Learn about proper waste management and hygiene practices to keep your community clean and healthy.",
            image: "https://images.unsplash.com/photo-1584483766114-2cea6facdf57?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
            date: "22 June 2023",
            location: "Community Center",
            donationGoal: 3000,
            raised: 1500
        },
        {
            id: 3,
            title: "Clean Water Initiative",
            description: "Help us install water purification systems in underserved communities.",
            image: "https://images.unsplash.com/photo-1551232864-3f0890e580d9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
            date: "30 June 2023",
            location: "Riverside Community",
            donationGoal: 10000,
            raised: 6700
        }
    ];

    return (
        <div className="bg-[#D9D9D9] py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">Events & Programs</h2>
                    <div className="w-20 h-1 bg-[#008E48] mx-auto mb-6"></div>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Join our initiatives to create healthier and cleaner communities through various programs and events.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {events.map((event) => (
                        <div key={event.id} className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                            <div className="h-48 overflow-hidden">
                                <img 
                                    src={event.image} 
                                    alt={event.title}
                                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                                />
                            </div>
                            
                            <div className="p-6">
                                <div className="flex items-center text-sm text-gray-500 mb-2">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                    </svg>
                                    {event.date}
                                    <svg className="w-4 h-4 ml-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                    </svg>
                                    {event.location}
                                </div>
                                
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                                <p className="text-gray-600 mb-4">{event.description}</p>
                                
                                <div className="mb-4">
                                    <div className="flex justify-between text-sm font-medium mb-1">
                                        <span>Raised: ${event.raised}</span>
                                        <span>Goal: ${event.donationGoal}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                            className="bg-[#008E48] h-2 rounded-full" 
                                            style={{ width: `${(event.raised / event.donationGoal) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                                
                                <div className="flex space-x-3">
                                    <button className="flex-1 bg-[#008E48] hover:bg-[#00753e] text-white font-medium py-2 px-4 rounded-lg transition duration-300">
                                        Register
                                    </button>
                                    <button className="flex-1 bg-white border border-[#008E48] text-[#008E48] hover:bg-gray-50 font-medium py-2 px-4 rounded-lg transition duration-300">
                                        Donate
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Events;