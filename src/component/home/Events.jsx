import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch programs
        const programsResponse = await fetch('https://health-and-sanitation-backend.vercel.app/programs');
        if (!programsResponse.ok) {
          throw new Error('Failed to fetch programs data');
        }
        const programsData = await programsResponse.json();

        // Process programs data
        const formattedEvents = await Promise.all(
          programsData
            .filter(program => program.programName !== "Announcement")
            .map(async (program) => {
              // Fetch donations for this program
              const donationsResponse = await fetch(`https://health-and-sanitation-backend.vercel.app/donations/program/${program._id}`);
              if (!donationsResponse.ok) {
                console.error(`Failed to fetch donations for program ${program._id}`);
                return {
                  id: program._id,
                  title: program.title || program.programName,
                  description: program.programDetails || program.subtitle || program.announcementText,
                  image: program.bannerImage || "https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
                  date: program.startDate || "Coming soon",
                  location: program.locations || "Multiple locations",
                  donationGoal: program.donationGoal || 10000,
                  raised: 0, // Default to 0 if donations fetch fails
                  programType: program.programName,
                  status: program.status
                };
              }
              
              const donationsData = await donationsResponse.json();
              const totalRaised = donationsData.data?.totalRaised || 0;

              return {
                id: program._id,
                title: program.title || program.programName,
                description: program.programDetails || program.subtitle || program.announcementText,
                image: program.bannerImage || "https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
                date: program.startDate || "Coming soon",
                location: program.locations || "Multiple locations",
                donationGoal: program.donationGoal || 10000,
                raised: totalRaised,
                programType: program.programName,
                status: program.status
              };
            })
        );

        setEvents(formattedEvents);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRegister = (eventId) => {
    navigate(`/program/${eventId}`);
  };

  const handleDonate = (eventId) => {
    navigate('/donation', { state: { programId: eventId } });
  };

  const calculateProgressPercentage = (raised, goal) => {
    if (goal <= 0) return 0;
    const percentage = (raised / goal) * 100;
    return Math.min(percentage, 100); // Cap at 100%
  };

  if (loading) {
    return (
      <div className="bg-[#D9D9D9] py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#008E48] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading events...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#D9D9D9] py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-red-500">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 bg-[#008E48] hover:bg-[#0A3B1E] text-white font-medium py-2 px-4 rounded-lg transition duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

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

        {events.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-lg text-gray-600">No events currently available. Check back later!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => {
              const progressPercentage = calculateProgressPercentage(event.raised, event.donationGoal);
              const formattedRaised = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
              }).format(event.raised);
              
              const formattedGoal = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
              }).format(event.donationGoal);

              return (
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
                    <p className="text-gray-600 mb-4">{event.description.length > 100 ? `${event.description.substring(0, 100)}...` : event.description}</p>
                    
                    <div className="mb-4">
                      <div className="flex justify-between text-sm font-medium mb-1">
                        <span>Raised: {formattedRaised}</span>
                        <span>Goal: {formattedGoal}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-[#008E48] h-2 rounded-full" 
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>
                      <div className="text-right text-xs text-gray-500 mt-1">
                        {progressPercentage.toFixed(0)}% funded
                      </div>
                    </div>
                    
                    <div className="flex space-x-3">
                      <button 
                        onClick={() => handleRegister(event.id)}
                        className="flex-1 bg-[#008E48] hover:bg-[#00753e] text-white font-medium py-2 px-4 rounded-lg transition duration-300"
                      >
                        Register
                      </button>
                      <button 
                        onClick={() => handleDonate(event.id)}
                        className="flex-1 bg-white border border-[#008E48] text-[#008E48] hover:bg-gray-50 font-medium py-2 px-4 rounded-lg transition duration-300"
                      >
                        Donate
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;