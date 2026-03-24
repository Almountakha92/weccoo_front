import React from 'react'
import { ArrowRight, CheckCircle2, PlayCircle } from 'lucide-react'
import BrandMark from '../components/BrandMark'
import { landingMedia } from '../config/landingMedia'

interface LandingProps {
  onNavigate: (screen: string) => void
}

const features = [
  {
    title: 'Publie vite',
    description: 'Ajoute un objet en quelques étapes simples.',
  },
  {
    title: 'Reste entre étudiants',
    description: "Une plateforme pensée pour la communauté campus.",
  },
  {
    title: 'Fais des économies',
    description: 'Don, prêt ou échange selon ton besoin.',
  },
]

export default function Landing({ onNavigate }: LandingProps) {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="lg:hidden">
        <header className="px-4 pt-4 pb-3 flex items-center justify-between">
          <BrandMark size="sm" showWordmark />
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="px-5 py-2.5 rounded-full bg-[#1E63D6] text-white text-sm font-extrabold shadow-[0_8px_24px_rgba(30,99,214,0.22)]"
          >
            Continuer
          </button>
        </header>

        <main className="px-4 pb-8">
          <section className="rounded-[28px] bg-[linear-gradient(180deg,#2D74E6_0%,#1E63D6_100%)] px-5 pt-6 pb-6 shadow-[0_16px_48px_rgba(30,99,214,0.18)] overflow-hidden relative">
            <div className="absolute -top-14 -right-14 w-40 h-40 rounded-full bg-[radial-gradient(circle,rgba(245,196,0,0.24)_0%,transparent_68%)]" />
            <div className="relative z-10">
              <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[12px] font-extrabold text-white/95 mb-4">
                Échange entre étudiants
              </div>
              <h1 className="font-[Cabinet_Grotesk] text-[30px] leading-[0.98] font-extrabold text-white max-w-[8ch]">
                Échange,
                <br />
                partage,
                <br />
                <span className="text-[#F5C400]">économise</span>
              </h1>
              <p className="mt-4 text-[15px] leading-7 text-white/80 max-w-[22ch]">
                Trouve rapidement des objets utiles sur ton campus sans passer par des groupes dispersés.
              </p>
              <div className="mt-6 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => onNavigate('home')}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#F5C400] px-5 py-3.5 text-[15px] font-extrabold text-white shadow-[0_12px_32px_rgba(245,196,0,0.28)]"
                >
                  Explorer maintenant
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('auth')}
                  className="w-full inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-5 py-3.5 text-[14px] font-bold text-white"
                >
                  Se connecter / s’inscrire
                </button>
              </div>
            </div>
          </section>

          <section className="mt-4 grid grid-cols-1 gap-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-[18px] border border-gray-200 bg-white p-4 shadow-[0_6px_24px_rgba(15,23,42,0.06)]"
              >
                <div className="mb-1 flex items-center gap-2 text-[#0F172A] font-extrabold">
                  <CheckCircle2 className="w-4 h-4 text-[#2ECC8F]" />
                  {feature.title}
                </div>
                <p className="text-[13px] leading-6 text-gray-600">{feature.description}</p>
              </div>
            ))}
          </section>

          <section className="mt-4 rounded-[20px] border border-gray-200 bg-white p-4 shadow-[0_6px_24px_rgba(15,23,42,0.06)]">
            <div className="mb-2 text-[17px] font-extrabold text-[#0F172A]">Voir la présentation</div>
            <p className="mb-3 text-[13px] leading-6 text-gray-600">
              Une courte vidéo pour comprendre rapidement le principe de WECCOO.
            </p>
            <div className="overflow-hidden rounded-[16px] bg-[#0F172A]">
              <video
                controls
                playsInline
                preload="metadata"
                poster={landingMedia.posterUrl}
                className="h-[210px] w-full object-cover"
              >
                <source src={landingMedia.videoUrl} type="video/mp4" />
              </video>
            </div>
          </section>

          <section className="mt-4 rounded-[20px] bg-[#0F172A] px-5 py-5 text-white shadow-[0_12px_36px_rgba(15,23,42,0.16)]">
            <div className="text-[18px] font-extrabold">Prêt à commencer ?</div>
            <p className="mt-2 text-[14px] leading-6 text-white/75">
              Parcours les publications librement, puis connecte-toi quand tu veux publier ou contacter un propriétaire.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="mt-4 w-full rounded-full bg-white px-5 py-3 text-[14px] font-extrabold text-[#0F172A]"
            >
              Accéder à l’accueil
            </button>
          </section>
        </main>
      </div>

      <div className="hidden lg:block">
        <header className="max-w-7xl mx-auto px-8 xl:px-10 pt-7 pb-6 flex items-center justify-between">
          <BrandMark size="sm" showWordmark />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate('adminAuth')}
              className="px-5 py-2.5 rounded-full bg-white text-[#0F172A] font-extrabold border border-gray-200 shadow-[0_6px_18px_rgba(15,23,42,0.06)] hover:-translate-y-0.5 transition-all duration-200"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="px-5 py-2.5 rounded-full bg-[#1E63D6] text-white font-extrabold shadow-[0_8px_32px_rgba(30,99,214,0.25)] hover:-translate-y-0.5 hover:shadow-[0_12px_36px_rgba(30,99,214,0.35)] transition-all duration-200"
            >
              Continuer
            </button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-8 xl:px-10 pb-16">
          <section className="bg-[linear-gradient(135deg,#1E63D6_0%,#2D74E6_58%,#3C82EE_100%)] rounded-[36px] px-14 py-16 xl:px-16 xl:py-18 relative overflow-hidden shadow-[0_28px_80px_rgba(30,99,214,0.18)]">
            <div className="absolute -top-28 -right-24 w-[460px] h-[460px] bg-[radial-gradient(circle,rgba(245,196,0,0.22)_0%,transparent_68%)] rounded-full" />
            <div className="absolute -bottom-20 -left-20 w-[380px] h-[380px] bg-[radial-gradient(circle,rgba(46,204,143,0.18)_0%,transparent_70%)] rounded-full" />
            <div className="absolute inset-y-0 right-[44%] w-px bg-white/8" />

            <div className="relative z-10 grid grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)] gap-14 items-center">
              <div className="max-w-[620px]">
                <div className="inline-flex items-center gap-2 bg-white/12 text-white border border-white/15 rounded-full px-4 py-2 text-[13px] font-extrabold mb-6 backdrop-blur-sm">
                  Plateforme d’échange entre étudiants
                </div>
                <h1 className="text-white font-[Cabinet_Grotesk] text-[58px] xl:text-[64px] leading-[0.98] font-extrabold tracking-[-0.03em] mb-5">
                  Échange,
                  <br />
                  partage,
                  <br />
                  <span className="text-[#F5C400]">économise</span> entre étudiants
                </h1>
                <p className="text-white/78 text-[19px] leading-9 max-w-[560px] mb-8">
                  Une application campus pour donner une seconde vie à tes affaires, trouver de bonnes opportunités et aider ta communauté étudiante.
                </p>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onNavigate('home')}
                    className="group inline-flex items-center gap-2.5 px-7 py-4 rounded-full bg-[#F5C400] text-white font-extrabold text-[15px] shadow-[0_12px_40px_rgba(245,196,0,0.28)] hover:-translate-y-0.5 hover:shadow-[0_14px_46px_rgba(245,196,0,0.36)] transition-all duration-200"
                  >
                    Explorer maintenant
                    <ArrowRight className="w-5 h-5 animate-blink-right" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('auth')}
                    className="inline-flex items-center gap-2.5 px-7 py-4 rounded-full border border-white/16 bg-white/10 text-white font-extrabold text-[15px] backdrop-blur-sm hover:bg-white/14 transition-all duration-200"
                  >
                    Se connecter
                  </button>
                </div>
              </div>

              <div className="rounded-[30px] border border-white/12 bg-white/10 p-7 backdrop-blur-md shadow-[0_18px_56px_rgba(15,23,42,0.16)]">
                <div className="flex items-center gap-2 text-white font-extrabold text-[17px] mb-4">
                  <PlayCircle className="w-5 h-5" />
                  Vidéo de présentation
                </div>
                <div className="rounded-[22px] overflow-hidden bg-[#0F172A]/80 border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                  <video
                    autoPlay
                    controls
                    loop
                    muted
                    playsInline
                    className="w-full aspect-[16/10] object-cover"
                    preload="metadata"
                    poster={landingMedia.posterUrl}
                  >
                    <source src={landingMedia.videoUrl} type="video/mp4" />
                  </video>
                </div>
                <div className="text-[13px] leading-6 text-white/72 mt-4 max-w-[520px]">
                  Présente rapidement le fonctionnement de WECCOO avec une courte vidéo de démonstration.
                </div>
              </div>
            </div>
          </section>

          <section className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-[24px] p-6 border border-gray-200 shadow-[0_8px_28px_rgba(15,23,42,0.07)]"
              >
                <div className="flex items-center gap-2 text-[#0F172A] font-extrabold mb-2">
                  <CheckCircle2 className="w-5 h-5 text-[#2ECC8F]" />
                  {feature.title}
                </div>
                <p className="text-[14px] text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </section>

          <section className="mt-10 bg-white rounded-[24px] p-9 border border-gray-200 shadow-[0_8px_28px_rgba(15,23,42,0.07)] flex items-center justify-between gap-5">
            <div>
              <div className="text-[#0F172A] font-extrabold text-[18px] mb-1">Prêt à commencer ?</div>
              <div className="text-[14px] text-gray-600">Connecte-toi ou crée ton compte étudiant en moins d’une minute.</div>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#1E63D6] text-white font-extrabold hover:-translate-y-0.5 transition-all duration-200 shadow-[0_8px_32px_rgba(30,99,214,0.25)]"
            >
              Continuer
              <ArrowRight className="w-5 h-5 animate-blink-right" />
            </button>
          </section>
        </main>
      </div>
    </div>
  )
}
