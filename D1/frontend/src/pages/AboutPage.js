import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-orange-900 text-white flex flex-col">
      <Header />

      <main className="flex-grow container mx-auto p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center">About Repofox</h1>
          
          <div className="bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-4 text-orange-400">What is Repofox?</h2>
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              Repofox is a modern version control and collaboration platform designed to streamline 
              your development workflow. Built with developers in mind, Repofox provides an intuitive 
              interface for managing your code repositories, collaborating with team members, and 
              tracking project progress.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold mb-3 text-orange-400">Features</h3>
              <ul className="text-gray-300 space-y-2">
                <li>• Repository management and version control</li>
                <li>• Team collaboration tools</li>
                <li>• Project tracking and analytics</li>
                <li>• Real-time activity feeds</li>
                <li>• User profiles and friend connections</li>
              </ul>
            </div>

            <div className="bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold mb-3 text-orange-400">Mission</h3>
              <p className="text-gray-300">
                Our mission is to make version control accessible and enjoyable for developers 
                of all skill levels. We believe that great software is built through collaboration, 
                and Repofox is designed to facilitate that collaboration.
              </p>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <h3 className="text-2xl font-bold mb-4 text-orange-400">Get Started Today</h3>
            <p className="text-gray-300 mb-6">
              Join thousands of developers who trust Repofox for their version control needs.
            </p>
            <button 
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg"
              onClick={() => navigate("/project")}
            >
              View Projects
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}