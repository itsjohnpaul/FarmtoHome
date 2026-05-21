import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const url = 'https://farmtohome-14jo.onrender.com';
const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Load from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('farm2home_user');
    const savedToken = localStorage.getItem('farm2home_token');

    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }

    setLoading(false);
  }, []);

  // ✅ LOGIN
  const login = async (email, password) => {
    try {
      const res = await axios.post(
        `${url}/api/auth/login`,
        { email, password }
      );

      setUser(res.data.user);
      setToken(res.data.token);

      localStorage.setItem('farm2home_user', JSON.stringify(res.data.user));
      localStorage.setItem('farm2home_token', res.data.token);

      return res.data.user;

    } catch (err) {
      throw err.response?.data?.message || "Login failed";
    }
  };

  // ✅ REGISTER
  const register = async (userData) => {
    try {
      await axios.post(
        `${url}/api/auth/register`,
        userData
      );

      // auto login after register
      return await login(userData.email, userData.password);

    } catch (err) {
      throw err.response?.data?.message || "Registration failed";
    }
  };

  // ✅ LOGOUT
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('farm2home_user');
    localStorage.removeItem('farm2home_token');
    localStorage.removeItem('farm2home_cart'); // Clear cart on logout
  };

  const value = {
    user,
    token,
    login,
    logout,
    register,
    setUser,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
