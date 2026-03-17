import React from 'react'
import { Camera } from 'lucide-react'
import type { ItemResponseDto } from '../dto'
import { publishTypeOptionsDto, type PublishItemProps } from '../dto'
import { publishItemMessages } from '../messages'
import { createItem } from '../services/itemApi'
import BrandMark from '../components/BrandMark'

interface PublishItemPageProps extends PublishItemProps {
  onItemCreated: (item: ItemResponseDto) => void
}

export default function PublishItem({ onNavigate, onShowToast, onItemCreated }: PublishItemPageProps) {
  const [selectedType, setSelectedType] = React.useState('don')
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [photos, setPhotos] = React.useState<string[]>([])
  const [photoError, setPhotoError] = React.useState<string | null>(null)
  const [isCameraOpen, setIsCameraOpen] = React.useState(false)
  const [cameraError, setCameraError] = React.useState<string | null>(null)
  const [isExchangeFormOpen, setIsExchangeFormOpen] = React.useState(false)
  const [exchangeNature, setExchangeNature] = React.useState<'vente' | 'echange_article' | ''>('')
  const [exchangePrice, setExchangePrice] = React.useState('')
  const [exchangeNeed, setExchangeNeed] = React.useState('')
  const [exchangeError, setExchangeError] = React.useState<string | null>(null)
  const [isLoanFormOpen, setIsLoanFormOpen] = React.useState(false)
  const [loanPrice, setLoanPrice] = React.useState('')
  const [loanPaymentType, setLoanPaymentType] = React.useState<'unique' | 'tranche' | 'mensuel' | 'autre' | ''>('')
  const [loanDuration, setLoanDuration] = React.useState('')
  const [form, setForm] = React.useState({
    title: '',
    category: '',
    description: '',
    condition: 'Tres bon etat',
    type: 'don' as 'don' | 'echange' | 'pret',
    location: 'Université Paris-Saclay'
  })

  const filePickerRef = React.useRef<HTMLInputElement | null>(null)
  const cameraPickerRef = React.useRef<HTMLInputElement | null>(null)
  const videoRef = React.useRef<HTMLVideoElement | null>(null)
  const mediaStreamRef = React.useRef<MediaStream | null>(null)

  const maxFiles = 5
  const maxSizeBytes = 5 * 1024 * 1024

  const resetExchangeDetails = () => {
    setExchangeNature('')
    setExchangePrice('')
    setExchangeNeed('')
    setExchangeError(null)
    setIsExchangeFormOpen(false)
  }

  const resetLoanDetails = () => {
    setLoanPrice('')
    setLoanPaymentType('')
    setLoanDuration('')
    setIsLoanFormOpen(false)
  }

  const buildDescription = (base: string) => {
    if (selectedType !== 'echange' && selectedType !== 'pret') return base

    const parts: string[] = []

    if (selectedType === 'echange') {
      if (exchangeNature === 'vente') {
        parts.push("Nature de l'échange : Vente")
        const trimmedPrice = exchangePrice.trim()
        if (trimmedPrice) {
          parts.push(`Prix : ${trimmedPrice}`)
        }
      } else if (exchangeNature === 'echange_article') {
        parts.push("Nature de l'échange : Échange avec autre article")
        const trimmedNeed = exchangeNeed.trim()
        if (trimmedNeed) {
          parts.push(`Recherche : ${trimmedNeed}`)
        }
      }
    }

    if (selectedType === 'pret') {
      parts.push('Conditions du prêt :')
      const trimmedLoanPrice = loanPrice.trim()
      if (trimmedLoanPrice) {
        parts.push(`Prix : ${trimmedLoanPrice}`)
      }
      if (loanPaymentType) {
        const paymentLabel =
          loanPaymentType === 'unique'
            ? 'Paiement en une fois'
            : loanPaymentType === 'tranche'
              ? 'Paiement par tranche'
              : loanPaymentType === 'mensuel'
                ? 'Paiement mensuel'
                : 'Autre'
        parts.push(`Paiement : ${paymentLabel}`)
      }
      const trimmedDuration = loanDuration.trim()
      if (trimmedDuration) {
        parts.push(`Durée / contrat : ${trimmedDuration}`)
      }
    }

    if (parts.length === 0) return base

    const normalizedBase = base.trim()
    const metaBlock = parts.join('\n')
    return normalizedBase ? `${metaBlock}\n\n${normalizedBase}` : metaBlock
  }

  const addFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const nextPhotos: string[] = []

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) {
        continue
      }
      if (file.size > maxSizeBytes) {
        onShowToast('Photo trop lourde (max 5 Mo).', 'error')
        continue
      }

      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result))
        reader.onerror = () => reject(new Error('read_error'))
        reader.readAsDataURL(file)
      })

      nextPhotos.push(dataUrl)
      if (photos.length + nextPhotos.length >= maxFiles) break
    }

    setPhotos((current) => {
      const merged = [...current, ...nextPhotos]
      const sliced = merged.slice(0, maxFiles)
      if (sliced.length > 0) {
        setPhotoError(null)
      }
      return sliced
    })
  }

  const openCamera = async () => {
    if (photos.length >= maxFiles) {
      onShowToast(`Maximum ${maxFiles} photos.`, 'error')
      return
    }

    // Some browsers require HTTPS (or localhost) for camera access.
    if (!window.isSecureContext) {
      onShowToast("La caméra nécessite HTTPS. Utilise 'Télécharger' si besoin.", 'error')
      cameraPickerRef.current?.click()
      return
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      cameraPickerRef.current?.click()
      return
    }

    setCameraError(null)
    setIsCameraOpen(true)
  }

  const closeCamera = () => {
    setIsCameraOpen(false)
  }

  const captureFromCamera = () => {
    const video = videoRef.current
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
      onShowToast('Caméra non prête.', 'error')
      return
    }

    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      onShowToast('Capture impossible.', 'error')
      return
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85)

    // Rough estimate, not exact, but good enough to avoid massive payloads.
    const approxBytes = Math.ceil((dataUrl.length - 'data:image/jpeg;base64,'.length) * 0.75)
    if (approxBytes > maxSizeBytes) {
      onShowToast('Photo trop lourde (max 5 Mo).', 'error')
      return
    }

    setPhotos((current) => {
      const merged = [...current, dataUrl].slice(0, maxFiles)
      if (merged.length > 0) setPhotoError(null)
      return merged
    })
    closeCamera()
  }

  React.useEffect(() => {
    if (!isCameraOpen) {
      // Stop stream when modal closes
      if (mediaStreamRef.current) {
        for (const track of mediaStreamRef.current.getTracks()) track.stop()
        mediaStreamRef.current = null
      }
      return
    }

    let cancelled = false

    ;(async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false
        })

        if (cancelled) {
          for (const track of stream.getTracks()) track.stop()
          return
        }

        mediaStreamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play().catch(() => {})
        }
      } catch (_error) {
        setCameraError("Impossible d'ouvrir la caméra. Autorise la permission ou utilise 'Télécharger'.")
        setIsCameraOpen(false)
        cameraPickerRef.current?.click()
      }
    })()

    return () => {
      cancelled = true
    }
  }, [isCameraOpen])

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.category.trim() || !form.description.trim() || !form.location.trim()) {
      onShowToast('Complete les champs obligatoires.', 'error')
      return
    }
    if (photos.length === 0) {
      const message = 'Ajoute au moins une photo.'
      setPhotoError(message)
      onShowToast(message, 'error')
      return
    }

    if (selectedType === 'echange' && !exchangeNature) {
      setExchangeError("Choisis la nature de l'échange.")
      setIsExchangeFormOpen(true)
      onShowToast("Précise la nature de l'échange.", 'error')
      return
    }

    try {
      setIsSubmitting(true)
      const response = await createItem({
        ...form,
        type: selectedType as 'don' | 'echange' | 'pret',
        description: buildDescription(form.description),
        photos
      })
      onItemCreated(response.data)
      onShowToast(publishItemMessages.publishSuccess, 'success')
      setTimeout(() => onNavigate('list'), 900)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Publication impossible.'
      onShowToast(message, 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-gray-100 w-full h-full p-9 max-lg:p-5 max-md:pb-24 border-t-4 border-[#1E63D6] flex flex-col items-center">
      {/* Header */}
      <div className="mb-7 w-full max-w-2xl">
        <BrandMark size="sm" className="mb-4" />
        <h2 className="font-[Cabinet_Grotesk] text-[28px] font-extrabold text-[#0F172A] mb-1">Publier un objet</h2>
        <p className="text-[14.5px] text-gray-500">Donne une seconde vie à tes affaires en 3 étapes</p>
      </div>

      {/* Progress Steps */}
      <div className="flex gap-0 w-full max-w-2xl border-b border-gray-200 pb-6 flex-wrap">
        <div className="flex-1 text-center">
          <div className="w-9 h-9 rounded-full bg-[#1E63D6] text-white font-extrabold text-[15px] flex items-center justify-center mx-auto mb-2">1</div>
          <div className="text-[12px] font-bold text-[#1E63D6]">Photos</div>
        </div>
        <div className="flex-1 h-0.5 bg-[#1E63D6] mt-[18px]" />
        <div className="flex-1 text-center">
          <div className="w-9 h-9 rounded-full bg-[#1E63D6] text-white font-extrabold text-[15px] flex items-center justify-center mx-auto mb-2">2</div>
          <div className="text-[12px] font-bold text-[#1E63D6]">Infos</div>
        </div>
        <div className="flex-1 h-0.5 bg-gray-200 mt-[18px]" />
        <div className="flex-1 text-center">
          <div className="w-9 h-9 rounded-full bg-gray-200 text-gray-500 font-extrabold text-[15px] flex items-center justify-center mx-auto mb-2">3</div>
          <div className="text-[12px] font-bold text-gray-500">Publier</div>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-[20px] p-6 sm:p-8 w-full max-w-2xl shadow-[0_4px_24px_rgba(15,23,42,0.08)]">
        {/* Photo Upload */}
        <div
          onClick={() => filePickerRef.current?.click()}
          className={`border-2 border-dashed rounded-[20px] p-6 sm:p-10 text-center cursor-pointer transition-all duration-200 hover:border-[#1E63D6] hover:bg-[#E8FAF3] mb-2 ${
            photoError ? 'border-rose-400 bg-rose-50/40' : 'border-gray-300'
          }`}
        >
          <Camera className="w-10 h-10 text-gray-400 mx-auto mb-3" />
          <div className="text-[14.5px] text-gray-700 font-semibold">Ajouter des photos *</div>
          <div className="text-[12.5px] text-gray-500 mt-1">PNG, JPG - Max 5 Mo par photo</div>
          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                void openCamera()
              }}
              className="px-4 py-2 rounded-full bg-[#1E63D6] text-white text-[12.5px] font-bold hover:bg-[#174FA9] transition-colors"
            >
              Prendre une photo
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                filePickerRef.current?.click()
              }}
              className="px-4 py-2 rounded-full bg-white border border-gray-200 text-[#0F172A] text-[12.5px] font-bold hover:bg-gray-50 transition-colors"
            >
              Télécharger
            </button>
          </div>
        </div>
        {photoError && (
          <div className="text-[12.5px] text-rose-600 font-semibold mb-4">{photoError}</div>
        )}
        {cameraError && (
          <div className="text-[12.5px] text-rose-600 font-semibold mb-4">{cameraError}</div>
        )}

        <input
          ref={filePickerRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => void addFiles(e.target.files)}
        />
        <input
          ref={cameraPickerRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => void addFiles(e.target.files)}
        />

        {isCameraOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-white rounded-[18px] w-full max-w-[520px] overflow-hidden shadow-[0_18px_70px_rgba(0,0,0,0.30)]">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="font-[Cabinet_Grotesk] text-[18px] font-extrabold text-[#0F172A]">Caméra</div>
                <button
                  type="button"
                  onClick={closeCamera}
                  className="px-3 py-1.5 rounded-full bg-gray-100 text-[#0F172A] text-[12.5px] font-bold hover:bg-gray-200 transition-colors"
                >
                  Fermer
                </button>
              </div>

              <div className="relative bg-black">
                <video
                  ref={videoRef}
                  className="w-full h-[360px] object-contain"
                  autoPlay
                  muted
                  playsInline
                />
              </div>

              <div className="px-5 py-4 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => cameraPickerRef.current?.click()}
                  className="flex-1 px-4 py-3 rounded-full bg-white border border-gray-200 text-[#0F172A] text-[13px] font-bold hover:bg-gray-50 transition-colors"
                >
                  Utiliser le sélecteur
                </button>
                <button
                  type="button"
                  onClick={captureFromCamera}
                  className="flex-1 px-4 py-3 rounded-full bg-[#1E63D6] text-white text-[13px] font-bold hover:bg-[#174FA9] transition-colors"
                >
                  Capturer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Photo Previews */}
        <div className="flex gap-2.5 mb-6">
          {photos.map((src, index) => (
            <button
              key={index}
              type="button"
              onClick={() =>
                setPhotos((current) => {
                  const next = current.filter((_, i) => i !== index)
                  if (next.length > 0) {
                    setPhotoError(null)
                  }
                  return next
                })
              }
              title="Supprimer"
              className="w-[72px] h-[72px] rounded-[8px] overflow-hidden bg-gray-100 cursor-pointer border-2 border-gray-200 hover:border-rose-300 transition-all duration-180"
            >
              <img src={src} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
          {photos.length < 5 && (
            <button
              type="button"
              onClick={() => filePickerRef.current?.click()}
              className="w-[72px] h-[72px] rounded-[8px] bg-gray-100 flex items-center justify-center cursor-pointer border-2 border-dashed border-gray-300 hover:border-[#1E63D6] transition-all duration-180"
            >
              <span className="text-xl text-gray-400">+</span>
            </button>
          )}
        </div>

        {/* Title */}
        <div className="mb-5.5 border-b border-gray-200 pb-5">
          <label className="text-[13.5px] font-bold text-[#0F172A] mb-2 block">Titre de l'objet *</label>
          <input
            type="text"
            placeholder="Ex : Physique Quantique - Cohen-Tannoudji"
            value={form.title}
            onChange={(event) => setForm((currentForm) => ({ ...currentForm, title: event.target.value }))}
            className="w-full h-10 px-4 py-3.25 rounded-[12px] border-2 border-gray-300 text-[14.5px] text-[#0F172A] font-['Satoshi'] outline-none focus:border-[#1E63D6] transition-all duration-180 bg-white"
          />
        </div>

        {/* Category */}
        <div className="mb-5.5">
          <label className="text-[13.5px] font-bold text-[#0F172A] mb-2 block">Catégorie *</label>
          <select
            value={form.category}
            onChange={(event) => setForm((currentForm) => ({ ...currentForm, category: event.target.value }))}
            className="w-full h-10 px-4 py-3.25 rounded-[12px] border-2 border-gray-300 text-[14.5px] text-[#0F172A] font-['Satoshi'] outline-none focus:border-[#1E63D6] transition-all duration-180 bg-white cursor-pointer"
          >
            <option value="">Choisir une catégorie</option>
            <option>Livres et Cours</option>
            <option>Electronique</option>
            <option>Fournitures scolaires</option>
            <option>Vetements</option>
            <option>Meubles</option>
            <option>Loisirs et Sport</option>
            <option>Divers</option>
          </select>
        </div>

        {/* Description */}
        <div className="mb-5.5">
          <label className="text-[13.5px] font-bold text-[#0F172A] mb-2 block">Description *</label>
          <textarea
            placeholder="Decris l'etat, l'edition, les caracteristiques... Sois precis !"
            rows={3}
            value={form.description}
            onChange={(event) => setForm((currentForm) => ({ ...currentForm, description: event.target.value }))}
            className="w-full px-4 py-3.25 rounded-[12px] border-2 border-gray-300 text-[14.5px] text-[#0F172A] font-['Satoshi'] outline-none focus:border-[#1E63D6] transition-all duration-180 bg-white resize-none"
          />
        </div>

        {/* Condition */}
        <div className="mb-5.5">
          <label className="text-[13.5px] font-bold text-[#0F172A] mb-2 block">État de l'objet</label>
          <select
            value={form.condition}
            onChange={(event) => setForm((currentForm) => ({ ...currentForm, condition: event.target.value }))}
            className="w-full h-10 px-4 py-3.25 rounded-[12px] border-2 border-gray-300 text-[14.5px] text-[#0F172A] font-['Satoshi'] outline-none focus:border-[#1E63D6] transition-all duration-180 bg-white cursor-pointer"
          >
            <option value="Neuf / comme neuf">Neuf / comme neuf</option>
            <option value="Tres bon etat">Très bon état</option>
            <option value="Bon etat">Bon état</option>
            <option value="Etat correct">Etat correct (use)</option>
          </select>
        </div>

        {/* Type */}
        <div className="mb-5.5">
          <label className="text-[13.5px] font-bold text-[#0F172A] mb-2 block">Type de proposition *</label>
          <div className="flex gap-3">
            {publishTypeOptionsDto.map((type) => (
              <button
                key={type.id}
                onClick={() => {
                  setSelectedType(type.id)
                  setForm((currentForm) => ({ ...currentForm, type: type.id }))
                  if (type.id === 'echange') {
                    setIsExchangeFormOpen(true)
                    resetLoanDetails()
                  } else if (type.id === 'pret') {
                    setIsLoanFormOpen(true)
                    resetExchangeDetails()
                  } else {
                    resetExchangeDetails()
                    resetLoanDetails()
                  }
                }}
                type="button"
                className={`flex-1 py-3.5 rounded-[12px] border-2 cursor-pointer text-[13.5px] font-bold transition-all duration-180 ${
                  selectedType === type.id
                    ? 'border-[#1E63D6] bg-[#E8FAF3] text-[#1E63D6]'
                    : 'border-gray-300 text-gray-700 hover:border-[#1E63D6] hover:text-[#1E63D6]'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

	        {selectedType === 'echange' && (
	          <button
	            type="button"
	            onClick={() => setIsExchangeFormOpen(true)}
	            className="w-full mb-5.5 rounded-[16px] bg-[#FEF3C7] border border-[#F5C400]/30 px-4 py-3 flex items-center justify-between hover:bg-[#FDE68A] transition-colors"
	            title="Configurer la nature de l'échange"
	          >
	            <div className="text-left">
	              <div className="text-[13px] font-extrabold text-[#0F172A]">Configurer la nature de l’échange</div>
	              {exchangeNature && (
	                <div className="text-[12px] text-gray-700 font-semibold">
	                  {exchangeNature === 'vente'
	                    ? `Vente${exchangePrice.trim() ? ` · Prix: ${exchangePrice.trim()}` : ''}`
	                    : `Échange avec autre article${exchangeNeed.trim() ? ` · Besoin: ${exchangeNeed.trim()}` : ''}`}
	                </div>
	              )}
	              {exchangeError && <div className="text-[12px] text-rose-600 font-extrabold mt-1">{exchangeError}</div>}
	            </div>
	            <div className="w-9 h-9 rounded-full bg-white/80 border border-[#F5C400]/20 flex items-center justify-center font-extrabold text-[#F5C400]">
	              2
	            </div>
	          </button>
	        )}

	        {selectedType === 'pret' && (
	          <button
	            type="button"
	            onClick={() => setIsLoanFormOpen(true)}
	            className="w-full mb-5.5 rounded-[16px] bg-[#FEF3C7] border border-[#F5C400]/30 px-4 py-3 flex items-center justify-between hover:bg-[#FDE68A] transition-colors"
	            title="Configurer les conditions du prêt"
	          >
	            <div className="text-left">
	              <div className="text-[13px] font-extrabold text-[#0F172A]">Configurer les conditions du prêt</div>
	              {(loanPrice.trim() || loanPaymentType || loanDuration.trim()) && (
	                <div className="text-[12px] text-gray-700 font-semibold">
	                  {[
	                    loanPrice.trim() ? `Prix: ${loanPrice.trim()}` : null,
	                    loanPaymentType
	                      ? `Paiement: ${
	                          loanPaymentType === 'unique'
	                            ? 'une fois'
	                            : loanPaymentType === 'tranche'
	                              ? 'par tranche'
	                              : loanPaymentType === 'mensuel'
	                                ? 'mensuel'
	                                : 'autre'
	                        }`
	                      : null,
	                    loanDuration.trim() ? `Durée: ${loanDuration.trim()}` : null,
	                  ]
	                    .filter(Boolean)
	                    .join(' · ')}
	                </div>
	              )}
	            </div>
	            <div className="w-9 h-9 rounded-full bg-white/80 border border-[#F5C400]/20 flex items-center justify-center font-extrabold text-[#F5C400]">
	              2
	            </div>
	          </button>
	        )}

        {/* Location */}
        <div className="mb-5.5">
          <label className="text-[13.5px] font-bold text-[#0F172A] mb-2  block">Zone de remise</label>
          <input
            type="text"
            placeholder="Ex : Paris 14e, campus Orsay…"
            value={form.location}
            onChange={(event) => setForm((currentForm) => ({ ...currentForm, location: event.target.value }))}
            className="w-full h-10 px-4 py-3.25 rounded-[12px] border-2 border-gray-300 text-[14.5px] text-[#0F172A] font-['Satoshi'] outline-none focus:border-[#2ECC8F] transition-all duration-180 bg-white"
          />
        </div>

        {/* Submit */}
        <div className="mt-6"> 
           <button
          onClick={() => void handleSubmit()}
          disabled={isSubmitting || photos.length === 0}
          className={`w-full h-10 py-4.25 rounded-full text-[17px] font-extrabold border-none shadow-[0_8px_32px_rgba(46,204,143,0.25)] transition-all duration-200 font-['Cabinet_Grotesk'] ${
            isSubmitting || photos.length === 0
              ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
              : 'bg-[#1E63D6] text-white cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_12px_36px_rgba(46,204,143,0.4)]'
          }`}
        >
          {isSubmitting ? 'Publication...' : 'Publier mon objet'}
        </button>
           </div>
       
      </div>

      {isExchangeFormOpen && selectedType === 'echange' && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-[18px] w-full max-w-[560px] overflow-hidden shadow-[0_18px_70px_rgba(0,0,0,0.30)]">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <div className="font-[Cabinet_Grotesk] text-[18px] font-extrabold text-[#0F172A]">
                  Détails de l’échange
                </div>
                <div className="text-[12.5px] text-gray-500 font-semibold">
                  Choisis la nature de l’échange (et ajoute un prix si c’est une vente).
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsExchangeFormOpen(false)
                  setExchangeError(null)
                }}
                className="px-3 py-1.5 rounded-full bg-gray-100 text-[#0F172A] text-[12.5px] font-bold hover:bg-gray-200 transition-colors"
              >
                Fermer
              </button>
            </div>

            <div className="px-5 py-5">
              <label className="text-[13.5px] font-bold text-[#0F172A] mb-2 block">
                Nature de l’échange *
              </label>
              <select
                value={exchangeNature}
                onChange={(e) => {
                  const next = e.target.value as 'vente' | 'echange_article' | ''
                  setExchangeNature(next)
                  setExchangeError(null)
                  if (next !== 'vente') setExchangePrice('')
                  if (next !== 'echange_article') setExchangeNeed('')
                }}
                className="w-full h-10 px-4 py-3.25 rounded-[12px] border-2 border-gray-300 text-[14.5px] text-[#0F172A] font-['Satoshi'] outline-none focus:border-[#1E63D6] transition-all duration-180 bg-white cursor-pointer"
              >
                <option value="">Choisir…</option>
                <option value="vente">Vente</option>
                <option value="echange_article">Échange avec autre article</option>
              </select>

              {exchangeNature === 'echange_article' && (
                <div className="mt-4">
                  <label className="text-[13.5px] font-bold text-[#0F172A] mb-2 block">
                    Ton besoin (optionnel)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Ex : Je cherche un ordinateur, un livre de maths, une calculatrice…"
                    value={exchangeNeed}
                    onChange={(e) => {
                      setExchangeNeed(e.target.value)
                      setExchangeError(null)
                    }}
                    className="w-full px-4 py-3.25 rounded-[12px] border-2 border-gray-300 text-[14.5px] text-[#0F172A] font-['Satoshi'] outline-none focus:border-[#1E63D6] transition-all duration-180 bg-white resize-none"
                    maxLength={240}
                  />
                  <div className="text-[12px] text-gray-500 font-semibold mt-1">
                    Décris l’article que tu souhaites recevoir en échange.
                  </div>
                </div>
              )}

              {exchangeNature === 'vente' && (
                <div className="mt-4">
                  <label className="text-[13.5px] font-bold text-[#0F172A] mb-2 block">Prix (optionnel)</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    placeholder="Ex : 25000"
                    value={exchangePrice}
                    onChange={(e) => {
                      setExchangePrice(e.target.value)
                      setExchangeError(null)
                    }}
                    className="w-full h-10 px-4 py-3.25 rounded-[12px] border-2 border-gray-300 text-[14.5px] text-[#0F172A] font-['Satoshi'] outline-none focus:border-[#1E63D6] transition-all duration-180 bg-white"
                  />
                  <div className="text-[12px] text-gray-500 font-semibold mt-1">
                    Laisse vide si c’est un échange sans prix.
                  </div>
                </div>
              )}

              {exchangeError && <div className="text-[12.5px] text-rose-600 font-extrabold mt-3">{exchangeError}</div>}
            </div>

            <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedType('don')
                  setForm((currentForm) => ({ ...currentForm, type: 'don' }))
                  resetExchangeDetails()
                }}
                className="px-4 py-3 rounded-full bg-white border border-gray-200 text-[#0F172A] text-[13px] font-bold hover:bg-gray-50 transition-colors"
              >
                Annuler l’échange
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!exchangeNature) {
                    setExchangeError("Choisis la nature de l'échange.")
                    return
                  }
                  setIsExchangeFormOpen(false)
                  setExchangeError(null)
                }}
                className="px-4 py-3 rounded-full bg-[#1E63D6] text-white text-[13px] font-bold hover:bg-[#174FA9] transition-colors"
              >
                Continuer
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoanFormOpen && selectedType === 'pret' && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-[18px] w-full max-w-[560px] overflow-hidden shadow-[0_18px_70px_rgba(0,0,0,0.30)]">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <div className="font-[Cabinet_Grotesk] text-[18px] font-extrabold text-[#0F172A]">
                  Conditions du prêt
                </div>
                <div className="text-[12.5px] text-gray-500 font-semibold">
                  Décris la nature du prêt (prix, paiement, durée/contrat).
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsLoanFormOpen(false)}
                className="px-3 py-1.5 rounded-full bg-gray-100 text-[#0F172A] text-[12.5px] font-bold hover:bg-gray-200 transition-colors"
              >
                Fermer
              </button>
            </div>

            <div className="px-5 py-5 space-y-4">
              <div>
                <label className="text-[13.5px] font-bold text-[#0F172A] mb-2 block">Prix à payer (optionnel)</label>
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  placeholder="Ex : 5000"
                  value={loanPrice}
                  onChange={(e) => setLoanPrice(e.target.value)}
                  className="w-full h-10 px-4 py-3.25 rounded-[12px] border-2 border-gray-300 text-[14.5px] text-[#0F172A] font-['Satoshi'] outline-none focus:border-[#1E63D6] transition-all duration-180 bg-white"
                />
              </div>

              <div>
                <label className="text-[13.5px] font-bold text-[#0F172A] mb-2 block">Type de paiement (optionnel)</label>
                <select
                  value={loanPaymentType}
                  onChange={(e) => setLoanPaymentType(e.target.value as typeof loanPaymentType)}
                  className="w-full h-10 px-4 py-3.25 rounded-[12px] border-2 border-gray-300 text-[14.5px] text-[#0F172A] font-['Satoshi'] outline-none focus:border-[#1E63D6] transition-all duration-180 bg-white cursor-pointer"
                >
                  <option value="">Choisir…</option>
                  <option value="unique">Paiement en une fois</option>
                  <option value="tranche">Paiement par tranche</option>
                  <option value="mensuel">Paiement mensuel</option>
                  <option value="autre">Autre</option>
                </select>
              </div>

              <div>
                <label className="text-[13.5px] font-bold text-[#0F172A] mb-2 block">Contrat / durée (optionnel)</label>
                <input
                  type="text"
                  placeholder="Ex : 2 semaines, 1 mois, jusqu’au 30/04…"
                  value={loanDuration}
                  onChange={(e) => setLoanDuration(e.target.value)}
                  className="w-full h-10 px-4 py-3.25 rounded-[12px] border-2 border-gray-300 text-[14.5px] text-[#0F172A] font-['Satoshi'] outline-none focus:border-[#1E63D6] transition-all duration-180 bg-white"
                  maxLength={80}
                />
              </div>
            </div>

            <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  resetLoanDetails()
                  setIsLoanFormOpen(false)
                }}
                className="px-4 py-3 rounded-full bg-white border border-gray-200 text-[#0F172A] text-[13px] font-bold hover:bg-gray-50 transition-colors"
              >
                Réinitialiser
              </button>
              <button
                type="button"
                onClick={() => setIsLoanFormOpen(false)}
                className="px-4 py-3 rounded-full bg-[#1E63D6] text-white text-[13px] font-bold hover:bg-[#174FA9] transition-colors"
              >
                Continuer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
