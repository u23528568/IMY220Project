import React from "react";

export default function EditProfile({ onSave }) {
  return (
    <form className="flex flex-col space-y-4 bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-2 text-orange-400">Edit Profile</h2>
      <input
        type="text"
        placeholder="Username"
        className="p-2 rounded bg-gray-700 text-white"
      />
      <textarea
        placeholder="About you..."
        className="p-2 rounded bg-gray-700 text-white"
        rows={4}
      />
      <button
        type="submit"
        className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded"
        onClick={e => { e.preventDefault(); if (onSave) onSave(); }}
      >
        Save
      </button>
    </form>
  );
}
