import React from "react";
import Header from "../components/Header";

export default function TeamsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-orange-900 text-white flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Teams & Collaboration</h1>
            <p className="text-gray-400 text-lg">
              Team features are coming soon to enhance your collaborative experience!
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-xl font-bold mb-6 text-orange-400">🚧 Under Development</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-700 p-4 rounded">
                <h3 className="font-semibold mb-2">🏢 Team Creation & Management</h3>
                <p className="text-gray-300 text-sm">
                  Create teams, invite members, and manage team settings and permissions.
                </p>
              </div>
              <div className="bg-gray-700 p-4 rounded">
                <h3 className="font-semibold mb-2">📋 Project Assignment</h3>
                <p className="text-gray-300 text-sm">
                  Assign projects to teams and track progress across multiple initiatives.
                </p>
              </div>
              <div className="bg-gray-700 p-4 rounded">
                <h3 className="font-semibold mb-2">💬 Team Communication</h3>
                <p className="text-gray-300 text-sm">
                  Built-in messaging, discussions, and announcements for seamless team coordination.
                </p>
              </div>
              <div className="bg-gray-700 p-4 rounded">
                <h3 className="font-semibold mb-2">📊 Team Analytics</h3>
                <p className="text-gray-300 text-sm">
                  Monitor team performance, project velocity, and collaboration metrics.
                </p>
              </div>
            </div>

            <div className="bg-blue-900 border border-blue-600 rounded-lg p-4">
              <h3 className="font-semibold mb-2">📢 Stay Tuned</h3>
              <p className="text-blue-200 text-sm">
                We're actively working on these features. In the meantime, you can create individual projects 
                and connect with other users through the discovery features.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}