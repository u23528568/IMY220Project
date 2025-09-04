import React, { useState } from "react";

const SignupForm = () => {
  const [form, setForm] = useState({ email: "", password: "", confirm: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      alert("Passwords do not match!");
      return;
    }
    alert("Stub: signup API call here");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-3">
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        required
        className="p-2 rounded bg-gray-700 text-white focus:outline-none"
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={form.password}
        onChange={handleChange}
        required
        className="p-2 rounded bg-gray-700 text-white focus:outline-none"
      />
      <input
        type="password"
        name="confirm"
        placeholder="Confirm password"
        value={form.confirm}
        onChange={handleChange}
        required
        className="p-2 rounded bg-gray-700 text-white focus:outline-none"
      />
      <button
        type="submit"
        className="bg-orange-500 hover:bg-orange-600 py-2 rounded font-semibold"
      >
        Register
      </button>
    </form>
  );
};

export default SignupForm;
