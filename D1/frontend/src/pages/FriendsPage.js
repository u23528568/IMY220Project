import React from "react";
import Header from "../components/Header";
import FriendCard from "../components/FriendCard";

const friends = [
  { username: "u23528568", status: "Online" },
  { username: "u23716982", status: "Offline" },
  { username: "u23999999", status: "Online" },
  { username: "u23123456", status: "Offline" },
];

export default function FriendsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-orange-900 text-white flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center">
        <div className="bg-gray-800 rounded-lg shadow-lg p-8 w-full max-w-xl flex flex-col space-y-4">
          <h1 className="text-2xl font-bold mb-4">Friends</h1>
          {friends.map((friend, idx) => (
            <FriendCard key={idx} username={friend.username} status={friend.status} />
          ))}
        </div>
      </main>
    </div>
  );
}
