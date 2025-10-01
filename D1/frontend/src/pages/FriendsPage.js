import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";
import ApiService from "../services/ApiService";

export default function FriendsPage() {
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // For now, we'll show all users as potential connections
        // In a real app, this would be friends/connections
        const result = await ApiService.getAllUsers();
        if (result.success) {
          // Filter out the current user
          const otherUsers = result.data.filter(u => u._id !== user?.id);
          setAllUsers(otherUsers);
        } else {
          setError("Failed to load users");
        }
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Error loading users");
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchUsers();
    }
  }, [user?.id]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-orange-900 text-white flex flex-col">
      <Header />

      <main className="flex-grow container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Discover Users</h1>
        <p className="text-gray-400 mb-6">Connect with other developers and creators</p>

        <div className="bg-gray-800 rounded-lg shadow-lg p-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between bg-gray-700 p-4 rounded animate-pulse">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-gray-600"></div>
                    <div>
                      <div className="h-4 bg-gray-600 rounded w-24 mb-2"></div>
                      <div className="h-3 bg-gray-600 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="h-8 bg-gray-600 rounded w-20"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-900 border border-red-600 text-red-200 p-4 rounded">
              {error}
            </div>
          ) : allUsers.length > 0 ? (
            <div className="space-y-4">
              {allUsers.map((otherUser) => (
                <div
                  key={otherUser._id}
                  className="flex items-center justify-between bg-gray-700 p-4 rounded hover:bg-gray-600 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={otherUser.profilePicture || "/assets/images/Logo.png"}
                      alt={otherUser.profile?.name || otherUser.username}
                      className="w-12 h-12 rounded-full object-cover border-2 border-orange-500"
                    />
                    <div>
                      <h3 className="font-semibold">
                        {otherUser.profile?.name || otherUser.username}
                      </h3>
                      <p className="text-gray-400 text-sm">@{otherUser.username}</p>
                      {otherUser.profile?.bio && (
                        <p className="text-gray-500 text-xs mt-1 max-w-md truncate">
                          {otherUser.profile.bio}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded text-sm"
                      onClick={() => {
                        // TODO: Implement friend request functionality
                        console.log("Connect with user:", otherUser.username);
                      }}
                    >
                      Connect
                    </button>
                    <button 
                      className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded text-sm"
                      onClick={() => {
                        // TODO: Implement view profile functionality
                        console.log("View profile:", otherUser.username);
                      }}
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400 mb-4">No other users found</p>
              <p className="text-gray-500 text-sm">
                Be the first to invite others to join the platform!
              </p>
            </div>
          )}
        </div>

        {/* Feature Notice */}
        <div className="mt-6 bg-blue-900 border border-blue-600 rounded-lg p-4">
          <h3 className="font-semibold mb-2">🚧 Coming Soon</h3>
          <p className="text-blue-200 text-sm">
            Friend requests, messaging, and collaboration features are planned for future releases.
            For now, you can discover other users and view their projects.
          </p>
        </div>
      </main>
    </div>
  );
}
