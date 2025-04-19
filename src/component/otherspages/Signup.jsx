import { Link, useNavigate } from "react-router-dom";
import logo from "../../../public/logo.webp";
import { useContext, useState } from "react";
import { FaGoogle, FaFacebook, FaUser, FaEnvelope, FaLock, FaCamera } from "react-icons/fa";
import { AuthContext } from "../../context/Authcontext";
import Swal from "sweetalert2";

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

    try {
      // 1. Create Firebase user
      await createUser(formData.email, formData.password);
      
      // 2. Save user data to MongoDB
      const response = await fetch('http://localhost:5000/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          photoUrl: formData.photoURL
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }
      
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Successfully registered",
        showConfirmButton: false,
        timer: 1500
      });
      navigate('/');
    } catch (error) {
      setError(error.message);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      // 1. Google auth with Firebase
      const result = await googleSignIn();
      const user = result.user;

      // 2. Save/update user in MongoDB
      const response = await fetch('http://localhost:5000/google-signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: user.displayName,
          email: user.email,
          photoUrl: user.photoURL
        }),
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Google signin failed');
      }
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Successfully registered",
        showConfirmButton: false,
        timer: 1500
      });
      navigate('/');
    } catch (error) {
      setError(error.message);
    }
  };

  const handleFacebookSignUp = () => {
    // Your existing Facebook signup logic
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      {/* Left Section - Welcome (500px) - Preserved exactly as before */}
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

      {/* Right Section - Sign Up Form (780px) - Preserved with original styling */}
      <div className="w-[780px] bg-white p-12 rounded-r-2xl shadow-lg">
        <h2 className="text-3xl text-center font-bold text-[#008E48] mb-8">
          Create Account
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Social Buttons - Preserved exactly as before */}
        <div className="flex justify-center space-x-4 mb-8">
          <button 
            onClick={handleGoogleSignUp}
            className="w-12 h-12 rounded-full bg-[#F2EEEE] border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition duration-300"
          >
            <FaGoogle className="text-red-500 text-xl" />
          </button>
          <button 
            onClick={handleFacebookSignUp}
            className="w-12 h-12 bg-[#F2EEEE] rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition duration-300"
          >
            <FaFacebook className="text-blue-600 text-xl" />
          </button>
        </div>

        <p className="text-center text-gray-500 mb-8">
          or use your email account
        </p>

        <form onSubmit={handleSubmit} className="max-w-md mx-auto">
          {/* Name Field */}
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUser className="text-gray-500" />
              </div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Name"
                className="w-full pl-10 pr-4 py-3 bg-[#D9D9D9] placeholder-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005623] focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Email Field */}
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope className="text-gray-500" />
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

          {/* Password Field */}
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="text-gray-500" />
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                required
                minLength="6"
                className="w-full pl-10 pr-4 py-3 bg-[#D9D9D9] placeholder-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005623] focus:border-transparent"
              />
            </div>
          </div>

          {/* Photo URL Field */}
          <div className="mb-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaCamera className="text-gray-500" />
              </div>
              <input
                type="url"
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