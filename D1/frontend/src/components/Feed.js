import React, { useState, useEffect } from "react";
import ApiService from "../services/ApiService";
import { formatDateToCAT } from "../utils/timezone";

export default function Feed() {
  const [feedType, setFeedType] = useState("local"); // 'local' or 'global'
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        setLoading(true);
        setError("");

        const result = feedType === "local" 
          ? await ApiService.getLocalActivityFeed()
          : await ApiService.getGlobalActivityFeed();

        if (result.success) {
          setActivities(result.data || []);
        } else {
          setError(result.error || "Failed to load activity feed");
        }
      } catch (error) {
        console.error("Feed fetch error:", error);
        setError("Error loading activity feed");
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, [feedType]);

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-orange-400">Activity Feed</h2>
        
        {/* Feed Type Toggle */}
        <div className="flex bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setFeedType("local")}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              feedType === "local"
                ? "bg-orange-600 text-white"
                : "text-gray-300 hover:text-white"
            }`}
          >
            Local
          </button>
          <button
            onClick={() => setFeedType("global")}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              feedType === "global"
                ? "bg-orange-600 text-white"
                : "text-gray-300 hover:text-white"
            }`}
          >
            Global
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-8 h-8 bg-gray-600 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-600 rounded w-1/4 mb-1"></div>
                  <div className="h-3 bg-gray-600 rounded w-1/3"></div>
                </div>
              </div>
              <div className="h-4 bg-gray-600 rounded w-3/4 ml-11"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-red-400 text-center py-4">
          {error}
        </div>
      ) : activities.length > 0 ? (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {activities.map((activity) => (
            <div key={activity._id} className="border-b border-gray-700 pb-4 last:border-b-0">
              <div className="flex items-start space-x-3">
                {activity.user?.profile?.avatar ? (
                  <img
                    src={activity.user.profile.avatar}
                    alt={activity.user?.profile?.name || activity.user?.username}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-600">
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
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-medium text-white">
                      {activity.user?.profile?.name || activity.user?.username}
                    </span>
                    <span className="text-xs text-gray-400">
                      committed to
                    </span>
                    <span className="text-sm text-orange-400 font-medium">
                      {activity.project?.name}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-300 mb-2">
                    {activity.message}
                  </p>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>{formatDateToCAT(activity.createdAt)}</span>
                    {activity.version && (
                      <span>Version {activity.version}</span>
                    )}
                    {activity.changes && (
                      <span>
                        {activity.changes.added?.length || 0} added, {" "}
                        {activity.changes.modified?.length || 0} modified, {" "}
                        {activity.changes.deleted?.length || 0} deleted
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-400">
            {feedType === "local" 
              ? "No activity in your projects yet"
              : "No global activity found"
            }
          </p>
          <p className="text-gray-500 text-sm mt-1">
            {feedType === "local" 
              ? "Create a project and make some check-ins to see activity here"
              : "Check back later for public project activity"
            }
          </p>
        </div>
      )}
    </div>
  );
}