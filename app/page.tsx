import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/lib/utils";
import { EventMapContainer } from "@/components/map";
import { EventList, EventFilters } from "@/components/events";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapIcon, List, Calendar } from "lucide-react";
import Link from "next/link";

export default function Home() {
  // You'll need to set your Mapbox access token in environment variables
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="w-full border-b border-b-foreground/10 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="w-full max-w-7xl mx-auto flex justify-between items-center p-4">
          <div className="flex gap-5 items-center">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
              <Calendar className="w-6 h-6 text-blue-600" />
              <span>Event Map</span>
            </Link>
            <span className="text-sm text-gray-500 hidden md:block">
              Türkiye&apos;nin En Kapsamlı Etkinlik Platformu
            </span>
          </div>
          <div className="flex items-center gap-4">
            <AuthButton />
            <ThemeSwitcher />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 w-full">
        {hasEnvVars ? (
          <div className="h-full">
            <Tabs defaultValue="map" className="h-full flex flex-col">
              {/* Tab Navigation */}
              <div className="border-b bg-gray-50/50">
                <div className="max-w-7xl mx-auto px-4">
                  <TabsList className="grid w-full max-w-md grid-cols-2 bg-transparent">
                    <TabsTrigger 
                      value="map" 
                      className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                      <MapIcon className="w-4 h-4" />
                      Harita Görünümü
                    </TabsTrigger>
                    <TabsTrigger 
                      value="list" 
                      className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                      <List className="w-4 h-4" />
                      Liste Görünümü
                    </TabsTrigger>
                  </TabsList>
                </div>
              </div>

              {/* Map View */}
              <TabsContent value="map" className="flex-1 m-0">
                <div className="h-[calc(100vh-8rem)]">
                  {mapboxToken ? (
                    <EventMapContainer
                      mapboxAccessToken={mapboxToken}
                      className="w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50">
                      <div className="text-center max-w-md mx-auto p-8">
                        <MapIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          Harita Görünümü
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Harita görünümünü kullanmak için Mapbox access token&apos;ınızı 
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm mx-1">
                            NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
                          </code>
                          environment variable&apos;ına ekleyin.
                        </p>
                        <a
                          href="https://docs.mapbox.com/help/getting-started/access-tokens/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          Mapbox token nasıl alınır?
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* List View */}
              <TabsContent value="list" className="flex-1 m-0">
                <div className="max-w-7xl mx-auto p-4">
                  <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      Türkiye&apos;deki Tüm Etkinlikler
                    </h1>
                    <p className="text-gray-600">
                      5 büyük bilet platformundan toplanan 5,240+ etkinlik
                    </p>
                  </div>

                  {/* Filters */}
                  <div className="mb-8">
                    <EventFilters
                      onFiltersChange={(filters) => {
                        // This will be handled by the EventList component
                        console.log('Filters changed:', filters);
                      }}
                    />
                  </div>

                  {/* Event List */}
                  <EventList
                    onEventSelect={(event) => {
                      console.log('Event selected:', event);
                      // TODO: Implement event detail modal or navigation
                    }}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          // Environment setup message
          <div className="flex items-center justify-center min-h-[60vh] bg-gray-50">
            <div className="text-center max-w-2xl mx-auto p-8">
              <Calendar className="w-20 h-20 text-blue-600 mx-auto mb-6" />
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Event Map Platform
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Türkiye&apos;nin en kapsamlı etkinlik keşif platformu. 
                5 büyük bilet platformundan toplanan binlerce etkinliği harita üzerinde keşfedin.
              </p>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
                <h3 className="font-semibold text-yellow-800 mb-2">
                  🔧 Kurulum Gerekli
                </h3>
                <p className="text-yellow-700 mb-4">
                  Platformu kullanmaya başlamak için Supabase bağlantınızı yapılandırın:
                </p>
                <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm text-left">
                  <div>NEXT_PUBLIC_SUPABASE_URL=your_supabase_url</div>
                  <div>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your_key</div>
                  <div className="text-gray-400 mt-2"># Opsiyonel: Harita için</div>
                  <div>NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token</div>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6 text-left">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <MapIcon className="w-8 h-8 text-blue-600 mb-3" />
                  <h3 className="font-semibold mb-2">İnteraktif Harita</h3>
                  <p className="text-gray-600 text-sm">
                    Etkinlikleri harita üzerinde görün, yakınınızda olanları keşfedin
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <List className="w-8 h-8 text-green-600 mb-3" />
                  <h3 className="font-semibold mb-2">Akıllı Filtreleme</h3>
                  <p className="text-gray-600 text-sm">
                    Kategori, tarih, şehir ve platform bazında etkinlikleri filtreleyin
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <Calendar className="w-8 h-8 text-purple-600 mb-3" />
                  <h3 className="font-semibold mb-2">Gerçek Zamanlı Fiyatlar</h3>
                  <p className="text-gray-600 text-sm">
                    Tüm platformlardaki güncel fiyatları karşılaştırın
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t bg-gray-50/50 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-600 text-sm">
            Powered by{" "}
            <a
              href="https://supabase.com"
              target="_blank"
              className="font-medium text-gray-900 hover:text-blue-600"
              rel="noreferrer"
            >
              Supabase
            </a>
            {" • "}
            <a
              href="https://nextjs.org"
              target="_blank"
              className="font-medium text-gray-900 hover:text-blue-600"
              rel="noreferrer"
            >
              Next.js
            </a>
            {" • "}
            <a
              href="https://www.mapbox.com"
              target="_blank"
              className="font-medium text-gray-900 hover:text-blue-600"
              rel="noreferrer"
            >
              Mapbox
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
