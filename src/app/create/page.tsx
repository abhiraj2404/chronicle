'use client'

import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'
import { Button } from '@/components/ui/custom-button/button'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  ImagePlus,
  Link2,
  Pencil,
  Upload,
  X,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useRef, useState } from 'react'
import { toast } from 'sonner'

// ─── Constants ─────────────────────────────────────────────────────────────────
const MAX_FILE_SIZE_MB = 50
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime']
const ACCEPTED_TYPES = [...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_VIDEO_TYPES]
const SOLANA_ADDRESS_REGEX = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/

// ─── Helpers ───────────────────────────────────────────────────────────────────
function isValidSolanaAddress(address: string): boolean {
  return SOLANA_ADDRESS_REGEX.test(address)
}

function getMediaType(file: File): 'image' | 'video' {
  return file.type.startsWith('video/') ? 'video' : 'image'
}

// ─── Component ─────────────────────────────────────────────────────────────────
export default function CreatePostPage() {
  const router = useRouter()
  const { walletAddress } = useCurrentWallet()

  const fileInputRef = useRef<HTMLInputElement>(null)

  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [mediaPreview, setMediaPreview] = useState<string | null>(null)
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null)
  const [caption, setCaption] = useState('')
  const [tokenCA, setTokenCA] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)

  // ── File selection handler ────────────────────────────────────────────
  const handleFileSelect = useCallback((file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error('Unsupported format. Use JPG, PNG, GIF, WebP, MP4, WebM, or MOV.')
      return
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      toast.error(`File exceeds ${MAX_FILE_SIZE_MB}MB limit.`)
      return
    }

    const type = getMediaType(file)
    setMediaFile(file)
    setMediaType(type)

    const objectUrl = URL.createObjectURL(file)
    setMediaPreview(objectUrl)
  }, [])

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) handleFileSelect(file)
  }

  const clearMedia = () => {
    setMediaFile(null)
    setMediaPreview(null)
    setMediaType(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // ── Drag & drop handlers ──────────────────────────────────────────────
  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => setIsDragOver(false)

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(false)
    const file = event.dataTransfer.files?.[0]
    if (file) handleFileSelect(file)
  }

  // ── Validation ────────────────────────────────────────────────────────
  const isFormValid =
    !!mediaFile && caption.trim().length > 0 && isValidSolanaAddress(tokenCA.trim())

  // ── Submit handler ────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!walletAddress) {
      toast.error('Connect your wallet to create a post.')
      return
    }

    if (!isFormValid) {
      toast.error('Please fill in all fields correctly.')
      return
    }

    setIsSubmitting(true)

    try {
      /* 
        For now we pass the media as a base64 data URL.
        In production you'd upload to S3/IPFS and get a hosted URL.
      */
      const contentUrl = mediaPreview ?? ''

      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorWallet: walletAddress,
          contentUrl,
          caption: caption.trim(),
          tokenCA: tokenCA.trim(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.error || 'Failed to create post')
      }

      toast.success('Post created successfully!')
      router.push('/')
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Something went wrong'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="flex flex-col px-4 pt-3 gap-4 overflow-y-auto no-scrollbar"
      style={{ height: 'calc(100dvh - 72px)' }}
    >
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-white/5"
        >
          <ArrowLeft size={20} className="text-zinc-400" />
        </button>
        <h1 className="text-lg font-bold text-white">Create Post</h1>
      </div>

      {/* ── Media upload area ──────────────────────────────────────── */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        onChange={handleInputChange}
        className="hidden"
        aria-label="Upload media"
      />

      {!mediaPreview ? (
        <motion.button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          whileTap={{ scale: 0.98 }}
          className="relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed transition-colors cursor-pointer"
          style={{
            minHeight: '220px',
            borderColor: isDragOver
              ? 'rgba(34,197,94,0.6)'
              : 'rgba(255,255,255,0.08)',
            background: isDragOver
              ? 'rgba(34,197,94,0.05)'
              : 'rgba(255,255,255,0.02)',
          }}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(34,197,94,0.1)' }}
          >
            <ImagePlus size={26} className="text-green-400" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-zinc-300">
              Tap to upload media
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              JPG, PNG, GIF, WebP, MP4, WebM · Max {MAX_FILE_SIZE_MB}MB
            </p>
          </div>
        </motion.button>
      ) : (
        <div className="relative rounded-2xl overflow-hidden border border-white/[0.06]">
          {/* Remove button */}
          <button
            type="button"
            onClick={clearMedia}
            className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
          >
            <X size={16} className="text-white" />
          </button>

          {mediaType === 'video' ? (
            <video
              src={mediaPreview}
              className="w-full max-h-[280px] object-cover"
              controls
              playsInline
              muted
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={mediaPreview}
              alt="Upload preview"
              className="w-full max-h-[280px] object-cover"
            />
          )}

          {/* Re-upload overlay */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white transition-colors"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
          >
            <Upload size={13} />
            Change
          </button>
        </div>
      )}

      {/* ── Caption ────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
          <Pencil size={14} className="text-zinc-500" />
          Caption
        </label>
        <textarea
          value={caption}
          onChange={(event) => setCaption(event.target.value)}
          placeholder="What's the alpha on this token?"
          maxLength={500}
          rows={3}
          className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 resize-none outline-none transition-all focus:ring-2 focus:ring-green-500/30 focus:border-green-500/50"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        />
        <p className="text-[11px] text-zinc-600 text-right">
          {caption.length}/500
        </p>
      </div>

      {/* ── Token Contract Address ─────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
          <Link2 size={14} className="text-zinc-500" />
          Token Contract Address
        </label>
        <input
          type="text"
          value={tokenCA}
          onChange={(event) => setTokenCA(event.target.value)}
          placeholder="e.g. So11111111111111111111111111111112"
          spellCheck={false}
          className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 font-mono outline-none transition-all focus:ring-2 focus:ring-green-500/30 focus:border-green-500/50"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        />
        {tokenCA.length > 0 && !isValidSolanaAddress(tokenCA.trim()) && (
          <p className="text-xs text-red-400">
            Enter a valid Solana contract address
          </p>
        )}
      </div>

      {/* ── Submit button ──────────────────────────────────────────── */}
      <div className="pb-4 mt-auto">
        <Button
          onClick={handleSubmit}
          disabled={!isFormValid || isSubmitting}
          loading={isSubmitting}
          className="w-full h-12 rounded-2xl text-sm font-bold"
          style={{
            background: isFormValid
              ? 'linear-gradient(135deg, #16a34a, #22c55e)'
              : undefined,
            boxShadow: isFormValid
              ? '0 0 24px rgba(34,197,94,0.25)'
              : undefined,
          }}
        >
          {isSubmitting ? 'Publishing...' : 'Publish Post'}
        </Button>
      </div>
    </div>
  )
}
