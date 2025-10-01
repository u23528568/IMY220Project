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
			
			<div className="flex items-center space-x-4">
				<span className="cursor-pointer hover:text-orange-400 text-white" onClick={() => navigate("/project")}>
					Repos
				</span>
				<span className="cursor-pointer hover:text-orange-400 text-white" onClick={() => navigate("/friends")}>
					Friends
				</span>
				<span className="cursor-pointer hover:text-orange-400 text-white" onClick={() => navigate("/about")}>
					About
				</span>
				
				{/* User profile dropdown */}
				<div className="relative">
					<div 
						className="flex items-center space-x-2 cursor-pointer"
						onClick={() => setShowDropdown(!showDropdown)}
					>
						<img
							src="/assets/images/profilepic.jpg"
							alt="User Avatar"
							className="w-8 h-8 rounded-full"
						/>
						<span className="text-white text-sm">
							{user?.profile?.name || user?.username || 'User'}
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
