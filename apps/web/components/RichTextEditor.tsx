"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  ImageIcon,
  Undo,
  Redo,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RichTextEditor({
  content,
  onChange,
}: {
  content: string;
  onChange: (html: string) => void;
}) {
  const editor = useEditor({
    extensions: [StarterKit, Image, Link.configure({ openOnClick: false })],
    content,
    // Avoid SSR hydration mismatches — see Tiptap's Next.js install guide.
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "blog-content min-h-[300px] px-4 py-3 focus:outline-none",
      },
    },
  });

  if (!editor) return null;

  function addLink() {
    const url = window.prompt("URL");
    if (!url) return;
    editor?.chain().focus().setLink({ href: url }).run();
  }

  function addImage() {
    const url = window.prompt("Image URL");
    if (!url) return;
    editor?.chain().focus().setImage({ src: url }).run();
  }

  const buttons = [
    {
      icon: Bold,
      label: "Bold",
      action: () => editor.chain().focus().toggleBold().run(),
      active: editor.isActive("bold"),
    },
    {
      icon: Italic,
      label: "Italic",
      action: () => editor.chain().focus().toggleItalic().run(),
      active: editor.isActive("italic"),
    },
    {
      icon: Heading2,
      label: "H2",
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      active: editor.isActive("heading", { level: 2 }),
    },
    {
      icon: Heading3,
      label: "H3",
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      active: editor.isActive("heading", { level: 3 }),
    },
    {
      icon: List,
      label: "Bullet list",
      action: () => editor.chain().focus().toggleBulletList().run(),
      active: editor.isActive("bulletList"),
    },
    {
      icon: ListOrdered,
      label: "Numbered list",
      action: () => editor.chain().focus().toggleOrderedList().run(),
      active: editor.isActive("orderedList"),
    },
    {
      icon: Quote,
      label: "Quote",
      action: () => editor.chain().focus().toggleBlockquote().run(),
      active: editor.isActive("blockquote"),
    },
    {
      icon: LinkIcon,
      label: "Link",
      action: addLink,
      active: editor.isActive("link"),
    },
    { icon: ImageIcon, label: "Image", action: addImage, active: false },
    {
      icon: Undo,
      label: "Undo",
      action: () => editor.chain().focus().undo().run(),
      active: false,
    },
    {
      icon: Redo,
      label: "Redo",
      action: () => editor.chain().focus().redo().run(),
      active: false,
    },
  ];

  return (
    <div
      className="rounded-lg border"
      style={{ borderColor: "#1a2d4a", background: "#0f1e38" }}
    >
      <div
        className="flex flex-wrap gap-1 p-2 border-b"
        style={{ borderColor: "#1a2d4a" }}
      >
        {buttons.map(({ icon: Icon, label, action, active }) => (
          <Button
            key={label}
            type="button"
            size="sm"
            variant="outline"
            className="h-7 w-7 p-0 border-[#1a2d4a]"
            style={
              active ? { background: "#4f6ef733", color: "#4f6ef7" } : undefined
            }
            onClick={action}
            title={label}
          >
            <Icon className="w-3.5 h-3.5" />
          </Button>
        ))}
      </div>
      <EditorContent editor={editor} className="text-white" />
    </div>
  );
}
