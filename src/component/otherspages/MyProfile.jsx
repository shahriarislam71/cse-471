import { useContext, useState, useEffect } from 'react';
import { updateProfile } from 'firebase/auth';
import { getAuth } from 'firebase/auth';
import app from '../../config/firebase.config';
import axios from 'axios';
import { AuthContext } from '../../context/Authcontext';

const MyProfile = () => {
  const { users, loading, updateUser } = useContext(AuthContext);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    photoURL: ''
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const auth = getAuth(app);

  useEffect(() => {
    if (users) {
      setFormData({
        displayName: users.displayName || '',
        email: users.email || '',
        photoURL: users.photoURL || ''
      });
    }
  }, [users]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // // Update Firebase profile (displayName and photoURL)
      // await updateProfile(auth.currentUser, {
      //   displayName: formData.displayName,
      //   photoURL: formData.photoURL
      // });

      // Update backend user data
      const response = await axios.put(`https://health-and-sanitation-backend.vercel.app/user?email=${users.email}`, {
        name: formData.displayName,
        photoUrl: formData.photoURL
      });

      if (response.data.success) {
        setSuccessMessage('Profile updated successfully!');
        setErrorMessage('');
        setTimeout(() => setSuccessMessage(''), 3000);
        setEditMode(false);
        
        // Refresh user data in context
        if (updateUser) {
          await updateUser({
            displayName: formData.displayName,
            photoURL: formData.photoURL
          });
        }
      } else {
        throw new Error(response.data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrorMessage(error.response?.data?.message || error.message || 'Failed to update profile');
      setSuccessMessage('');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#008E48]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Profile Header */}
          <div className="bg-[#008E48] px-6 py-8 sm:px-10 sm:py-12 text-center">
            <div className="relative mx-auto h-32 w-32 rounded-full border-4 border-white shadow-lg overflow-hidden">
              {formData.photoURL ? (
                <img 
                  src={formData.photoURL} 
                  alt="Profile" 
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-[#00753e] flex items-center justify-center text-white text-5xl font-bold">
                  {users?.email?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <h1 className="mt-6 text-3xl font-bold text-white">
              {formData.displayName || 'My Profile'}
            </h1>
            <p className="mt-2 text-[#d1fae5]">{users?.email}</p>
          </div>

          {/* Profile Content */}
          <div className="px-6 py-8 sm:px-10 sm:py-12">
            {successMessage && (
              <div className="mb-6 p-3 bg-green-100 text-green-800 rounded-lg text-center">
                {successMessage}
              </div>
            )}
            {errorMessage && (
              <div className="mb-6 p-3 bg-red-100 text-red-800 rounded-lg text-center">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {/* Name Field */}
                <div>
                  <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  {editMode ? (
                    <input
                      type="text"
                      id="displayName"
                      name="displayName"
                      value={formData.displayName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008E48] focus:border-[#008E48]"
                      required
                    />
                  ) : (
                    <p className="px-4 py-3 bg-gray-50 rounded-lg">{formData.displayName || 'Not set'}</p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <p className="px-4 py-3 bg-gray-50 rounded-lg">{users?.email}</p>
                </div>

                {/* Photo URL Field */}
                <div>
                  <label htmlFor="photoURL" className="block text-sm font-medium text-gray-700 mb-1">
                    Profile Photo URL
                  </label>
                  {editMode ? (
                    <input
                      type="url"
                      id="photoURL"
                      name="photoURL"
                      value={formData.photoURL}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008E48] focus:border-[#008E48]"
                      placeholder="https://example.com/photo.jpg"
                    />
                  ) : (
                    <p className="px-4 py-3 bg-gray-50 rounded-lg truncate">
                      {formData.photoURL || 'Not set'}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                {editMode ? (
                  <>
                    <button
                      type="submit"
                      className="flex-1 bg-[#008E48] hover:bg-[#00753e] text-white py-3 px-6 rounded-lg font-medium transition-colors shadow-md"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditMode(false)}
                      className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 px-6 rounded-lg font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditMode(true)}
                    className="flex-1 bg-[#008E48] hover:bg-[#00753e] text-white py-3 px-6 rounded-lg font-medium transition-colors shadow-md"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;