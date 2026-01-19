import { useState } from 'react'
import { createPortal } from 'react-dom'
import toast from 'react-hot-toast'
import { reportImage } from '../firebase/firestore'

const modalRoot = typeof document !== 'undefined' ? document.body : null

export default function ReportModal({ isOpen, image, onClose, reporterId }) {
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!modalRoot || !isOpen || !image) return null

  const submit = async () => {
    if (!reason.trim()) {
      toast.error('Please provide a reason')
      return
    }
    setSubmitting(true)
    try {
      await reportImage({ imageId: image.id, reason: reason.trim(), reporterId })
      toast.success('Report submitted')
      setReason('')
      onClose()
    } catch (err) {
      console.error(err)
      toast.error('Could not submit report')
    } finally {
      setSubmitting(false)
    }
  }

  const content = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-[var(--surface-card)] p-6">
        <h3 className="text-lg font-semibold">Report this upload</h3>
        <p className="mt-2 text-sm text-[var(--text-muted)]">Reporting: {image.title || image.id}</p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={5}
          className="mt-4 w-full rounded-md bg-[#0f0b10] px-3 py-2 text-sm"
          placeholder="Explain what's wrong (fake views, copies, policy violation, etc.)"
        />
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-full px-4 py-2 border">
            Cancel
          </button>
          <button type="button" onClick={submit} disabled={submitting} className="rounded-full bg-brand-500 px-4 py-2 text-white">
            {submitting ? 'Sending…' : 'Submit report'}
          </button>
        </div>
      </div>
    </div>
  )

  return createPortal(content, modalRoot)
}
