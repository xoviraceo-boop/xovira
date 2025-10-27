import React from 'react';

export const EmptyState = ({ title, message, icon, actionButton }) => {
  return (
    <div 
      className="
        flex flex-col items-center justify-center 
        p-10 sm:p-12 
        text-center 
        bg-gray-50 
        rounded-xl 
        border-2 border-dashed border-gray-300 
        max-w-xl 
        mx-auto 
        shadow-sm
      "
    >
      {/* Optional Icon Container */}
      {icon && (
        <div className="text-5xl text-gray-400 mb-4">
          {/* We clone the icon element to ensure it gets the Tailwind styling if it's a simple SVG/component */}
          {React.isValidElement(icon) ? (
             React.cloneElement(icon, { className: 'w-12 h-12 stroke-1.5' }) 
          ) : (
            icon
          )}
        </div>
      )}

      {/* Title */}
      <h2 className="text-xl font-semibold text-gray-800 mb-2">
        {title}
      </h2>

      {/* Message */}
      <p className="text-base text-gray-500 mb-6 max-w-sm">
        {message}
      </p>

      {/* Optional Action Button */}
      {actionButton && (
        <div className="mt-2">
          {/* Use standard Tailwind button classes for a primary action */}
          {React.isValidElement(actionButton) ? (
            // Ensure the button element gets primary styling
            React.cloneElement(actionButton, { 
              className: `
                px-4 py-2 
                text-sm font-medium 
                text-white 
                bg-indigo-600 
                hover:bg-indigo-700 
                rounded-lg 
                shadow-md 
                transition duration-150 
                focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                ${actionButton.props.className || ''} 
              `.trim()
            })
          ) : (
            // Fallback for a simple text/string passed as actionButton
            <button
              className="
                px-4 py-2 
                text-sm font-medium 
                text-white 
                bg-indigo-600 
                hover:bg-indigo-700 
                rounded-lg 
                shadow-md 
                transition duration-150 
                focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
              "
            >
              {actionButton}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
