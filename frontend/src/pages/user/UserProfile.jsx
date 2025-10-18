import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { logout, updateUserProfile } from "../../redux/slices/authSlice";
import { updateUserProfile as updateUserProfileAction } from "../../redux/slices/userSlice";
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

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
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
        }
      } finally {
        setProfileLoading(false);
      }
    };

    fetchFullProfile();
  }, [authUser?.id]);

  useEffect(() => {
    if (!loading && error) {
      closeAlert();
      showErrorAlert("Update Failed", error);
    }
  }, [error, loading]);

  const handleLogout = async () => {
    const result = await showConfirmDialog(
      "Logout",
      "Are you sure you want to logout?"
    );

    if (result.isConfirmed) {
      dispatch(logout());
      showToast("Logout successful", "success");
      setTimeout(() => navigate("/login"), 1500);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setHasChanges(true);
  };

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

    if (
      formData.phone &&
      formData.phone.length > 0 &&
      formData.phone.length < 10
    ) {
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
        try {
          const response = await axios.get("/user/profile");
          if (response.data.success) {
            const profileData = response.data.data;
            setFormData({
              name: profileData.name || "",
              email: profileData.email || "",
              phone: profileData.phone || "",
              address: profileData.address || "",
            });
          }
        } catch (err) {
          console.error("Failed to reload profile:", err);
        }
        setIsEditing(false);
        setHasChanges(false);
      }
    } else {
      setIsEditing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

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
            updateUserProfile({
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

          showToast("Profile Updated", "success");
          setIsEditing(false);
          setHasChanges(false);
        } else {
          showToast(
            resultAction.payload || "Failed to update profile",
            "error"
          );
        }
      } catch (err) {
        closeAlert();
        showErrorAlert("Error", err.message || "An error occurred");
      }
    }
  };

  const handleEditClick = () => {
    if (!isEditing) {
      setIsEditing(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
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
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Profile Information
            </h2>
            {!isEditing && (
              <button
                onClick={handleEditClick}
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 transition-all"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 transition-all"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 transition-all"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 transition-all"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div className="mt-6 flex gap-3">
                    <button
                      type="submit"
                      disabled={loading || profileLoading}
                      className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={loading || profileLoading}
                      className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed transition-colors"
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
