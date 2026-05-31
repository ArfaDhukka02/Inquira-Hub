import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { isLoggedIn, getUsername, logout } from "../api/auth"

export default function Navbar() {
    const [loggedIn, setLoggedIn] = useState(isLoggedIn());
    const [username, setUsername] = useState(getUsername());
    const navigate = useNavigate();

    useEffect(() => {
        const sync = () => {
            setLoggedIn(isLoggedIn());
            setUsername(getUsername());
        };
        window.addEventListener("auth-change", sync);
        return () => window.removeEventListener("auth-change", sync);
    }, []);

    function handleLogout() {
        logout();
        setLoggedIn(false);
        setUsername(null);
        window.dispatchEvent(new Event("auth-change"));
        navigate("/");
    }

    return (
        <nav className="bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2">
                    <div className="bg-orange-500 text-white font-bold px-2 py-0.5 rounded text-sm">
                        IH
                    </div>
                    <span className="font-semibold text-gray-800 text-lg">Inquira Hub</span>
                </Link>

                {/* Right side */}
                <div className="flex items-center gap-3">
                    {loggedIn ? (
                        <>
                            <Link
                                to="/ask"
                                className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-1.5 rounded-md transition"
                            >
                                Ask Question
                            </Link>
                            <span className="text-sm text-gray-600 font-medium">{username}</span>
                            <button
                                onClick={handleLogout}
                                className="text-sm text-gray-500 hover:text-gray-800 border border-gray-300 px-3 py-1.5 rounded-md transition"
                            >
                                Log out
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className="text-sm text-gray-600 hover:text-gray-900 border border-gray-300 px-3 py-1.5 rounded-md transition"
                            >
                                Log in
                            </Link>
                            <Link
                                to="/signup"
                                className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-1.5 rounded-md transition"
                            >
                                Sign up
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}