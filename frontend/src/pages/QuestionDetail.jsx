import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchQuestion, postAnswer, requestAIAnswer } from "../api/api";
import { isLoggedIn, getUserId } from "../api/auth";
import VoteButtons from "../components/VoteButtons";
import AnswerCard from "../components/AnswerCard";
import TagBadge from "../components/TagBadge";

export default function QuestionDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [question, setQuestion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [answerBody, setAnswerBody] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [answerError, setAnswerError] = useState(null);

    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchQuestion(id);
            setQuestion(data);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { load(); }, [load]);

    async function handlePostAnswer(e) {
        e.preventDefault();
        if (!answerBody.trim()) return;
        setSubmitting(true);
        setAnswerError(null);
        try {
            await postAnswer(parseInt(id), answerBody.trim());
            setAnswerBody("");
            await load();
        } catch (e) {
            setAnswerError(e.message);
        } finally {
            setSubmitting(false);
        }
    }

    async function handleAIAnswer() {
        setAiLoading(true);
        setAiError(null);
        try {
            await requestAIAnswer(parseInt(id));
            await load();
        } catch (e) {
            setAiError(e.message);
        } finally {
            setAiLoading(false);
        }
    }

    function handleAccepted(answerId) {
        setQuestion((prev) => ({
            ...prev,
            answers: prev.answers.map((a) => ({
                ...a,
                is_accepted: a.id === answerId ? 1 : 0,
            })),
        }));
    }

    if (loading) return <div className="text-center py-16 text-gray-400">Loading...</div>;
    if (error) return <div className="text-center py-8 text-red-500">{error}</div>;
    if (!question) return null;

    const tags = question.tags
        ? question.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [];
    const isAuthor = isLoggedIn() && getUserId() === question.user_id;

    return (
        <div>
            {/* Back link */}
            <button
                onClick={() => navigate(-1)}
                className="text-sm text-gray-500 hover:text-gray-800 mb-6 flex items-center gap-1"
            >
                ← Back to questions
            </button>

            {/* Question */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                <div className="flex gap-5">
                    <VoteButtons
                        targetType="question"
                        targetId={question.id}
                        initialScore={question.vote_score}
                    />
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl font-bold text-gray-900 mb-3 leading-snug">
                            {question.title}
                        </h1>
                        <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed mb-4">
                            {question.body}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                            {tags.map((tag) => (
                                <TagBadge key={tag} tag={tag} />
                            ))}
                            <span className="ml-auto text-xs text-gray-400">
                                asked by{" "}
                                <span className="font-medium text-gray-600">
                                    {question.username}
                                </span>{" "}
                                · {new Date(question.created_at).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Answers header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                    {question.answers.length} Answer
                    {question.answers.length !== 1 ? "s" : ""}
                </h2>

                {/* AI Answer button — any logged-in user */}
                {isLoggedIn() && (
                    <button
                        onClick={handleAIAnswer}
                        disabled={aiLoading}
                        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-md transition"
                    >
                        {aiLoading ? (
                            <>
                                <span className="animate-spin">⟳</span> Generating...
                            </>
                        ) : (
                            <>✦ Get AI Answer</>
                        )}
                    </button>
                )}
            </div>

            {aiError && (
                <div className="text-red-500 text-sm mb-4">{aiError}</div>
            )}

            {/* Answer list */}
            <div className="space-y-4 mb-10">
                {question.answers.map((ans) => (
                    <AnswerCard
                        key={ans.id}
                        answer={ans}
                        questionAuthorId={question.user_id}
                        onAccepted={handleAccepted}
                    />
                ))}
            </div>

            {/* Post answer form */}
            {isLoggedIn() ? (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-base font-semibold text-gray-800 mb-3">
                        Your Answer
                    </h3>
                    <form onSubmit={handlePostAnswer}>
                        <textarea
                            value={answerBody}
                            onChange={(e) => setAnswerBody(e.target.value)}
                            rows={6}
                            placeholder="Write your answer here..."
                            className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-y"
                        />
                        {answerError && (
                            <p className="text-red-500 text-sm mt-2">{answerError}</p>
                        )}
                        <button
                            type="submit"
                            disabled={submitting || !answerBody.trim()}
                            className="mt-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-medium px-5 py-2 rounded-md transition"
                        >
                            {submitting ? "Posting..." : "Post Your Answer"}
                        </button>
                    </form>
                </div>
            ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center text-sm text-gray-600">
                    <span
                        className="text-orange-500 hover:underline cursor-pointer"
                        onClick={() => navigate("/login")}
                    >
                        Log in
                    </span>{" "}
                    or{" "}
                    <span
                        className="text-orange-500 hover:underline cursor-pointer"
                        onClick={() => navigate("/signup")}
                    >
                        sign up
                    </span>{" "}
                    to post an answer.
                </div>
            )}
        </div>
    );
}
