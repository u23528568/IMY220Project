import React, { useState } from "react";
import LoginForm from "../components/LoginForm";
import SignupForm from "../components/SignupForm";
import FeatureCard from "../components/FeatureCard";

const SplashPage = () => {
  const [activeTab, setActiveTab] = useState("register");

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-[#222222] via-gray-900 to-orange-800 text-white">
      {/* Header */}
      <header className="flex items-center bg-[#222222] w-screen py-2 px-4 fixed top-0 z-10">
        <img src="/assets/images/Logo.jpg" alt="Repofox Logo" className="w-12 h-12 mr-2 rounded-full" />
        <h1 className="text-3xl font-display font-bold tracking-tight">
          <span className="text-orange-500">Repofox</span><span className="text-white">Hub</span>
        </h1>
      </header>

      {/* Tagline */}
      <section className="text-center mt-20">
        <h2 className="text-2xl font-display font-bold text-orange-400 tracking-tight mb-3">REPOFOX</h2>
        <p className="mt-2 text-gray-200 max-w-md mx-auto font-medium leading-relaxed">
          Use our version control system to manage your projects efficiently. <br />
          Showcase your work, exchange ideas, and discover new opportunities with developers worldwide.
        </p>
      </section>

      {/* Auth Card */}
      <section className="bg-gray-800 p-6 rounded-lg shadow-md mt-8 w-80">
        <div className="flex justify-around mb-4 border-b border-gray-600 pb-2">
          <button
            className={`text-sm font-semibold ${
              activeTab === "register" ? "text-orange-400 border-b-2 border-orange-400" : "text-gray-400"
            }`}
            onClick={() => setActiveTab("register")}
          >
            Register
          </button>
          <button
            className={`text-sm font-semibold ${
              activeTab === "login" ? "text-orange-400 border-b-2 border-orange-400" : "text-gray-400"
            }`}
            onClick={() => setActiveTab("login")}
          >
            Login
          </button>
        </div>

        {activeTab === "register" ? <SignupForm /> : <LoginForm />}
      </section>

      {/* Why use Repofox */}
      <section className="mt-12 text-center mt-20">
        <h2 className="text-xl font-semibold mb-6">Why use Repofox?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
          <FeatureCard
            title="Real Feedback from Real Developers"
            text="Get meaningful input to improve your code, design, and ideas — not just empty likes."
          />
          <FeatureCard
            title="Built for Growth"
            text="Track your progress, learn from others, and grow your skills through community-driven engagement."
          />
          <FeatureCard
            title="Global Developer Network"
            text="Instantly connect with developers across the globe to share, collaborate, and innovate together."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-12 py-4 w-full bg-black text-center text-sm text-gray-400 absolute bottom-0">
        REPOFOX©
      </footer>
    </div>
  );
};

export default SplashPage;
