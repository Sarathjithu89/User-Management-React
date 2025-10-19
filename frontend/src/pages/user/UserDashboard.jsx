import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { fetchUserProfile } from "../../redux/slices/userSlice";
import { logout } from "../../redux/slices/authSlice";
import { showToast } from "../../utils/alerts";

const UserDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { profile, loading } = useSelector((state) => state.user);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user && !profile && !loading) {
      dispatch(fetchUserProfile());
    }
  }, [dispatch, user, profile, loading]);

  const handleLogout = () => {
    dispatch(logout()).then(() => {
      showToast("Logout successful", "success");
    });
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">User Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">
              Welcome, {user?.name || profile?.name || "User"}
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
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
              className="px-3 py-2 rounded bg-blue-700"
            >
              Dashboard
            </Link>
            <Link
              to="/user/profile"
              className="px-3 py-2 rounded hover:bg-blue-700"
            >
              My Profile
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-xl font-semibold mb-6">Dashboard Overview</h2>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading your information...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Profile Summary Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                Profile Summary
              </h3>
              <div className="space-y-2">
                <p className="text-gray-600">
                  <span className="font-medium">Name:</span>{" "}
                  {profile?.name || "N/A"}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Email:</span>{" "}
                  {profile?.email || user?.email || "N/A"}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Status:</span>{" "}
                  <span className="inline-block px-2 py-1 text-xs rounded bg-green-100 text-green-800">
                    Active
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default UserDashboard;
