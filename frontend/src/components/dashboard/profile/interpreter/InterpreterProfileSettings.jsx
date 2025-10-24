
import React, { useEffect, useState } from 'react';
import { Camera } from 'lucide-react';
import Swal from 'sweetalert2';
import useInterpreterAuth from '../../../../context/InterpreterAuthContext';
import { API_URL } from '../../../../api/api';

const InterpreterProfileSettings = () => {
  const { user, updateProfile } = useInterpreterAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    createdAt: user?.createdAt || '',
    photoUrl: user?.photoUrl ? `${API_URL}${user.photoUrl}` : '',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      createdAt: user?.createdAt || '',
      photoUrl: user?.photoUrl ? `${API_URL}${user.photoUrl}` : '',
    });
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          photoUrl: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const updatePayload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      };

      if (selectedFile) {
        const fd = new FormData();
        fd.append('photo', selectedFile);
        fd.append('name', formData.name);
        fd.append('email', formData.email);
        fd.append('phone', formData.phone);
        await updateProfile(user?.id, fd);
      } else {
        await updateProfile(user?.id, updatePayload);
      }

      Swal.fire({
        icon: 'success',
        title: 'Profile Updated!',
        text: 'Your profile has been updated successfully.',
        confirmButtonColor: '#2563eb', // blue-600
        textColor: '#1f2937', // gray-800
        titleColor: '#1f2937', // gray-800
      });

      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: error.message || 'Something went wrong while updating your profile.',
        confirmButtonColor: '#ef4444', // red-500
        textColor: '#1f2937', // gray-800
        titleColor: '#1f2937', // gray-800
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      createdAt: user?.createdAt || '',
      photoUrl: user?.photoUrl ? `${API_URL}${user.photoUrl}` : '',
    });
    setSelectedFile(null);
    setIsEditing(false);
  };

  const handleUpdate = () => {
    setIsEditing(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().slice(0, 16);
  };

  return (
    <>
      {/* Profile Section */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Basic Information
        </h2>

        {/* Profile Photo */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Profile Photo
          </label>
          <div className="flex items-center space-x-3">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              {formData.photoUrl ? (
                <img
                  src={formData.photoUrl}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <Camera className="w-4 h-4 text-gray-400" />
              )}
            </div>
            <div className="flex space-x-2">
              <label
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  isEditing
                    ? 'bg-blue-500 text-white hover:bg-blue-600 cursor-pointer'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Upload
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={!isEditing}
                  className="hidden"
                />
              </label>
              <button
                onClick={() =>
                  setFormData((prev) => ({ ...prev, photoUrl: '' }))
                }
                disabled={!isEditing}
                className={`px-3 py-1.5 border border-gray-200 rounded text-xs font-medium transition-colors ${
                  isEditing
                    ? 'text-gray-600 hover:bg-gray-50'
                    : 'text-gray-400 cursor-not-allowed'
                }`}
              >
                Remove
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Recommended image size is 400px x 400px
          </p>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="name"
              className="block text-xs font-medium text-gray-600 mb-1"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              readOnly={!isEditing}
              className={`w-full px-3 py-1.5 border border-gray-200 rounded text-xs ${
                isEditing
                  ? 'focus:ring-blue-500 focus:border-blue-500'
                  : 'bg-gray-100 text-gray-600 cursor-not-allowed'
              }`}
              placeholder="Enter your name"
            />
          </div>
          <div>
            <label
              htmlFor="phone"
              className="block text-xs font-medium text-gray-600 mb-1"
            >
              Phone
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              readOnly={!isEditing}
              className={`w-full px-3 py-1.5 border border-gray-200 rounded text-xs ${
                isEditing
                  ? 'focus:ring-blue-500 focus:border-blue-500'
                  : 'bg-gray-100 text-gray-600 cursor-not-allowed'
              }`}
              placeholder="Enter phone number"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-medium text-gray-600 mb-1"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              readOnly={!isEditing}
              className={`w-full px-3 py-1.5 border border-gray-200 rounded text-xs ${
                isEditing
                  ? 'focus:ring-blue-500 focus:border-blue-500'
                  : 'bg-gray-100 text-gray-600 cursor-not-allowed'
              }`}
              placeholder="Enter email address"
            />
          </div>
          <div>
            <label
              htmlFor="createdAt"
              className="block text-xs font-medium text-gray-600 mb-1"
            >
              Account Created
            </label>
            <input
              type="datetime-local"
              id="createdAt"
              name="createdAt"
              value={formatDate(formData.createdAt)}
              readOnly
              className="w-full px-3 py-1.5 border border-gray-200 rounded text-xs bg-gray-100 text-gray-600 cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Buttons */}
      {!isEditing && (
        <div className="flex justify-end">
          <button
            onClick={handleUpdate}
            className="px-4 py-1.5 bg-blue-500 text-white text-xs font-medium rounded hover:bg-blue-600 transition-colors"
          >
            Update
          </button>
        </div>
      )}

      {isEditing && (
        <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
          <button
            onClick={handleCancel}
            className="px-4 py-1.5 border border-gray-200 text-gray-600 text-xs font-medium rounded hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-1.5 bg-blue-500 text-white text-xs font-medium rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      )}
    </>
  );
};

export default InterpreterProfileSettings;