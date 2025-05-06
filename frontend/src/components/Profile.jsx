import { useState, useEffect } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import { useNavigate } from "react-router-dom";
import { FaUserAlt, FaUserEdit, FaPhone, FaMapMarkerAlt, FaIdCard, FaFileAlt } from "react-icons/fa";

const Profile = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    name: "",
    fatherName: "", 
    phoneNumber: "",
    address: "",
    profileImage: "",
    idNumber: "",
    tinNumber: "",
    idImage: ""
  });
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [idImagePreview, setIdImagePreview] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/profile/me`, {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await response.json();
        console.log('Profile data:', data);

        if (data.profile) {
          setProfile({
            name: data.profile.name || "",
            fatherName: data.profile.fatherName || "",
            phoneNumber: data.profile.phoneNumber || "",
            address: data.profile.address || "",
            profileImage: data.profile.profileImage || "",
            idNumber: data.profile.idNumber || "",
            tinNumber: data.profile.tinNumber || "",
            idImage: data.profile.idImage || ""
          });

          // Set image previews if they exist
          if (data.profile.profileImage) {
            setImagePreview(data.profile.profileImage);
          }
          if (data.profile.idImage) {
            setIdImagePreview(data.profile.idImage);
          }
        }
      } catch (error) {
        console.error('Profile fetch error:', error);
        setError(error.message || "Failed to fetch profile");
      }
    };

    if (user && user.token) {
      fetchProfile();
    } else {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phoneNumber') {
      let phoneNumber = value.replace(/\D/g, '');
      
      if (!phoneNumber.startsWith('251')) {
        if (phoneNumber.startsWith('0')) {
          phoneNumber = '251' + phoneNumber.substring(1);
        } else if (!phoneNumber.startsWith('251')) {
          phoneNumber = '251' + phoneNumber;
        }
      }
      
      phoneNumber = phoneNumber.substring(0, 12);
      const formattedNumber = '+' + phoneNumber;
      
      setProfile(prev => ({
        ...prev,
        [name]: formattedNumber
      }));
    } else {
      setProfile(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setProfile(prev => ({
          ...prev,
          profileImage: file // Store the file object instead of base64
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleIdImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }
      
      // Validate file size (e.g., max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setIdImagePreview(reader.result);
        setProfile(prev => ({
          ...prev,
          idImage: file // Store the file object instead of base64
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage("");

    try {
      const formData = new FormData();
      
      // Append text fields
      Object.keys(profile).forEach(key => {
        if (key !== 'profileImage' && key !== 'idImage') {
          formData.append(key, profile[key]);
        }
      });

      // Append files if they exist
      if (profile.profileImage instanceof File) {
        formData.append('profileImage', profile.profileImage);
      }
      
      if (profile.idImage instanceof File) {
        formData.append('idImage', profile.idImage);
      }

      // Use the correct endpoint
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/profile/update-details`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${user.token}`
        },
        body: formData
      });

      // Check if the response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server sent non-JSON response");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      setSuccessMessage("Profile updated successfully!");
      setIsEditing(false);
      
      if (data.user?.profile) {
        setProfile(prev => ({
          ...prev,
          ...data.user.profile
        }));
        if (data.user.profile.profileImage) {
          setImagePreview(data.user.profile.profileImage);
        }
        if (data.user.profile.idImage) {
          setIdImagePreview(data.user.profile.idImage);
        }
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Personal Profile
          </h1>
          
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg animate-fade-in">
              {error}
            </div>
          )}
          
          {successMessage && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-lg animate-fade-in">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center mb-8">
              <div className="relative group">
                <img 
                  src={imagePreview || "/images/default-profile.png"} 
                  alt="Profile" 
                  className="w-40 h-40 rounded-full object-cover border-4 border-indigo-500 shadow-xl transition duration-300 ease-in-out transform group-hover:scale-105"
                />
                {isEditing && (
                  <>
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 rounded-full opacity-0 group-hover:opacity-100 transition duration-300">
                      <span className="text-white text-sm font-medium">Change Photo</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="transition-all duration-300 hover:transform hover:scale-102">
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2 flex items-center">
                  <FaUserAlt className="mr-2 text-indigo-500" /> Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 disabled:bg-gray-100 dark:disabled:bg-gray-700 "
                />
              </div>

              <div className="transition-all duration-300 hover:transform hover:scale-102">
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2 flex items-center">
                  <FaUserEdit className="mr-2 text-indigo-500" /> Father's Name
                </label>
                <input
                  type="text"
                  name="fatherName"
                  value={profile.fatherName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 disabled:bg-gray-100 dark:disabled:bg-gray-700"
                />
              </div>

              <div className="transition-all duration-300 hover:transform hover:scale-102">
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2 flex items-center">
                  <FaPhone className="mr-2 text-indigo-500" /> Phone Number
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={profile.phoneNumber}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="+251XXXXXXXXX"
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 disabled:bg-gray-100 dark:disabled:bg-gray-700"
                />
                <small className="text-gray-500 dark:text-gray-400">Format: +251XXXXXXXXX</small>
              </div>

              <div className="transition-all duration-300 hover:transform hover:scale-102">
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2 flex items-center">
                  <FaMapMarkerAlt className="mr-2 text-indigo-500" /> Address
                </label>
                <textarea
                  name="address"
                  value={profile.address}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 disabled:bg-gray-100 dark:disabled:bg-gray-700"
                  rows="3"
                />
              </div>
            </div>

            {user.accountType === "provider" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="transition-all duration-300 hover:transform hover:scale-102">
                  <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2 flex items-center">
                    <FaIdCard className="mr-2 text-indigo-500" /> ID Number
                  </label>
                  <input
                    type="text"
                    name="idNumber"
                    value={profile.idNumber}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 disabled:bg-gray-100 dark:disabled:bg-gray-700"
                  />
                </div>

                <div className="transition-all duration-300 hover:transform hover:scale-102">
                  <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2 flex items-center">
                    <FaFileAlt className="mr-2 text-indigo-500" /> TIN Number
                  </label>
                  <input
                    type="text"
                    name="tinNumber"
                    value={profile.tinNumber}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 disabled:bg-gray-100 dark:disabled:bg-gray-700"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2 flex items-center">
                    <FaIdCard className="mr-2 text-indigo-500" /> ID Image
                  </label>
                  <div className="relative group">
                    {idImagePreview ? (
                      <div className="relative">
                        <img 
                          src={idImagePreview}
                          alt="ID" 
                          className="w-full max-h-[400px] object-contain rounded-lg border-2 border-indigo-500 shadow-lg transition-all duration-300 bg-white dark:bg-gray-700"
                        />
                        <a 
                          href={idImagePreview} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-lg text-sm hover:bg-opacity-70"
                        >
                          View Full
                        </a>
                      </div>
                    ) : (
                      <div className="w-full h-56 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-400">
                        <span className="text-gray-500 dark:text-gray-400">No ID image uploaded</span>
                      </div>
                    )}
                    {isEditing && (
                      <>
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 rounded-lg opacity-0 group-hover:opacity-100 transition duration-300">
                          <span className="text-white text-sm font-medium">Upload ID Image</span>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleIdImageChange}
                          className="absolute inset-0 w-full h-full opacity-0  cursor-pointer"
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-4 mt-8">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transform hover:scale-105 transition-all duration-300 shadow-lg"
                >
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transform hover:scale-105 transition-all duration-300 shadow-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transform hover:scale-105 transition-all duration-300 shadow-lg"
                  >
                    Save Changes
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
