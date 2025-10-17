export const USER_ROLES = {
  ADMIN: "admin",
  USER: "user",
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    REFERESH: "/auth/refresh",
  },
  USER: {
    PROFILE: "/user/profile",
    UPDATE: "/user/profile",
  },
  ADMIN: {
    USERS: "/admin/users",
    STATS: "/admin/stats",
    DELETE_USER: (id) => `/admin/users/${id}`,
    UPDATE_ROLE: (id) => `/admin/users/${id}/role`,
  },
};

export const TOKEN_KEY = "token";
