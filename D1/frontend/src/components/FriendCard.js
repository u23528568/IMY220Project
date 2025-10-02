import React from "react";

export default function FriendCard({ username, status }) {
  return (
    <div className="bg-gray-700 rounded p-4 flex justify-between items-center">
      <div>
        <h2 className="font-semibold text-lg">{username}</h2>
        <p className={`text-sm ${status === "Online" ? "text-green-400" : "text-gray-400"}`}>{status}</p>
      </div>
      <button className="bg-orange-500 hover:bg-orange-600 text-white rounded px-4 py-2 text-sm">Message</button>
    </div>
  );
}
