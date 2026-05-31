import React, { useState } from "react";
import { vote } from "../api/api";
import { isLoggedIn } from "../api/auth";

export default function VoteButtons({ targetType, targetId, initialScore }) {
    const [score, setScore] = useState(Number(initialScore) ?? 0);
    const [userVote, setUserVote] = useState(0);
    const [loading, setLoading] = useState(false);

    async function handleVote(value) {
        if (!isLoggedIn()) {
            alert("You must be logged in to vote.");
            return;
        }
        setLoading(true);
        try {
            const result = await vote(targetType, targetId, value);
            // Update userVote state
            if (userVote === value) {
                setUserVote(0);
            } else {
                setUserVote(value);
            }
            // Use score from backend if returned, otherwise adjust manually
            if (result.score !== undefined) {
                setScore(result.score);
            } else {
                setScore((prev) => {
                    if (userVote === value) return prev - value;
                    if (userVote === 0) return prev + value;
                    return prev - userVote + value;
                });
            }
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
                className={`transition text-xl leading-none disabled:opacity-40 ${userVote === 1 ? "text-orange-500" : "text-gray-400 hover:text-orange-500"
                    }`}
                title="Upvote"
            >
                ▲
            </button>
            <span className="text-sm font-semibold text-gray-700">{score}</span>
            <button
                onClick={() => handleVote(-1)}
                disabled={loading}
                className={`transition text-xl leading-none disabled:opacity-40 ${userVote === -1 ? "text-blue-500" : "text-gray-400 hover:text-blue-500"
                    }`}
                title="Downvote"
            >
                ▼
            </button>
        </div>
    );
}