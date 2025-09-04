import React from "react";
import { useNavigate } from "react-router-dom";

export default function Header() {
	const navigate = useNavigate();

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
				<span className="cursor-pointer hover:text-orange-400" onClick={() => navigate("/project")}>
					Repos
				</span>
				<span className="cursor-pointer hover:text-orange-400" onClick={() => navigate("/friends")}>
					Friends
				</span>
				<span className="cursor-pointer hover:text-orange-400" onClick={() => navigate("/about")}>
					About
				</span>
				<img
					src="/assets/images/profilepic.jpg"
					alt="User Avatar"
					className="w-8 h-8 rounded-full cursor-pointer"
					onClick={() => navigate("/profile")}
				/>
			</div>
		</header>
	);
}
