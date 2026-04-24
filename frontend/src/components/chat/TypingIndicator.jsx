const TypingIndicator = ({ name }) => {
  return (
    <div className="flex items-center gap-2 text-sm px-2">
      {/* NAME */}
      <span className="text-base-content/70 italic">{name} is typing</span>

      {/* DOT ANIMATION */}
      <div className="flex items-center gap-1">
        <span className="w-1.5 h-1.5 bg-base-content/60 rounded-full animate-bounce [animation-delay:-0.3s]" />
        <span className="w-1.5 h-1.5 bg-base-content/60 rounded-full animate-bounce [animation-delay:-0.15s]" />
        <span className="w-1.5 h-1.5 bg-base-content/60 rounded-full animate-bounce" />
      </div>
    </div>
  );
};

export default TypingIndicator;
