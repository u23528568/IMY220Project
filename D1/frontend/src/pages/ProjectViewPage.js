import React from "react";
import Header from "../components/Header";

export default function ProjectViewPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-orange-900 text-white flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center">
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left: Team, Languages, Activity */}
          <div className="md:col-span-1">
            <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-4">
              <h2 className="font-semibold text-lg mb-2">Team Members:</h2>
              <div className="text-gray-300 text-sm mb-4">
                <div>u23528568</div>
                <div>u23716982</div>
              </div>
              <h2 className="font-semibold text-lg mb-2">Languages:</h2>
              <div className="text-gray-300 text-sm mb-4">Java &nbsp; Java &nbsp; Java</div>
              <h2 className="font-semibold text-lg mb-2">Recent Activity:</h2>
              <div className="bg-gray-700 rounded p-2 text-sm">
                u23528568<br />
                Committed at 12:06 29/04/2025
              </div>
            </div>
          </div>
          {/* Right: Project Info & Files */}
          <div className="md:col-span-2 flex flex-col space-y-4">
            <div className="bg-gray-800 rounded-lg shadow-lg p-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Project1 <span className="bg-gray-600 text-xs px-2 py-1 rounded ml-2">Public</span></h1>
                <p className="text-gray-400 text-sm mt-1">Created 12:06 29/04/2025</p>
              </div>
              <button className="text-gray-400 text-2xl">&#9825;</button>
            </div>
            <div className="bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="font-semibold text-lg mb-4">Project Files</h2>
              <div className="space-y-2">
                <div className="bg-gray-700 rounded p-2 flex items-center">
                  <span className="mr-2">&#128193;</span> Engine
                </div>
                <div className="bg-gray-700 rounded p-2 flex items-center">
                  <span className="mr-2">&#128193;</span> UI
                </div>
                <div className="bg-gray-700 rounded p-2 flex items-center">
                  <span className="mr-2">&#128193;</span> AI
                </div>
                <div className="bg-gray-700 rounded p-2 flex items-center">
                  <span className="mr-2">&#128193;</span> API
                </div>
                <div className="bg-gray-700 rounded p-2 flex items-center">
                  <span className="mr-2">&#128196;</span> Readme.md
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
