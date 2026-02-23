import { Layers, ImageUpscale, Upload } from "lucide-react";
import { Link } from "react-router-dom";

export function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="relative bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 h-22 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-slate-200 p-2 rounded-lg size-8 flex items-center justify-center">
              <Layers className="size-6 text-slate-600" />
            </div>
            <div className="flex gap-2 items-center">
              <span className="text-lg text-slate-700 font-bold">Kayla</span>
              <span className="text-xs text-slate-500">Tools</span>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="flex items-center gap-3 mb-10">
                <div className="rounded-xl flex items-center justify-center">
                  <ImageUpscale className="size-10 text-slate-300" />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold">BR Tools</span>
                  <span className="text-xs text-slate-500">Suite de ferramentas gratuitas</span>
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                Otimize suas imagens com rapidez
              </h1>
              <p className="mt-4 text-lg text-slate-600 max-w-xl">
                Ferramentas gratuitas para recortar, redimensionar e comprimir imagens em lote.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-slate-900 text-white text-sm font-medium hover:bg-slate-800"
                >
                  <Upload className="w-4 h-4" />
                  Smart Resize &amp; Crop
                </Link>
              </div>
            </div>
            <div className="relative" />
          </div>
        </div>
      </header>
    </div>
  );
}
