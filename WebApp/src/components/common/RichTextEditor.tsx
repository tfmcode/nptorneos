import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
} from "lucide-react";

const extensions = [StarterKit];

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  className?: string;
}

const RichTextEditor = ({
  content,
  onChange,
  className,
}: RichTextEditorProps) => {
  const editor = useEditor({
    extensions,
    content,
    editorProps: {
      attributes: {
        class: `${className} focus:outline-none prose prose-sm max-w-none p-3 min-h-[100px] [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:text-gray-800 [&>h1]:my-4 [&>h1]:mb-2 [&>h2]:text-xl [&>h2]:font-semibold [&>h2]:text-gray-700 [&>h2]:my-3 [&>h2]:mb-2 [&>p]:my-2 [&>p]:leading-relaxed [&>ul]:list-disc [&>ul]:ml-6 [&>ul]:my-2 [&>ol]:list-decimal [&>ol]:ml-6 [&>ol]:my-2 [&>li]:my-1 [&>blockquote]:border-l-4 [&>blockquote]:border-gray-300 [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-gray-600 [&>blockquote]:my-2 [&>strong]:font-semibold [&>em]:italic`,
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-gray-300 rounded-md overflow-hidden">
      {/* Toolbar */}
      <MenuBar editor={editor} />

      {/* Editor Content */}
      <div className="bg-white">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default RichTextEditor;

const MenuBar = ({ editor }: { editor: Editor }) => {
  const buttons = [
    {
      icon: <Bold size={16} />,
      title: "Bold",
      onClick: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive("bold"),
    },
    {
      icon: <Italic size={16} />,
      title: "Italic",
      onClick: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive("italic"),
    },
    {
      icon: <Heading1 size={16} />,
      title: "Heading 1",
      onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: editor.isActive("heading", { level: 1 }),
    },
    {
      icon: <Heading2 size={16} />,
      title: "Heading 2",
      onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: editor.isActive("heading", { level: 2 }),
    },
    {
      icon: <List size={16} />,
      title: "Bullet List",
      onClick: () => editor.chain().focus().toggleBulletList().run(),
      isActive: editor.isActive("bulletList"),
    },
    {
      icon: <ListOrdered size={16} />,
      title: "Numbered List",
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: editor.isActive("orderedList"),
    },
    {
      icon: <Quote size={16} />,
      title: "Quote",
      onClick: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: editor.isActive("blockquote"),
    },
  ];

  const handleButtonClick = (callback: () => void) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    callback();
  };

  return (
    <div className="flex items-center gap-1 p-2 bg-gray-50 border-b border-gray-200">
      {buttons.map((button) => (
        <button
          key={button.title}
          onClick={handleButtonClick(button.onClick)}
          className={`p-1.5 rounded hover:bg-gray-200 transition-colors ${
            button.isActive ? "bg-gray-200 text-blue-600" : "text-gray-600"
          }`}
          title={button.title}
        >
          {button.icon}
        </button>
      ))}
    </div>
  );
};
