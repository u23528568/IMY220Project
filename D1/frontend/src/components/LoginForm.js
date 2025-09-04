import React from "react";
import { useNavigate } from "react-router-dom";

export default function LoginForm() {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // no real auth logic, just redirect
    navigate("/home");
  };

  return (
    <form onSubmit={handleLogin} className="flex flex-col space-y-4">
      <input type="text" placeholder="Username" className="p-2 rounded bg-gray-700 text-white" />
      <input type="password" placeholder="Password" className="p-2 rounded bg-gray-700 text-white" />
      <button
        type="submit"
        className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded"
      >
        Login
      </button>
    </form>
  );
}
