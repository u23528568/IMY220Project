import React from "react";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";

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
      <main className="flex-grow flex items-center justify-center">
        <div className="bg-gray-800 rounded-lg shadow-lg p-8 w-full max-w-xl flex flex-col space-y-4">
          {projects.map((project, idx) => (
            <div
              key={idx}
              className="bg-gray-700 rounded p-4 flex justify-between items-center cursor-pointer"
              onClick={() => navigate("/projectview")}
            >
              <div>
                <h2 className="font-semibold text-lg">{project.name}</h2>
                <p className="text-gray-400 text-sm">{project.team}</p>
              </div>
              <span className="text-gray-400 text-xs">Last commit: {project.lastCommit}</span>
            </div>
          ))}
          <button className="mt-4 self-end bg-gray-700 hover:bg-gray-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-2xl">
            +
          </button>
        </div>
      </main>
    </div>
  );
}
