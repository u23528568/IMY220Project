import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Files from "../components/Files";
import ProjectHistory from "../components/ProjectHistory";
import { useAuth } from "../context/AuthContext";
import ApiService from "../services/ApiService";
import { detectLanguagesFromFiles, getLanguageColor } from "../utils/languageDetection";
import { formatDateTimeToCAT, formatDateToCAT, formatTimeToCAT, getRelativeTimeCAT } from "../utils/timezone";
import { downloadProjectAsZip, downloadProjectAsText } from "../utils/downloadUtils";

export default function ProjectViewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isProjectInfoExpanded, setIsProjectInfoExpanded] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [checkOutLoading, setCheckOutLoading] = useState(false);
  const [showCheckOutModal, setShowCheckOutModal] = useState(false);
  const [checkOutMessage, setCheckOutMessage] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [friends, setFriends] = useState([]);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  
  // Get project ID from navigation state or URL params
  const projectId = location.state?.projectId || new URLSearchParams(location.search).get('id');

  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) {
        setError("No project ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const result = await ApiService.getProject(projectId);
        if (result.success) {
          setProject(result.data);
          
          // Check if project is favorited
          try {
            const favoritesResult = await ApiService.getUserFavorites();
            if (favoritesResult.success) {
              const isFav = favoritesResult.data.some(fav => fav._id === projectId);
              setIsFavorited(isFav);
            }
          } catch (err) {
            console.error("Error checking favorites:", err);
          }
        } else {
          setError("Failed to load project");
        }
      } catch (err) {
        console.error("Error fetching project:", err);
        setError("Error loading project");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-orange-900 text-white flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading project...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-orange-900 text-white flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="bg-red-900 border border-red-600 text-red-200 p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-2">Project Not Found</h2>
              <p className="mb-4">{error || "The requested project could not be found."}</p>
              <button 
                onClick={() => navigate("/project")}
                className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded"
              >
                View All Projects
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const isOwner = project.owner?._id === user?.id;
  const isMember = project.members?.some(member => member.user?._id === user?.id);
  const hasWorkPermission = isOwner || isMember;

  const handleFavoriteToggle = async () => {
    if (favoritesLoading) return;
    
    setFavoritesLoading(true);
    try {
      if (isFavorited) {
        const result = await ApiService.removeFromFavorites(project._id);
        if (result.success) {
          setIsFavorited(false);
        }
      } else {
        const result = await ApiService.addToFavorites(project._id);
        if (result.success) {
          setIsFavorited(true);
        }
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    } finally {
      setFavoritesLoading(false);
    }
  };

  const handleCheckIn = async () => {
    setCheckInLoading(true);
    try {
      const result = await ApiService.checkIntoProject(project._id);
      if (result.success) {
        // Refresh project data to show updated checkout status
        const updatedProject = await ApiService.getProject(project._id);
        if (updatedProject.success) {
          setProject(updatedProject.data);
        }
      }
    } catch (error) {
      console.error("Error checking in:", error);
      alert("Failed to check into project. " + (error.message || "Please try again."));
    } finally {
      setCheckInLoading(false);
    }
  };

  const handleInviteCollaborators = async () => {
    try {
      setShowInviteModal(true);
      const friendsResult = await ApiService.getFriendsList();
      if (friendsResult.success) {
        // Filter out friends who are already members
        const currentMemberIds = project.members?.map(member => member.user._id) || [];
        const availableFriends = friendsResult.data.filter(
          friend => !currentMemberIds.includes(friend._id)
        );
        setFriends(availableFriends);
      }
    } catch (error) {
      console.error('Error loading friends:', error);
      alert('Failed to load friends list');
    }
  };

  const handleInviteFriend = async (friendId) => {
    try {
      setInviteLoading(true);
      const result = await ApiService.inviteCollaborator(project._id, friendId, 'collaborator');
      if (result.success) {
        alert('Collaborator added successfully!');
        // Refresh project data to show new member
        const updatedProject = await ApiService.getProjectDetails(project._id);
        if (updatedProject.success) {
          setProject(updatedProject.data);
        }
        // Remove invited friend from available list
        setFriends(friends.filter(friend => friend._id !== friendId));
      } else {
        alert(result.error || 'Failed to invite collaborator');
      }
    } catch (error) {
      console.error('Error inviting collaborator:', error);
      alert('Error inviting collaborator');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleRemoveCollaborator = async (memberId, memberName) => {
    if (window.confirm(`Are you sure you want to remove ${memberName} from this project?`)) {
      try {
        const result = await ApiService.removeCollaborator(project._id, memberId);
        if (result.success) {
          alert('Collaborator removed successfully');
          // Refresh project data
          const updatedProject = await ApiService.getProjectDetails(project._id);
          if (updatedProject.success) {
            setProject(updatedProject.data);
          }
        } else {
          alert(result.error || 'Failed to remove collaborator');
        }
      } catch (error) {
        console.error('Error removing collaborator:', error);
        alert('Error removing collaborator');
      }
    }
  };

  const handleCheckOutSubmit = async () => {
    if (!checkOutMessage.trim()) {
      alert("Please enter a message describing what you worked on.");
      return;
    }

    setCheckOutLoading(true);
    try {
      const result = await ApiService.checkOutOfProject(project._id, checkOutMessage);
      if (result.success) {
        // Refresh project data
        const updatedProject = await ApiService.getProject(project._id);
        if (updatedProject.success) {
          setProject(updatedProject.data);
        }
        setShowCheckOutModal(false);
        setCheckOutMessage('');
        alert(`Successfully checked out! Time spent: ${result.data.timeSpent || 'Unknown'}`);
      }
    } catch (error) {
      console.error("Error checking out:", error);
      alert("Failed to check out. " + (error.message || "Please try again."));
    } finally {
      setCheckOutLoading(false);
    }
  };

  const handleDownloadProject = async (format = 'zip') => {
    try {
      setDownloadLoading(true);
      
      // Get project data for download
      const result = await ApiService.downloadProject(projectId);
      
      if (result.success) {
        if (format === 'zip') {
          await downloadProjectAsZip(result.data);
        } else {
          downloadProjectAsText(result.data);
        }
      } else {
        throw new Error(result.error || 'Failed to download project');
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download project: ' + (error.message || 'Please try again'));
    } finally {
      setDownloadLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-orange-900 text-white flex flex-col">
      <Header />

      <main className="flex flex-1 container mx-auto p-6 gap-6">
        <aside className="w-80 bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-orange-400">{project.name}</h1>
              <span className="bg-gray-600 text-xs px-2 py-1 rounded">
                {project.visibility || "Public"}
              </span>
            </div>
            <div className="flex space-x-3">
              {isOwner && (
                <button 
                  className="text-gray-400 hover:text-orange-400 text-lg"
                  onClick={() => navigate("/edit-project", { state: { projectId: project._id } })}
                  title="Edit Project"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z" />
                    <path d="M5.25 5.25a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3V13.5a.75.75 0 0 0-1.5 0v5.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V8.25a1.5 1.5 0 0 1 1.5-1.5h5.25a.75.75 0 0 0 0-1.5H5.25Z" />
                  </svg>
                </button>
              )}
              <button 
                className={`w-6 h-6 transition-all duration-200 ${
                  isFavorited 
                    ? 'text-orange-500 hover:text-orange-400 scale-110' 
                    : 'text-gray-400 hover:text-orange-500 hover:scale-110'
                } ${favoritesLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                onClick={handleFavoriteToggle}
                disabled={favoritesLoading}
                title={isFavorited ? "Remove from Favorites" : "Add to Favorites"}
              >
                {isFavorited ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          <p className="text-gray-400 text-sm mb-6">
            Created on {formatDateToCAT(project.createdAt)} (CAT)
          </p>

          {project.files && project.files.length > 0 && (() => {
            const languages = detectLanguagesFromFiles(project.files);
            return languages.length > 0 && (
              <div className="mb-6">
                <h2 className="font-semibold mb-2">Languages</h2>
                <div className="flex flex-wrap gap-2">
                  {languages.map((language, index) => (
                    <span 
                      key={index} 
                      className="inline-block text-white text-sm px-3 py-1 rounded-full cursor-pointer transition-colors"
                      style={{ backgroundColor: getLanguageColor(language) }}
                    >
                      {language}
                    </span>
                  ))}
                </div>
              </div>
            );
          })()}

          {project.type && (
            <div className="mb-6">
              <h2 className="font-semibold mb-2">Project Type</h2>
              <span className="bg-blue-600 text-xs px-2 py-1 rounded">{project.type}</span>
            </div>
          )}

          <div className="mb-6">
            <h2 className="font-semibold mb-2">Last Updated</h2>
            <div className="text-sm text-gray-400">
              <div>{formatDateToCAT(project.updatedAt)}</div>
              <div>{formatTimeToCAT(project.updatedAt)}</div>
            </div>
          </div>

          <div>
            <h2 className="font-semibold mb-2">Collaboration</h2>
            <div className="space-y-3">
              {/* Project Members */}
              {project.members && project.members.length > 0 ? (
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Members ({project.members.length})</h3>
                  <div className="space-y-2">
                    {project.members.map((member, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {member.user?.profile?.avatar ? (
                            <img
                              src={member.user.profile.avatar}
                              alt="Member"
                              className="w-6 h-6 rounded-full border border-gray-600"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full border border-gray-600 flex items-center justify-center bg-gray-700">
                              <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                strokeWidth="1.5" 
                                stroke="currentColor" 
                                className="w-4 h-4 text-gray-400"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                              </svg>
                            </div>
                          )}
                          <div className="text-xs">
                            <div className="text-white">
                              {member.user?.profile?.name || member.user?.username || "Unknown"}
                            </div>
                            <div className="text-gray-400">{member.role || "Member"}</div>
                          </div>
                        </div>
                        {isOwner && (
                          <button
                            onClick={() => handleRemoveCollaborator(
                              member.user._id, 
                              member.user?.profile?.name || member.user?.username || "Unknown"
                            )}
                            className="text-red-400 hover:text-red-300 text-xs"
                            title="Remove collaborator"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-gray-400">
                  <div className="flex items-center space-x-2 mb-2">
                    <span>👤</span>
                    <span>No collaborators yet</span>
                  </div>
                </div>
              )}

              {/* Collaboration Actions */}
              <div className="pt-2 border-t border-gray-700">
                {isOwner ? (
                  <div className="space-y-2">
                    <button 
                      className="w-full text-left text-xs text-orange-400 hover:text-orange-300 flex items-center space-x-2"
                      onClick={handleInviteCollaborators}
                    >
                      <span>➕</span>
                      <span>Add Collaborators</span>
                    </button>
                    <button className="w-full text-left text-xs text-gray-400 hover:text-white flex items-center space-x-2">
                      <span>⚙️</span>
                      <span>Manage Access</span>
                    </button>
                  </div>
                ) : (
                  <div className="text-xs text-gray-400">
                    <div className="flex items-center space-x-2">
                      <span>🔒</span>
                      <span>Contact owner to collaborate</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Collaboration Stats */}
              <div className="pt-2 border-t border-gray-700">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-center">
                    <div className="text-orange-400 font-semibold">
                      {(project.members?.length || 0) + 1}
                    </div>
                    <div className="text-gray-400">Contributors</div>
                  </div>
                  <div className="text-center">
                    <div className="text-orange-400 font-semibold">
                      {project.visibility === 'public' ? 'Public' : 'Private'}
                    </div>
                    <div className="text-gray-400">Visibility</div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="pt-2 border-t border-gray-700">
                <h3 className="text-sm font-medium text-gray-400 mb-2">Recent Activity</h3>
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {/* Generate recent activity based on project data */}
                  {(() => {
                    const activities = [];
                    
                    // Project creation activity
                    activities.push({
                      id: 'created',
                      icon: '🚀',
                      text: 'Project created',
                      user: project.owner?.username,
                      time: project.createdAt
                    });

                    // Recent file activities (if files exist)
                    if (project.files && project.files.length > 0) {
                      const recentFiles = project.files
                        .sort((a, b) => new Date(b.createdAt || b.updatedAt) - new Date(a.createdAt || a.updatedAt))
                        .slice(0, 2);
                      
                      recentFiles.forEach((file, index) => {
                        activities.push({
                          id: `file-${index}`,
                          icon: file.type === 'folder' ? '📁' : '📄',
                          text: `${file.type === 'folder' ? 'Created folder' : 'Added file'} ${file.name}`,
                          user: file.createdBy?.username || project.owner?.username,
                          time: file.createdAt || file.updatedAt || project.updatedAt
                        });
                      });
                    }

                    // Project update activity (if different from creation)
                    if (new Date(project.updatedAt).getTime() !== new Date(project.createdAt).getTime()) {
                      activities.push({
                        id: 'updated',
                        icon: (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                            <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z" />
                            <path d="M5.25 5.25a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3V13.5a.75.75 0 0 0-1.5 0v5.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V8.25a1.5 1.5 0 0 1 1.5-1.5h5.25a.75.75 0 0 0 0-1.5H5.25Z" />
                          </svg>
                        ),
                        text: 'Project updated',
                        user: project.owner?.username,
                        time: project.updatedAt
                      });
                    }

                    // Sort by most recent first and limit to 5 items
                    const sortedActivities = activities
                      .sort((a, b) => new Date(b.time) - new Date(a.time))
                      .slice(0, 5);

                    return sortedActivities.length > 0 ? (
                      sortedActivities.map(activity => (
                        <div key={activity.id} className="flex items-start space-x-2">
                          <span className="text-xs mt-0.5">{activity.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-white truncate">
                              {activity.text}
                            </div>
                            <div className="text-xs text-gray-400">
                              {activity.user} • {getRelativeTimeCAT(activity.time)}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-gray-400">
                        <div className="flex items-center space-x-2">
                          <span>📭</span>
                          <span>No recent activity</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        </aside>

        <section className="flex-1 bg-gray-800 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Project Details</h2>
            <div className="flex space-x-3">
              {/* Download Project Button - Available to owners and collaborators */}
              {(isOwner || isMember) && (
                <button 
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 px-4 py-2 rounded text-sm flex items-center space-x-2"
                  onClick={() => handleDownloadProject('zip')}
                  disabled={downloadLoading}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M12 2.25a.75.75 0 0 1 .75.75v11.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 1 1 1.06-1.06l3.22 3.22V3a.75.75 0 0 1 .75-.75Zm-9 13.5a.75.75 0 0 1 .75.75v2.25a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5V16.5a.75.75 0 0 1 1.5 0v2.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V16.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
                  </svg>
                  <span>{downloadLoading ? 'Downloading...' : 'Download ZIP'}</span>
                </button>
              )}
              
              {/* Edit Project Button - Only for owners */}
              {isOwner && (
                <button 
                  className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded text-sm flex items-center space-x-2"
                  onClick={() => navigate("/edit-project", { state: { projectId: project._id } })}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z" />
                    <path d="M5.25 5.25a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3V13.5a.75.75 0 0 0-1.5 0v5.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V8.25a1.5 1.5 0 0 1 1.5-1.5h5.25a.75.75 0 0 0 0-1.5H5.25Z" />
                  </svg>
                  <span>Edit Project</span>
                </button>
              )}
            </div>
          </div>
          
          <div className="space-y-6">
            {/* Project Information */}
            <div className="bg-gray-700 p-4 rounded">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Project Information</h3>
                <button
                  onClick={() => setIsProjectInfoExpanded(!isProjectInfoExpanded)}
                  className="text-gray-400 hover:text-white transition-colors p-1 rounded"
                  aria-label={isProjectInfoExpanded ? "Collapse" : "Expand"}
                >
                  <svg 
                    className={`w-5 h-5 transition-transform duration-200 ${isProjectInfoExpanded ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              
              <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isProjectInfoExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                {/* Project Owner */}
                <div className="mb-4">
                  <span className="text-gray-400 text-sm">Owner:</span>
                  <div className="flex items-center space-x-3 mt-1">
                    {project.owner?.profile?.avatar ? (
                      <img
                        src={project.owner.profile.avatar}
                        alt="Owner"
                        className="w-10 h-10 rounded-full border border-orange-500"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full border border-orange-500 flex items-center justify-center bg-gray-700">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          strokeWidth="1.5" 
                          stroke="currentColor" 
                          className="w-6 h-6 text-gray-400"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-white">
                        {project.owner?.profile?.name || project.owner?.username || "Unknown"}
                      </div>
                      <div className="text-gray-400 text-sm">@{project.owner?.username}</div>
                    </div>
                  </div>
                </div>

                {/* Project Description */}
                {project.description && (
                  <div className="mb-4">
                    <span className="text-gray-400 text-sm">Description:</span>
                    <p className="text-gray-300 text-sm mt-1 leading-relaxed">{project.description}</p>
                  </div>
                )}

                {/* Project Details Grid */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Name:</span>
                    <p className="font-medium">{project.name}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Type:</span>
                    <p className="font-medium">{project.type || "Not specified"}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Created:</span>
                    <p className="font-medium">{formatDateToCAT(project.createdAt)}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Last Modified:</span>
                    <p className="font-medium">{formatDateToCAT(project.updatedAt)}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Visibility:</span>
                    <p className="font-medium capitalize">{project.visibility || "Public"}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">License:</span>
                    <p className="font-medium">{project.license || "None"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Check-in/Check-out Management */}
            {hasWorkPermission ? (
              <div className="bg-gray-700 p-4 rounded">
                <h3 className="font-semibold mb-3">Project Workspace</h3>
                
                {project.isCheckedOut ? (
                project.checkedOutBy._id === user?.id ? (
                  // User is currently checked in
                  <div className="bg-green-900 border border-green-600 p-4 rounded-lg mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-green-200 font-semibold mb-1">✅ You are currently working on this project</h4>
                        <p className="text-green-300 text-sm">
                          Started: {formatDateTimeToCAT(project.checkedOutAt)} (CAT)
                        </p>
                      </div>
                      <button
                        onClick={() => setShowCheckOutModal(true)}
                        disabled={checkOutLoading}
                        className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 px-4 py-2 rounded text-white font-medium"
                      >
                        {checkOutLoading ? 'Saving...' : 'Check Out & Save Work'}
                      </button>
                    </div>
                  </div>
                ) : (
                  // Someone else is checked in
                  <div className="bg-yellow-900 border border-yellow-600 p-4 rounded-lg mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-yellow-200 text-xl">🔒</span>
                      <div>
                        <h4 className="text-yellow-200 font-semibold">Project Currently In Use</h4>
                        <p className="text-yellow-300 text-sm">
                          {project.checkedOutBy.profile?.name || project.checkedOutBy.username} is currently working on this project
                        </p>
                        <p className="text-yellow-400 text-xs">
                          Started: {formatDateTimeToCAT(project.checkedOutAt)} (CAT)
                        </p>
                      </div>
                    </div>
                  </div>
                )
              ) : (
                // Project is available
                <div className="bg-blue-900 border border-blue-600 p-4 rounded-lg mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-blue-200 font-semibold mb-1">🚀 Project Available</h4>
                      <p className="text-blue-300 text-sm">
                        Check in to start working on this project
                      </p>
                    </div>
                    <button
                      onClick={handleCheckIn}
                      disabled={checkInLoading}
                      className="bg-green-500 hover:bg-green-600 disabled:opacity-50 px-4 py-2 rounded text-white font-medium"
                    >
                      {checkInLoading ? 'Checking In...' : 'Check In'}
                    </button>
                  </div>
                </div>
              )}
              </div>
            ) : (
              // User doesn't have permission to work on this project
              <div className="bg-gray-700 p-4 rounded">
                <h3 className="font-semibold mb-3">Project Workspace</h3>
                <div className="bg-gray-800 border border-gray-600 p-4 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-400 text-xl">👀</span>
                    <div>
                      <h4 className="text-gray-300 font-semibold">View Only</h4>
                      <p className="text-gray-400 text-sm">
                        You can view this project but cannot make changes. Contact the owner to request collaboration access.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* File Management */}
            <div className="bg-gray-700 p-4 rounded">
              <h3 className="font-semibold mb-3">Files & Documents</h3>
              <Files project={project} />
            </div>

            {/* Project History */}
            <ProjectHistory projectId={project._id} />
          </div>
        </section>
      </main>

      {/* Check-out Modal */}
      {showCheckOutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-white mb-4">Check Out of Project</h3>
            
            <div className="mb-4">
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Describe what you worked on: *
              </label>
              <textarea
                value={checkOutMessage}
                onChange={(e) => setCheckOutMessage(e.target.value)}
                placeholder="e.g., Added user authentication, fixed login bug, updated README..."
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                rows={4}
                required
              />
            </div>

            <div className="text-sm text-gray-400 mb-6">
              <p>💡 <strong>Tip:</strong> Be specific about what you accomplished. This helps your team track progress!</p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowCheckOutModal(false);
                  setCheckOutMessage('');
                }}
                className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded text-white"
                disabled={checkOutLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleCheckOutSubmit}
                disabled={checkOutLoading || !checkOutMessage.trim()}
                className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed rounded text-white font-medium"
              >
                {checkOutLoading ? 'Saving...' : 'Check Out'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Collaborators Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold mb-4">Invite Collaborators</h3>
            
            {friends.length > 0 ? (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {friends.map((friend) => (
                  <div key={friend._id} className="flex items-center justify-between bg-gray-700 p-3 rounded">
                    <div className="flex items-center space-x-3">
                      {friend.profile?.avatar ? (
                        <img
                          src={friend.profile.avatar}
                          alt={friend.profile?.name || friend.username}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-700">
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            strokeWidth="1.5" 
                            stroke="currentColor" 
                            className="w-5 h-5 text-gray-400"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                          </svg>
                        </div>
                      )}
                      <div>
                        <h4 className="font-semibold text-sm">
                          {friend.profile?.name || friend.username}
                        </h4>
                        <p className="text-gray-400 text-xs">@{friend.username}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleInviteFriend(friend._id)}
                      disabled={inviteLoading}
                      className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white px-3 py-1 rounded text-sm"
                    >
                      {inviteLoading ? 'Inviting...' : 'Invite'}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-400">
                <p>No friends available to invite.</p>
                <p className="text-sm mt-1">Friends who are already collaborators are not shown.</p>
              </div>
            )}

            <div className="flex justify-end mt-6">
              <button
                onClick={() => {
                  setShowInviteModal(false);
                  setFriends([]);
                }}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
