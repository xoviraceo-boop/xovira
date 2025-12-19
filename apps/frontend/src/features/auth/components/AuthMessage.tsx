import React from "react";

export const AuthMessage = ({ message }: { message: string }) => {
  if (!message) return null;
  
  const isSuccess = message.includes('Check your email') || message.includes('Success');
  const style = isSuccess
    ? 'bg-green-100 text-green-700 border-green-300'
    : 'bg-red-100 text-red-700 border-red-300';

  return (
    <div className={`mb-4 p-4 rounded-lg border text-sm font-medium transition-opacity duration-300 ${style}`}>
      {message}
    </div>
  );
};