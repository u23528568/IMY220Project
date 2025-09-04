import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

export default function ProjectViewPage() {
  const navigate = useNavigate();

  const teamMembers = [
    { id: "u23528568", name: "John Doe" },
    { id: "u98765432", name: "Jane Smith" },
    { id: "u12345678", name: "Bob Johnson" }
  ];

  const languages = [
    { name: "Java", percentage: 45 },
    { name: "HTML", percentage: 30 },
    { name: "CSS", percentage: 25 }
  ];

  const projectFiles = [
    { name: "Engine", type: "folder", icon: "📁" },
    { name: "UI", type: "folder", icon: "📁" },
    { name: "JS", type: "folder", icon: "📁" },
    { name: "JPA", type: "folder", icon: "📁" },
    { name: "README.md", type: "file", icon: "📄" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-orange-900 text-white flex flex-col">
      <Header />

      <main className="flex flex-1 container mx-auto p-6 gap-6">
        <aside className="w-80 bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold">Project1</h1>
              <span className="bg-gray-600 text-xs px-2 py-1 rounded">Public</span>
            </div>
            <button className="text-orange-400 hover:text-orange-300">
              ♡
            </button>
          </div>
          
          <p className="text-gray-400 text-sm mb-6">Created on 28/04/2025</p>

          <div className="mb-6">
            <h2 className="font-semibold mb-2">Team Members</h2>
            <div className="space-y-2">
              {teamMembers.map((member) => (
                <div key={member.id} className="text-sm">
                  <div className="font-medium">{member.id}</div>
                  <div className="text-gray-400">{member.name}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h2 className="font-semibold mb-2">Languages</h2>
            <div className="space-y-2">
              {languages.map((lang) => (
                <div key={lang.name} className="flex justify-between text-sm">
                  <span>{lang.name}</span>
                  <span className="text-gray-400">{lang.percentage}%</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-semibold mb-2">Recent Activity</h2>
            <div className="text-sm text-gray-400">
              <div>u23528568</div>
              <div>Committed working files</div>
            </div>
          </div>
        </aside>

        <section className="flex-1 bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Project Files</h2>
          
          <div className="space-y-2">
            {projectFiles.map((file, index) => (
              <div key={index} className="flex items-center space-x-3 p-2 hover:bg-gray-700 rounded cursor-pointer">
                <span className="text-lg">{file.icon}</span>
                <span className="flex-1">{file.name}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
