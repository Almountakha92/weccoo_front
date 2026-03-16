import React from 'react'
import { ArrowRight, CheckCircle2, PlayCircle } from 'lucide-react'
import BrandMark from '../components/BrandMark'

interface LandingProps {
  onNavigate: (screen: string) => void
}

const features = [
  {
    title: 'Échange simple',
    description: 'Publie un objet en quelques étapes et trouve rapidement ce dont tu as besoin.'
  },
  {
    title: 'Communauté campus',
    description: "Reste dans un cadre étudiant, avec vérification de l'université."
  },
  {
    title: 'Économies au quotidien',
    description: "Don, prêt ou échange : fais des économies et donne une seconde vie aux objets."
  }
]

export default function Landing({ onNavigate }: LandingProps) {
  const videoUrl = String(import.meta.env.VITE_LANDING_VIDEO_URL || '/videos/presentation.mp4')

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="max-w-6xl mx-auto px-5 sm:px-8 pt-7 pb-6 flex items-center justify-between">
        <BrandMark size="sm" />
        <button
          type="button"
          onClick={() => onNavigate('auth')}
          className="px-5 py-2.5 rounded-full bg-[#1E63D6] text-white font-extrabold shadow-[0_8px_32px_rgba(30,99,214,0.25)] hover:-translate-y-0.5 hover:shadow-[0_12px_36px_rgba(30,99,214,0.35)] transition-all duration-200"
        >
          Continuer
        </button>
      </header>

      <main className="max-w-6xl mx-auto px-5 sm:px-8 pb-14">
        <section className="bg-[#1E63D6] rounded-[28px] p-10 sm:p-14 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-[420px] h-[420px] bg-[radial-gradient(circle,rgba(245,196,0,0.26)_0%,transparent_68%)] rounded-full" />
          <div className="absolute -bottom-16 -left-16 w-[360px] h-[360px] bg-[radial-gradient(circle,rgba(46,204,143,0.18)_0%,transparent_70%)] rounded-full" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 text-white border border-white/15 rounded-full px-4 py-2 text-[13px] font-extrabold mb-5">
                Plateforme d’échange entre étudiants
              </div>
              <h1 className="text-white font-[Cabinet_Grotesk] text-[38px] sm:text-[44px] leading-[1.1] font-extrabold mb-4">
                Échange, partage, <span className="text-[#F5C400]">économise</span> entre étudiants
              </h1>
              <p className="text-white/70 text-[15px] leading-relaxed max-w-[520px] mb-7">
                Une application campus pour donner une seconde vie à tes affaires, trouver de bonnes opportunités et aider ta communauté.
              </p>

              <button
                type="button"
                onClick={() => onNavigate('auth')}
                className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-[#F5C400] text-white font-extrabold text-[14px] shadow-[0_10px_34px_rgba(245,196,0,0.25)] hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(245,196,0,0.35)] transition-all duration-200"
              >
                Continuer
                <ArrowRight className="w-5 h-5 animate-blink-right" />
              </button>
            </div>

            <div className="bg-white/10 border border-white/15 rounded-[22px] p-5 sm:p-7 backdrop-blur-md">
              <div className="flex items-center gap-2 text-white font-extrabold mb-4">
                <PlayCircle className="w-5 h-5" />
                Vidéo de présentation
              </div>
              <div className="rounded-[18px] overflow-hidden bg-black/20 border border-white/10">
                <video
                  controls
                  className="w-full h-[240px] sm:h-[300px] object-cover"
                  preload="metadata"
                >
                  <source src={videoUrl} />
                </video>
              </div>
              <div className="text-[12.5px] text-white/70 mt-3">
                Astuce : place ta vidéo dans <span className="font-bold">public/videos/presentation.mp4</span> ou définis <span className="font-bold">VITE_LANDING_VIDEO_URL</span>.
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-white rounded-[22px] p-6 border border-gray-200 shadow-[0_4px_24px_rgba(15,23,42,0.08)]"
            >
              <div className="flex items-center gap-2 text-[#0F172A] font-extrabold mb-2">
                <CheckCircle2 className="w-5 h-5 text-[#2ECC8F]" />
                {feature.title}
              </div>
              <p className="text-[14px] text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </section>

        <section className="mt-10 bg-white rounded-[22px] p-7 sm:p-9 border border-gray-200 shadow-[0_4px_24px_rgba(15,23,42,0.08)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div>
            <div className="text-[#0F172A] font-extrabold text-[18px] mb-1">Prêt à commencer ?</div>
            <div className="text-[14px] text-gray-600">Connecte-toi ou crée ton compte étudiant en moins d’une minute.</div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('auth')}
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#1E63D6] text-white font-extrabold hover:-translate-y-0.5 transition-all duration-200 shadow-[0_8px_32px_rgba(30,99,214,0.25)]"
          >
            Continuer
            <ArrowRight className="w-5 h-5 animate-blink-right" />
          </button>
        </section>
      </main>
    </div>
  )
}

