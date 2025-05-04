import axios from "axios";

export const getUserData = async (email) => {
    console.log(email)
    const response = await axios.get(`https://health-and-sanitation-backend.vercel.app/user?email=${email}`);
    return response.data;
};
