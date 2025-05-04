import { Outlet } from "react-router-dom";


const SimpleLayout = () => {
    return (
        <div>
            <Outlet></Outlet>
        </div>
    );
};

export default SimpleLayout;