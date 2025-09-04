import React from "react";
import { useNavigate } from "react-router-dom";

export default function Header() {
	const navigate = useNavigate();
		return (
			<header className="flex items-center justify-between px-6 py-3 bg-gray-800 shadow-md">
				<div className="flex items-center cursor-pointer" onClick={() => navigate("/home") }>
					<img src="/assets/images/Logo.png" alt="Repofox Logo" className="w-6 h-6 mr-2" />
					<span className="text-orange-400 font-bold text-xl">Repofox</span>
				</div>
				<nav className="flex items-center space-x-6">
					<span className="cursor-pointer" onClick={() => navigate("/project")}>Repos</span>
					<span className="cursor-pointer" onClick={() => navigate("/friends")}>Friends</span>
				</nav>
			</header>
		);
}
