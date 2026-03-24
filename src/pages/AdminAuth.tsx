import React from 'react'
import BrandMark from '../components/BrandMark'
import { adminLogin, confirmAdminMfa } from '../services/adminAuthApi'
import { setAdminToken } from '../services/adminAuthToken'

interface AdminAuthProps {
  onNavigate: (screen: string) => void
  onShowToast: (message: string, type?: string) => void
  onAdminAuthSuccess: (token: string) => void
}

export default function AdminAuth({ onNavigate, onShowToast, onAdminAuthSuccess }: AdminAuthProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [setup, setSetup] = React.useState<null | { preAuthToken: string; secret: string; otpauthUrl: string }>(null)
  const [form, setForm] = React.useState({
    email: '',
    password: '',
    otp: '',
    setupOtp: ''
  })

  const handleLogin = async () => {
    if (!form.email.trim() || !form.password.trim()) {
      onShowToast('Renseigne email et mot de passe admin.', 'error')
      return
    }

    try {
      setIsSubmitting(true)
      const response = await adminLogin({ email: form.email, password: form.password, otp: form.otp || undefined })

      if (response.data.mfaSetupRequired) {
        setSetup({
          preAuthToken: response.data.preAuthToken,
          secret: response.data.secret,
          otpauthUrl: response.data.otpauthUrl
        })
        onShowToast('MFA requis: configure ton application puis confirme le code OTP.', 'success')
        return
      }

      setAdminToken(response.data.token)
      onAdminAuthSuccess(response.data.token)
      onShowToast('Connexion admin réussie.', 'success')
      setTimeout(() => onNavigate('admin'), 500)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur de connexion admin.'
      onShowToast(message, 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleConfirmMfa = async () => {
    if (!setup) return
    if (!form.setupOtp.trim()) {
      onShowToast('Renseigne le code OTP.', 'error')
      return
    }

    try {
      setIsSubmitting(true)
      const response = await confirmAdminMfa({ preAuthToken: setup.preAuthToken, otp: form.setupOtp })
      setAdminToken(response.data.token)
      onAdminAuthSuccess(response.data.token)
      onShowToast('MFA activé, connexion admin OK.', 'success')
      setTimeout(() => onNavigate('admin'), 500)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Confirmation MFA impossible.'
      onShowToast(message, 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-[#F2F2F2] min-h-screen flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-[28px] p-6 sm:p-12 w-full max-w-[520px] shadow-[0_8px_40px_rgba(15,23,42,0.12)] border border-[#E5E7EB]">
        <div className="text-center mb-8">
          <BrandMark size="md" className="justify-center mb-3.5" showWordmark={false} />
          <h2 className="font-[Cabinet_Grotesk] text-[22px] font-extrabold text-[#0F172A]">Back-office</h2>
          <p className="text-[14px] text-gray-500 mt-1">Connexion admin (super_admin / campus_admin)</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[12px] font-extrabold text-gray-700 mb-1.5">Email</label>
            <input
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="admin@weccoo.sn"
              className="w-full px-4 py-3 rounded-[14px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1E63D6]/30"
            />
          </div>

          <div>
            <label className="block text-[12px] font-extrabold text-gray-700 mb-1.5">Mot de passe</label>
            <input
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              type="password"
              placeholder="********"
              className="w-full px-4 py-3 rounded-[14px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1E63D6]/30"
            />
          </div>

          <div>
            <label className="block text-[12px] font-extrabold text-gray-700 mb-1.5">OTP (si déjà activé)</label>
            <input
              value={form.otp}
              onChange={(e) => setForm((prev) => ({ ...prev, otp: e.target.value }))}
              placeholder="123456"
              inputMode="numeric"
              disabled={Boolean(setup)}
              className="w-full px-4 py-3 rounded-[14px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1E63D6]/30"
            />
            {setup && <div className="text-[12px] text-gray-500 mt-1">MFA en cours de configuration: utilise le champ OTP dans le bloc ci-dessous.</div>}
          </div>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleLogin}
            className="w-full px-6 py-3.5 rounded-full bg-[#1E63D6] text-white font-extrabold hover:-translate-y-0.5 transition-all duration-200 shadow-[0_8px_32px_rgba(30,99,214,0.25)] disabled:opacity-60 disabled:hover:translate-y-0"
          >
            {isSubmitting ? 'Connexion…' : 'Se connecter'}
          </button>

          {setup && (
            <div className="mt-6 rounded-[18px] border border-gray-200 bg-[#F8FAFC] p-4">
              <div className="text-[#0F172A] font-extrabold mb-1">Configurer MFA (1 fois)</div>
              <div className="text-[13px] text-gray-600 mb-3">
                Ajoute un compte dans Google Authenticator / Microsoft Authenticator avec ce secret, puis saisis le code OTP (6 chiffres) pour activer.
              </div>
              <div className="text-[12px] font-extrabold text-gray-700">Secret</div>
              <div className="text-[12px] font-mono break-all bg-white border border-gray-200 rounded-[12px] p-2 mt-1 mb-3">
                {setup.secret}
              </div>
              <div className="text-[12px] font-extrabold text-gray-700">otpauth URL</div>
              <div className="text-[12px] font-mono break-all bg-white border border-gray-200 rounded-[12px] p-2 mt-1 mb-3">
                {setup.otpauthUrl}
              </div>

              <div className="mb-3">
                <div className="text-[12px] font-extrabold text-gray-700 mb-1.5">OTP (depuis l’application)</div>
                <input
                  value={form.setupOtp}
                  onChange={(e) => setForm((prev) => ({ ...prev, setupOtp: e.target.value }))}
                  placeholder="123456"
                  inputMode="numeric"
                  className="w-full px-4 py-3 rounded-[14px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#F5C400]/30 bg-white"
                />
              </div>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmMfa}
                className="w-full px-6 py-3 rounded-full bg-[#F5C400] text-white font-extrabold shadow-[0_10px_34px_rgba(245,196,0,0.25)] disabled:opacity-60"
              >
                {isSubmitting ? 'Validation…' : 'Confirmer MFA'}
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => onNavigate('landing')}
            className="w-full text-[13px] text-gray-600 font-bold hover:text-gray-800"
          >
            ← Retour
          </button>
        </div>
      </div>
    </div>
  )
}
