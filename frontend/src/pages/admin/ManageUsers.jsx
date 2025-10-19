import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { data, Link, useNavigate } from "react-router-dom";
import {
  fetchAllUsers,
  deleteUser,
  updateUserRole,
} from "../../redux/slices/adminSlice";
import { logout } from "../../redux/slices/authSlice";
import {
  showErrorAlert,
  showDeleteConfirmation,
  showToast,
  showConfirmDialog,
} from "../../utils/alerts";

const ManageUsers = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { users, loading, error } = useSelector((state) => state.admin);
  const { user } = useSelector((state) => state.auth);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const handleDelete = async (userToDelete) => {
    const result = await showDeleteConfirmation(userToDelete.name);

    if (result.isConfirmed) {
      try {
        dispatch(deleteUser(userToDelete.id)).then((data) => {
          if (data.type.endsWith("/fulfilled")) {
            showToast(`${userToDelete.name} deleted successfully`, "success");
          } else {
            showErrorAlert("Error", data.payload || "Failed to delete user");
          }
        });
      } catch (err) {
        showErrorAlert("Error", err.message || "An error occurred");
      }
    }
  };

  const handleRoleChange = async (userId, currentRole) => {
    const newRole = currentRole === "admin" ? "user" : "admin";

    const result = showConfirmDialog(
      `Change role to ${newRole}?`,
      `Are you sure you want to change this user's role to "${newRole}"?`
    );

    if ((await result).isConfirmed) {
      try {
        const updateResult = await dispatch(
          updateUserRole({ userId, role: newRole })
        );

        if (updateResult.type.endsWith("/fulfilled")) {
          showToast(`User role updated to ${newRole}`, "success");
        } else {
          showErrorAlert(
            "Error",
            updateResult.payload || "Failed to update role"
          );
        }
      } catch (err) {
        showErrorAlert("Error", err.message || "An error occurred");
      }
    }
  };

  if (error && !loading) {
    showErrorAlert("Error", error);
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Manage Users</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">
              Welcome, {user?.name || "Admin"}
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
      <nav className="bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-4 py-3">
            <Link
              to="/admin/dashboard"
              className="px-3 py-2 rounded hover:bg-gray-700"
            >
              Dashboard
            </Link>
            <Link to="/admin/users" className="px-3 py-2 rounded bg-gray-900">
              Manage Users
            </Link>
            <Link
              to="/admin/profile"
              className="px-3 py-2 rounded hover:bg-gray-700"
            >
              Profile
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">All Users</h2>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
              <p className="mt-4 text-gray-600">Loading users...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-6 py-4 text-center text-gray-500"
                      >
                        No users found
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {u.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {u.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleRoleChange(u.id, u.role)}
                            className={`px-3 py-1 rounded text-white text-xs font-semibold ${
                              u.role === "admin"
                                ? "bg-purple-600 hover:bg-purple-700"
                                : "bg-blue-600 hover:bg-blue-700"
                            }`}
                          >
                            {u.role}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {u.status || "Active"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                          <button
                            onClick={() => handleDelete(u)}
                            className="text-red-600 hover:text-red-900 font-semibold"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary Card */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Summary</h3>
          <p className="text-gray-600">
            Total Users:{" "}
            <span className="font-bold text-gray-900">{users.length}</span>
          </p>
        </div>
      </main>
    </div>
  );
};

export default ManageUsers;
