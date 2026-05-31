import React, { useState } from "react";
import VoteButtons from "./VoteButtons";
import { acceptAnswer } from "../api/api";
import { getUserId, isLoggedIn } from "../api/auth";

export default function AnswerCard({ answer, questionAuthorId, onAccepted }) {
    const [accepting, setAccepting] = useState(false);
    const isOwner = isLoggedIn() && getUserId() === questionAuthorId;

    async function handleAccept() {
        setAccepting(true);
        try {
            await acceptAnswer(answer.id);
            onAccepted(answer.id);
        } catch (e) {
            alert(e.message);
        } finally {
            setAccepting(false);
        }
    }

    return (
        <div
            className={`flex gap-4 p-5 rounded-lg border ${answer.is_accepted
                    ? "border-green-400 bg-green-50"
                    : "border-gray-200 bg-white"
                }`}
        >
            {/* Vote column */}
            <div className="flex flex-col items-center gap-2">
                <VoteButtons
                    targetType="answer"
                    targetId={answer.id}
                    initialScore={answer.vote_score}
                />
                {/* Accept checkmark */}
                {answer.is_accepted ? (
                    <div className="text-green-500 text-xl" title="Accepted answer">✔</div>
                ) : isOwner ? (
                    <button
                        onClick={handleAccept}
                        disabled={accepting}
                        className="text-gray-300 hover:text-green-500 text-xl transition disabled:opacity-40"
                        title="Accept this answer"
                    >
                        ✔
                    </button>
                ) : null}
            </div>

            {/* Body */}
            <div className="flex-1 min-w-0">
                {answer.ai_generated && (
                    <span className="inline-flex items-center gap-1 text-xs bg-purple-100 text-purple-700 border border-purple-200 px-2 py-0.5 rounded mb-2 font-medium">
                        ✦ AI Generated
                    </span>
                )}
                <p className="text-gray-800 whitespace-pre-wrap text-sm leading-relaxed">
                    {answer.body}
                </p>
                <div className="mt-3 text-xs text-gray-400">
                    answered by <span className="font-medium text-gray-600">{answer.username}</span>
                    {" · "}
                    {new Date(answer.created_at).toLocaleDateString()}
                </div>
            </div>
        </div>
    );
}
