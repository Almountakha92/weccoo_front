import React from 'react'
import { Mail, Lock, Eye, User, GraduationCap, ArrowRight, Phone } from 'lucide-react'
import type { AuthResponseDto } from '../dto'
import { login, signup, verifyUniversityEmail } from '../services/authApi'
import { setAuthToken, setAuthUser } from '../services/authToken'
import { signupSchema } from '../validation/auth.schema'
import BrandMark from '../components/BrandMark'
import { fetchCampuses } from '../services/campusApi'
import type { CampusDto } from '../dto'

interface AuthProps {
  onNavigate: (screen: string) => void
  onShowToast: (message: string, type?: string) => void
  onAuthSuccess: (session: AuthResponseDto) => void
}

export default function Auth({ onNavigate, onShowToast, onAuthSuccess }: AuthProps) {
  const [activeTab, setActiveTab] = React.useState<'login' | 'signup'>('login')
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [showLoginPassword, setShowLoginPassword] = React.useState(false)
  const [showSignupPassword, setShowSignupPassword] = React.useState(false)
  const [campuses, setCampuses] = React.useState<CampusDto[]>([])
  const [isCampusesLoading, setIsCampusesLoading] = React.useState(false)
  const [loginForm, setLoginForm] = React.useState({
    email: '',
    password: ''
  })
  const [signupForm, setSignupForm] = React.useState({
    fullName: '',
    university: '',
    email: '',
    whatsappPhone: '',
    password: '',
    campusId: ''
  })

  React.useEffect(() => {
    void (async () => {
      try {
        setIsCampusesLoading(true)
        const response = await fetchCampuses()
        setCampuses(response.data)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Impossible de charger les campus.'
        onShowToast(message, 'error')
        setCampuses([])
      } finally {
        setIsCampusesLoading(false)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleLogin = async () => {
    if (!loginForm.email.trim() || !loginForm.password.trim()) {
      onShowToast('Renseigne ton email et ton mot de passe.', 'error')
      return
    }

    try {
      setIsSubmitting(true)
      const response = await login(loginForm)
      setAuthToken(response.data.token)
      setAuthUser(response.data.user)
      onAuthSuccess(response.data)
      onShowToast(`${response.message} Bienvenue ${response.data.user.fullName}`, 'success')
      setTimeout(() => onNavigate('home'), 900)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur de connexion au serveur.'
      onShowToast(message, 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSignup = async () => {
    const parsed = signupSchema.safeParse(signupForm)

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]
      onShowToast(firstIssue?.message ?? 'Formulaire invalide.', 'error')
      return
    }

    try {
      setIsSubmitting(true)
      const verification = await verifyUniversityEmail({
        email: parsed.data.email,
        university: parsed.data.university
      })

      if (!verification.data.exists) {
        onShowToast(
          `L'email universitaire saisi ne se trouve pas dans la base de donnée de l'université (${parsed.data.university}).`,
          'error'
        )
        return
      }

      const response = await signup(parsed.data)
      setActiveTab('login')
      setLoginForm({
        email: parsed.data.email,
        password: ''
      })
      setSignupForm({
        fullName: '',
        university: '',
        email: '',
        whatsappPhone: '',
        password: '',
        campusId: ''
      })
      onShowToast(`${response.message} Connecte-toi maintenant pour acceder a ton compte.`, 'success')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur de connexion au serveur.'
      onShowToast(message, 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const fieldWrapperClassName =
    'w-full min-h-[56px] flex items-center gap-2.5 bg-gray-100 rounded-[16px] px-4 py-3 border-2 border-transparent focus-within:border-[#1E63D6] focus-within:bg-white transition-all duration-180'
  const fieldInputClassName =
    "flex-1 bg-transparent border-none outline-none text-[14.5px] text-[#0F172A] font-['Satoshi'] placeholder:text-[#94A3B8]"

  return (
    <div className="bg-[#F2F2F2] min-h-screen flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-[28px] p-6 sm:p-12 w-full max-w-[440px] shadow-[0_8px_40px_rgba(15,23,42,0.12)] border border-[#E5E7EB]">
        {/* Logo */}
        <div className="text-center mb-8">
          <BrandMark size="md" className="justify-center mb-3.5" showWordmark={false} />
          <h2 className="font-[Cabinet_Grotesk] text-[34px] leading-none font-extrabold text-[#1E63D6]">Wec<span className="text-[#F5C400]">coo</span></h2>
          <p className="text-[14px] text-gray-500 mt-1">La communauté d'echange étudiante</p>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-full p-1 mb-7">
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-2.5 rounded-full text-[14px] font-bold cursor-pointer transition-all duration-200 border-none bg-none font-['Satoshi'] ${
              activeTab === 'login'
                ? 'bg-white text-[#0F172A] shadow-[0_4px_24px_rgba(15,23,42,0.08)]'
                : 'text-gray-500'
            }`}
          >
            Connexion
          </button>
          <button
            onClick={() => setActiveTab('signup')}
            className={`flex-1 py-2.5 rounded-full text-[14px] font-bold cursor-pointer transition-all duration-200 border-none bg-none font-['Satoshi'] ${
              activeTab === 'signup'
                ? 'bg-white text-[#0F172A] shadow-[0_4px_24px_rgba(15,23,42,0.08)]'
                : 'text-gray-500'
            }`}
          >
            Inscription
          </button>
        </div>
        {/* Login Form */}
        {activeTab === 'login' && (
          <div>
            <div className="mb-4.5">
              <label className="text-[13px] font-bold text-[#0F172A] mb-2 block">Email universitaire</label>
              <div className={fieldWrapperClassName}>
                <Mail className="w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  placeholder="prenom.nom@universite.edu.sn"
                  autoComplete="nope"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                  className={fieldInputClassName}
                />
              </div>
            </div>

            <div className="mb-5">
              <label className="text-[13px] font-bold text-[#0F172A] mb-2 block">Mot de passe</label>
              <div className={fieldWrapperClassName}>
                <Lock className="w-5 h-5 text-gray-500" />
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  placeholder="........"
                  autoComplete="new-password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && !isSubmitting && handleLogin()}
                  className={fieldInputClassName}
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword((current) => !current)}
                  className="text-gray-500 hover:text-[#1E63D6] transition-colors"
                  aria-label={showLoginPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  <Eye className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="text-right mb-5">
              <span className="text-[13px] text-[#1E63D6] font-bold cursor-pointer  ">Mot de passe oublie ?</span>
            </div>

            <button
              onClick={handleLogin}
              disabled={isSubmitting}
              className="w-full min-h-[56px] py-3.75 rounded-full text-[15px] font-extrabold bg-[#1E63D6] text-white border-none cursor-pointer shadow-[0_8px_32px_rgba(30,99,214,0.25)] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(30,99,214,0.4)] transition-all duration-200 font-['Cabinet_Grotesk'] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Connexion...' : 'Se connecter'}
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center text-[13px] text-gray-500 my-5 relative">
              <span className="absolute top-1/2 left-0 right-0 h-px bg-gray-200" />
              <span className="relative bg-white px-3">Vous n'avez pas de compte ?</span>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('signup')}
              className="w-full min-h-[56px] py-3.25 rounded-[16px] border-2 border-gray-200 bg-white flex items-center justify-center gap-2.5 text-[14px] font-bold text-[#0F172A] cursor-pointer hover:border-[#1E63D6] hover:bg-[#E6EDFC] transition-all duration-180 font-['Satoshi']"
            >
              <span className="text-xl font-bold"></span> Creer un compte
            </button>
          </div>
        )}

        {/* Signup Form */}
        {activeTab === 'signup' && (
          <div>
            <div className="mb-4.5">
              <label className="text-[13px] font-bold text-[#0F172A] mb-2 block">Prenom et Nom</label>
              <div className={fieldWrapperClassName}>
                <User className="w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Baye Leyty Mountakha"
                  autoComplete="nope"
                  value={signupForm.fullName}
                  onChange={(e) => setSignupForm(prev => ({ ...prev, fullName: e.target.value }))}
                  className={fieldInputClassName}
                />
              </div>
            </div>

            <div className="mb-4.5">
              <label className="text-[13px] font-bold text-[#0F172A] mb-2 block">Email universitaire *</label>
              <div className={fieldWrapperClassName}>
                <Mail className="w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  placeholder="prenom.nom@universite.edu.sn"
                  autoComplete="nope"
                  value={signupForm.email}
                  onChange={(e) => setSignupForm(prev => ({ ...prev, email: e.target.value }))}
                  className={fieldInputClassName}
                />
              </div>
            </div>

            <div className="mb-4.5">
              <label className="text-[13px] font-bold text-[#0F172A] mb-2 block">Universite / Ecole</label>
              <div className={fieldWrapperClassName}>
                <GraduationCap className="w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="ucad,ugb..."
                  autoComplete="new-password"
                  value={signupForm.university}
                  onChange={(e) => setSignupForm(prev => ({ ...prev, university: e.target.value }))}
                  className={fieldInputClassName}
                />
              </div>
            </div>

            <div className="mb-4.5">
              <label className="text-[13px] font-bold text-[#0F172A] mb-2 block">Campus *</label>
              <div className={fieldWrapperClassName}>
                <GraduationCap className="w-5 h-5 text-gray-500" />
                <select
                  value={signupForm.campusId}
                  onChange={(e) => setSignupForm(prev => ({ ...prev, campusId: e.target.value }))}
                  className={fieldInputClassName}
                  disabled={isCampusesLoading || campuses.length === 0}
                >
                  <option value="">{isCampusesLoading ? 'Chargement...' : 'Choisir un campus'}</option>
                  {campuses.map((campus) => (
                    <option key={campus.id} value={campus.id}>
                      {campus.name}
                    </option>
                  ))}
                </select>
              </div>
              {campuses.length === 0 && !isCampusesLoading && (
                <div className="text-[12px] text-gray-500 mt-1">
                  Aucun campus disponible. Demande au super admin d’en créer un dans le back-office.
                </div>
              )}
            </div>

            <div className="mb-4.5">
              <label className="text-[13px] font-bold text-[#0F172A] mb-2 block">Numéro WhatsApp *</label>
              <div className={fieldWrapperClassName}>
                <Phone className="w-5 h-5 text-gray-500" />
                <input
                  type="tel"
                  placeholder="221771234567"
                  autoComplete="nope"
                  value={signupForm.whatsappPhone}
                  onChange={(e) => setSignupForm(prev => ({ ...prev, whatsappPhone: e.target.value }))}
                  className={fieldInputClassName}
                />
              </div>
            </div>

            <div className="mb-5">
              <label className="text-[13px] font-bold text-[#0F172A] mb-2 block">Mot de passe</label>
              <div className={fieldWrapperClassName}>
                <Lock className="w-5 h-5 text-gray-500" />
                <input
                  type={showSignupPassword ? 'text' : 'password'}
                  placeholder="Min. 8 caracteres"
                  autoComplete="new-password"
                  value={signupForm.password}
                  onChange={(e) => setSignupForm(prev => ({ ...prev, password: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && !isSubmitting && handleSignup()}
                  className={fieldInputClassName}
                />
                <button
                  type="button"
                  onClick={() => setShowSignupPassword((current) => !current)}
                  className="text-gray-500 hover:text-[#1E63D6] transition-colors"
                  aria-label={showSignupPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  <Eye className="w-5 h-5" />
                </button>
              </div>
            </div>

            <button
              onClick={handleSignup}
              disabled={isSubmitting}
              className="w-full min-h-[56px] py-3.75 rounded-full text-[15px] font-extrabold bg-[#1E63D6] text-white border-none cursor-pointer shadow-[0_8px_32px_rgba(30,99,214,0.25)] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(30,99,214,0.4)] transition-all duration-200 font-['Cabinet_Grotesk'] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Inscription...' : 'Creer mon compte'}
            </button>

            <div className="text-center text-[13px] text-gray-500 my-5 relative">
              <span className="absolute top-1/2 left-0 right-0 h-px bg-gray-200" />
              <span className="relative bg-white px-3">Déjà un compte ?</span>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('login')}
              className="w-full min-h-[56px] py-3.25 rounded-[16px] border-2 border-gray-200 bg-white flex items-center justify-center gap-2.5 text-[14px] font-bold text-[#0F172A] cursor-pointer hover:border-[#1E63D6] hover:bg-[#E6EDFC] transition-all duration-180 font-['Satoshi']"
            >
              Revenir à la connexion
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
