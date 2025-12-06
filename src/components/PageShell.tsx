"use client";

import React from "react";

type Props = {
  children: React.ReactNode;
};

export function PageShell({ children }: Props) {
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 pb-8 md:pb-10">
        <div className="mx-auto max-w-[1920px]">{children}</div>
      </div>
    </div>
  );
}
