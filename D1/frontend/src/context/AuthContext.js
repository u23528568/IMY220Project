import React, { createContext, useContext, useReducer, useEffect } from 'react';
import ApiService from '../services/ApiService';

// Initial state
const initialState = {
  isAuthenticated: false,
  user: null,
  loading: true,
  error: null,
};

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  SET_USER: 'SET_USER',
  SET_LOADING: 'SET_LOADING',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer function
function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        loading: true,
        error: null,
      };
    
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        loading: false,
        error: null,
      };
    
    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        loading: false,
        error: action.payload,
      };
    
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
      };
    
    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
      };
    
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    
    default:
      return state;
  }
}

// Create context
const AuthContext = createContext();

// Auth provider component
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if user is already logged in when app loads
  useEffect(() => {
    const checkAuth = () => {
      if (ApiService.isAuthenticated()) {
        const userData = ApiService.getCurrentUser();
        dispatch({
          type: AUTH_ACTIONS.SET_USER,
          payload: userData,
        });
      }
      dispatch({
        type: AUTH_ACTIONS.SET_LOADING,
        payload: false,
      });
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    try {
      const result = await ApiService.login(credentials);

      if (result.success) {
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: result.data.user,
        });
        return { success: true };
      } else {
        dispatch({
          type: AUTH_ACTIONS.LOGIN_FAILURE,
          payload: result.error,
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: 'Login failed. Please try again.',
      });
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  // Signup function
  const signup = async (userData) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    try {
      const result = await ApiService.signup(userData);

      if (result.success) {
        // After successful signup, automatically log in
        const loginResult = await ApiService.login({
          email: userData.email,
          password: userData.password,
        });

        if (loginResult.success) {
          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: loginResult.data.user,
          });
          return { success: true };
        }
      }

      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: result.error || 'Signup failed',
      });
      return { success: false, error: result.error || 'Signup failed' };
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: 'Signup failed. Please try again.',
      });
      return { success: false, error: 'Signup failed. Please try again.' };
    }
  };

  // Logout function
  const logout = () => {
    ApiService.logout();
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  };

  // Update user data
  const updateUser = (userData) => {
    dispatch({
      type: AUTH_ACTIONS.SET_USER,
      payload: userData,
    });
    localStorage.setItem('userData', JSON.stringify(userData));
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  const value = {
    ...state,
    login,
    signup,
    logout,
    updateUser,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;