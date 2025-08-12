export function TypingDots() {
  return (
    <div className="flex space-x-1 items-center">
      <div className="flex space-x-1">
        <div className="h-2 w-2 bg-gabi-dark-green rounded-full animate-bounce"></div>
        <div className="h-2 w-2 bg-gabi-dark-green rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="h-2 w-2 bg-gabi-dark-green rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  )
}