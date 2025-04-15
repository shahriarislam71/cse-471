import { createBrowserRouter } from "react-router-dom";
import Home from "../component/home/Home";
import HealthProgram from "../component/home/HealthProgram";
import Register from "../component/otherspages/Register";
import Signup from "../component/otherspages/Signup";
import Login from "../component/otherspages/Login";
import MyProfile from "../component/otherspages/MyProfile";


// import ChefData from "../component/Home/Home/ChefData";

const route = createBrowserRouter([
    {
        path: '/',
        element: <Home></Home>,
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