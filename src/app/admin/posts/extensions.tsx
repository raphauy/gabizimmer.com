import {
  TiptapLink,
  TiptapUnderline,
  UpdatedImage,
  TaskList,
  TaskItem,
  HorizontalRule,
  StarterKit,
  Placeholder,
  Mathematics,
  Twitter,
  Command,
  renderItems,
  createSuggestionItems,
  type SuggestionItem,
} from "novel"
import { cx } from "class-variance-authority"
import { 
  Hash, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  CheckSquare,
  Code,
  Quote,
  Minus,
  Image,
  Link,
  Calculator,
  Twitter as TwitterIcon
} from "lucide-react"


// Placeholder extension
const placeholderExtension = Placeholder.configure({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  placeholder: ({ node, pos, hasAnchor }: { node: any, pos: number, hasAnchor: boolean }) => {
    // No mostrar placeholder en task items
    if (node.type.name === "taskItem") {
      return "";
    }
    
    // No mostrar placeholder en nodos que tienen contenido o están dentro de listas
    if (hasAnchor || node.content.size > 0) {
      return "";
    }
    
    if (node.type.name === "heading") {
      return `Título ${node.attrs.level}`;
    }
    
    // Solo mostrar el placeholder principal en el primer párrafo vacío del documento
    if (node.type.name === "paragraph" && pos === 1) {
      return "Presiona '/' para comandos o empieza a escribir...";
    }
    
    return "";
  },
  includeChildren: false, // Cambiar a false para evitar mostrar en elementos hijos
});

// TiptapLink extension
const tiptapLink = TiptapLink.configure({
  HTMLAttributes: {
    class: cx(
      "text-muted-foreground underline underline-offset-[3px] hover:text-primary transition-colors cursor-pointer",
    ),
  },
});


// UpdatedImage extension
const updatedImage = UpdatedImage.configure({});

// TaskList extension
const taskList = TaskList.configure({
  itemTypeName: 'taskItem',
  HTMLAttributes: {
    class: 'task-list'
  }
});

// TaskItem extension
const taskItem = TaskItem.configure({
  nested: true,
  HTMLAttributes: {
    class: 'task-list-item'
  }
});

// HorizontalRule extension
const horizontalRule = HorizontalRule.configure({});

// Elementos de sugerencia para comandos slash (mover antes para poder referenciarlos)
export const suggestionItems: SuggestionItem[] = createSuggestionItems([
  {
    title: "Texto",
    description: "Empieza a escribir texto plano.",
    searchTerms: ["p", "párrafo"],
    icon: <Hash size={18} />,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleNode("paragraph", "paragraph")
        .run();
    },
  },
  {
    title: "Título Principal", 
    description: "Encabezado de sección grande (H2).",
    searchTerms: ["título", "principal", "h2"],
    icon: <Heading2 size={18} />,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 2 })
        .run();
    },
  },
  {
    title: "Subtítulo",
    description: "Encabezado de subsección (H3).",
    searchTerms: ["subtítulo", "sub", "h3"],
    icon: <Heading3 size={18} />,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 3 })
        .run();
    },
  },
  {
    title: "Lista con viñetas",
    description: "Crear una lista simple con viñetas.",
    searchTerms: ["lista", "viñeta", "punto"],
    icon: <List size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    title: "Lista numerada",
    description: "Crear una lista con numeración.",
    searchTerms: ["numerada", "ordenada", "números"],
    icon: <ListOrdered size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },
  {
    title: "Lista de tareas",
    description: "Hacer seguimiento de tareas con una lista de verificación.",
    searchTerms: ["todo", "tarea", "checkbox", "verificación"],
    icon: <CheckSquare size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleTaskList().run();
    },
  },
  {
    title: "Bloque de código",
    description: "Capturar un fragmento de código.",
    searchTerms: ["código", "programación"],
    icon: <Code size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
    },
  },
  {
    title: "Cita",
    description: "Capturar una cita.",
    searchTerms: ["cita", "quote", "blockquote"],
    icon: <Quote size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBlockquote().run();
    },
  },
  {
    title: "Línea separadora",
    description: "Dividir visualmente tu contenido.",
    searchTerms: ["línea", "separador", "divisor", "hr"],
    icon: <Minus size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run();
    },
  },
  {
    title: "Imagen",
    description: "Subir una imagen desde tu dispositivo.",
    searchTerms: ["imagen", "foto", "picture", "image"],
    // eslint-disable-next-line jsx-a11y/alt-text
    icon: <Image size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run();
      // Trigger file input
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const url = e.target?.result as string;
            editor.chain().focus().setImage({ src: url, alt: 'Imagen subida' }).run();
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    },
  },
  {
    title: "Enlace",
    description: "Crear un enlace a una página web.",
    searchTerms: ["enlace", "link", "url"],
    icon: <Link size={18} />,
    command: ({ editor, range }) => {
      const url = window.prompt('Introduce la URL:');
      if (url) {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .insertContent(`<a href="${url}">Enlace</a>`)
          .run();
      }
    },
  },
  {
    title: "Matemáticas",
    description: "Escribir expresiones matemáticas con LaTeX.",
    searchTerms: ["matemáticas", "math", "latex", "fórmula"],
    icon: <Calculator size={18} />,
    command: ({ editor, range }) => {
      const latex = window.prompt('Introduce la expresión LaTeX:');
      if (latex) {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .insertContent(`$$${latex}$$`)
          .run();
      }
    },
  },
  {
    title: "Tweet de Twitter",
    description: "Insertar un tweet de Twitter.",
    searchTerms: ["twitter", "tweet", "x"],
    icon: <TwitterIcon size={18} />,
    command: ({ editor, range }) => {
      const tweetUrl = window.prompt('Introduce la URL del tweet:');
      if (tweetUrl) {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .insertContent(`<div data-twitter-url="${tweetUrl}"></div>`)
          .run();
      }
    },
  },
])

// Configurar la extensión Command para slash commands
export const slashCommand = Command.configure({
  suggestion: {
    items: () => suggestionItems,
    render: renderItems,
  },
})

// Configuración de extensiones según la documentación de Novel
export const defaultExtensions = [
  StarterKit.configure({
    heading: {
      levels: [2, 3, 4, 5, 6], // Sin H1 como pediste
    },
    horizontalRule: false,
    dropcursor: {
      color: "#DBEAFE", 
      width: 4,
    },
    gapcursor: false,
  }),
  placeholderExtension,
  tiptapLink,
  TiptapUnderline,
  updatedImage, // Solo usar UpdatedImage, no TiptapImage
  taskList,
  taskItem,
  horizontalRule,
  Mathematics.configure({
    HTMLAttributes: {
      class: cx("math-katex"),
    },
    katexOptions: {
      throwOnError: false,
    },
  }),
  Twitter.configure({
    addPasteHandler: true,
  }),
  slashCommand,
]