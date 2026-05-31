import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchQuestions } from "../api/api";
import { isLoggedIn } from "../api/auth";
import TagBadge from "../components/TagBadge";

export default function Home() {
    const [questions, setQuestions] = useState([]);
    const [search, setSearch] = useState("");
    const [activeTag, setActiveTag] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchQuestions(search, activeTag);
            setQuestions(data);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, [search, activeTag]);

    useEffect(() => {
        const timer = setTimeout(load, 300);
        return () => clearTimeout(timer);
    }, [load]);

    function handleTagClick(tag) {
        setActiveTag((prev) => (prev === tag ? "" : tag));
    }

    return (
        <div>
            {/* Header row */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">All Questions</h1>
                {isLoggedIn() && (
                    <Link
                        to="/ask"
                        className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-md transition"
                    >
                        Ask Question
                    </Link>
                )}
            </div>

            {/* Search bar */}
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search questions..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
            </div>

            {/* Active tag filter */}
            {activeTag && (
                <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
                    Filtered by tag:
                    <TagBadge tag={activeTag} />
                    <button
                        onClick={() => setActiveTag("")}
                        className="text-gray-400 hover:text-gray-700 text-xs underline"
                    >
                        Clear
                    </button>
                </div>
            )}

            {/* Question count */}
            {!loading && (
                <p className="text-sm text-gray-500 mb-4">
                    {questions.length} question{questions.length !== 1 ? "s" : ""}
                </p>
            )}

            {/* States */}
            {loading && (
                <div className="text-center py-16 text-gray-400">Loading...</div>
            )}
            {error && (
                <div className="text-center py-8 text-red-500">{error}</div>
            )}

            {/* Question list */}
            {!loading && !error && questions.length === 0 && (
                <div className="text-center py-16 text-gray-400">
                    No questions found.{" "}
                    {isLoggedIn() ? (
                        <Link to="/ask" className="text-orange-500 hover:underline">
                            Ask the first one!
                        </Link>
                    ) : (
                        <Link to="/signup" className="text-orange-500 hover:underline">
                            Sign up to ask one!
                        </Link>
                    )}
                </div>
            )}

            <div className="space-y-3">
                {questions.map((q) => {
                    const tags = q.tags ? q.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];
                    return (
                        <div
                            key={q.id}
                            className="bg-white border border-gray-200 rounded-lg p-5 hover:border-orange-300 transition cursor-pointer"
                            onClick={() => navigate(`/questions/${q.id}`)}
                        >
                            <div className="flex gap-4">
                                {/* Stats */}
                                <div className="flex flex-col items-center gap-2 min-w-[64px] text-center text-xs text-gray-500 shrink-0">
                                    <div>
                                        <div className="text-base font-semibold text-gray-700">
                                            {q.vote_score}
                                        </div>
                                        <div>votes</div>
                                    </div>
                                    <div
                                        className={`px-2 py-1 rounded text-xs font-medium ${q.answer_count > 0
                                                ? "bg-green-100 text-green-700 border border-green-300"
                                                : "bg-gray-100 text-gray-500"
                                            }`}
                                    >
                                        {q.answer_count} ans
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <h2 className="text-base font-semibold text-blue-700 hover:text-blue-900 mb-1 leading-snug">
                                        {q.title}
                                    </h2>
                                    <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                                        {q.body}
                                    </p>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {tags.map((tag) => (
                                            <TagBadge
                                                key={tag}
                                                tag={tag}
                                                onClick={(e) => {
                                                    e.stopPropagation?.();
                                                    handleTagClick(tag);
                                                }}
                                            />
                                        ))}
                                        <span className="ml-auto text-xs text-gray-400 shrink-0">
                                            asked by{" "}
                                            <span className="font-medium text-gray-600">
                                                {q.username}
                                            </span>{" "}
                                            · {new Date(q.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
