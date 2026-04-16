import { useState, useEffect, useContext } from 'react';
import axiosInstance from '../utils/axios';

export const useProvideAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axiosInstance.get('/auth/me');
        if (response.data.success) {
          setUser(response.data.user);
        }
      } catch (error) {
        console.log('Not authenticated');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const register = async (userData) => {
    try {
      const response = await axiosInstance.post('/auth/register', userData);
      if (response.data.success) {
        setUser(response.data.user);
        return { success: true, message: response.data.message };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  const login = async (userData) => {
    try {
      const response = await axiosInstance.post('/auth/login', userData);
      if (response.data.success) {
        setUser(response.data.user);
        return { success: true, message: response.data.message };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const googleLogin = async (credential) => {
    try {
      const response = await axiosInstance.post('/auth/google', { credential });
      if (response.data.success) {
        setUser(response.data.user);
        return { success: true, message: response.data.message };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Google login failed'
      };
    }
  };

  const logout = async () => {
    try {
      await axiosInstance.post('/auth/logout');
      setUser(null);
      return { success: true, message: 'Logged out successfully' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Logout failed'
      };
    }
  };

  return {
    user,
    register,
    login,
    googleLogin,
    logout,
    loading,
  };
};