import React from "react";
import Header from "../components/Header";

export default function TeamsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-orange-900 text-white flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Teams</h1>
        <div className="bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="space-y-4">
            <div className="bg-gray-700 rounded p-4">
              <h3 className="font-semibold text-lg">Team1</h3>
              <p className="text-gray-400 text-sm">Active members: 4</p>
              <p className="text-gray-300 text-sm mt-2">Main development team</p>
            </div>
            <div className="bg-gray-700 rounded p-4">
              <h3 className="font-semibold text-lg">Team 2</h3>
              <p className="text-gray-400 text-sm">Active members: 2</p>
              <p className="text-gray-300 text-sm mt-2">Testing and QA team</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}