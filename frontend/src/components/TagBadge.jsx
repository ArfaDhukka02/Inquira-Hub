import React from "react";

export default function TagBadge({ tag, onClick }) {
    return (
        <span
            onClick={onClick ? () => onClick(tag) : undefined}
            className={`inline-block bg-blue-50 text-blue-700 text-xs font-medium px-2 py-0.5 rounded border border-blue-200 ${onClick ? "cursor-pointer hover:bg-blue-100 transition" : ""
                }`}
        >
            {tag}
        </span>
    );
}