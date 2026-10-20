import { useRef, useState } from 'react'
import { ImagePlus, Trash2 } from 'lucide-react'
import { Modal } from '../../components/layout/modal'
import { Button } from '../../components/layout/button'
import { Input, Label } from '../../components/layout/input'
import { useProfile } from '../../hooks/useProfile'
import { useFriends } from '../../hooks/useFriends'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { extractQrPayload, imageFileToDataUrl, NO_QR_FOUND, renderQrImage } from '../../utils/duitnow'

interface DuitNowSettingsProps {
  isOpen: boolean
  onClose: () => void
}

export function DuitNowSettings({ isOpen, onClose }: DuitNowSettingsProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const { profile, saveProfile } = useProfile()
  const { friends } = useFriends()
  const fileRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [unreadable, setUnreadable] = useState<File | null>(null)
  const [nameDraft, setNameDraft] = useState<string | null>(null)
  const name = nameDraft ?? profile.myName ?? ''

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    setBusy(true)
    setUnreadable(null)
    try {
      const payload = await extractQrPayload(file)
      await saveProfile({ duitnowQr: await renderQrImage(payload) })
      toast('QR found and saved', 'success')
    } catch (err) {
      if (err instanceof Error && err.message === NO_QR_FOUND) setUnreadable(file)
      else if (err instanceof Error && err.message !== 'save failed') toast(err.message, 'error')
    } finally {
      setBusy(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const handleUseWholeImage = async () => {
    if (!unreadable) return
    setBusy(true)
    try {
      await saveProfile({ duitnowQr: await imageFileToDataUrl(unreadable) })
      setUnreadable(null)
      toast('Image saved', 'success')
    } catch (err) {
      if (err instanceof Error && err.message !== 'save failed') toast(err.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  const handleRemove = async () => {
    setBusy(true)
    try {
      await saveProfile({ duitnowQr: null })
    } catch { /* toast shown by saveProfile */ } finally {
      setBusy(false)
    }
  }

  const handleSaveName = async () => {
    try {
      await saveProfile({ myName: name.trim() || null })
      setNameDraft(null)
      toast('Saved', 'success')
    } catch { /* toast shown by saveProfile */ }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="My DuitNow QR">
      {!user ? (
        <p className="text-[#EEEEEE]/60 text-sm">Sign in to save your DuitNow QR.</p>
      ) : (
        <div className="space-y-5">
          <p className="text-[#EEEEEE]/50 text-xs leading-relaxed">
            Your QR is added to a receipt's PDF only when <span className="text-[#EEEEEE]/80">you</span> are
            the one who paid. If someone else paid, no QR is shown.
          </p>

          <div>
            <Label>QR image</Label>
            {profile.duitnowQr ? (
              <div className="flex items-center gap-4">
                <img
                  src={profile.duitnowQr}
                  alt="Your DuitNow QR"
                  className="w-32 h-32 rounded-xl bg-white p-1.5 object-contain"
                />
                <div className="flex flex-col gap-2">
                  <Button size="sm" variant="secondary" disabled={busy} className="min-h-11" onClick={() => fileRef.current?.click()}>
                    <ImagePlus size={14} /> Replace
                  </Button>
                  <Button size="sm" variant="danger" disabled={busy} className="min-h-11" onClick={handleRemove}>
                    <Trash2 size={14} /> Remove
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                disabled={busy}
                onClick={() => fileRef.current?.click()}
                className="w-full rounded-xl border border-dashed border-[#00ADB5]/40 py-8 flex flex-col items-center gap-2 text-[#00ADB5] hover:bg-[#00ADB5]/5 transition-colors cursor-pointer"
              >
                <ImagePlus size={22} />
                <span className="text-sm font-medium">{busy ? 'Finding QR…' : 'Upload DuitNow QR screenshot'}</span>
              </button>
            )}
            <p className="text-[#EEEEEE]/30 text-xs mt-1.5">
              A full screenshot is fine. We find the QR in it and keep only that.
            </p>
            {unreadable && (
              <div className="mt-3 rounded-xl bg-red-500/10 border border-red-500/20 p-3 space-y-2">
                <p className="text-red-300 text-xs">
                  Couldn't find a QR in that image. Try a clearer or closer screenshot, or crop it to the QR yourself.
                </p>
                <Button size="sm" variant="secondary" disabled={busy} className="min-h-11" onClick={handleUseWholeImage}>
                  Use the whole image anyway
                </Button>
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </div>

          <div>
            <Label htmlFor="myName">My name in receipts</Label>
            <div className="flex gap-2">
              <Input
                id="myName"
                className="min-h-11"
                list="friend-names"
                value={name}
                placeholder="e.g. Kimi"
                onChange={(e) => setNameDraft(e.target.value)}
              />
              <datalist id="friend-names">
                {friends.map((f) => <option key={f.id} value={f.name} />)}
              </datalist>
              <Button
                type="button"
                className="min-h-11 shrink-0"
                disabled={nameDraft === null || nameDraft.trim() === (profile.myName ?? '')}
                onClick={handleSaveName}
              >
                Save
              </Button>
            </div>
            <p className="text-[#EEEEEE]/30 text-xs mt-1.5">
              Must match how you appear as a participant, so we know when "Paid by" is you.
            </p>
          </div>
        </div>
      )}
    </Modal>
  )
}
