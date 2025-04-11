import { createBrowserRouter } from "react-router-dom";
import Header from "../components/home/Header";
import Home from "../components/home/Home";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Header></Header>,
    children: [
      {
        path: "/",
        element: <Home></Home>,
      },
    ],
  },
]);

export default router
