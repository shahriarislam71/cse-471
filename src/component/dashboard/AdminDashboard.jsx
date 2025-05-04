import { useState } from "react";
import { useNavigate } from "react-router-dom";

const GeneralMemberDashboard = () => {
  // Track active link
  const [activeLink, setActiveLink] = useState("Home");
  const navigate = useNavigate();

  const handleLinkClick = (linkName) => {
    setActiveLink(linkName);
    if (linkName === "Approve Volunteers") {
      navigate("approve-volunteers");
    } else if (linkName === "Assign Roles") {
      navigate("assign-roles");
    } else if (linkName === "Create Programs") {
      navigate("create-programs");
    }
     else if (linkName === "View Programs") {
      navigate("view-programs");
    }
     else if (linkName === "View Donations") {
      navigate("view-donations");
    }
    else if (linkName === "Home") {
      navigate(".");
    }
  };

  const links = [
    "Home",
    "Create Programs",
    "Approve Volunteers",
    "Assign Roles",
    "View Donations",
    "View Programs"
  ];

  return (
    <div className="bg-[#0A3B1E] mt-8 mx-[115px] py-4">
      <div className="flex flex-wrap gap-x-[35px] gap-y-5 text-white text-lg px-5">
        {links.map((link) => (
          <div
            key={link}
            className={`relative pb-1 ${
              activeLink === link ? "text-[#008E48]" : ""
            }`}
            onClick={() => handleLinkClick(link)}
          >
            <span className="cursor-pointer hover:underline">{link}</span>
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
