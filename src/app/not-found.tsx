import Link from "next/link";
import Logo from "registro/components/shared/Logo";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-blue-400 to-blue-600 dark:from-[#121212] dark:via-[#1a1a1a] dark:to-[#121212] relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-10 dark:opacity-5">
        <div className="absolute top-20 left-10 w-32 h-32 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-white rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-8 opacity-0 animate-fade-in-up">
          {/* Logo */}
          <div className="flex justify-center mb-8 opacity-0 animate-fade-in-scale">
            <Logo size={80} />
          </div>

          {/* 404 Number */}
          <h1 className="text-8xl sm:text-[12rem] lg:text-[14rem] font-black text-white/20 dark:text-white/10 leading-none opacity-0 animate-fade-in-scale-spring">
            404
          </h1>

          {/* Error Message */}
          <div className="space-y-4 opacity-0 animate-fade-in-up-4">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-4">
              Página no encontrada
            </h2>
            <p className="text-xl sm:text-2xl text-white/90 max-w-2xl mx-auto leading-relaxed">
              Lo sentimos, la página que buscas no existe, esta en desarrollo o
              ha sido movida.
            </p>
            <p className="text-lg text-white/80">
              Pero no te preocupes, podemos ayudarte a encontrar el camino de
              regreso.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8 opacity-0 animate-fade-in-up-5">
            <Link
              href="/"
              className="inline-block px-8 py-4 bg-white text-blue-500 font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-blue-50 hover:scale-105 active:scale-95"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
