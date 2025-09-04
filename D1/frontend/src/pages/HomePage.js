import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

export default function HomePage() {
  const [feedType, setFeedType] = useState("local");
  const navigate = useNavigate();

  const localFeed = [
    {
      id: 1,
      title: "Local Community Project: Building a Better Tomorrow",
      content:
        "Our local development team has launched a new initiative to create open-source tools for small businesses. Join us in making a difference in our community.",
    },
    {
      id: 2,
      title: "University Hackathon Results Are In!",
      content:
        "The annual coding competition at our local university has concluded. Amazing projects from students showcasing the future of technology.",
    },
  ];

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

  const feedData = feedType === "local" ? localFeed : internationalFeed;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-orange-900 text-white flex flex-col">
      <Header />

      <main className="flex flex-1">
        <aside className="w-64 bg-gray-800 p-4 flex flex-col space-y-6">
          <div className="flex flex-col items-center space-y-2">
            <img
              src="/assets/images/profilepic.jpg"
              alt="User Avatar"
              className="w-12 h-12 rounded-full cursor-pointer"
              onClick={() => navigate("/profile")}
            />
            <span className="font-semibold">Username</span>
          </div>

          <div>
            <h2 className="text-gray-400 text-sm mb-2">Repositories</h2>
            <ul className="space-y-2">
              <li 
                className="bg-gray-700 hover:bg-gray-600 p-2 rounded cursor-pointer"
                onClick={() => navigate("/projectview")}
              >
                Project1
              </li>
              <li 
                className="bg-gray-700 hover:bg-gray-600 p-2 rounded cursor-pointer"
                onClick={() => navigate("/projectview")}
              >
                Project2
              </li>
              <li 
                className="bg-gray-700 hover:bg-gray-600 p-2 rounded cursor-pointer"
                onClick={() => navigate("/projectview")}
              >
                Project3
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-gray-400 text-sm mb-2">Teams</h2>
            <ul className="space-y-2">
              <li 
                className="bg-gray-700 hover:bg-gray-600 p-2 rounded cursor-pointer"
                onClick={() => navigate("/team1")}
              >
                Team1
              </li>
              <li className="bg-gray-700 hover:bg-gray-600 p-2 rounded">Team 2</li>
            </ul>
          </div>
        </aside>

        <section className="flex-1 p-6">
          <h1 className="text-2xl font-bold mb-4">Home</h1>

          <div className="bg-gray-800 p-4 rounded-lg shadow-md">
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
