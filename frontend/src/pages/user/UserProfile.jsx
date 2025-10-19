import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  updateUserProfile as updateUserProfileAction,
  uploadProfilePicture,
} from "../../redux/slices/userSlice";
import {
  logout,
  updateUserProfile as updateAuthProfile,
} from "../../redux/slices/authSlice";
import axios from "../../api/axios";
import {
  showSuccessAlert,
  showErrorAlert,
  showLoadingAlert,
  closeAlert,
  showConfirmDialog,
  showToast,
} from "../../utils/alerts";

const UserProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { profile, loading, error } = useSelector((state) => state.user);
  const { user: authUser } = useSelector((state) => state.auth);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [pictureUrl, setPictureUrl] = useState(null);
  const [uploadingPicture, setUploadingPicture] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;
  const BASE_URL = API_URL.replace("/api", "");

  // Fetch user
  const fetchFullProfile = async () => {
    try {
      setProfileLoading(true);
      const response = await axios.get("/user/profile");

      if (response.data.success) {
        const profileData = response.data.data;

        setFormData({
          name: profileData.name || "",
          email: profileData.email || "",
          phone: profileData.phone || "",
          address: profileData.address || "",
        });

        if (profileData.profile_picture_path) {
          setPictureUrl(`${BASE_URL}/${profileData.profile_picture_path}`);
        } else {
          setPictureUrl(null);
        }
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);

      if (profile) {
        setFormData({
          name: profile.name || "",
          email: profile.email || "",
          phone: profile.phone || "",
          address: profile.address || "",
        });

        if (profile.profile_picture_path) {
          setPictureUrl(`${BASE_URL}/${profile.profile_picture_path}`);
        }
      }
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    fetchFullProfile();
  }, [authUser?.id]);

  useEffect(() => {
    if (!loading && error) {
      closeAlert();
      showErrorAlert("Update Failed", error);
    }
  }, [error, loading]);

  // Logout
  const handleLogout = async () => {
    const result = await showConfirmDialog(
      "Logout",
      "Are you sure you want to logout?"
    );

    if (result.isConfirmed) {
      dispatch(logout());
      showToast("Logout Successful", "success");
      setTimeout(() => navigate("/login"), 1500);
    }
  };

  //Input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setHasChanges(true);
  };

  //Form validation
  const validateForm = () => {
    if (!formData.name.trim()) {
      showErrorAlert("Validation Error", "Full name is required");
      return false;
    }

    if (!formData.email.trim()) {
      showErrorAlert("Validation Error", "Email is required");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showErrorAlert("Validation Error", "Please enter a valid email address");
      return false;
    }

    if (formData.phone && formData.phone.length < 10) {
      showErrorAlert(
        "Validation Error",
        "Phone number must be at least 10 digits"
      );
      return false;
    }

    return true;
  };

  const handleCancel = async () => {
    if (hasChanges) {
      const result = await showConfirmDialog(
        "Discard Changes?",
        "You have unsaved changes. Are you sure you want to discard them?"
      );

      if (result.isConfirmed) {
        await fetchFullProfile();
        setIsEditing(false);
        setHasChanges(false);
      }
    } else {
      setIsEditing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const result = await showConfirmDialog(
      "Save Changes",
      "Are you sure you want to save these changes?"
    );

    if (result.isConfirmed) {
      showLoadingAlert("Saving your profile...");

      try {
        const resultAction = await dispatch(updateUserProfileAction(formData));
        closeAlert();

        if (resultAction.type.endsWith("/fulfilled")) {
          const updatedUserData = resultAction.payload;

          dispatch(
            updateAuthProfile({
              name: updatedUserData.name,
              email: updatedUserData.email,
              phone: updatedUserData.phone,
              address: updatedUserData.address,
            })
          );

          setFormData({
            name: updatedUserData.name || "",
            email: updatedUserData.email || "",
            phone: updatedUserData.phone || "",
            address: updatedUserData.address || "",
          });

          showSuccessAlert(
            "Profile Updated",
            "Your profile has been updated successfully"
          );
          setIsEditing(false);
          setHasChanges(false);
        } else {
          showErrorAlert(
            "Update Failed",
            resultAction.payload || "Failed to update profile"
          );
        }
      } catch (err) {
        closeAlert();
        showErrorAlert("Error", err.message || "An error occurred");
      }
    }
  };

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      showErrorAlert(
        "Invalid File Type",
        "Only JPEG, PNG, and GIF files are allowed"
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showErrorAlert("File Too Large", "File size must be less than 5MB");
      return;
    }

    setUploadingPicture(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("profilePicture", file);

      const resultAction = await dispatch(uploadProfilePicture(formDataToSend));

      if (resultAction.type.endsWith("/fulfilled")) {
        const updatedData = resultAction.payload;

        if (updatedData.profile_picture_path) {
          setPictureUrl(`${BASE_URL}/${updatedData.profile_picture_path}`);
        }

        dispatch(
          updateAuthProfile({
            profile_picture_path: updatedData.profile_picture_path,
          })
        );

        showToast("Profile picture updated successfully", "success");
      } else {
        showErrorAlert(
          "Upload Failed",
          resultAction.payload || "Failed to upload picture"
        );
      }
    } catch (err) {
      showErrorAlert("Error", err.message || "Failed to upload picture");
    } finally {
      setUploadingPicture(false);
    }
  };

  const handleDeletePicture = async () => {
    const result = await showConfirmDialog(
      "Delete Picture?",
      "Are you sure you want to delete your profile picture?"
    );

    if (result.isConfirmed) {
      try {
        await axios.delete("/user/profile-picture");
        setPictureUrl(null);
        dispatch(updateAuthProfile({ profile_picture_path: null }));
        showToast("Profile picture deleted successfully", "success");
      } catch (err) {
        showErrorAlert("Error", err.message || "Failed to delete picture");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">
              Welcome, {authUser?.name || "User"}
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-4 py-3">
            <Link
              to="/user/dashboard"
              className="px-3 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              to="/user/profile"
              className="px-3 py-2 rounded bg-blue-700 transition-colors"
            >
              My Profile
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Picture Section */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Profile Picture
            </h2>
          </div>

          <div className="p-6 flex flex-col items-center">
            <div className="relative mb-4">
              {pictureUrl ? (
                <img
                  src={pictureUrl}
                  alt="Profile"
                  className="w-40 h-40 rounded-full object-cover border-4 border-blue-500 shadow-lg"
                  onError={(e) => {
                    console.error("Image failed to load:", pictureUrl);
                    setPictureUrl(null);
                  }}
                />
              ) : (
                <div className="w-40 h-40 rounded-full bg-gray-300 flex items-center justify-center border-4 border-gray-300 shadow-lg">
                  <svg
                    className="w-20 h-20 text-gray-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPicture}
                className="absolute bottom-0 right-0 bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600 disabled:bg-blue-400 shadow-md transition-colors"
                title="Upload photo"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
                </svg>
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif"
              onChange={handleProfilePictureChange}
              className="hidden"
            />

            <div className="flex gap-2 mb-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPicture}
                className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:bg-blue-400 transition-colors"
              >
                {uploadingPicture ? "Uploading..." : "Upload Photo"}
              </button>
              {pictureUrl && (
                <button
                  type="button"
                  onClick={handleDeletePicture}
                  className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Profile Information
            </h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
              >
                Edit Profile
              </button>
            )}
          </div>

          <div className="p-6">
            {profileLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Loading your profile...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      required
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="Enter your phone number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="Enter your address"
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                </div>

                {/* Buttons */}
                {isEditing && (
                  <div className="mt-6 flex gap-3">
                    <button
                      type="submit"
                      disabled={loading || profileLoading}
                      className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:bg-blue-400 transition-colors"
                    >
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={loading || profileLoading}
                      className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserProfile;
