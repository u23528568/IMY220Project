import React from "react";
import { getUserAvatar } from "../utils/avatarUtils";

export default function UserAvatar({ 
  user, 
  size = "w-8 h-8", 
  className = "", 
  onClick 
}) {
  const avatarUrl = getUserAvatar(user);
  
  return (
    <div className={`${className}`} onClick={onClick}>
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={user?.username || "User Avatar"}
          className={`${size} rounded-full object-cover border-0 ${onClick ? 'cursor-pointer' : ''}`}
          onError={(e) => {
            // If placeholder image fails to load, show default icon
            e.target.style.display = 'none';
            if (e.target.nextSibling) {
              e.target.nextSibling.style.display = 'block';
            }
          }}
        />
      ) : null}
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        strokeWidth="1.5" 
        stroke="currentColor" 
        className={`${size} text-gray-400 ${onClick ? 'cursor-pointer' : ''} ${avatarUrl ? 'hidden' : ''}`}
        style={{ display: avatarUrl ? 'none' : 'block' }}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      </svg>
    </div>
  );
}