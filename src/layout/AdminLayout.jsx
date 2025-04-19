import { Outlet } from "react-router-dom";
import AdminDashboard from "../component/dashboard/AdminDashboard";
import Header from "../component/home/Header";
import Footer from "../component/home/Footer";
import { useContext } from "react";
import { AuthContext } from "../context/Authcontext";


const AdminLayout = () => {
    const {loading} = useContext(AuthContext)
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
            <AdminDashboard></AdminDashboard>
            <Outlet></Outlet>
            <Footer></Footer>
        </div>
    );
};

export default AdminLayout;