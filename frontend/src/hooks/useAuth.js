'use client';

import { useState, useEffect, useCallback } from 'react';
import { authAPI, apiClient } from '@/utils/api';
import { TOKEN_KEY, CUSTOMER_KEY } from '@/lib/constants';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const token = apiClient.getToken();
    if (token) {
      // Try to fetch current user
      fetchMe();
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchMe = useCallback(async () => {
    setIsLoading(true);
    const response = await authAPI.getMe();
    if (response.success) {
      setUser(response.data);
      setIsAuthenticated(true);
    } else {
      apiClient.setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    }
    setIsLoading(false);
  }, []);

  const register = useCallback(async (email, password, confirmPassword, firstName, lastName) => {
    setIsLoading(true);
    setError(null);
    const response = await authAPI.register(email, password, confirmPassword, firstName, lastName);
    if (!response.success) {
      setError(response.error || 'Registration failed');
    }
    setIsLoading(false);
    return response;
  }, []);

  const verifyOTP = useCallback(async (email, otp) => {
    setIsLoading(true);
    setError(null);
    const response = await authAPI.verifyOTP(email, otp);
    if (response.success) {
      apiClient.setToken(response.data.token);
      setUser(response.data.customer);
      setIsAuthenticated(true);
    } else {
      setError(response.error || 'OTP verification failed');
    }
    setIsLoading(false);
    return response;
  }, []);

  const resendOTP = useCallback(async (email) => {
    setIsLoading(true);
    setError(null);
    const response = await authAPI.resendOTP(email);
    if (!response.success) {
      setError(response.error || 'Failed to resend OTP');
    }
    setIsLoading(false);
    return response;
  }, []);

  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    setError(null);
    const response = await authAPI.login(email, password);
    if (response.success) {
      apiClient.setToken(response.data.token);
      setUser(response.data.customer);
      setIsAuthenticated(true);
    } else {
      setError(response.error || 'Login failed');
    }
    setIsLoading(false);
    return response;
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    await authAPI.logout();
    apiClient.setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setIsLoading(false);
  }, []);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    register,
    verifyOTP,
    resendOTP,
    login,
    logout,
  };
};
