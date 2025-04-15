import { Link, useNavigate } from "react-router-dom";
import logo from "../../../public/logo.webp";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/Authcontext";

const Signup = () => {
  const { createUser, googleSignIn, loading } = useContext(AuthContext);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    photoURL: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Email and password are required");
      return;
    }

    try {
      await createUser(formData.email, formData.password);
      // You would typically update the user profile (name, photoURL) here
      navigate("/");
    } catch (error) {
      setError(error.message);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      await googleSignIn();
      navigate("/");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      {/* Left Section - Welcome (500px) */}
      <div className="w-[500px] bg-[#005623] h-[652px] p-12 rounded-l-2xl shadow-lg flex flex-col text-white">
        <div className="mb-8 flex items-center gap-3">
          <img src={logo} alt="" className="h-[30px] w-[30px]" />
          <h1 className="text-2xl font-bold">Health & Sanitation Platform</h1>
        </div>

        <div className="flex flex-col items-center justify-center mt-[170px]">
          <h2 className="text-3xl text-center font-bold mb-4">Welcome Back</h2>
          <p className="text-center mb-8 opacity-90">
            To Keep Connected With Us Please Login With Your Personal Info
          </p>

          <Link to={"/signin"}>
            <button className="border-2 border-white rounded-full px-8 py-2 font-medium hover:bg-white hover:text-[#005623] transition duration-300">
              Sign In
            </button>
          </Link>
        </div>
      </div>

      {/* Right Section - Sign Up Form (780px) */}
      <div className="w-[780px] bg-white p-12 rounded-r-2xl shadow-lg">
        <h2 className="text-3xl text-center font-bold text-[#008E48] mb-8">
          Create Account
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-center">
            {error}
          </div>
        )}

        <div className="flex justify-center space-x-4 mb-8">
          <button 
            onClick={handleGoogleSignUp}
            className="w-12 h-12 rounded-full bg-[#F2EEEE] border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition duration-300"
          >
            <svg
              className="w-6 h-6 text-black"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866.549 3.921 1.453l2.814-2.814c-1.784-1.664-4.153-2.675-6.735-2.675-5.522 0-10 4.477-10 10s4.478 10 10 10c8.396 0 10-7.496 10-10 0-.67-.069-1.325-.201-1.955h-9.799z" />
            </svg>
          </button>
          <button className="w-12 h-12 bg-[#F2EEEE] rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition duration-300">
            <svg
              className="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              width="26"
              height="29"
              viewBox="0 0 26 29"
              fill="none"
            >
              <path
                d="M6.5002 16.9525V29H15.9252V16.9525H22.9533L24.4158 11.4131H15.9252V9.45332C15.9252 6.525 17.5746 5.40352 21.8321 5.40352C23.1564 5.40352 24.2208 5.42617 24.8383 5.47148V0.447461C23.6764 0.226562 20.8327 0 19.1914 0C10.5058 0 6.5002 2.86035 6.5002 9.02851V11.4131H1.1377V16.9525H6.5002Z"
                fill="black"
              />
            </svg>
          </button>
        </div>

        <p className="text-center text-gray-500 mb-8">
          or use your email account
        </p>

        <form onSubmit={handleSubmit} className="max-w-md mx-auto">
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="w-5 h-5 text-black"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  ></path>
                </svg>
              </div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Name"
                className="w-full pl-10 pr-4 py-3 bg-[#D9D9D9] placeholder-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005623] focus:border-transparent"
              />
            </div>
          </div>

          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="w-5 h-5 text-black"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  ></path>
                </svg>
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                required
                className="w-full pl-10 pr-4 py-3 bg-[#D9D9D9] placeholder-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005623] focus:border-transparent"
              />
            </div>
          </div>

          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="w-5 h-5 text-black"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  ></path>
                </svg>
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                required
                className="w-full pl-10 pr-4 py-3 bg-[#D9D9D9] placeholder-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005623] focus:border-transparent"
              />
            </div>
          </div>

          <div className="mb-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="w-5 h-5 text-black"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  ></path>
                </svg>
              </div>
              <input
                type="text"
                name="photoURL"
                value={formData.photoURL}
                onChange={handleChange}
                placeholder="Photo URL"
                className="w-full pl-10 pr-4 py-3 bg-[#D9D9D9] placeholder-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005623] focus:border-transparent"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#005623] text-white py-3 rounded-lg font-medium hover:bg-[#00451c] transition duration-300 disabled:opacity-70"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup;