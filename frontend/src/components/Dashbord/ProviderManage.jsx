import React, { useState, useEffect } from 'react';
import { AiOutlineDelete, AiOutlineWarning } from 'react-icons/ai';
import { MdReportProblem } from 'react-icons/md';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const ProviderManage = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/providers`);
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  const handleDelete = async (id, e) => {
    e.preventDefault(); // Prevent row click when deleting
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/providers/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Failed to delete user');
      }
      setUsers(users.filter(user => user._id !== id));
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const openModal = async (user, e) => {
    e.preventDefault();
    try {
      // Fetch complete user details when opening modal
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/providers/${user._id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user details');
      }
      const userData = await response.json();
      setSelectedUser(userData);
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  // Update the verification status display in the modal
  const getVerificationStatus = (user) => {
    if (user.profile?.idVerified) {
      return (
        <span className="text-green-600">
          Verified on {new Date(user.profile.verificationDate).toLocaleDateString()}
        </span>
      );
    }
    return <span className="text-red-600">Not Verified</span>;
  };

  const handleVerifyProvider = async (userId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/providers/${selectedUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to verify provider');
      }

      const data = await response.json();

      // Update the selected user state
      setSelectedUser({
        ...selectedUser,
        profile: {
          ...selectedUser.profile,
          idVerified: true,
          verificationDate: new Date()
        }
      });

      // Update the users list
      setUsers(users.map(user => 
        user._id === userId 
          ? {
              ...user,
              profile: {
                ...user.profile,
                idVerified: true
              }
            }
          : user
      ));

      // Show success message
      toast.success('Provider verified successfully. Verification email sent.');

    } catch (error) {
      console.error('Error verifying provider:', error);
      toast.error('Failed to verify provider');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">Provider Control Panel</h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-100 dark:bg-blue-700">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Warnings</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Reported</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Write</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer" onClick={(e) => openModal(user, e)}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      <img 
                        className="h-10 w-10 rounded-full object-cover" 
                        src={user.profileImage} 
                        alt={user.name} 
                        onError={(e) => {
                          e.target.src = "default-avatar.png";
                        }}
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-200">
                        {user.name}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.profile?.idVerified 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.profile?.idVerified ? 'Verified' : 'Not Verified'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <AiOutlineWarning className="text-yellow-500 mr-2" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">{user.warnings || 0}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <MdReportProblem className="text-red-500 mr-2" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">{user.reported || 0}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={(e) => handleDelete(user._id, e)}
                    className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
                  >
                    <AiOutlineDelete className="text-xl" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal content */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg w-11/12 max-w-7xl mx-auto flex gap-8">
            {/* Left section - Image and basic info */}
            <div className="w-1/4">
              <div className="aspect-square rounded-lg overflow-hidden mb-4">
                <img 
                  src={selectedUser.profile?.profileImage || "default-avatar.png"} 
                  alt={selectedUser.profile?.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                {selectedUser.profile?.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {selectedUser.email}
              </p>
              <button
                onClick={() => handleVerifyProvider(selectedUser._id)}
                className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-200 mb-2"
                disabled={selectedUser.profile?.idVerified}
              >
                {selectedUser.profile?.idVerified ? 'Already Verified' : 'Verify Provider'}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="w-full bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition duration-200"
              >
                Close
              </button>
            </div>

            {/* Middle section - User details */}
            <div className="w-2/4 grid grid-cols-2 gap-6">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Name:</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {selectedUser.profile?.name || 'Not provided'}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">ID Verification:</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {selectedUser.profile?.idVerified ? 
                    `Verified (${new Date(selectedUser.profile.verificationDate).toLocaleDateString()})` : 
                    'Not Verified'}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Account Status:</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {selectedUser.active ? 'Active' : 'Inactive'}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Father's Name:</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {selectedUser.profile?.fatherName || 'Not provided'}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Phone Number:</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {selectedUser.profile?.phoneNumber || 'Not provided'}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Address:</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {selectedUser.profile?.address || 'Not provided'}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">TIN Number:</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {selectedUser.profile?.tinNumber || 'Not provided'}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">ID Number:</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {selectedUser.profile?.idNumber || 'Not provided'}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Warnings:</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {selectedUser.warnings || 0}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Reports:</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {selectedUser.reported || 0}
                </p>
              </div>
            </div>

            {/* Right section - ID Document */}
            <div className="w-1/4">
              {selectedUser.profile?.idImage && (
                <div className="h-full">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">ID Document:</p>
                  <div className="h-[90%] rounded-lg overflow-hidden">
                    <img 
                      src={selectedUser.profile.idImage}
                      alt="ID Document" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderManage;
