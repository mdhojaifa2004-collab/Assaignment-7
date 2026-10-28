

const Loading = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 text-white p-4">
      <div className="relative flex items-center justify-center mb-6">
        {/* বাইরের বড় অ্যানিমেটেড রিং */}
        <div className="h-20 w-20 animate-spin rounded-full border-4 border-t-blue-500 border-r-transparent border-b-cyan-400 border-l-transparent shadow-lg shadow-blue-500/20"></div>
        
        {/* ভেতরের ছোট রিং (উল্টো দিকে ঘুরবে) */}
        <div className="absolute h-12 w-12 animate-spin rounded-full border-4 border-t-purple-500 border-r-transparent border-b-pink-500 border-l-transparent animation-delay-150 [animation-direction:reverse]"></div>
        
        {/* মাঝখানের গ্লোয়িং ডট */}
        <div className="absolute h-4 w-4 rounded-full bg-cyan-400 animate-pulse shadow-md shadow-cyan-400/50"></div>
      </div>

      {/* লোডিং টেক্সট */}
      <h2 className="text-xl font-semibold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 animate-pulse">
        Loading Assets...
      </h2>
      
      {/* একটি ছোট সাব-টেক্সট */}
      <p className="mt-2 text-sm text-gray-400 font-medium">
        Please wait while we prepare your space.
      </p>
    </div>
  );
};

export default Loading;
