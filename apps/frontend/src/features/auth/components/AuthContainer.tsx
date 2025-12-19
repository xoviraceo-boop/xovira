import React from "react";

export const AuthContainer = ({ children }: { children: React.ReactNode }) => (
  <div className="w-full bg-white/95 backdrop-blur-sm shadow-2xl rounded-2xl transform transition-all duration-500 p-8 md:p-12">
    {children}
  </div>
);