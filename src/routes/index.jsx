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
import VolunteerRegistration from "../component/GeneralMemberComponent/VolunteerRegistration";
import VolunteerInfo from "../component/AdminComponent/VolunteerInfo";
import DoctorAppointment from "../component/GeneralMemberComponent/DoctorAppointment";
import AddSlots from "../component/doctorComponent/AddSlots";
import AppointmentHistory from "../component/GeneralMemberComponent/AppointmentHistory";
import Appointments from "../component/doctorComponent/Appointments";
import SuccessfullAppointment from "../component/doctorComponent/SuccessfullAppointment";
import AddRoles from "../component/AdminComponent/AddRoles";
import Requests from "../component/VoluntersComponent/Request";
import ParticipationHistory from "../component/VoluntersComponent/ParticipationHistory";
import DoctorRequest from "../component/doctorComponent/DoctorRequest";
import EmergencyHelp from "../component/GeneralMemberComponent/EmergencyHelp";
import EmergencyCases from "../component/VoluntersComponent/EmergencyCases";
import RescuedHistory from "../component/VoluntersComponent/RescuedHistory";
import CreatePrograms from "../component/AdminComponent/CreatePrograms";
import ViewPrograms from "../component/AdminComponent/ViewPrograms";
import AssignPrograms from "../component/teacherCOmponent/AssignPrograms";
import DoctorAssignPrograms from "../component/doctorComponent/DoctorAssignPrograms";
import HealthAndSanitationGuide from "../component/GeneralMemberComponent/HealthAndSanitationGuide";
import Donation from "../component/otherspages/Donation";
import Success from "../component/otherspages/Success";
import DonationHistory from "../component/GeneralMemberComponent/DonationHistory";
import ViewDonation from "../component/AdminComponent/ViewDonation";



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

    // {
    //     path: '/program',
    //     element: <SimpleLayout />, // No header/footer
    //     children: [
    //         {
    //             path: ':id',
    //             element: <HealthProgram />
    //         }
    //     ]
    // },

    // General members dashboard
    {
        path: 'general-member',
        element: <Privateroute><GeneralMemberLayout></GeneralMemberLayout></Privateroute>,
        children:[
            {
                index: true,
                element: <Home></Home>
            },
            {
                path: "doctors-appointment",
                element: <DoctorAppointment></DoctorAppointment>
            },
            {
                path: "appointment-history",
                element: <AppointmentHistory></AppointmentHistory>
            },
            {
                path: 'volunteer-registration',
                element: <VolunteerRegistration></VolunteerRegistration>
            },
            {
                path: "emergency-help",
                element: <EmergencyHelp></EmergencyHelp>
            },
            {
                path: "healthandsanitationguide",
                element: <HealthAndSanitationGuide></HealthAndSanitationGuide>
            },
            {
                path: "donation-history",
                element: <DonationHistory></DonationHistory>
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
            },
            {
                path: "appointments",
                element: <Appointments></Appointments>
            },
            {
                path: "successfull-appointment",
                element: <SuccessfullAppointment></SuccessfullAppointment>
            },
            {
                path:"add-slots",
                element: <AddSlots></AddSlots>
            },
            {
                path: "doctor-request",
                element: <DoctorRequest></DoctorRequest>
            },
            {
                path: "doctor-assign-programs",
                element: <DoctorAssignPrograms></DoctorAssignPrograms>
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
            },
            {
                path: "assign-programs",
                element: <AssignPrograms></AssignPrograms>
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
            },
            {
                path: 'request',
                element: <Requests></Requests>
            },
            {
                path: "volunteer-participation",
                element: <ParticipationHistory></ParticipationHistory>
            },
            {
                path: "emergency-cases",
                element: <EmergencyCases></EmergencyCases>
            },
            {
                path: "rescued-history",
                element: <RescuedHistory></RescuedHistory>
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
            },
            {
                path: "approve-volunteers",
                element: <VolunteerInfo></VolunteerInfo>
            },
            {
                path: "assign-roles",
                element: <AddRoles></AddRoles>
            },
            {
                path: "create-programs",
                element: <CreatePrograms></CreatePrograms>
            },
            {
                path: "view-programs",
                element: <ViewPrograms></ViewPrograms>
            },
            {
                path: "view-donations",
                element: <ViewDonation></ViewDonation>
            }
        ]
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
    },
    {
        path: "/program/:id",
        element: <HealthProgram></HealthProgram>
    },
    {
        path: "/donation",
        element: <Privateroute><Donation></Donation></Privateroute>
    },
    {
        path:"/success",
        element: <Success></Success>
    }
    
])
export default route;