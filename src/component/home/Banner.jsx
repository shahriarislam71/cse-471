import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";

const Banner = () => {
    const carouselItems = [
        {
            id: 1,
            title: "Community Health Initiative",
            description: "Join our free health checkup camp this weekend",
            image: "https://cdn.expresshealthcare.in/wp-content/uploads/2020/01/03174832/Medical-camp-750x409.jpg",
            ctaText: "Learn More",
            ctaLink: "/events/health-camp",
            overlayColor: "rgba(5, 150, 105, 0.7)"
        },
        {
            id: 2,
            title: "Sanitation Awareness Program",
            description: "Learn about proper sanitation practices in your community",
            image: "https://thumbs.dreamstime.com/b/medical-camp-13742635.jpg",
            ctaText: "Register Now",
            ctaLink: "/events/sanitation",
            overlayColor: "rgba(5, 150, 105, 0.7)"
        },
        {
            id: 3,
            title: "Volunteer Recruitment",
            description: "Become a volunteer and make a difference",
            image: "https://archesbd.com/wp-content/uploads/2015/07/Sanitation-min-1.jpg",
            ctaText: "Join Us",
            ctaLink: "/volunteer",
            overlayColor: "rgba(5, 150, 105, 0.7)"
        }
    ];
    
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
                {carouselItems.map((item) => (
                    <div key={item.id} className="relative group">
                        <div className="h-[500px] w-full">
                            <img 
                                src={item.image} 
                                alt={item.title} 
                                className="w-full h-full object-cover brightness-90 group-hover:brightness-75 transition-all duration-500"
                            />
                        </div>
                        <div 
                            className="absolute inset-0 flex items-end justify-center p-8 md:p-12 bg-gradient-to-t from-black/80 via-black/40 to-transparent"
                            style={{ backgroundColor: item.overlayColor }}
                        >
                            <div className="max-w-3xl space-y-4 text-white">
                                <h2 className="text-3xl md:text-4xl font-bold leading-tight">{item.title}</h2>
                                <p className="text-lg md:text-xl opacity-90">{item.description}</p>
                                <a 
                                    href={item.ctaLink} 
                                    className="inline-block bg-white text-gray-900 hover:bg-gray-100 px-6 py-3 rounded-lg font-medium text-lg transition-all duration-300 shadow-lg hover:shadow-xl"
                                >
                                    {item.ctaText}
                                </a>
                            </div>
                        </div>
                    </div>
                ))}
            </Carousel>
        </div>
    );
};

export default Banner;