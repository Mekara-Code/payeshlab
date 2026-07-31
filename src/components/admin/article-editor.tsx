"use client";

/* eslint-disable @next/next/no-img-element -- Article images are administrator-configured URLs. */

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  deleteArticle,
  saveArticle,
  toggleArticleStatus,
  type ArticleActionState,
  type ManagedContentType,
} from "@/app/admin/articles/actions";
import { useToast } from "@/components/ui/toast-provider";

type BlockType = "paragraph" | "heading" | "list" | "quote" | "table";
type EditorBlock = { id: string; type: BlockType; content: string };

export type ManagedArticle = {
  categories: string[];
  content: unknown;
  excerpt: string | null;
  featuredImage: string | null;
  id: string;
  metaDescription: string | null;
  slug: string;
  status: "DRAFT" | "PUBLISHED";
  tags: string[];
  title: string;
  updatedAt: string;
};

const PAGE_SIZE = 6;
const initialCategories = [
  "آموزش سلامت",
  "آزمایش‌های تخصصی",
  "تغذیه و سبک زندگی",
];
const blockLabels: Record<BlockType, string> = {
  paragraph: "پاراگراف",
  heading: "تیتر",
  list: "فهرست",
  quote: "نقل‌قول",
  table: "جدول",
};

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function getEmptyBlocks(): EditorBlock[] {
  return [{ id: uid(), type: "paragraph", content: "" }];
}

function parseEditorBlocks(value: unknown): EditorBlock[] {
  if (!Array.isArray(value)) return getEmptyBlocks();

  const blocks = value.filter(
    (block): block is EditorBlock =>
      Boolean(block) &&
      typeof block === "object" &&
      typeof (block as EditorBlock).id === "string" &&
      typeof (block as EditorBlock).content === "string" &&
      ["paragraph", "heading", "list", "quote", "table"].includes(
        (block as EditorBlock).type,
      ),
  );

  return blocks.length > 0 ? blocks : getEmptyBlocks();
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9\u0600-\u06ff]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatPersianDate(value: string) {
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function PlusIcon() {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
      <path
        d="m6 6 12 12M18 6 6 18"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24">
      <path
        d="M5 7h14M10 11v6M14 11v6M8 7l1-3h6l1 3M7 7l1 13h8l1-13"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24">
      <path
        d="m14.5 5.5 4 4M4 20l4.2-.8L19.5 7.9a1.4 1.4 0 0 0 0-2l-1.4-1.4a1.4 1.4 0 0 0-2 0L4.8 15.8 4 20Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg aria-hidden="true" className="size-8" fill="none" viewBox="0 0 24 24">
      <path
        d="M6 3.5h8l4 4V20a.8.8 0 0 1-.8.8H6.8A.8.8 0 0 1 6 20V4.3a.8.8 0 0 1 .8-.8Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
      <path
        d="M14 3.5V8h4M9 12h6M9 16h4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function DragHandleIcon() {
  return (
    <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24">
      <path
        d="M8 7h.01M8 12h.01M8 17h.01M16 7h.01M16 12h.01M16 17h.01"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="3"
      />
    </svg>
  );
}

function TableIcon() {
  return (
    <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24">
      <rect
        height="14"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.8"
        width="16"
        x="4"
        y="5"
      />
      <path
        d="M4 10h16M10 5v14M15 5v14"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
      <path
        d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M5 15v3.2c0 1 .8 1.8 1.8 1.8h10.4c1 0 1.8-.8 1.8-1.8V15"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
    </svg>
  );
}

function BlockIcon({ type }: { type: BlockType }) {
  if (type === "heading") return <span className="font-black">H</span>;
  if (type === "list") return <span className="font-black">≡</span>;
  if (type === "quote") return <span className="text-xl font-black">“</span>;
  if (type === "table") return <TableIcon />;
  return <span className="font-black">¶</span>;
}

function getEmptyTableRows() {
  return [
    ["عنوان ستون اول", "عنوان ستون دوم"],
    ["", ""],
  ];
}

function parseTableRows(value: string) {
  try {
    const rawRows = JSON.parse(value) as unknown;
    if (!Array.isArray(rawRows) || rawRows.length === 0)
      return getEmptyTableRows();

    const validRows = rawRows
      .filter((row): row is unknown[] => Array.isArray(row))
      .slice(0, 20);
    if (validRows.length === 0) return getEmptyTableRows();
    const columnCount = Math.min(
      12,
      Math.max(1, ...validRows.map((row) => row.length)),
    );
    return validRows.map((row) =>
      Array.from({ length: columnCount }, (_, index) =>
        typeof row[index] === "string" ? row[index] : "",
      ),
    );
  } catch {
    return getEmptyTableRows();
  }
}

function serializeTableRows(rows: string[][]) {
  return JSON.stringify(rows);
}

function isContentEmpty(value: string) {
  return (
    value
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim().length === 0
  );
}

function RichTextComposer({
  ariaLabel,
  className,
  onChange,
  placeholder,
  value,
}: {
  ariaLabel: string;
  className?: string;
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value)
      editorRef.current.innerHTML = value;
  }, [value]);

  function updateValue() {
    onChange(editorRef.current?.innerHTML ?? "");
  }

  function executeCommand(command: string, commandValue?: string) {
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    updateValue();
  }

  function addLink() {
    const href = window.prompt("نشانی پیوند را وارد کنید:");
    if (href) executeCommand("createLink", href);
  }

  const toolButtonClass =
    "grid size-11 place-items-center rounded-lg text-sm font-black text-slate-600 transition hover:bg-teal-100 hover:text-teal-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500";

  return (
    <div className="rounded-xl border border-slate-200 bg-white focus-within:border-teal-500 focus-within:ring-4 focus-within:ring-teal-500/10">
      <div
        aria-label="ابزارهای ویرایش متن"
        className="flex flex-wrap gap-1 border-b border-slate-100 p-1.5"
        role="toolbar"
      >
        <button
          aria-label="پررنگ"
          className={toolButtonClass}
          onMouseDown={(event) => {
            event.preventDefault();
            executeCommand("bold");
          }}
          title="پررنگ"
          type="button"
        >
          B
        </button>
        <button
          aria-label="مورب"
          className={`${toolButtonClass} italic`}
          onMouseDown={(event) => {
            event.preventDefault();
            executeCommand("italic");
          }}
          title="مورب"
          type="button"
        >
          I
        </button>
        <button
          aria-label="زیرخط"
          className={`${toolButtonClass} underline`}
          onMouseDown={(event) => {
            event.preventDefault();
            executeCommand("underline");
          }}
          title="زیرخط"
          type="button"
        >
          U
        </button>
        <button
          aria-label="خط‌خورده"
          className={`${toolButtonClass} line-through`}
          onMouseDown={(event) => {
            event.preventDefault();
            executeCommand("strikeThrough");
          }}
          title="خط‌خورده"
          type="button"
        >
          S
        </button>
        <button
          aria-label="فهرست نشانه‌دار"
          className={toolButtonClass}
          onMouseDown={(event) => {
            event.preventDefault();
            executeCommand("insertUnorderedList");
          }}
          title="فهرست نشانه‌دار"
          type="button"
        >
          •
        </button>
        <button
          aria-label="افزودن پیوند"
          className={toolButtonClass}
          onMouseDown={(event) => {
            event.preventDefault();
            addLink();
          }}
          title="افزودن پیوند"
          type="button"
        >
          ↗
        </button>
        <button
          aria-label="پاک‌کردن قالب‌بندی"
          className={toolButtonClass}
          onMouseDown={(event) => {
            event.preventDefault();
            executeCommand("removeFormat");
          }}
          title="پاک‌کردن قالب‌بندی"
          type="button"
        >
          Tx
        </button>
      </div>
      <div className="relative">
        {isContentEmpty(value) ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-3 top-3 text-base text-slate-300"
          >
            {placeholder}
          </span>
        ) : null}
        <div
          aria-label={ariaLabel}
          className={`min-h-32 p-3 text-base leading-8 text-slate-700 outline-none ${className ?? ""}`}
          contentEditable
          dir="auto"
          onInput={updateValue}
          ref={editorRef}
          role="textbox"
          suppressContentEditableWarning
        />
      </div>
    </div>
  );
}

