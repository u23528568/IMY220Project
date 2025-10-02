import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginForm() {
  const navigate = useNavigate();
  const { login, loading, error, clearError } = useAuth();
  
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [validationError, setValidationError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user starts typing
    if (validationError) setValidationError("");
    if (error) clearError();
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      setValidationError("Email is required");
      return false;
    }
    if (!formData.password.trim()) {
      setValidationError("Password is required");
      return false;
    }
    if (!formData.email.includes("@")) {
      setValidationError("Please enter a valid email");
      return false;
    }
    return true;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    console.log('LoginForm: Starting login with form data:', formData);
    const result = await login(formData);
    console.log('LoginForm: Received result from AuthContext:', result);
    
    if (result.success) {
      console.log('LoginForm: Login successful, navigating to /home');
      navigate("/home");
    } else {
      console.log('LoginForm: Login failed, error will be shown by AuthContext');
    }
    // Error handling is done automatically by the AuthContext
  };

  return (
    <form onSubmit={handleLogin} className="flex flex-col space-y-4">
      {/* Display errors */}
      {(error || validationError) && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || validationError}
        </div>
      )}
      
      <input 
        type="email" 
        name="email"
        placeholder="Email" 
        value={formData.email}
        onChange={handleChange}
        className="p-2 rounded bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:border-orange-500 focus:outline-none"
        disabled={loading}
        required
      />
      
      <input 
        type="password" 
        name="password"
        placeholder="Password" 
        value={formData.password}
        onChange={handleChange}
        className="p-2 rounded bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:border-orange-500 focus:outline-none"
        disabled={loading}
        required
      />
      
      <button
        type="submit"
        disabled={loading}
        className={`font-semibold py-2 px-4 rounded transition-colors ${
          loading 
            ? "bg-gray-500 cursor-not-allowed" 
            : "bg-orange-500 hover:bg-orange-600"
        } text-white`}
      >
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}
