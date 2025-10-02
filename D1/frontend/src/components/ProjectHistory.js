import React, { useState, useEffect } from 'react';
import ApiService from '../services/ApiService';
import { getRelativeTimeCAT } from '../utils/timezone';

export default function ProjectHistory({ projectId }) {
  const [checkins, setCheckins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const fetchCheckins = async () => {
      try {
        setLoading(true);
        const result = await ApiService.getProjectCheckins(projectId);
        if (result.success) {
          setCheckins(result.data || []);
        } else {
          setError('Failed to load project history');
        }
      } catch (err) {
        console.error('Error fetching checkins:', err);
        setError('Error loading project history');
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchCheckins();
    }
  }, [projectId]);

  const formatTimeSpent = (hours) => {
    if (!hours || hours < 0.01) return 'Less than 1 minute';
    if (hours < 1) return `${Math.round(hours * 60)} minutes`;
    if (hours < 24) return `${hours.toFixed(1)} hours`;
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${days}d ${remainingHours.toFixed(1)}h`;
  };

  // Using CAT timezone utility instead of local formatRelativeTime function

  if (loading) {
    return (
      <div className="bg-gray-700 p-4 rounded">
        <h3 className="font-semibold mb-3">Project History</h3>
        <div className="text-center py-4 text-gray-400">
          <div className="animate-pulse">Loading history...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-700 p-4 rounded">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Project History</h3>
        {checkins.length > 0 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded"
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            <svg 
              className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>

      {error ? (
        <div className="text-center py-4 text-red-400">
          {error}
        </div>
      ) : checkins.length === 0 ? (
        <div className="text-center py-6 text-gray-400">
          <div className="mb-2">📋</div>
          <p>No work sessions recorded yet</p>
          <p className="text-sm mt-1">Check in to start tracking your progress!</p>
        </div>
      ) : (
        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-32 opacity-100'}`}>
          <div className="space-y-3 max-h-full overflow-y-auto">
            {checkins.slice(0, isExpanded ? checkins.length : 3).map((checkin, index) => (
              <div key={checkin._id} className="bg-gray-600 p-3 rounded-lg border-l-4 border-orange-500">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      v{checkin.version}
                    </div>
                    <div>
                      <div className="font-medium text-white">
                        {checkin.user?.profile?.name || checkin.user?.username || 'Unknown User'}
                      </div>
                      <div className="text-xs text-gray-400">
                        {getRelativeTimeCAT(checkin.createdAt)} (CAT)
                        {checkin.timeSpent && (
                          <span className="ml-2">• {formatTimeSpent(checkin.timeSpent)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-200 text-sm mb-2">{checkin.message}</p>
                
                {checkin.changes && (checkin.changes.added?.length > 0 || checkin.changes.modified?.length > 0 || checkin.changes.deleted?.length > 0) && (
                  <div className="flex flex-wrap gap-2 text-xs">
                    {checkin.changes.added?.length > 0 && (
                      <span className="bg-green-600 text-green-100 px-2 py-1 rounded">
                        +{checkin.changes.added.length} added
                      </span>
                    )}
                    {checkin.changes.modified?.length > 0 && (
                      <span className="bg-yellow-600 text-yellow-100 px-2 py-1 rounded">
                        ~{checkin.changes.modified.length} modified
                      </span>
                    )}
                    {checkin.changes.deleted?.length > 0 && (
                      <span className="bg-red-600 text-red-100 px-2 py-1 rounded">
                        -{checkin.changes.deleted.length} deleted
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
            
            {!isExpanded && checkins.length > 3 && (
              <button
                onClick={() => setIsExpanded(true)}
                className="w-full text-center py-2 text-gray-400 hover:text-white text-sm"
              >
                Show {checkins.length - 3} more checkins...
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}