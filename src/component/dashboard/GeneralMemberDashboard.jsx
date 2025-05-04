import { useState } from "react";
import { useNavigate } from "react-router-dom";

const GeneralMemberDashboard = () => {
    // Track active link
    const [activeLink, setActiveLink] = useState("Home");
    const navigate = useNavigate();

    const handleLinkClick = (linkName) => {
        setActiveLink(linkName);
        if (linkName === "Volunteer Registration") {
            navigate("volunteer-registration");
        }else if(linkName === "Doctors Appointment"){
            navigate("doctors-appointment")
        }
        else if(linkName === "Appointment History"){
            navigate("appointment-history")
        }
        else if (linkName === "Emergency Help") {
            navigate("emergency-help"); 
        }
        else if (linkName === "Health And Sanitation Guide") {
            navigate("healthandsanitationguide"); 
        }
        else if (linkName === "Donation History") {
            navigate("donation-history"); 
        }
        else if (linkName === "Home") {
            navigate("."); 
        }
    };

    const links = [
        "Home",
        "Doctors Appointment",
        "Appointment History",
        "Emergency Help",
        "Health And Sanitation Guide",
        "Volunteer Registration",
        "Donation History"
    ];

    return (
        <div className="bg-[#0A3B1E] mt-8 mx-[115px] py-4">
            <div className="flex flex-wrap gap-x-[35px] gap-y-5 text-white text-lg px-5">
                {links.map((link) => (
                    <div 
                        key={link}
                        className={`relative pb-1 ${activeLink === link ? "text-[#008E48]" : ""}`}
                        onClick={() => handleLinkClick(link)}
                    >
                        <span className="cursor-pointer hover:underline">
                            {link}
                        </span>
                        {activeLink === link && (
                            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#008E48] mt-1"></div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GeneralMemberDashboard;