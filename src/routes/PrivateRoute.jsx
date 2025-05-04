import { useContext, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/Authcontext";
import { getUserData } from "../hook/getUserData";

const PrivateRoute = ({ children }) => {
  const { users, loading } = useContext(AuthContext);
  const location = useLocation();
  const [userData, setUserData] = useState(null);
  const [userLoading, setUserLoading] = useState(true);

  useEffect(() => {
    if (users?.email) {
      const fetchUserData = async () => {
        try {
          const data = await getUserData(users.email);
          console.log(data)
          setUserData(data);
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setUserLoading(false);
        }
      };
      fetchUserData();
    } else {
      setUserLoading(false);
    }
  }, [users]);

  if (loading || userLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#008e48]"></div>
      </div>
    );
  }

  if (!users) {
    return <Navigate state={{ from: location }} to="/signin" replace></Navigate>;
  }


  // If user is trying to access the base dashboard, redirect them to their specific dashboard
  if (location.pathname === '/dashboard' && userData) {
    console.log(userData)
    const dashboardPath = getDashboardPath(userData.data.volunteer_type);
    return <Navigate to={dashboardPath} replace />;
  }

  return children;
};

// Helper function to determine dashboard path based on volunteer_type
const getDashboardPath = (volunteerType) => {
  switch (volunteerType?.toLowerCase()) {
    case 'admin':
      return '/admin-dashboard';
    case 'doctor':
      return '/doctor-dashboard';
    case 'teacher':
      return '/teacher-dashboard';
    case 'general volunteer':
      return '/volunteer-dashboard';
    default:
      return '/general-member';
  }
};

export default PrivateRoute;