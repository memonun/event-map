import { hasEnvVars } from "@/lib/utils";
import { AirbnbStyleMapPlatform } from "@/components/AirbnbStyleMapPlatform";
import { Calendar } from "lucide-react";

export default function Home() {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

  return (
    <>
      {hasEnvVars ? (
        <AirbnbStyleMapPlatform mapboxAccessToken={mapboxToken} />
      ) : (
        // Environment setup message (full screen)
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
          <div className="text-center max-w-2xl mx-auto p-8">
            <Calendar className="w-20 h-20 text-red-500 mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Event Map Platform
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Türkiye&apos;nin en kapsamlı etkinlik keşif platformu. 
              5 büyük bilet platformundan toplanan binlerce etkinliği harita üzerinde keşfedin.
            </p>
            
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-6 mb-8 shadow-lg">
              <h3 className="font-semibold text-gray-800 mb-2">
                🔧 Kurulum Gerekli
              </h3>
              <p className="text-gray-600 mb-4">
                Platformu kullanmaya başlamak için environment variables&apos;ınızı yapılandırın:
              </p>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm text-left">
                <div>NEXT_PUBLIC_SUPABASE_URL=your_supabase_url</div>
                <div>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your_key</div>
                <div className="text-gray-400 mt-2"># Harita için:</div>
                <div>NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
