import React from "react";

const FeatureCard = ({ title, text }) => {
  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md">
      <h3 className="font-bold mb-2">{title}</h3>
      <p className="text-sm text-gray-300">{text}</p>
    </div>
  );
};

export default FeatureCard;
