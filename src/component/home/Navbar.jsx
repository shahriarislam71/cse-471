

const Navbar = () => {
    return (
        <div className="bg-[#0A3B1E] mt-8 mx-[115px] py-4">
            <div className="flex gap-[35px] text-white text-lg px-5">
                <a href="#" className="hover:underline">Home</a>
                <a href="#" className="hover:underline">Dashboard</a>
                <a href="#" className="hover:underline">Doctors Appointment</a>
                <a href="#" className="hover:underline">Emergency Help</a>
                <a href="#" className="hover:underline">Events</a>
                <a href="#" className="hover:underline">Volunteer Registration</a>
            </div>
        </div>
    );
};

export default Navbar;