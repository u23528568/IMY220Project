import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const internationalFeed = [
  {
    id: 1,
    title: "Global Project Showcase: A New Era of Collaboration",
    content:
      "Developers from over 50 countries have come together to build a decentralized social network. The project, codenamed 'Odyssey', aims to give users full control over their data.",
  },
  {
    id: 2,
    title: "Open-Source AI Redefines Machine Learning",
    content:
      "A team in Europe has released a new open-source AI framework that is 40% faster than existing models. The community is already building amazing tools with it.",
  },
];

const localFeed = [
  {
    id: 1,
    title: "Local University Develops a New Green Tech App",
    content:
      "Students at the local university have created an app to help residents track and reduce their carbon footprint. The project won the National Innovation Award.",
  },
  {
    id: 2,
    title: "Community Hackathon for a Cause",
    content:
      "Our city's annual hackathon is next week! This year's theme is 'Tech for Good'. Come and build solutions for local non-profits. Great prizes and networking opportunities.",
  },
  {
    id: 3,
    title: "New Co-working Space for Developers Opens Downtown",
    content:
      "A new tech hub, 'The Coder's Cafe', has opened downtown, offering high-speed internet, free coffee, and a collaborative environment for local developers and startups.",
  },
];

export default function HomePage() {
  const [feedType, setFeedType] = useState("local");
  const navigate = useNavigate();
  const feedData = feedType === "local" ? localFeed : internationalFeed;
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-orange-900 text-white flex flex-col">
      {/* Top Navbar */}
      <header className="flex justify-between items-center px-6 py-3 bg-gray-800 shadow-md">
        <div className="flex items-center space-x-2">
          <img src="/assets/images/Logo.png" alt="Repofox Logo" className="w-6 h-6" />
          <span className="text-orange-400 font-bold">Repofox</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="cursor-pointer" onClick={() => navigate("/project")}>Repos</span>
          <img
            src="/assets/images/profilepic.jpg"
            alt="User Avatar"
            className="w-8 h-8 rounded-full cursor-pointer"
            onClick={() => navigate("/profile")}
          />
        </div>
      </header>

      <main className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-800 p-4 flex flex-col space-y-6">
          {/* User Profile */}
          <div className="flex flex-col items-center space-y-2">
            <img
              src="/assets/images/profilepic.jpg"
              alt="User Avatar"
              className="w-12 h-12 rounded-full cursor-pointer"
              onClick={() => navigate("/profile")}
            />
            <span className="font-semibold">Username</span>
          </div>

          {/* Repositories */}
          <div>
            <h2 className="text-gray-400 text-sm mb-2">Repositories</h2>
            <ul className="space-y-2">
              <li className="bg-gray-700 hover:bg-gray-600 p-2 rounded">Project1</li>
              <li className="bg-gray-700 hover:bg-gray-600 p-2 rounded">Project2</li>
              <li className="bg-gray-700 hover:bg-gray-600 p-2 rounded">Project3</li>
            </ul>
          </div>

          {/* Teams */}
          <div>
            <h2 className="text-gray-400 text-sm mb-2">Teams</h2>
            <ul className="space-y-2">
              <li className="bg-gray-700 hover:bg-gray-600 p-2 rounded">Team 1</li>
              <li className="bg-gray-700 hover:bg-gray-600 p-2 rounded">Team 2</li>
            </ul>
          </div>
        </aside>

        {/* Feed Section */}
        <section className="flex-1 p-6">
          <h1 className="text-2xl font-bold mb-4">Home</h1>

          <div className="bg-gray-800 p-4 rounded-lg shadow-md">
            {/* Feed Header */}
            <div className="flex justify-between items-center border-b border-gray-700 pb-2 mb-4">
              <h2 className="font-semibold">Feed</h2>
              <div className="space-x-2">
                <button
                  onClick={() => setFeedType("international")}
                  className={`px-3 py-1 rounded text-sm ${
                    feedType === "international"
                      ? "bg-orange-500 hover:bg-orange-600"
                      : "bg-gray-700 hover:bg-gray-600"
                  }`}
                >
                  International
                </button>
                <button
                  onClick={() => setFeedType("local")}
                  className={`px-3 py-1 rounded text-sm ${
                    feedType === "local"
                      ? "bg-orange-500 hover:bg-orange-600"
                      : "bg-gray-700 hover:bg-gray-600"
                  }`}
                >
                  Local
                </button>
              </div>
            </div>

            {/* Feed Items */}
            <div className="space-y-4">
              {feedData.map((item) => (
                <div key={item.id} className="bg-gray-700 p-4 rounded">
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-gray-300 text-sm">{item.content}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
