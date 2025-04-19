import Header from "../component/home/Header";
import DoctorDashboard from "../component/dashboard/DoctorDashboard";
import { Outlet } from "react-router-dom";
import Footer from "../component/home/Footer";
import { AuthContext } from "../context/Authcontext";
import { useContext } from "react";

const DoctorLayout = () => {
  const { loading } = useContext(AuthContext);
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#008e48]"></div>
      </div>
    );
  }
  return (
    <div>
      <Header></Header>
      <DoctorDashboard></DoctorDashboard>
      <Outlet></Outlet>
      <Footer></Footer>
    </div>
  );
};

export default DoctorLayout;
