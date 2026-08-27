import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Image from '@tiptap/extension-image'
import { useRef } from 'react'
import { VideoNode } from '../extensions/VideoNode'
import { uploadMedia } from '../services/articles'
import './RichTextEditor.css'

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
}

const TEXT_COLORS = ['#222222', '#d94686', '#e05c7a', '#9a3412', '#1d4ed8', '#15803d']

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      TextStyle,
      Color,
      Image,
      VideoNode,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  if (!editor) return null

  async function handleImageSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    const url = await uploadMedia(file)
    editor?.chain().focus().setImage({ src: url }).run()
  }

  async function handleVideoSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    const url = await uploadMedia(file)
    editor?.chain().focus().setVideo({ src: url }).run()
  }

  return (
    <div className="rte">
      <div className="rte-toolbar">
        <button
          type="button"
          className={editor.isActive('heading', { level: 1 }) ? 'active' : ''}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          H1
        </button>
        <button
          type="button"
          className={editor.isActive('heading', { level: 2 }) ? 'active' : ''}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          H2
        </button>
        <button
          type="button"
          className={editor.isActive('heading', { level: 3 }) ? 'active' : ''}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          H3
        </button>
        <span className="rte-sep" />
        <button
          type="button"
          className={editor.isActive('bold') ? 'active' : ''}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          className={editor.isActive('italic') ? 'active' : ''}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <em>I</em>
        </button>
        <span className="rte-sep" />
        <button
          type="button"
          className={editor.isActive('bulletList') ? 'active' : ''}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          • Lista
        </button>
        <button
          type="button"
          className={editor.isActive('orderedList') ? 'active' : ''}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1. Lista
        </button>
        <span className="rte-sep" />
        {TEXT_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            title={color}
            className="rte-color"
            style={{ backgroundColor: color }}
            onClick={() => editor.chain().focus().setColor(color).run()}
          />
        ))}
        <span className="rte-sep" />
        <button type="button" onClick={() => imageInputRef.current?.click()}>
          🖼 Imagem
        </button>
        <button type="button" onClick={() => videoInputRef.current?.click()}>
          🎬 Vídeo
        </button>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleImageSelected}
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          hidden
          onChange={handleVideoSelected}
        />
      </div>

      <EditorContent editor={editor} className="rte-content" />
    </div>
  )
}
