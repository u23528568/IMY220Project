import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";
import ApiService from "../services/ApiService";
import { formatDateToCAT } from "../utils/timezone";
import { detectLanguagesFromFiles, getLanguageColor } from "../utils/languageDetection";

export default function UserProfile() {
  const { identifier } = useParams(); // username or user ID
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [friends, setFriends] = useState([]);
  const [relationship, setRelationship] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching profile for identifier:', identifier);
        const result = await ApiService.getUserProfile(identifier);
        console.log('Profile API result:', result);
        
        if (result.success) {
          setProfileUser(result.data.user);
          setProjects(result.data.projects || []);
          setRelationship(result.data.relationship || {});
          
          // Fetch friends list if they are friends or viewing own profile
          if (result.data.relationship.isFriend || result.data.relationship.isOwn) {
            const friendsResult = await ApiService.getUserFriends(result.data.user._id);
            if (friendsResult.success) {
              setFriends(friendsResult.data || []);
            }
          }
        } else {
          console.error('Profile fetch failed:', result);
          setError(result.error || 'Failed to load user profile');
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Error loading user profile');
      } finally {
        setLoading(false);
      }
    };

    if (identifier) {
      fetchUserProfile();
    }
  }, [identifier]);

  const handleSendFriendRequest = async () => {
    try {
      setActionLoading(true);
      const result = await ApiService.sendFriendRequest(profileUser._id);
      
      if (result.success) {
        setRelationship(prev => ({ ...prev, hasPendingRequest: true }));
        alert('Friend request sent successfully!');
      } else {
        alert(result.error || 'Failed to send friend request');
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
      alert('Error sending friend request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveFriend = async () => {
    if (!confirm('Are you sure you want to remove this friend?')) return;
    
    try {
      setActionLoading(true);
      const result = await ApiService.removeFriend(profileUser._id);
      
      if (result.success) {
        setRelationship(prev => ({ ...prev, isFriend: false }));
        alert('Friend removed successfully');
      } else {
        alert(result.error || 'Failed to remove friend');
      }
    } catch (error) {
      console.error('Error removing friend:', error);
      alert('Error removing friend');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-orange-900 text-white flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto p-6">
          <div className="animate-pulse space-y-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center space-x-6">
                <div className="w-24 h-24 rounded-full bg-gray-600"></div>
                <div className="space-y-3">
                  <div className="h-6 bg-gray-600 rounded w-48"></div>
                  <div className="h-4 bg-gray-600 rounded w-32"></div>
                  <div className="h-4 bg-gray-600 rounded w-64"></div>
                </div>
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="h-6 bg-gray-600 rounded w-32 mb-4"></div>
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-20 bg-gray-600 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-orange-900 text-white flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto p-6">
          <div className="bg-red-900 border border-red-600 text-red-200 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-2">Error</h2>
            <p>{error}</p>
            <button 
              onClick={() => navigate(-1)}
              className="mt-4 bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
            >
              Go Back
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-orange-900 text-white flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto p-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">User Not Found</h2>
            <p className="text-gray-400 mb-6">The user you're looking for doesn't exist.</p>
            <button 
              onClick={() => navigate(-1)}
              className="bg-orange-500 hover:bg-orange-600 px-6 py-2 rounded"
            >
              Go Back
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-orange-900 text-white flex flex-col">
      <Header />

      <main className="flex-grow container mx-auto p-6">
        {/* User Profile Header */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-6">
              {profileUser.profile?.avatar ? (
                <img
                  src={profileUser.profile.avatar}
                  alt={profileUser.profile?.name || profileUser.username}
                  className="w-24 h-24 rounded-full object-cover border-4 border-orange-500"
                />
              ) : (
                <div className="w-24 h-24 rounded-full border-4 border-orange-500 flex items-center justify-center bg-gray-700">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    strokeWidth="1.5" 
                    stroke="currentColor" 
                    className="w-12 h-12 text-gray-400"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold">
                  {profileUser.profile?.name || profileUser.username}
                </h1>
                <p className="text-gray-400 mb-2">@{profileUser.username}</p>
                
                {/* Show full profile only if friends or own profile */}
                {(relationship.isFriend || relationship.isOwn) ? (
                  <>
                    {profileUser.profile?.bio && (
                      <p className="text-gray-300 mb-3 max-w-md">{profileUser.profile.bio}</p>
                    )}
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span>Joined {formatDateToCAT(profileUser.createdAt)}</span>
                      <span>•</span>
                      <span>{profileUser.projectCount} projects</span>
                      <span>•</span>
                      <span>{profileUser.friendCount} friends</span>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-500 text-sm italic mt-2">
                    Add as friend to see full profile
                  </p>
                )}
              </div>
            </div>
            
            {/* Action Buttons */}
            {!relationship.isOwn && (
              <div className="flex space-x-3">
                {relationship.isFriend ? (
                  <button 
                    onClick={handleRemoveFriend}
                    disabled={actionLoading}
                    className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded"
                  >
                    {actionLoading ? 'Removing...' : 'Remove Friend'}
                  </button>
                ) : relationship.hasPendingRequest ? (
                  <button 
                    disabled
                    className="bg-gray-600 text-gray-400 px-4 py-2 rounded cursor-not-allowed"
                  >
                    Request Sent
                  </button>
                ) : (
                  <button 
                    onClick={handleSendFriendRequest}
                    disabled={actionLoading}
                    className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white px-4 py-2 rounded"
                  >
                    {actionLoading ? 'Sending...' : 'Send Friend Request'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Only show projects and friends if they are friends or viewing own profile */}
        {(relationship.isFriend || relationship.isOwn) ? (
          <>
            {/* Friends List */}
            {friends.length > 0 && (
              <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">
                  Friends ({friends.length})
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {friends.slice(0, 8).map((friend) => (
                    <div
                      key={friend._id}
                      className="bg-gray-700 p-3 rounded-lg hover:bg-gray-600 cursor-pointer transition-colors"
                      onClick={() => navigate(`/user/${friend.username}`)}
                    >
                      <div className="flex flex-col items-center text-center">
                        {friend.profile?.avatar ? (
                          <img
                            src={friend.profile.avatar}
                            alt={friend.username}
                            className="w-16 h-16 rounded-full object-cover mb-2"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gray-600 flex items-center justify-center mb-2">
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
                        <p className="font-semibold text-white text-sm truncate w-full">
                          {friend.profile?.name || friend.username}
                        </p>
                        <p className="text-gray-400 text-xs truncate w-full">
                          @{friend.username}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                {friends.length > 8 && (
                  <p className="text-center text-gray-400 text-sm mt-4">
                    and {friends.length - 8} more friends
                  </p>
                )}
              </div>
            )}

            {/* User Projects */}
            <div className="bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">
                {relationship.isOwn ? 'Your Projects' : `${profileUser.profile?.name || profileUser.username}'s Projects`}
              </h2>
              
              {projects.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p className="mb-2">📁</p>
                  <p>No public projects yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {projects.map((project) => (
                    <div
                      key={project._id}
                      className="bg-gray-700 p-4 rounded-lg border border-gray-600 hover:border-orange-500 cursor-pointer transition-colors"
                      onClick={() => navigate("/projectview", { state: { projectId: project._id } })}
                    >
                      <h3 className="font-semibold text-orange-400 mb-2">{project.name}</h3>
                      <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                        {project.description || "No description available"}
                      </p>
                      
                      <div className="flex justify-between items-center text-xs text-gray-400 mb-2">
                        <span>{project.type || "Project"}</span>
                        <span>{formatDateToCAT(project.createdAt)}</span>
                      </div>

                      {(() => {
                        const languages = detectLanguagesFromFiles(project.files || []);
                        return languages.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {languages.slice(0, 3).map((language, index) => (
                              <span 
                                key={index} 
                                className={`inline-block ${getLanguageColor(language)} text-white text-xs px-2 py-1 rounded-full font-medium`}
                              >
                                {language}
                              </span>
                            ))}
                            {languages.length > 3 && (
                              <span className="text-gray-400 text-xs">
                                +{languages.length - 3} more
                              </span>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          /* Not friends - show restricted message */
          <div className="bg-gray-800 rounded-lg shadow-lg p-12 text-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth="1.5" 
              stroke="currentColor" 
              className="w-16 h-16 text-gray-600 mx-auto mb-4"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">Profile is Private</h3>
            <p className="text-gray-400 mb-6">
              Send a friend request to view {profileUser.profile?.name || profileUser.username}'s projects and friends list.
            </p>
            {!relationship.hasPendingRequest && (
              <button 
                onClick={handleSendFriendRequest}
                disabled={actionLoading}
                className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white px-6 py-3 rounded-lg"
              >
                {actionLoading ? 'Sending...' : 'Send Friend Request'}
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}