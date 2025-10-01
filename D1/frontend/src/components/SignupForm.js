import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const SignupForm = () => {
  const navigate = useNavigate();
  const { signup, loading, error, clearError } = useAuth();
  
  const [form, setForm] = useState({ 
    username: "",
    email: "", 
    password: "", 
    confirm: "",
    name: "",
    bio: ""
  });
  const [validationError, setValidationError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    
    // Clear errors when user starts typing
    if (validationError) setValidationError("");
    if (error) clearError();
  };

  const validateForm = () => {
    if (!form.username.trim()) {
      setValidationError("Username is required");
      return false;
    }
    if (!form.email.trim()) {
      setValidationError("Email is required");
      return false;
    }
    if (!form.name.trim()) {
      setValidationError("Name is required");
      return false;
    }
    if (!form.password.trim()) {
      setValidationError("Password is required");
      return false;
    }
    if (form.password.length < 6) {
      setValidationError("Password must be at least 6 characters");
      return false;
    }
    if (form.password !== form.confirm) {
      setValidationError("Passwords do not match!");
      return false;
    }
    if (!form.email.includes("@")) {
      setValidationError("Please enter a valid email");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Prepare data in the format expected by the backend
    const signupData = {
      username: form.username,
      email: form.email,
      password: form.password,
      profile: {
        name: form.name,
        bio: form.bio || "New user on Repofox"
      }
    };

    const result = await signup(signupData);
    
    if (result.success) {
      navigate("/home");
    }
    // Error handling is done automatically by the AuthContext
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-3">
      {/* Display errors */}
      {(error || validationError) && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || validationError}
        </div>
      )}

      <input
        type="text"
        name="username"
        placeholder="Username"
        value={form.username}
        onChange={handleChange}
        disabled={loading}
        required
        className="p-2 rounded bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:border-orange-500 focus:outline-none"
      />
      
      <input
        type="text"
        name="name"
        placeholder="Full Name"
        value={form.name}
        onChange={handleChange}
        disabled={loading}
        required
        className="p-2 rounded bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:border-orange-500 focus:outline-none"
      />

      <input
        type="email"
        name="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        disabled={loading}
        required
        className="p-2 rounded bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:border-orange-500 focus:outline-none"
      />

      <input
        type="text"
        name="bio"
        placeholder="Bio (optional)"
        value={form.bio}
        onChange={handleChange}
        disabled={loading}
        className="p-2 rounded bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:border-orange-500 focus:outline-none"
      />
      
      <input
        type="password"
        name="password"
        placeholder="Password (min 6 characters)"
        value={form.password}
        onChange={handleChange}
        disabled={loading}
        required
        className="p-2 rounded bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:border-orange-500 focus:outline-none"
      />
      
      <input
        type="password"
        name="confirm"
        placeholder="Confirm password"
        value={form.confirm}
        onChange={handleChange}
        disabled={loading}
        required
        className="p-2 rounded bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:border-orange-500 focus:outline-none"
      />
      
      <button
        type="submit"
        disabled={loading}
        className={`py-2 rounded font-semibold transition-colors ${
          loading 
            ? "bg-gray-500 cursor-not-allowed" 
            : "bg-orange-500 hover:bg-orange-600"
        } text-white`}
      >
        {loading ? "Creating Account..." : "Register"}
      </button>
    </form>
  );
};

export default SignupForm;
