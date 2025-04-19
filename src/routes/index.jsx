import { createBrowserRouter } from "react-router-dom";
import Home from "../component/home/Home";
import HealthProgram from "../component/home/HealthProgram";
import Register from "../component/otherspages/Register";
import Signup from "../component/otherspages/Signup";
import Login from "../component/otherspages/Login";
import MyProfile from "../component/otherspages/MyProfile";
import HomeLayout from "../layout/HomeLayout";
import GeneralMemberLayout from "../layout/GeneralMemberLayout";
import DoctorLayout from "../layout/DoctorLayout";
import TeacherLayout from "../layout/TeacherLayout";
import PermanentVolunteerLayout from "../layout/PermanentVolunteerLayout";
import AdminLayout from "../layout/AdminLayout";
import Privateroute from "./PrivateRoute";


// import ChefData from "../component/Home/Home/ChefData";

const route = createBrowserRouter([
    {
        path: '/',
        element: <HomeLayout></HomeLayout>,
        children:[
            {
                path: '/',
                element: <Home></Home>
            },
            {
                path: '/dashboard',
                element: <Privateroute><div /></Privateroute> // Empty element since we redirect immediately
              },
        ]
    },

    // General members dashboard
    {
        path: 'general-member',
        element: <Privateroute><GeneralMemberLayout></GeneralMemberLayout></Privateroute>,
        children:[
            {
                index: true,
                element: <Home></Home>
            }
        ]
    },

    // Doctor dashboard
    {
        path: 'doctor-dashboard',
        element: <Privateroute><DoctorLayout></DoctorLayout></Privateroute>,
        children:[
            {
                index: true,
                element: <Home></Home>
            }
        ]
    },

    // Teacher dashboard
    {
        path: 'teacher-dashboard',
        element: <Privateroute><TeacherLayout></TeacherLayout></Privateroute>,
        children:[
            {
                index: true,
                element: <Home></Home>
            }
        ]
    },
    // Volunteer dashboard
    {
        path: 'volunteer-dashboard',
        element: <Privateroute><PermanentVolunteerLayout></PermanentVolunteerLayout></Privateroute>,
        children:[
            {
                index: true,
                element: <Home></Home>
            }
        ]
    },

    // Admin dashboard
    {
        path: 'admin-dashboard',
        element: <Privateroute><AdminLayout></AdminLayout></Privateroute>,
        children:[
            {
                index: true,
                element: <Home></Home>
            }
        ]
    },
    {
        path: '/events/health-camp',
        element: <HealthProgram />,
    },
    {
        path: 'register/health-camp',
        element: <Register></Register>
    },
    {
        path: '/signup',
        element: <Signup></Signup>
    },
    {
        path: '/signin',
        element: <Login></Login>
    },
    {
        path: '/profile',
        element: <MyProfile></MyProfile>
    }
])
export default route;