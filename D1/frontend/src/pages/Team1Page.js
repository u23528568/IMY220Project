import React from "react";
import { useNavigate } from "react-router-dom";

export default function Team1Page() {
  const navigate = useNavigate();

  const teamMembers = [
    {
      id: 1,
      name: "John Smith",
      role: "Team Lead",
      avatar: "/assets/images/profilepic.jpg",
      status: "online"
    },
    {
      id: 2,
      name: "Sarah Johnson",
      role: "Frontend Developer",
      avatar: "/assets/images/profilepic.jpg",
      status: "online"
    },
    {
      id: 3,
      name: "Mike Chen",
      role: "Backend Developer",
      avatar: "/assets/images/profilepic.jpg",
      status: "offline"
    },
    {
      id: 4,
      name: "Emily Davis",
      role: "UI/UX Designer",
      avatar: "/assets/images/profilepic.jpg",
      status: "online"
    }
  ];

  const projects = [
    { name: "Project1", status: "Active", lastUpdate: "2 hours ago" },
    { name: "Project2", status: "In Review", lastUpdate: "1 day ago" },
    { name: "Project3", status: "Completed", lastUpdate: "3 days ago" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-orange-900 text-white flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-3 bg-gray-800 shadow-md">
        <div className="flex items-center space-x-2">
          <img 
            src="/assets/images/Logo.png" 
            alt="Repofox Logo" 
            className="w-6 h-6 cursor-pointer" 
            onClick={() => navigate("/home")}
          />
          <span 
            className="text-orange-400 font-bold cursor-pointer"
            onClick={() => navigate("/home")}
          >
            Repofox
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="cursor-pointer" onClick={() => navigate("/project")}>Repos</span>
          <span className="cursor-pointer" onClick={() => navigate("/friends")}>Friends</span>
          <img
            src="/assets/images/profilepic.jpg"
            alt="User Avatar"
            className="w-8 h-8 rounded-full cursor-pointer"
            onClick={() => navigate("/profile")}
          />
        </div>
      </header>

      <main className="flex-grow container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Team1</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Team Members */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Team Members</h2>
            <div className="space-y-4">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center space-x-3 bg-gray-700 p-3 rounded">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{member.name}</h3>
                    <p className="text-gray-400 text-sm">{member.role}</p>
                  </div>
                  <span
                    className={`w-3 h-3 rounded-full ${
                      member.status === "online" ? "bg-green-500" : "bg-gray-500"
                    }`}
                  ></span>
                </div>
              ))}
            </div>
          </div>

          {/* Team Projects */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Team Projects</h2>
            <div className="space-y-4">
              {projects.map((project, index) => (
                <div key={index} className="bg-gray-700 p-4 rounded">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">{project.name}</h3>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        project.status === "Active"
                          ? "bg-green-600"
                          : project.status === "In Review"
                          ? "bg-yellow-600"
                          : "bg-blue-600"
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm">Last updated: {project.lastUpdate}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Team Stats */}
        <div className="mt-6 bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Team Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-700 p-4 rounded text-center">
              <h3 className="text-2xl font-bold text-orange-400">4</h3>
              <p className="text-gray-400">Members</p>
            </div>
            <div className="bg-gray-700 p-4 rounded text-center">
              <h3 className="text-2xl font-bold text-green-400">3</h3>
              <p className="text-gray-400">Active Projects</p>
            </div>
            <div className="bg-gray-700 p-4 rounded text-center">
              <h3 className="text-2xl font-bold text-blue-400">23</h3>
              <p className="text-gray-400">Commits This Week</p>
            </div>
            <div className="bg-gray-700 p-4 rounded text-center">
              <h3 className="text-2xl font-bold text-purple-400">89%</h3>
              <p className="text-gray-400">Team Efficiency</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}