import Link from 'next/link';

const NotFound = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 px-4 select-none">
            <div className="text-center max-w-md w-full space-y-6">
                
                {/* বড় ও আকর্ষণীয় 404 টেক্সট */}
                <h1 className="text-9xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 drop-shadow-sm animate-pulse">
                    404
                </h1>

                {/* এরর মেসেজ */}
                <div className="space-y-2">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">
                        পেজটি খুঁজে পাওয়া যায়নি
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base leading-relaxed">
                        দুঃখিত, আপনি যে পৃষ্ঠাটি খুঁজছেন সেটি হয়তো মুছে ফেলা হয়েছে অথবা তার লিংকটি ভুল ছিল।
                    </p>
                </div>

                {/* অ্যাকশন বাটন */}
                <div className="pt-4">
                    <Link 
                        href="/" 
                        className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-all duration-200 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                        হোম পেজে ফিরে যান
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
