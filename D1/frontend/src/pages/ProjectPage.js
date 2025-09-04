import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

const projects = [
  {
    name: "Project 1",
    team: "Team1",
    lastCommit: "29/04/2025"
  },
  {
    name: "Project 1",
    team: "Team1",
    lastCommit: "29/04/2025"
  },
  {
    name: "Project 1",
    team: "Team1",
    lastCommit: "29/04/2025"
  }
];

export default function ProjectPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-orange-900 text-white flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Repositories</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {projects.map((project, index) => (
            <div 
              key={index}
              className="bg-gray-800 rounded-lg shadow-lg p-6 cursor-pointer hover:bg-gray-700 transition-colors"
              onClick={() => navigate("/projectview")}
            >
              <h3 className="text-xl font-bold mb-2">{project.name}</h3>
              <p className="text-gray-400 text-sm mb-1">Team: {project.team}</p>
              <p className="text-gray-400 text-sm">Last commit: {project.lastCommit}</p>
            </div>
          ))}
        </div>

        <button className="fixed bottom-6 right-6 bg-orange-500 hover:bg-orange-600 text-white font-bold p-4 rounded-full shadow-lg">
          +
        </button>
      </main>
    </div>
  );
}
