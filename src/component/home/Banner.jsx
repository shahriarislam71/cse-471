import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { useEffect, useState } from 'react';
import axios from 'axios';

const Banner = () => {
    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchQuickPrograms = async () => {
            try {
                const response = await axios.get("https://health-and-sanitation-backend.vercel.app/quick-programs");
                setPrograms(response.data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching programs:", err);
                setError("Failed to load programs");
                setLoading(false);
            }
        };

        fetchQuickPrograms();
    }, []);

    if (loading) {
        return (
            <div className="px-[5%] py-[30px] mx-[35px]">
                <div className="h-[500px] flex items-center justify-center bg-gray-100 rounded-2xl">
                    <p>Loading programs...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="px-[5%] py-[30px] mx-[35px]">
                <div className="h-[500px] flex items-center justify-center bg-gray-100 rounded-2xl">
                    <p className="text-red-500">{error}</p>
                </div>
            </div>
        );
    }

    if (programs.length === 0) {
        return (
            <div className="px-[5%] py-[30px] mx-[35px]">
                <div className="h-[500px] flex items-center justify-center bg-gray-100 rounded-2xl">
                    <p>No quick programs available</p>
                </div>
            </div>
        );
    }

    return (
        <div className="px-[5%] py-[30px] mx-[35px]">
            <Carousel
                autoPlay={true}
                infiniteLoop={true}
                showThumbs={false}
                showStatus={false}
                showIndicators={true}
                interval={5000}
                stopOnHover={true}
                className="rounded-2xl overflow-hidden shadow-xl"
                renderArrowPrev={(onClickHandler, hasPrev, label) => (
                    <button
                        type="button"
                        onClick={onClickHandler}
                        title={label}
                        className="absolute z-10 left-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 backdrop-blur-sm rounded-full p-3 text-white hover:text-white transition-all duration-300"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                )}
                renderArrowNext={(onClickHandler, hasNext, label) => (
                    <button
                        type="button"
                        onClick={onClickHandler}
                        title={label}
                        className="absolute z-10 right-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 backdrop-blur-sm rounded-full p-3 text-white hover:text-white transition-all duration-300"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                )}
            >
                {programs.map((program) => (
                    <div key={program._id} className="relative group">
                        <div className="h-[500px] w-full">
                            <img 
                                src={program.bannerImage} 
                                alt={program.title} 
                                className="w-full h-full object-cover brightness-90 group-hover:brightness-75 transition-all duration-500"
                            />
                        </div>
                        {program.programName !== "Announcement" ? (
                            <div 
                                className="absolute inset-0 flex items-end justify-center p-8 md:p-12 bg-gradient-to-t from-black/80 via-black/40 to-transparent"
                                style={{ backgroundColor: "rgba(5, 150, 105, 0.7)" }}
                            >
                                <div className="max-w-3xl space-y-4 text-white">
                                    <h2 className="text-3xl md:text-4xl font-bold leading-tight">{program.title}</h2>
                                    <p className="text-lg md:text-xl opacity-90">{program.subtitle}</p>
                                    <a 
                                        href={`/program/${program._id}`} 
                                        className="inline-block bg-white text-gray-900 hover:bg-gray-100 px-6 py-3 rounded-lg font-medium text-lg transition-all duration-300 shadow-lg hover:shadow-xl"
                                    >
                                        Learn More
                                    </a>
                                </div>
                            </div>
                        ) : (
                            <div 
                                className="absolute inset-0 flex items-center justify-center p-8 md:p-12 bg-gradient-to-t from-black/80 via-black/40 to-transparent"
                                style={{ backgroundColor: "rgba(5, 150, 105, 0.7)" }}
                            >
                                <div className="max-w-4xl text-center">
                                    <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                                        {program.announcementText}
                                    </h1>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </Carousel>
        </div>
    );
};

export default Banner;