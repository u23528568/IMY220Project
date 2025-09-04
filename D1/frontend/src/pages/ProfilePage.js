import React, { useState } from "react";
import Header from "../components/Header";
import EditProfile from "../components/EditProfile";

function ProfilePage() {
  const [editing, setEditing] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-orange-900 text-white flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto p-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Profile Card */}
        <div className="md:col-span-1">
          {!editing ? (
            <div className="bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col items-center">
              <img
                src="/assets/images/Logo.png"
                alt="User Avatar"
                className="w-32 h-32 rounded-full border-4 border-orange-500"
              />
              <h1 className="text-2xl font-bold mt-4 text-orange-400">
                u23528568
              </h1>
              <div className="mt-4 text-left w-full">
                <h2 className="font-semibold text-lg">About:</h2>
                <p className="text-gray-300 text-sm mt-2">
                  Sed do eiusmod tempor incididunt ut labore et dolore magna
                  aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                  ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </p>
              </div>
              <button className="mt-6 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded w-full" onClick={() => setEditing(true)}>
                Edit Profile
              </button>
            </div>
          ) : (
            <EditProfile onSave={() => setEditing(false)} />
          )}
        </div>

        {/* Right Column: Repositories and Commits */}
        <div className="md:col-span-2 space-y-8">
          {/* Recent Repositories */}
          <div>
            <h2 className="text-xl font-bold mb-4">Recent Repositories</h2>
            <div className="bg-gray-800 rounded-lg shadow-lg p-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Project 1</h3>
                <span className="text-sm text-gray-400">9/7/2025</span>
              </div>
            </div>
          </div>

          {/* Recent Commits */}
          <div>
            <h2 className="text-xl font-bold mb-4">Recent Commits</h2>
            <div className="bg-gray-800 rounded-lg shadow-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">Project 1</h3>
                  <p className="text-sm text-gray-400">Added working files</p>
                </div>
                <span className="text-sm text-gray-400">9/7/2025</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ProfilePage;
