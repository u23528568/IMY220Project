import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Header() {
	const navigate = useNavigate();
	const { user, logout, isAuthenticated } = useAuth();
	const [showDropdown, setShowDropdown] = useState(false);

	const handleLogout = () => {
		logout();
		navigate("/");
		setShowDropdown(false);
	};

	// Don't show header if not authenticated
	if (!isAuthenticated) {
		return null;
	}

	return (
		<header className="flex justify-between items-center px-6 py-3 bg-gray-800 shadow-md">
			<div className="flex items-center space-x-2">
				<img 
					src="/assets/images/Logo.jpg" 
					alt="Repofox Logo" 
					className="w-6 h-6 cursor-pointer rounded-full" 
					onClick={() => navigate("/home")}
				/>
				<span 
					className="text-orange-400 font-display font-bold text-xl cursor-pointer tracking-tight"
					onClick={() => navigate("/home")}
				>
					Repo<span className="text-white">fox</span>
				</span>
			</div>
			
			<div className="flex items-center space-x-4">
				<span className="cursor-pointer hover:text-orange-400 text-white font-medium transition-colors" onClick={() => navigate("/project")}>
					Repos
				</span>
				<span className="cursor-pointer hover:text-orange-400 text-white font-medium transition-colors" onClick={() => navigate("/friends")}>
					Friends
				</span>
				<span className="cursor-pointer hover:text-orange-400 text-white font-medium transition-colors" onClick={() => navigate("/about")}>
					About
				</span>
				
				{/* User profile dropdown */}
				<div className="relative">
					<div 
						className="flex items-center space-x-2 cursor-pointer"
						onClick={() => setShowDropdown(!showDropdown)}
					>
						{user?.profile?.avatar ? (
							<img
								src={user.profile.avatar}
								alt="User Avatar"
								className="w-8 h-8 rounded-full object-cover border-0"
							/>
						) : (
							<svg 
								xmlns="http://www.w3.org/2000/svg" 
								fill="none" 
								viewBox="0 0 24 24" 
								strokeWidth="1.5" 
								stroke="currentColor" 
								className="w-8 h-8 text-white"
							>
								<path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
							</svg>
						)}
						<span className="text-white text-sm">
							{user?.username || 'User'}
						</span>
						<svg 
							className={`w-4 h-4 text-white transition-transform ${showDropdown ? 'rotate-180' : ''}`} 
							fill="none" 
							stroke="currentColor" 
							viewBox="0 0 24 24"
						>
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
						</svg>
					</div>
					
					{/* Dropdown menu */}
					{showDropdown && (
						<div className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-md shadow-lg py-1 z-50">
							<button 
								className="block px-4 py-2 text-sm text-white hover:bg-gray-600 w-full text-left"
								onClick={() => {
									navigate("/profile");
									setShowDropdown(false);
								}}
							>
								My Profile
							</button>
							<button 
								className="block px-4 py-2 text-sm text-white hover:bg-gray-600 w-full text-left"
								onClick={handleLogout}
							>
								Logout
							</button>
						</div>
					)}
				</div>
			</div>
		</header>
	);
}
