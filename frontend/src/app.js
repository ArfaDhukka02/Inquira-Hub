import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import QuestionDetail from "./pages/QuestionDetail";
import AskQuestion from "./pages/AskQuestion";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { isLoggedIn } from "./api/auth";

function ProtectedRoute({ children }) {
    return isLoggedIn() ? children : <Navigate to="/login" replace />;
}

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-gray-100">
                <Navbar />
                <main className="max-w-4xl mx-auto px-4 py-8">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/questions/:id" element={<QuestionDetail />} />
                        <Route
                            path="/ask"
                            element={
                                <ProtectedRoute>
                                    <AskQuestion />
                                </ProtectedRoute>
                            }
                        />
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
