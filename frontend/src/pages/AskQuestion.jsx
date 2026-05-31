import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createQuestion } from "../api/api";

export default function AskQuestion() {
    const navigate = useNavigate();
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [tags, setTags] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    async function handleSubmit(e) {
        e.preventDefault();
        if (!title.trim() || !body.trim()) return;
        setSubmitting(true);
        setError(null);
        try {
            const data = await createQuestion(title.trim(), body.trim(), tags.trim());
            navigate(`/questions/${data.id}`);
        } catch (e) {
            setError(e.message);
            setSubmitting(false);
        }
    }

    return (
        <div className="max-w-2xl">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Ask a Question</h1>

            <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-5">
                {/* Title */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Title
                    </label>
                    <p className="text-xs text-gray-400 mb-2">
                        Be specific and imagine you're asking a question to another person.
                    </p>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. How do I reverse a string in Python?"
                        className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                </div>

                {/* Body */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Body
                    </label>
                    <p className="text-xs text-gray-400 mb-2">
                        Include all the information someone would need to answer your question.
                    </p>
                    <textarea
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        rows={8}
                        placeholder="Describe your problem in detail..."
                        className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-y"
                    />
                </div>

                {/* Tags */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Tags
                    </label>
                    <p className="text-xs text-gray-400 mb-2">
                        Add up to 5 tags separated by commas (e.g. python, django, api).
                    </p>
                    <input
                        type="text"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        placeholder="python, fastapi, mysql"
                        className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <div className="flex items-center gap-3 pt-1">
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || !title.trim() || !body.trim()}
                        className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-medium px-5 py-2 rounded-md transition"
                    >
                        {submitting ? "Posting..." : "Post Your Question"}
                    </button>
                    <button
                        onClick={() => navigate("/")}
                        className="text-sm text-gray-500 hover:text-gray-700"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
