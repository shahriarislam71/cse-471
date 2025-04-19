import axios from "axios";

export const getUserData = async (email) => {
    console.log(email)
    const response = await axios.get(`http://localhost:5000/user?email=${email}`);
    return response.data;
};