function TableBlockEditor({
  onChange,
  value,
}: {
  onChange: (value: string) => void;
  value: string;
}) {
  const rows = parseTableRows(value);

  function updateRows(updater: (current: string[][]) => string[][]) {
    onChange(serializeTableRows(updater(rows)));
  }

  function updateCell(rowIndex: number, cellIndex: number, cellValue: string) {
    updateRows((current) =>
      current.map((row, index) =>
        index === rowIndex
          ? row.map((cell, columnIndex) =>
              columnIndex === cellIndex ? cellValue : cell,
            )
          : row,
      ),
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 bg-slate-50 px-3 py-2">
        <span className="ml-auto text-xs font-extrabold text-slate-500">
          جدول قابل‌ویرایش
        </span>
        <button
          className="min-h-11 rounded-lg px-3 text-xs font-extrabold text-teal-500 transition hover:bg-teal-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 disabled:opacity-40"
          disabled={rows.length >= 20}
          onClick={() =>
            updateRows((current) => [...current, current[0].map(() => "")])
          }
          type="button"
        >
          ردیف +
        </button>
        <button
          className="min-h-11 rounded-lg px-3 text-xs font-extrabold text-teal-500 transition hover:bg-teal-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 disabled:opacity-40"
          disabled={rows[0].length >= 12}
          onClick={() =>
            updateRows((current) => current.map((row) => [...row, ""]))
          }
          type="button"
        >
          ستون +
        </button>
        <button
          className="min-h-11 rounded-lg px-3 text-xs font-extrabold text-rose-700 transition hover:bg-rose-50 disabled:opacity-40"
          disabled={rows.length === 1}
          onClick={() => updateRows((current) => current.slice(0, -1))}
          type="button"
        >
          ردیف −
        </button>
        <button
          className="min-h-11 rounded-lg px-3 text-xs font-extrabold text-rose-700 transition hover:bg-rose-50 disabled:opacity-40"
          disabled={rows[0].length === 1}
          onClick={() =>
            updateRows((current) => current.map((row) => row.slice(0, -1)))
          }
          type="button"
        >
          ستون −
        </button>
      </div>
      <div className="overflow-x-auto p-3">
        <table className="w-full min-w-[34rem] border-collapse text-sm">
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td className="border border-slate-200 p-0" key={cellIndex}>
                    <input
                      aria-label={`ردیف ${rowIndex + 1} ستون ${cellIndex + 1}`}
                      className={`min-h-11 w-full bg-transparent px-3 outline-none focus:bg-teal-50 focus:ring-2 focus:ring-inset focus:ring-teal-500 ${rowIndex === 0 ? "font-extrabold text-slate-900" : "font-medium text-slate-700"}`}
                      onChange={(event) =>
                        updateCell(rowIndex, cellIndex, event.target.value)
                      }
                      value={cell}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SortableEditorBlock({
  block,
  index,
  onRemove,
  onUpdate,
}: {
  block: EditorBlock;
  index: number;
  onRemove: (id: string) => void;
  onUpdate: (id: string, content: string) => void;
}) {
  const {
    attributes,
    isDragging,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: block.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <article
      className={`group rounded-2xl border p-3 transition ${isDragging ? "border-teal-400 bg-teal-50/80 shadow-lg" : "border-transparent hover:border-teal-100 hover:bg-teal-50/35"}`}
      ref={setNodeRef}
      style={style}
    >
      <div className="mb-2 flex items-center justify-between gap-3 text-xs font-extrabold text-slate-400">
        <span className="inline-flex items-center gap-2">
          <button
            aria-label={`جابجایی بلوک ${index + 1}`}
            className="grid size-11 cursor-grab place-items-center rounded-lg text-slate-400 transition hover:bg-teal-100 hover:text-teal-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 active:cursor-grabbing"
            ref={setActivatorNodeRef}
            type="button"
            {...attributes}
            {...listeners}
          >
            <DragHandleIcon />
          </button>
          <span className="grid size-6 place-items-center rounded-md bg-slate-100 text-slate-600">
            <BlockIcon type={block.type} />
          </span>
          {blockLabels[block.type]} {index + 1}
        </span>
        <button
          aria-label="حذف بلوک"
          className="grid size-11 place-items-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-700"
          onClick={() => onRemove(block.id)}
          type="button"
        >
          <TrashIcon />
        </button>
      </div>
      {block.type === "heading" ? (
        <input
          aria-label="متن تیتر"
          className="w-full rounded-lg bg-transparent px-2 py-1 text-2xl font-black text-slate-950 outline-none placeholder:text-slate-300 focus-visible:ring-2 focus-visible:ring-teal-500"
          onChange={(event) => onUpdate(block.id, event.target.value)}
          placeholder="تیتر بخش"
          value={block.content}
        />
      ) : block.type === "table" ? (
        <TableBlockEditor
          onChange={(value) => onUpdate(block.id, value)}
          value={block.content}
        />
      ) : (
        <RichTextComposer
          ariaLabel={`محتوای ${blockLabels[block.type]}`}
          className={
            block.type === "quote"
              ? "border-r-4 border-teal-500 pr-4 font-bold text-slate-800"
              : ""
          }
          onChange={(value) => onUpdate(block.id, value)}
          placeholder={
            block.type === "list"
              ? "فهرست را بنویسید یا از ابزار فهرست استفاده کنید…"
              : "برای نوشتن شروع کنید…"
          }
          value={block.content}
        />
      )}
    </article>
  );
}

export function ArticleEditor({
  contentType = "ARTICLE",
  items = [],
}: {
  contentType?: ManagedContentType;
  items?: ManagedArticle[];
}) {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [blocks, setBlocks] = useState<EditorBlock[]>(getEmptyBlocks);
  const [isInserterOpen, setIsInserterOpen] = useState(false);
  const [categories, setCategories] = useState(initialCategories);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    initialCategories[0],
  ]);
  const [categoryDraft, setCategoryDraft] = useState("");
  const [tags, setTags] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null);
  const [featuredImagePreview, setFeaturedImagePreview] = useState<
    string | null
  >(null);
  const [isFeaturedImageDragging, setIsFeaturedImageDragging] = useState(false);
  const [featuredImageError, setFeaturedImageError] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isSaving, startSaving] = useTransition();
  const [isManaging, startManaging] = useTransition();
  const dialogRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const submitStatusRef = useRef<"draft" | "published">("published");
  const featuredImageInputRef = useRef<HTMLInputElement>(null);
  const featuredImagePreviewUrlRef = useRef<string | null>(null);
  const shouldReduceMotion = useReducedMotion() ?? false;
  const router = useRouter();
  const { toast } = useToast();
  const serializedBlocks = useMemo(() => JSON.stringify(blocks), [blocks]);
  const contentLabel = contentType === "NEWS" ? "خبر" : "مقاله";
  const pageCount = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const visiblePage = Math.min(currentPage, pageCount);
  const pageItems = items.slice(
    (visiblePage - 1) * PAGE_SIZE,
    visiblePage * PAGE_SIZE,
  );
  const displayedFeaturedImage = featuredImagePreview ?? featuredImage;
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const resetEditor = useCallback(() => {
    setEditingId(null);
    setTitle("");
    setSlug("");
    setSlugTouched(false);
    setBlocks(getEmptyBlocks());
    setSelectedCategories([initialCategories[0]]);
    setTags("");
    setExcerpt("");
    setFeaturedImage("");
    if (featuredImagePreviewUrlRef.current)
      URL.revokeObjectURL(featuredImagePreviewUrlRef.current);
    featuredImagePreviewUrlRef.current = null;
    setFeaturedImageFile(null);
    setFeaturedImagePreview(null);
    setFeaturedImageError("");
    setIsFeaturedImageDragging(false);
    if (featuredImageInputRef.current) featuredImageInputRef.current.value = "";
    setMetaDescription("");
    setIsInserterOpen(false);
  }, []);

  const closeEditor = useCallback(() => {
    setIsEditorOpen(false);
    setIsInserterOpen(false);
  }, []);

  useEffect(() => {
    if (!isEditorOpen) return;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeEditor();
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = focusable[0];
      const lastElement = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    const frame = window.requestAnimationFrame(() =>
      closeButtonRef.current?.focus(),
    );

    return () => {
      document.body.style.overflow = previousOverflow;
      window.cancelAnimationFrame(frame);
      window.removeEventListener("keydown", handleKeyDown);
      returnFocusRef.current?.focus();
    };
  }, [closeEditor, isEditorOpen]);

  useEffect(
    () => () => {
      if (featuredImagePreviewUrlRef.current)
        URL.revokeObjectURL(featuredImagePreviewUrlRef.current);
    },
    [],
  );

  function openNewEditor(trigger: HTMLElement) {
    resetEditor();
    returnFocusRef.current = trigger;
    setIsEditorOpen(true);
  }

  function openEditEditor(item: ManagedArticle, trigger: HTMLElement) {
    const itemCategories =
      item.categories.length > 0 ? item.categories : [initialCategories[0]];
    setEditingId(item.id);
    setTitle(item.title);
    setSlug(item.slug);
    setSlugTouched(true);
    setBlocks(parseEditorBlocks(item.content));
    setCategories((current) =>
      Array.from(new Set([...current, ...itemCategories])),
    );
    setSelectedCategories(itemCategories);
    setTags(item.tags.join(", "));
    setExcerpt(item.excerpt ?? "");
    setFeaturedImage(item.featuredImage ?? "");
    if (featuredImagePreviewUrlRef.current)
      URL.revokeObjectURL(featuredImagePreviewUrlRef.current);
    featuredImagePreviewUrlRef.current = null;
    setFeaturedImageFile(null);
    setFeaturedImagePreview(null);
    setFeaturedImageError("");
    setIsFeaturedImageDragging(false);
    if (featuredImageInputRef.current) featuredImageInputRef.current.value = "";
    setMetaDescription(item.metaDescription ?? "");
    setIsInserterOpen(false);
    returnFocusRef.current = trigger;
    setIsEditorOpen(true);
  }

  function updateBlock(id: string, content: string) {
    setBlocks((current) =>
      current.map((block) => (block.id === id ? { ...block, content } : block)),
    );
  }

  function addBlock(type: BlockType) {
    setBlocks((current) => [
      ...current,
      {
        id: uid(),
        type,
        content:
          type === "table" ? serializeTableRows(getEmptyTableRows()) : "",
      },
    ]);
    setIsInserterOpen(false);
  }

  function removeBlock(id: string) {
    setBlocks((current) =>
      current.length === 1
        ? current
        : current.filter((block) => block.id !== id),
    );
  }

  function clearSelectedFeaturedImage() {
    if (featuredImagePreviewUrlRef.current)
      URL.revokeObjectURL(featuredImagePreviewUrlRef.current);
    featuredImagePreviewUrlRef.current = null;
    setFeaturedImageFile(null);
    setFeaturedImagePreview(null);
    setFeaturedImageError("");
    if (featuredImageInputRef.current) featuredImageInputRef.current.value = "";
  }

  function selectFeaturedImage(file: File | undefined) {
    if (!file) return;
    if (
      !new Set(["image/jpeg", "image/png", "image/webp"]).has(file.type) ||
      file.size > 5 * 1024 * 1024
    ) {
      setFeaturedImageError(
        "فقط PNG، JPG یا WebP با حجم حداکثر ۵ مگابایت قابل بارگذاری است.",
      );
      return;
    }

    clearSelectedFeaturedImage();
    const previewUrl = URL.createObjectURL(file);
    featuredImagePreviewUrlRef.current = previewUrl;
    setFeaturedImageFile(file);
    setFeaturedImagePreview(previewUrl);
    setFeaturedImage("");
  }

  function handleBlockDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setBlocks((current) => {
      const oldIndex = current.findIndex((block) => block.id === active.id);
      const newIndex = current.findIndex((block) => block.id === over.id);
      return oldIndex < 0 || newIndex < 0
        ? current
        : arrayMove(current, oldIndex, newIndex);
    });
  }

  function toggleCategory(category: string) {
    setSelectedCategories((current) =>
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category],
    );
  }

  function addCategory() {
    const value = categoryDraft.trim();
    if (!value) return;
    setCategories((current) =>
      current.includes(value) ? current : [...current, value],
    );
    setSelectedCategories((current) =>
      current.includes(value) ? current : [...current, value],
    );
    setCategoryDraft("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSaving) return;

    const formData = new FormData(event.currentTarget);
    formData.set("status", submitStatusRef.current);
    if (featuredImageFile) formData.set("featuredImageFile", featuredImageFile);
    startSaving(async () => {
      const result = await saveArticle({}, formData);
      if (!result.success) {
        toast(result.message ?? "ذخیره محتوا انجام نشد.", {
          variant: "error",
        });
        return;
      }

      toast(result.message ?? "تغییرات محتوا ذخیره شد.", {
        variant: "success",
      });
      router.refresh();
      closeEditor();
      resetEditor();
    });
  }

  function runContentAction(action: () => Promise<ArticleActionState>) {
    startManaging(async () => {
      const result = await action();
      if (result.message)
        toast(result.message, { variant: result.success ? "success" : "error" });
      if (result.success) router.refresh();
    });
  }

  return (
    <div className="pb-8">
      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_14px_34px_rgba(15,23,42,0.05)] sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-extrabold tracking-wide text-teal-500">
              مدیریت محتوا
            </p>
            <h2 className="mt-1 text-2xl font-black tracking-[-0.04em] text-slate-950">
              {contentLabel}‌ها
            </h2>
            <p className="mt-2 text-sm font-medium text-slate-600">
              {contentLabel}‌های خود را ایجاد، ویرایش، منتشر یا حذف کنید.
            </p>
          </div>
          <button
            className="inline-flex min-h-12 w-fit items-center gap-2 rounded-2xl bg-teal-500 px-5 text-sm font-extrabold text-white transition-[background-color,transform] duration-200 hover:-translate-y-0.5 hover:bg-teal-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-500 active:translate-y-0"
            onClick={(event) => openNewEditor(event.currentTarget)}
            type="button"
          >
            <PlusIcon />
            {contentLabel} جدید
          </button>
        </div>

        {items.length > 0 ? (
          <>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {pageItems.map((item) => {
                const isPublished = item.status === "PUBLISHED";
                return (
                  <article
                    className="group overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-teal-200"
                    key={item.id}
                  >
                    <div className="relative flex h-32 items-end overflow-hidden bg-slate-950 p-4 text-white">
                      {item.featuredImage ? (
                        <img
                          alt=""
                          aria-hidden="true"
                          className="absolute inset-0 size-full object-cover opacity-55 transition-transform duration-500 group-hover:scale-105"
                          src={item.featuredImage}
                        />
                      ) : (
                        <span
                          aria-hidden="true"
                          className="absolute inset-0 grid place-items-center bg-teal-500 text-teal-100"
                        >
                          <DocumentIcon />
                        </span>
                      )}
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,44,34,0.08),rgba(2,44,34,0.85))]"
                      />
                      <span
                        className={`relative rounded-full px-2.5 py-1 text-[11px] font-extrabold ${isPublished ? "bg-teal-100 text-teal-500" : "bg-white/20 text-white"}`}
                      >
                        {isPublished ? "منتشرشده" : "پیش‌نویس"}
                      </span>
                    </div>
                    <div className="p-4">
                      <time
                        className="text-xs font-bold text-teal-500"
                        dateTime={item.updatedAt}
                      >
                        {formatPersianDate(item.updatedAt)}
                      </time>
                      <h3 className="mt-2 line-clamp-2 min-h-12 text-sm font-black leading-6 text-slate-950">
                        {item.title}
                      </h3>
                      <p className="mt-2 line-clamp-2 min-h-10 text-xs font-medium leading-5 text-slate-500">
                        {item.excerpt || "بدون خلاصه"}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                        <button
                          className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-teal-50 px-3 text-xs font-extrabold text-teal-500 transition hover:bg-teal-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
                          onClick={(event) =>
                            openEditEditor(item, event.currentTarget)
                          }
                          type="button"
                        >
                          <EditIcon />
                          ویرایش
                        </button>
                        <button
                          className="min-h-10 rounded-xl px-3 text-xs font-extrabold text-rose-700 transition hover:bg-rose-50 disabled:opacity-60"
                          disabled={isManaging}
                          onClick={() =>
                            runContentAction(() =>
                              deleteArticle(item.id, contentType),
                            )
                          }
                          type="button"
                        >
                          حذف
                        </button>
                        <button
                          className="min-h-10 rounded-xl px-3 text-xs font-extrabold text-slate-600 transition hover:bg-slate-100 disabled:opacity-60"
                          disabled={isManaging}
                          onClick={() =>
                            runContentAction(() =>
                              toggleArticleStatus(
                                item.id,
                                contentType,
                                isPublished,
                              ),
                            )
                          }
                          type="button"
                        >
                          {isPublished ? "پیش‌نویس" : "انتشار"}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {pageCount > 1 ? (
              <nav
                aria-label={`صفحه‌بندی ${contentLabel}‌ها`}
                className="mt-6 flex items-center justify-center gap-3"
              >
                <button
                  aria-label="صفحه قبل"
                  className="grid size-11 place-items-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-teal-50 hover:text-teal-500 disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={visiblePage === 1}
                  onClick={() =>
                    setCurrentPage((current) => Math.max(1, current - 1))
                  }
                  type="button"
                >
                  ›
                </button>
                <span className="min-w-28 text-center text-sm font-extrabold text-slate-700">
                  صفحه {visiblePage.toLocaleString("fa-IR")} از{" "}
                  {pageCount.toLocaleString("fa-IR")}
                </span>
                <button
                  aria-label="صفحه بعد"
                  className="grid size-11 place-items-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-teal-50 hover:text-teal-500 disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={visiblePage === pageCount}
                  onClick={() =>
                    setCurrentPage((current) =>
                      Math.min(pageCount, current + 1),
                    )
                  }
                  type="button"
                >
                  ‹
                </button>
              </nav>
            ) : null}
          </>
        ) : (
          <div className="mt-6 rounded-[1.5rem] bg-slate-50 px-5 py-12 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-teal-100 text-teal-500">
              <DocumentIcon />
            </span>
            <p className="mt-4 text-sm font-bold text-slate-600">
              هنوز {contentLabel}ی ثبت نشده است.
            </p>
          </div>
        )}
      </section>

      <AnimatePresence>
        {isEditorOpen ? (
          <motion.div
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] flex items-end sm:items-center sm:justify-center sm:p-5"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.2,
              ease: "easeOut",
            }}
          >
            <button
              aria-label="بستن ویرایشگر"
              className="absolute inset-0 cursor-default bg-slate-950/60 backdrop-blur-[2px]"
              onClick={closeEditor}
              tabIndex={-1}
              type="button"
            />
            <motion.section
              animate={{ opacity: 1, scale: 1, y: 0 }}
              aria-labelledby="content-editor-title"
              aria-modal="true"
              className="relative flex max-h-[calc(100dvh-0.75rem)] w-full flex-col overflow-hidden rounded-t-[2rem] bg-[#f4fbfa] shadow-[0_28px_72px_rgba(15,23,42,0.3)] sm:max-h-[min(92dvh,54rem)] sm:max-w-6xl sm:rounded-[2rem]"
              exit={{
                opacity: 0,
                scale: shouldReduceMotion ? 1 : 0.98,
                y: shouldReduceMotion ? 0 : 16,
              }}
              id="content-editor-dialog"
              initial={{
                opacity: 0,
                scale: shouldReduceMotion ? 1 : 0.98,
                y: shouldReduceMotion ? 0 : 24,
              }}
              ref={dialogRef}
              role="dialog"
              transition={{
                duration: shouldReduceMotion ? 0 : 0.24,
                ease: "easeOut",
              }}
            >
              <header className="flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-5 pb-4 pt-5 sm:px-7 sm:pb-5 sm:pt-6">
                <div>
                  <span className="inline-flex rounded-full bg-teal-50 px-3 py-1 text-xs font-extrabold text-teal-500">
                    مدیریت محتوا
                  </span>
                  <h2
                    className="mt-2 text-xl font-black tracking-[-0.04em] text-slate-950 sm:text-2xl"
                    id="content-editor-title"
                  >
                    {editingId
                      ? `ویرایش ${contentLabel}`
                      : `${contentLabel} جدید`}
                  </h2>
                </div>
                <button
                  aria-label="بستن مودال"
                  className="grid size-11 shrink-0 place-items-center rounded-full border border-slate-200 text-slate-600 transition-[background-color,color,transform] duration-200 hover:bg-teal-100 hover:text-teal-500 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-500 active:scale-95"
                  onClick={closeEditor}
                  ref={closeButtonRef}
                  type="button"
                >
                  <CloseIcon />
                </button>
              </header>

              <form
                className="flex min-h-0 flex-1 flex-col"
                onSubmit={handleSubmit}
              >
                <input
                  name="blocksJson"
                  type="hidden"
                  value={serializedBlocks}
                />
                <input
                  name="categoriesJson"
                  type="hidden"
                  value={JSON.stringify(selectedCategories)}
                />
                <input name="id" type="hidden" value={editingId ?? ""} />
                <input
                  name="tagsJson"
                  type="hidden"
                  value={JSON.stringify(
                    tags
                      .split(",")
                      .map((tag) => tag.trim())
                      .filter(Boolean),
                  )}
                />
                <input name="type" type="hidden" value={contentType} />

                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-5 py-3 sm:px-7">
                  <div className="relative">
                    <button
                      aria-expanded={isInserterOpen}
                      className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-3 text-sm font-extrabold text-teal-500 transition hover:bg-teal-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
                      onClick={() => setIsInserterOpen((value) => !value)}
                      type="button"
                    >
                      <PlusIcon />
                      افزودن بلوک
                    </button>
                    {isInserterOpen ? (
                      <div className="absolute top-[calc(100%+0.5rem)] z-30 grid w-56 gap-1 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_18px_50px_rgba(15,23,42,0.18)]">
                        {(
                          [
                            "paragraph",
                            "heading",
                            "list",
                            "quote",
                            "table",
                          ] as BlockType[]
                        ).map((type) => (
                          <button
                            className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-right text-sm font-bold text-slate-700 transition hover:bg-teal-50 hover:text-teal-500"
                            key={type}
                            onClick={() => addBlock(type)}
                            type="button"
                          >
                            <span className="grid size-7 place-items-center rounded-lg bg-slate-100">
                              <BlockIcon type={type} />
                            </span>
                            {blockLabels[type]}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="min-h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                      disabled={isSaving}
                      onClick={() => {
                        submitStatusRef.current = "draft";
                      }}
                      type="submit"
                    >
                      ذخیره پیش‌نویس
                    </button>
                    <button
                      className="min-h-11 rounded-xl bg-teal-500 px-4 text-sm font-extrabold text-white transition hover:bg-teal-500 disabled:opacity-60"
                      disabled={isSaving}
                      onClick={() => {
                        submitStatusRef.current = "published";
                      }}
                      type="submit"
                    >
                      {isSaving
                        ? "در حال ذخیره…"
                        : editingId
                          ? "به‌روزرسانی"
                          : "انتشار"}
                    </button>
                  </div>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5 sm:p-7">
                  <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem] xl:items-start">
                    <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_14px_34px_rgba(15,23,42,0.05)] sm:p-7">
                      <label
                        className="sr-only"
                        htmlFor={`${contentType}-title`}
                      >
                        عنوان {contentLabel}
                      </label>
                      <input
                        className="w-full border-0 bg-transparent p-0 text-3xl font-black tracking-[-0.05em] text-slate-950 outline-none placeholder:text-slate-300 focus-visible:ring-2 focus-visible:ring-teal-500 sm:text-4xl"
                        id={`${contentType}-title`}
                        name="title"
                        onChange={(event) => {
                          setTitle(event.target.value);
                          if (!slugTouched)
                            setSlug(slugify(event.target.value));
                        }}
                        placeholder={`افزودن عنوان ${contentLabel}`}
                        required
                        value={title}
                      />
                      <div className="mt-5 flex items-center gap-2 border-y border-slate-100 py-3 text-xs font-bold text-slate-500">
                        <span>نامک:</span>
                        <input
                          className="min-w-0 flex-1 bg-transparent text-left text-slate-700 outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                          dir="ltr"
                          name="slug"
                          onChange={(event) => {
                            setSlugTouched(true);
                            setSlug(event.target.value);
                          }}
                          value={slug}
                        />
                      </div>
                      <p
                        className="mt-6 text-xs font-bold leading-6 text-slate-500"
                        id="block-order-help"
                      >
                        برای جابه‌جایی هر بخش، دستهٔ کنار آن را بکشید یا با
                        صفحه‌کلید جابه‌جا کنید.
                      </p>
                      <DndContext
                        collisionDetection={closestCenter}
                        onDragEnd={handleBlockDragEnd}
                        sensors={sensors}
                      >
                        <SortableContext
                          items={blocks.map((block) => block.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          <div
                            aria-describedby="block-order-help"
                            className="mt-3 grid gap-4"
                          >
                            {blocks.map((block, index) => (
                              <SortableEditorBlock
                                block={block}
                                index={index}
                                key={block.id}
                                onRemove={removeBlock}
                                onUpdate={updateBlock}
                              />
                            ))}
                          </div>
                        </SortableContext>
                      </DndContext>
                      <button
                        className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-extrabold text-teal-500 transition hover:bg-teal-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
                        onClick={() => addBlock("paragraph")}
                        type="button"
                      >
                        <PlusIcon />
                        افزودن پاراگراف
                      </button>
                    </section>
                    <aside className="grid gap-5">
                      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
                        <h3 className="text-sm font-black text-slate-950">
                          دسته‌بندی‌ها
                        </h3>
                        <div className="mt-4 grid gap-2">
                          {categories.map((category) => (
                            <label
                              className="flex min-h-10 items-center gap-3 text-sm font-bold text-slate-700"
                              key={category}
                            >
                              <input
                                checked={selectedCategories.includes(category)}
                                className="size-4 accent-teal-500"
                                onChange={() => toggleCategory(category)}
                                type="checkbox"
                              />
                              {category}
                            </label>
                          ))}
                        </div>
                        <div className="mt-4 flex gap-2">
                          <label
                            className="sr-only"
                            htmlFor={`${contentType}-new-category`}
                          >
                            دسته‌بندی جدید
                          </label>
                          <input
                            className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                            id={`${contentType}-new-category`}
                            onChange={(event) =>
                              setCategoryDraft(event.target.value)
                            }
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                event.preventDefault();
                                addCategory();
                              }
                            }}
                            placeholder="دسته جدید"
                            value={categoryDraft}
                          />
                          <button
                            className="grid size-11 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-500 hover:bg-teal-100"
                            onClick={addCategory}
                            type="button"
                          >
                            <PlusIcon />
                          </button>
                        </div>
                      </section>
                      <section className="grid gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
                        <label className="grid gap-2 text-sm font-black text-slate-950">
                          خلاصه {contentLabel}
                          <textarea
                            className="min-h-24 resize-y rounded-xl border border-slate-200 p-3 text-sm font-medium leading-6 text-slate-700 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                            name="excerpt"
                            onChange={(event) => setExcerpt(event.target.value)}
                            placeholder="خلاصه‌ای کوتاه برای نمایش در فهرست…"
                            value={excerpt}
                          />
                        </label>
                        <label className="grid gap-2 text-sm font-black text-slate-950">
                          برچسب‌ها
                          <input
                            className="rounded-xl border border-slate-200 p-3 text-sm font-medium text-slate-700 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                            onChange={(event) => setTags(event.target.value)}
                            placeholder="آزمایش، سلامت، تغذیه"
                            value={tags}
                          />
                        </label>
                        <section
                          aria-labelledby={`${contentType}-featured-image-label`}
                          className="grid gap-3"
                        >
                          <p
                            className="text-sm font-black text-slate-950"
                            id={`${contentType}-featured-image-label`}
                          >
                            تصویر شاخص
                          </p>
                          <input
                            accept="image/jpeg,image/png,image/webp"
                            className="sr-only"
                            id={`${contentType}-featured-image-file`}
                            name="featuredImageFile"
                            onChange={(event) => {
                              selectFeaturedImage(event.target.files?.[0]);
                              event.currentTarget.value = "";
                            }}
                            ref={featuredImageInputRef}
                            type="file"
                          />
                          <label
                            aria-describedby={`${contentType}-featured-image-help`}
                            aria-labelledby={`${contentType}-featured-image-label`}
                            className={`flex min-h-36 cursor-pointer items-center gap-4 rounded-2xl border-2 border-dashed p-4 transition duration-200 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-teal-500 ${isFeaturedImageDragging ? "border-teal-500 bg-teal-50 shadow-[0_0_0_5px_rgba(20,184,166,0.1)]" : "border-slate-200 bg-slate-50/70 hover:border-teal-300 hover:bg-teal-50/50"}`}
                            htmlFor={`${contentType}-featured-image-file`}
                            onDragEnter={() => setIsFeaturedImageDragging(true)}
                            onDragLeave={() =>
                              setIsFeaturedImageDragging(false)
                            }
                            onDragOver={(event) => {
                              event.preventDefault();
                              setIsFeaturedImageDragging(true);
                            }}
                            onDrop={(event) => {
                              event.preventDefault();
                              setIsFeaturedImageDragging(false);
                              selectFeaturedImage(event.dataTransfer.files[0]);
                            }}
                          >
                            {displayedFeaturedImage ? (
                              <img
                                alt={
                                  featuredImagePreview
                                    ? "پیش‌نمایش تصویر شاخص جدید"
                                    : "تصویر شاخص فعلی"
                                }
                                className="size-20 shrink-0 rounded-xl border border-white bg-white object-cover shadow-sm"
                                src={displayedFeaturedImage}
                              />
                            ) : (
                              <span
                                aria-hidden="true"
                                className="grid size-14 shrink-0 place-items-center rounded-2xl bg-teal-500 text-white shadow-[0_10px_20px_rgba(13,148,136,0.2)]"
                              >
                                <UploadIcon />
                              </span>
                            )}
                            <span className="min-w-0">
                              <span className="block text-sm font-extrabold text-slate-800">
                                {featuredImagePreview
                                  ? featuredImageFile?.name
                                  : displayedFeaturedImage
                                    ? "برای جایگزینی، تصویر تازه را رها کنید"
                                    : "تصویر را اینجا رها کنید"}
                              </span>
                              <span className="mt-1 block text-xs font-bold leading-5 text-slate-500">
                                یا برای انتخاب فایل کلیک کنید
                              </span>
                              <span className="mt-1 block text-[11px] font-bold text-teal-500">
                                PNG، JPG یا WebP · حداکثر ۵ مگابایت
                              </span>
                            </span>
                          </label>
                          <p
                            className="text-xs font-medium leading-5 text-slate-500"
                            id={`${contentType}-featured-image-help`}
                          >
                            تصویر هنگام ذخیره با نامی تصادفی در فضای اختصاصی
                            مقالات نگه‌داری می‌شود.
                          </p>
                          {featuredImagePreview ? (
                            <button
                              className="min-h-11 w-fit rounded-xl px-3 text-sm font-extrabold text-rose-700 transition hover:bg-rose-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-700"
                              onClick={clearSelectedFeaturedImage}
                              type="button"
                            >
                              انصراف از تصویر انتخاب‌شده
                            </button>
                          ) : null}
                          {displayedFeaturedImage ? (
                            <button
                              className="min-h-11 w-fit rounded-xl px-3 text-sm font-extrabold text-rose-700 transition hover:bg-rose-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-700"
                              onClick={() => {
                                clearSelectedFeaturedImage();
                                setFeaturedImage("");
                              }}
                              type="button"
                            >
                              حذف تصویر شاخص
                            </button>
                          ) : null}
                          {featuredImageError ? (
                            <p
                              className="text-sm font-bold text-rose-700"
                              role="alert"
                            >
                              {featuredImageError}
                            </p>
                          ) : null}
                          <label className="grid gap-2 text-xs font-extrabold text-slate-600">
                            یا نشانی تصویر را وارد کنید
                            <input
                              className="rounded-xl border border-slate-200 p-3 text-sm font-medium text-slate-700 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                              dir="ltr"
                              name="featuredImage"
                              onChange={(event) => {
                                clearSelectedFeaturedImage();
                                setFeaturedImage(event.target.value);
                              }}
                              placeholder="https://…"
                              value={featuredImage}
                            />
                          </label>
                        </section>
                        <label className="grid gap-2 text-sm font-black text-slate-950">
                          توضیح SEO
                          <textarea
                            className="min-h-20 resize-y rounded-xl border border-slate-200 p-3 text-sm font-medium leading-6 text-slate-700 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                            maxLength={160}
                            name="metaDescription"
                            onChange={(event) =>
                              setMetaDescription(event.target.value)
                            }
                            placeholder="توضیح کوتاه برای موتورهای جست‌وجو"
                            value={metaDescription}
                          />
                        </label>
                      </section>
                    </aside>
                  </div>
                </div>
              </form>
            </motion.section>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
