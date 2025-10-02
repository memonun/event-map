export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <h2 className="text-2xl mb-6">Page Not Found</h2>
        <p className="text-gray-400 mb-8">The page you're looking for doesn't exist.</p>
        <a 
          href="/" 
          className="bg-yellow-400 text-black px-6 py-3 rounded-full font-medium hover:bg-yellow-300 transition-colors"
        >
          Go Home
        </a>
      </div>
    </div>
  );
}