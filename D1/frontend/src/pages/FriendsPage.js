import React from "react";
import Header from "../components/Header";

export default function FriendsPage() {
  const friends = [
    {
      id: 1,
      name: "John Smith",
      username: "@johnsmith",
      avatar: "/assets/images/profilepic.jpg",
      isOnline: true,
    },
    {
      id: 2,
      name: "Sarah Johnson",
      username: "@sarahj",
      avatar: "/assets/images/profilepic.jpg",
      isOnline: false,
    },
    {
      id: 3,
      name: "Mike Chen",
      username: "@mikechen",
      avatar: "/assets/images/profilepic.jpg",
      isOnline: true,
    },
    {
      id: 4,
      name: "Emily Davis",
      username: "@emilyd",
      avatar: "/assets/images/profilepic.jpg",
      isOnline: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-orange-900 text-white flex flex-col">
      <Header />

      <main className="flex-grow container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Friends</h1>

        <div className="bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="space-y-4">
            {friends.map((friend) => (
              <div
                key={friend.id}
                className="flex items-center justify-between bg-gray-700 p-4 rounded"
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={friend.avatar}
                    alt={friend.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <h3 className="font-semibold">{friend.name}</h3>
                    <p className="text-gray-400 text-sm">{friend.username}</p>
                  </div>
                  <span
                    className={`w-3 h-3 rounded-full ${
                      friend.isOnline ? "bg-green-500" : "bg-gray-500"
                    }`}
                  ></span>
                </div>
                <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded">
                  Message
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
