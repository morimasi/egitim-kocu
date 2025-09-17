import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, Calendar, MessageCircle } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Eğitim Koçu</span>
            </div>
            <div className="flex space-x-4">
              <Link href="/auth/login">
                <Button variant="ghost">Giriş Yap</Button>
              </Link>
              <Link href="/auth/register">
                <Button>Kayıt Ol</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            Eğitim Koçluğu
            <span className="block text-blue-600">Platformu</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Öğrenci takibi, ödev yönetimi ve iletişimi tek platformda birleştiren 
            modern eğitim koçluğu çözümü.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <Link href="/auth/register">
                <Button size="lg" className="w-full">
                  Hemen Başlayın
                </Button>
              </Link>
            </div>
            <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
              <Link href="/auth/login">
                <Button variant="outline" size="lg" className="w-full">
                  Giriş Yapın
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-16">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-blue-600" />
                <CardTitle className="text-lg">Öğrenci Takibi</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Öğrenci profillerini yönetin, hedefleri belirleyin ve ilerlemelerini takip edin.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <BookOpen className="h-8 w-8 text-green-600" />
                <CardTitle className="text-lg">Ödev Yönetimi</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Ödevleri kolayca oluşturun, atayın ve değerlendirin. Dosya paylaşımı desteklenir.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Calendar className="h-8 w-8 text-purple-600" />
                <CardTitle className="text-lg">Hatırlatmalar</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Otomatik hatırlatmalarla önemli tarihleri kaçırmayın. E-posta bildirimleri.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <MessageCircle className="h-8 w-8 text-orange-600" />
                <CardTitle className="text-lg">İletişim</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Koç ve öğrenci arasında anlık mesajlaşma. Dosya paylaşımı desteklenir.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-24 bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center space-x-6 md:order-2">
            <p className="text-center text-sm text-gray-400">
              &copy; 2024 Eğitim Koçu. Tüm hakları saklıdır.
            </p>
          </div>
          <div className="mt-8 md:mt-0 md:order-1">
            <div className="flex items-center justify-center md:justify-start">
              <BookOpen className="h-6 w-6 text-blue-600" />
              <span className="ml-2 text-lg font-semibold text-gray-900">Eğitim Koçu</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
