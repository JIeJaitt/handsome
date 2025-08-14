"use client";

import { Dispatch, SetStateAction } from "react";

export default function Search({
  value,
  onChange,
}: {
  value: string;
  onChange: Dispatch<SetStateAction<string>>;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search posts..."
      className="w-full p-2 border border-gray-300 rounded-md"
    />
  );
}
