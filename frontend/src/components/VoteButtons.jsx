import React, { useState } from "react";
import { vote } from "../api/api";
import { isLoggedIn } from "../api/auth";

export default function VoteButtons({ targetType, targetId, initialScore }) {
    const [score, setScore] = useState(initialScore ?? 0);
    const [loading, setLoading] = useState(false);

    async function handleVote(value) {
        if (!isLoggedIn()) {
            alert("You must be logged in to vote.");
            return;
        }
        setLoading(true);
        try {
            await vote(targetType, targetId, value);
            // Optimistic: toggle off if same, otherwise apply
            setScore((prev) => prev + value);
        } catch (e) {
            alert(e.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-col items-center gap-1 min-w-[32px]">
            <button
                onClick={() => handleVote(1)}
                disabled={loading}
                className="text-gray-400 hover:text-orange-500 transition text-xl leading-none disabled:opacity-40"
                title="Upvote"
            >
                ▲
            </button>
            <span className="text-sm font-semibold text-gray-700">{score}</span>
            <button
                onClick={() => handleVote(-1)}
                disabled={loading}
                className="text-gray-400 hover:text-blue-500 transition text-xl leading-none disabled:opacity-40"
                title="Downvote"
            >
                ▼
            </button>
        </div>
    );
}
