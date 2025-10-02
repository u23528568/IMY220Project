import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";
import ApiService from "../services/ApiService";

export default function FriendsPage() {
  const navigate = useNavigate();
  const [allUsers, setAllUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch friends list
        const friendsResult = await ApiService.getFriendsList();
        let friendsList = [];
        if (friendsResult.success && Array.isArray(friendsResult.data)) {
          friendsList = friendsResult.data;
          setFriends(friendsList);
        }

        // Fetch friend requests
        const requestsResult = await ApiService.getFriendRequests();
        if (requestsResult.success && Array.isArray(requestsResult.data)) {
          setFriendRequests(requestsResult.data);
        }
        
        // Fetch all users for discovery
        const usersResult = await ApiService.getAllUsers();
        if (usersResult.success) {
          // Filter out the current user and existing friends
          const friendIds = friendsList.map(f => f._id);
          const otherUsers = usersResult.data.filter(u => 
            u._id !== user?.id && !friendIds.includes(u._id)
          );
          setAllUsers(otherUsers);
        } else {
          setError("Failed to load users");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Error loading data");
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchData();
    }
  }, [user?.id]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-orange-900 text-white flex flex-col">
      <Header />

      <main className="flex-grow container mx-auto p-6">
        {/* Friend Requests */}
        {friendRequests.length > 0 && (
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">Friend Requests</h1>
            <p className="text-gray-400 mb-6">People who want to connect with you</p>
            
            <div className="bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="space-y-4">
                {friendRequests.map((request) => (
                  <div key={request._id} className="flex items-center justify-between bg-orange-900/20 border border-orange-600/30 p-4 rounded">
                    <div className="flex items-center space-x-3">
                      {request.from.profile?.avatar ? (
                        <img
                          src={request.from.profile.avatar}
                          alt={request.from.profile?.name || request.from.username}
                          className="w-12 h-12 rounded-full object-cover border-2 border-orange-500"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full border-2 border-orange-500 flex items-center justify-center bg-gray-700">
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            strokeWidth="1.5" 
                            stroke="currentColor" 
                            className="w-8 h-8 text-gray-400"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                          </svg>
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold">
                          {request.from.profile?.name || request.from.username}
                        </h3>
                        <p className="text-gray-400 text-sm">@{request.from.username}</p>
                        <p className="text-gray-500 text-xs">
                          Sent {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm"
                        onClick={async () => {
                          try {
                            const result = await ApiService.handleFriendRequest(request._id, 'accept');
                            if (result.success) {
                              setFriendRequests(friendRequests.filter(r => r._id !== request._id));
                              // Add to friends list
                              setFriends([...friends, request.from]);
                              alert('Friend request accepted!');
                            } else {
                              alert('Failed to accept friend request');
                            }
                          } catch (error) {
                            alert('Error accepting friend request');
                          }
                        }}
                      >
                        Accept
                      </button>
                      <button 
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm"
                        onClick={async () => {
                          try {
                            const result = await ApiService.handleFriendRequest(request._id, 'reject');
                            if (result.success) {
                              setFriendRequests(friendRequests.filter(r => r._id !== request._id));
                              alert('Friend request declined');
                            } else {
                              alert('Failed to decline friend request');
                            }
                          } catch (error) {
                            alert('Error declining friend request');
                          }
                        }}
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Friends List */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">My Friends</h1>
          <p className="text-gray-400 mb-6">Your connections and collaborators</p>
          
          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            {loading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center justify-between bg-gray-700 p-4 rounded animate-pulse">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-gray-600"></div>
                      <div>
                        <div className="h-4 bg-gray-600 rounded w-24 mb-2"></div>
                        <div className="h-3 bg-gray-600 rounded w-16"></div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <div className="h-8 bg-gray-600 rounded w-20"></div>
                      <div className="h-8 bg-gray-600 rounded w-16"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : friends.length > 0 ? (
              <div className="space-y-4">
                {friends.map((friend) => (
                  <div key={friend._id} className="flex items-center justify-between bg-gray-700 p-4 rounded">
                    <div className="flex items-center space-x-3">
                      {friend.profile?.avatar ? (
                        <img
                          src={friend.profile.avatar}
                          alt={friend.profile?.name || friend.username}
                          className="w-12 h-12 rounded-full object-cover border-2 border-green-500"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full border-2 border-green-500 flex items-center justify-center bg-gray-700">
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            strokeWidth="1.5" 
                            stroke="currentColor" 
                            className="w-8 h-8 text-gray-400"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                          </svg>
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold">
                          {friend.profile?.name || friend.username}
                        </h3>
                        <p className="text-gray-400 text-sm">@{friend.username}</p>
                        {friend.profile?.bio && (
                          <p className="text-gray-500 text-xs mt-1 max-w-md truncate">
                            {friend.profile.bio}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded text-sm"
                        onClick={() => navigate(`/user/${friend.username}`)}
                      >
                        View Profile
                      </button>
                      <button 
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm"
                        onClick={async () => {
                          if (window.confirm('Are you sure you want to remove this friend?')) {
                            try {
                              const result = await ApiService.removeFriend(friend._id);
                              if (result.success) {
                                setFriends(friends.filter(f => f._id !== friend._id));
                              } else {
                                alert('Failed to remove friend');
                              }
                            } catch (error) {
                              alert('Error removing friend');
                            }
                          }
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-2">No friends yet</p>
                <p className="text-gray-500 text-sm">
                  Connect with other users below to start building your network!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Discover Users */}
        <div>
          <h2 className="text-2xl font-bold mb-2">Discover Users</h2>
          <p className="text-gray-400 mb-6">Connect with other developers and creators</p>
        </div>

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
                    {otherUser.profile?.avatar ? (
                      <img
                        src={otherUser.profile.avatar}
                        alt={otherUser.profile?.name || otherUser.username}
                        className="w-12 h-12 rounded-full object-cover border-2 border-orange-500"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full border-2 border-orange-500 flex items-center justify-center bg-gray-700">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          strokeWidth="1.5" 
                          stroke="currentColor" 
                          className="w-8 h-8 text-gray-400"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>
                      </div>
                    )}
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
                      onClick={async () => {
                        try {
                          const result = await ApiService.sendFriendRequest(otherUser._id);
                          if (result.success) {
                            alert('Friend request sent!');
                          } else {
                            alert(result.error || 'Failed to send friend request');
                          }
                        } catch (error) {
                          alert('Error sending friend request');
                        }
                      }}
                    >
                      Connect
                    </button>
                    <button 
                      className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded text-sm"
                      onClick={() => navigate(`/user/${otherUser.username}`)}
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
        <div className="mt-6 bg-green-900 border border-green-600 rounded-lg p-4">
          <h3 className="font-semibold mb-2">✅ Friends & Profiles</h3>
          <p className="text-green-200 text-sm">
            You can now send friend requests, view user profiles, and manage your connections.
            Click "Connect" to send friend requests and "View Profile" to see detailed user information.
          </p>
        </div>
      </main>
    </div>
  );
}
