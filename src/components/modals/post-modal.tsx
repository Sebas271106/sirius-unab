"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Upload, X, Image as ImageIcon, CheckCircle2 } from "lucide-react"
import { supabase } from "@/../app/supabaseClient"
import { useToast } from "@/hooks/use-toast"

interface PostModalProps {
  isOpen: boolean
  onClose: () => void
}

interface PreviewFile {
  file: File
  url: string
}

export function PostModal({ isOpen, onClose }: PostModalProps) {
  const { toast } = useToast()
  const [content, setContent] = useState("")
  const [files, setFiles] = useState<PreviewFile[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      // reset state when closed
      setContent("")
      files.forEach((f) => URL.revokeObjectURL(f.url))
      setFiles([])
      setIsSubmitting(false)
      setSubmitted(false)
    }
  }, [isOpen])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files
    if (!list) return
    const newFiles: PreviewFile[] = Array.from(list).map((f) => ({ file: f, url: URL.createObjectURL(f) }))
    setFiles((prev) => [...prev, ...newFiles])
    e.target.value = ""
  }

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const copy = [...prev]
      const [removed] = copy.splice(index, 1)
      if (removed) URL.revokeObjectURL(removed.url)
      return copy
    })
  }

  // Aspect ratio for cropping: '16:9' or '1:1'
  const [aspect, setAspect] = useState<'1:1' | '16:9'>('16:9')

  // Center crop image to the selected aspect
  async function cropImageToAspect(file: File, aspect: '1:1' | '16:9'): Promise<File> {
    const img = document.createElement('img')
    const objectUrl = URL.createObjectURL(file)
    img.src = objectUrl
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error('No se pudo cargar la imagen para recortar'))
    })

    const naturalW = img.naturalWidth
    const naturalH = img.naturalHeight
    const targetRatio = aspect === '16:9' ? 16 / 9 : 1
    const sourceRatio = naturalW / naturalH

    // Determine source crop rect (center crop)
    let srcW = naturalW
    let srcH = naturalH
    if (sourceRatio > targetRatio) {
      // demasiado ancho, recortamos en ancho
      srcH = naturalH
      srcW = Math.round(targetRatio * srcH)
    } else {
      // demasiado alto, recortamos en alto
      srcW = naturalW
      srcH = Math.round(srcW / targetRatio)
    }
    const srcX = Math.round((naturalW - srcW) / 2)
    const srcY = Math.round((naturalH - srcH) / 2)

    // Output size (limit to natural size)
    const maxOutW = aspect === '16:9' ? 1280 : 1080
    const scale = Math.min(maxOutW / srcW, 1) // no escalar por encima del tamaño original
    const outW = Math.round(srcW * scale)
    const outH = Math.round(srcH * scale)

    const canvas = document.createElement('canvas')
    canvas.width = outW
    canvas.height = outH
    const ctx = canvas.getContext('2d')!
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, outW, outH)

    const blob: Blob = await new Promise((resolve) => canvas.toBlob((b) => resolve(b as Blob), 'image/jpeg', 0.92))
    URL.revokeObjectURL(objectUrl)

    const croppedFile = new File([blob], file.name.replace(/\.[^.]+$/, '') + '-cropped.jpg', { type: 'image/jpeg' })
    return croppedFile
  }

  async function handleCrop(index: number) {
    const pf = files[index]
    if (!pf || !pf.file.type.startsWith('image/')) return
    const newFile = await cropImageToAspect(pf.file, aspect)
    const newUrl = URL.createObjectURL(newFile)
    setFiles((prev) => {
      const copy = [...prev]
      const old = copy[index]
      if (old) URL.revokeObjectURL(old.url)
      copy[index] = { file: newFile, url: newUrl }
      return copy
    })
  }

  const handleSubmit = async () => {
    if (!content.trim() && files.length === 0) {
      toast({ title: "Nada para publicar", description: "Escribe algo o adjunta una imagen/video." })
      return
    }

    setIsSubmitting(true)
    try {
      const { data: sessionData, error: sessionErr } = await supabase.auth.getSession()
      if (sessionErr) throw sessionErr
      const user = sessionData.session?.user
      if (!user) {
        toast({ title: "Necesitas iniciar sesión", description: "Por favor inicia sesión para publicar." })
        setIsSubmitting(false)
        return
      }

      // Create post
      const { data: postRes, error: postErr } = await supabase
        .from("posts")
        .insert({ author_id: user.id, content })
        .select("id")
        .single()
      if (postErr) throw postErr
      const postId = postRes.id as string

      // Upload files and save media rows
      for (const pf of files) {
        let fileToUpload = pf.file
        // If image, crop to selected aspect before upload
        if (pf.file.type.startsWith('image/')) {
          try {
            fileToUpload = await cropImageToAspect(pf.file, aspect)
          } catch (e) {
            console.warn('Fallo recorte, se sube original:', e)
          }
        }
        const ext = (fileToUpload.name.split('.').pop()?.toLowerCase() || 'jpg')
        const path = `${user.id}/${postId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { error: upErr } = await supabase.storage.from("posts").upload(path, fileToUpload, {
          cacheControl: "3600",
          upsert: false,
        })
        if (upErr) throw upErr
        const { data: pub } = supabase.storage.from("posts").getPublicUrl(path)
        const publicUrl = pub.publicUrl
        await supabase.from("post_media").insert({
          post_id: postId,
          storage_path: path,
          url: publicUrl,
          mime_type: fileToUpload.type || "application/octet-stream",
          size_bytes: fileToUpload.size || 0,
        })
      }

      setSubmitted(true)
      toast({ title: "Publicado", description: "Tu publicación ha sido creada exitosamente." })
      // Notificar al Home para refrescar el feed
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("sirius:postCreated"))
      }
      // Close after brief delay
      setTimeout(() => {
        onClose()
      }, 800)
    } catch (err: any) {
      console.error(err)
      toast({ title: "Error al publicar", description: err?.message || "Intenta nuevamente." })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl rounded-2xl border shadow-lg transition-all data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">Nueva publicación</DialogTitle>
        </DialogHeader>

        {submitted ? (
          <div className="flex flex-col items-center justify-center py-12">
            <CheckCircle2 className="w-16 h-16 text-[#ff9800] mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">¡Publicación creada!</h3>
          </div>
        ) : (
          <div className="space-y-5 mt-2">
            <div>
              <Label htmlFor="post-content" className="text-sm">Contenido</Label>
              <Textarea
                id="post-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="¿Qué está pasando en la UNAB?"
                className="mt-2"
                rows={4}
              />
            </div>

            <div>
              <Label className="text-sm">Medios</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-[#ff9800] transition-colors mt-2">
                <input
                  type="file"
                  id="post-files"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*,video/*"
                />
                <label htmlFor="post-files" className="cursor-pointer flex flex-col items-center">
                  <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-foreground">Haz clic para subir o arrastra y suelta</p>
                  <p className="text-xs text-muted-foreground">Imágenes o videos (máx 10MB c/u)</p>
                </label>
              </div>

              {files.length > 0 && (
                <>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Aspecto:</span>
                    <Button type="button" size="sm" variant={aspect === '16:9' ? 'default' : 'outline'} onClick={() => setAspect('16:9')}>16:9</Button>
                    <Button type="button" size="sm" variant={aspect === '1:1' ? 'default' : 'outline'} onClick={() => setAspect('1:1')}>1:1</Button>
                    <span className="ml-3 text-xs text-muted-foreground">(recorte centrado; pronto: zoom, reposición y filtros)</span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    {files.map((pf, idx) => (
                      <div key={idx} className="relative group">
                        <div className="overflow-hidden rounded-xl border">
                          <div className={pf.file.type.startsWith("image/") ? (aspect === '16:9' ? "aspect-[16/9]" : "aspect-square") : "aspect-[16/9]"}>
                            {pf.file.type.startsWith("image/") ? (
                              <img src={pf.url} alt={pf.file.name} className="w-full h-full object-cover" />
                            ) : (
                              <video src={pf.url} className="w-full h-full object-cover" />
                            )}
                          </div>
                        </div>
                        <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => handleCrop(idx)}
                            className="h-8 px-2 text-xs"
                            title="Recortar"
                          >
                            Recortar
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(idx)}
                            className="h-8 w-8 p-0"
                            title="Eliminar"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground truncate">{pf.file.name}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-[#ff9800] hover:bg-[#ff9800]/90 text-white"
              >
                {isSubmitting ? "Publicando..." : "Publicar"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}