import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <div className="bg-[#0A3B1E] mt-8 mx-[115px] py-4">
      <div className="flex gap-[35px] text-white text-lg px-5">
        <Link to="/" className="hover:underline">Home</Link>
        <Link to="/dashboard" className="hover:underline">Dashboard</Link>
        {/* <Link to="#" className="hover:underline">Doctors Appointment</Link>
        <Link to="#" className="hover:underline">Emergency Help</Link>
        <Link to="#" className="hover:underline">Events</Link>
        <Link to="#" className="hover:underline">Volunteer Registration</Link> */}
      </div>
    </div>
  );
};

export default Navbar;