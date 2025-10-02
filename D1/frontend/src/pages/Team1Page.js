import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

export default function Team1Page() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-orange-900 text-white flex flex-col">
      <Header />

      <main className="flex-grow container mx-auto p-6">
        <div className="max-w-4xl mx-auto">
          {/* Coming Soon Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Teams & Collaboration</h1>
            <p className="text-gray-400 text-lg">
              Team management and collaboration features coming soon!
            </p>
          </div>

          {/* Feature Preview */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-8 mb-6">
            <h2 className="text-xl font-bold mb-6 text-orange-400">🚀 Planned Features</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-gray-700 p-4 rounded">
                  <h3 className="font-semibold mb-2">👥 Team Management</h3>
                  <p className="text-gray-300 text-sm">
                    Create teams, invite members, and manage roles and permissions
                  </p>
                </div>
                <div className="bg-gray-700 p-4 rounded">
                  <h3 className="font-semibold mb-2">🔄 Real-time Collaboration</h3>
                  <p className="text-gray-300 text-sm">
                    Work together on projects with live updates and synchronized changes
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-700 p-4 rounded">
                  <h3 className="font-semibold mb-2">💬 Team Communication</h3>
                  <p className="text-gray-300 text-sm">
                    Built-in chat, discussions, and project-specific messaging
                  </p>
                </div>
                <div className="bg-gray-700 p-4 rounded">
                  <h3 className="font-semibold mb-2">📊 Analytics & Insights</h3>
                  <p className="text-gray-300 text-sm">
                    Track team productivity, project progress, and collaboration metrics
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Current Capabilities */}
          <div className="bg-blue-900 border border-blue-600 rounded-lg p-6 mb-6">
            <h3 className="font-semibold mb-4">✨ Available Now</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-blue-300 mb-2">Individual Projects</h4>
                <p className="text-blue-200">Create and manage your own projects</p>
              </div>
              <div>
                <h4 className="font-medium text-blue-300 mb-2">User Discovery</h4>
                <p className="text-blue-200">Find and connect with other developers</p>
              </div>
              <div>
                <h4 className="font-medium text-blue-300 mb-2">Project Sharing</h4>
                <p className="text-blue-200">Share your projects with the community</p>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-4">Ready to Get Started?</h3>
            <div className="space-x-4">
              <button 
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded"
                onClick={() => navigate("/project")}
              >
                View All Projects
              </button>
              <button 
                className="bg-gray-600 hover:bg-gray-500 text-white px-6 py-2 rounded"
                onClick={() => navigate("/project")}
              >
                View All Projects
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}