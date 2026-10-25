import {
  Camera,
  FileImage,
  FileSpreadsheet,
  FileText,
  Link2,
  RefreshCw,
  SwitchCamera,
  Upload,
  X,
} from "lucide-react";
import * as React from "react";

import { defineMessages } from "../i18n/messages";
import { cn } from "../lib/cn";
import { focusRing } from "../lib/control";
import { Button } from "./Button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./Dialog";
import { Input } from "./Input";
import { useFormat, useMessages } from "./TajUIProvider";

export const fileUploadMessages = defineMessages("fileUpload", {
  ru: {
    title: "Перетащите файлы сюда",
    titleSingle: "Перетащите файл сюда",
    browse: "или выберите на устройстве",
    drop: "Отпустите, чтобы добавить",
    maxSize: (size: string) => `До ${size}`,
    maxFiles: (count: number) => `Файлов не больше: ${count}`,
    fileList: "Выбранные файлы",
    remove: (name: string) => `Удалить файл «${name}»`,
    uploading: (name: string) => `Загрузка «${name}»`,
    tooLarge: (name: string, size: string) => `«${name}» больше ${size}`,
    wrongType: (name: string) => `«${name}»: этот тип файла не поддерживается`,
    tooMany: (count: number) => `Можно добавить не больше файлов: ${count}`,
    bytes: "Б",
    kb: "КБ",
    mb: "МБ",
    gb: "ГБ",
    camera: "Камера",
    cameraTitle: "Снимок с камеры",
    cameraHint: "Наведите камеру и нажмите «Снять».",
    takePhoto: "Снять",
    retake: "Переснять",
    usePhoto: "Использовать",
    switchCamera: "Переключить камеру",
    cameraPreview: "Изображение с камеры",
    photoPreview: "Снимок",
    cameraDenied: "Нет доступа к камере. Разрешите его в настройках браузера.",
    cameraUnsupported: "Камера недоступна на этом устройстве.",
    cameraError: "Не удалось включить камеру.",
    fromLink: "По ссылке",
    linkLabel: "Ссылка на файл",
    linkPlaceholder: "https://…",
    addLink: "Добавить",
    invalidLink: "Введите ссылку, начинающуюся с http:// или https://",
  },
  tg: {
    title: "Файлҳоро ба ин ҷо кашед",
    titleSingle: "Файлро ба ин ҷо кашед",
    browse: "ё аз дастгоҳ интихоб кунед",
    drop: "Барои илова кардан раҳо кунед",
    maxSize: (size: string) => `То ${size}`,
    maxFiles: (count: number) => `На зиёда аз ${count} файл`,
    fileList: "Файлҳои интихобшуда",
    remove: (name: string) => `Нест кардани файли «${name}»`,
    uploading: (name: string) => `Боркунии «${name}»`,
    tooLarge: (name: string, size: string) =>
      `«${name}» аз ${size} калонтар аст`,
    wrongType: (name: string) => `«${name}»: ин навъи файл дастгирӣ намешавад`,
    tooMany: (count: number) =>
      `На зиёда аз ${count} файл илова кардан мумкин аст`,
    bytes: "Б",
    kb: "КБ",
    mb: "МБ",
    gb: "ГБ",
    camera: "Камера",
    cameraTitle: "Акс аз камера",
    cameraHint: "Камераро равона кунед ва «Акс гирифтан»-ро пахш кунед.",
    takePhoto: "Акс гирифтан",
    retake: "Аз нав гирифтан",
    usePhoto: "Истифода бурдан",
    switchCamera: "Иваз кардани камера",
    cameraPreview: "Тасвир аз камера",
    photoPreview: "Акс",
    cameraDenied: "Дастрасӣ ба камера нест. Онро дар танзимоти браузер иҷозат диҳед.",
    cameraUnsupported: "Дар ин дастгоҳ камера дастрас нест.",
    cameraError: "Камераро фаъол кардан нашуд.",
    fromLink: "Бо истинод",
    linkLabel: "Истинод ба файл",
    linkPlaceholder: "https://…",
    addLink: "Илова кардан",
    invalidLink: "Истиноде ворид кунед, ки бо http:// ё https:// оғоз мешавад",
  },
  en: {
    title: "Drag files here",
    titleSingle: "Drag a file here",
    browse: "or choose from your device",
    drop: "Release to add",
    maxSize: (size: string) => `Up to ${size}`,
    maxFiles: (count: number) => `Up to ${count} files`,
    fileList: "Selected files",
    remove: (name: string) => `Remove file “${name}”`,
    uploading: (name: string) => `Uploading “${name}”`,
    tooLarge: (name: string, size: string) =>
      `“${name}” is larger than ${size}`,
    wrongType: (name: string) => `“${name}”: this file type is not supported`,
    tooMany: (count: number) => `You can add up to ${count} files`,
    bytes: "B",
    kb: "KB",
    mb: "MB",
    gb: "GB",
    camera: "Camera",
    cameraTitle: "Take a photo",
    cameraHint: "Point the camera and press “Capture”.",
    takePhoto: "Capture",
    retake: "Retake",
    usePhoto: "Use photo",
    switchCamera: "Switch camera",
    cameraPreview: "Camera preview",
    photoPreview: "Photo",
    cameraDenied: "No camera access. Allow it in your browser settings.",
    cameraUnsupported: "No camera is available on this device.",
    cameraError: "Could not start the camera.",
    fromLink: "From link",
    linkLabel: "File link",
    linkPlaceholder: "https://…",
    addLink: "Add",
    invalidLink: "Enter a link starting with http:// or https://",
  },
});

export type FileUploadMessages = (typeof fileUploadMessages.locales)["ru"];

export type FileRejectionCode =
  "file-too-large" | "file-invalid-type" | "too-many-files";

export interface FileRejection {
  file: File;
  errors: { code: FileRejectionCode; message: string }[];
}

export interface FileUploadProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onChange" | "defaultValue" | "title"
> {
  /** Same syntax as `<input accept>`: ".xlsx,.csv", "image/*". */
  accept?: string;
  multiple?: boolean;
  /** Maximum size per file, in bytes. */
  maxSize?: number;
  /** Maximum number of files in `value` (with `multiple`). */
  maxFiles?: number;
  value?: File[];
  defaultValue?: File[];
  onValueChange?: (files: File[]) => void;
  /** Files refused by `accept` / `maxSize` / `maxFiles`, with localized messages. */
  onReject?: (rejections: FileRejection[]) => void;
  /** Upload progress 0–100 per file, keyed by `file.name`. */
  progress?: Record<string, number>;
  disabled?: boolean;
  /** Id of the dropzone button, so a `<Label htmlFor>` can name it. */
  id?: string;
  /** Form field name for the native input. */
  name?: string;
  /** Replaces the dropzone heading. */
  title?: React.ReactNode;
  /** Replaces the generated hint ("Excel, CSV · До 10 МБ"). */
  description?: React.ReactNode;
  /** Hide the built-in file list (render your own from `value`). */
  hideFileList?: boolean;
  /**
   * Offer "Camera": a getUserMedia capture dialog (switch front/back, take,
   * retake, use) whose photo joins `value` as a JPEG File.
   */
  camera?: boolean;
  /** Offer "From link": a URL field that reports the address via `onLink`. */
  linkInput?: boolean;
  /** Called with a valid http(s) URL from the link field. */
  onLink?: (url: string) => void;
  labels?: Partial<FileUploadMessages>;
}

/** Whether `file` matches an `accept` string (extensions, MIME, `type/*`). */
export function fileMatchesAccept(file: File, accept?: string): boolean {
  if (!accept) return true;
  const tokens = accept
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
  if (tokens.length === 0) return true;
  const name = file.name.toLowerCase();
  const type = (file.type || "").toLowerCase();
  return tokens.some((t) => {
    if (t.startsWith(".")) return name.endsWith(t);
    if (t.endsWith("/*")) return type.startsWith(t.slice(0, -1));
    return type === t;
  });
}

type Formatter = ReturnType<typeof useFormat>;

/** "1,5 МБ" — 1024-based, localized units. */
export function formatFileSize(
  bytes: number,
  f: Pick<Formatter, "number">,
  units: Pick<
    FileUploadMessages,
    "bytes" | "kb" | "mb" | "gb"
  > = fileUploadMessages.locales.ru,
): string {
  const steps = [units.bytes, units.kb, units.mb, units.gb];
  let value = Math.max(0, bytes);
  let i = 0;
  while (value >= 1024 && i < steps.length - 1) {
    value /= 1024;
    i++;
  }
  const digits = i === 0 || value >= 10 ? 0 : 1;
  return `${f.number(value, { maximumFractionDigits: digits })}\u00a0${steps[i]}`;
}

function fileKey(file: File) {
  return `${file.name}:${file.size}:${file.lastModified}`;
}

function FileIcon({ file }: { file: File }) {
  const name = file.name.toLowerCase();
  const cls = "size-4 shrink-0";
  if (file.type.startsWith("image/"))
    return <FileImage className={cls} aria-hidden />;
  if (
    /\.(xlsx?|csv|ods)$/.test(name) ||
    file.type.includes("spreadsheet") ||
    file.type === "text/csv"
  )
    return <FileSpreadsheet className={cls} aria-hidden />;
  return <FileText className={cls} aria-hidden />;
}

/**
 * Drag-and-drop zone plus file list: Excel / 1C imports, product photos,
 * scanned contracts. Validates type, size and count, and reports refusals
 * with localized messages. Uploading itself is up to the app (pass
 * `progress` to show it).
 */
export const FileUpload = React.forwardRef<HTMLDivElement, FileUploadProps>(
  (
    {
      className,
      accept,
      multiple = false,
      maxSize,
      maxFiles,
      value: valueProp,
      defaultValue,
      onValueChange,
      onReject,
      progress,
      disabled = false,
      name,
      title,
      description,
      hideFileList = false,
      camera = false,
      linkInput = false,
      onLink,
      labels,
      id,
      ...props
    },
    ref,
  ) => {
    const t = useMessages(fileUploadMessages, labels);
    const f = useFormat();
    const autoId = React.useId();
    const buttonId = id ?? `${autoId}-dropzone`;
    const hintId = `${autoId}-hint`;
    const errorId = `${autoId}-errors`;

    const [inner, setInner] = React.useState<File[]>(defaultValue ?? []);
    const controlled = valueProp !== undefined;
    const files = controlled ? valueProp : inner;

    const [errors, setErrors] = React.useState<string[]>([]);
    const [dragging, setDragging] = React.useState(false);
    const dragDepth = React.useRef(0);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const buttonRef = React.useRef<HTMLButtonElement>(null);
    const listRef = React.useRef<HTMLUListElement>(null);
    const focusAfterRemove = React.useRef<number | null>(null);

    const commit = (next: File[]) => {
      if (!controlled) setInner(next);
      onValueChange?.(next);
    };

    const sizeText = maxSize !== undefined ? formatFileSize(maxSize, f, t) : "";
    const limit = multiple ? (maxFiles ?? Infinity) : 1;

    const addFiles = (incoming: File[]) => {
      if (disabled || incoming.length === 0) return;
      const rejections: FileRejection[] = [];
      const accepted: File[] = [];
      // A single-file upload replaces the current file.
      const base = multiple ? files : [];
      let room = limit - base.length;

      for (const file of incoming) {
        const errs: FileRejection["errors"] = [];
        if (!fileMatchesAccept(file, accept))
          errs.push({
            code: "file-invalid-type",
            message: t.wrongType(file.name),
          });
        if (maxSize !== undefined && file.size > maxSize)
          errs.push({
            code: "file-too-large",
            message: t.tooLarge(file.name, sizeText),
          });
        if (errs.length === 0 && room <= 0)
          errs.push({ code: "too-many-files", message: t.tooMany(limit) });
        if (errs.length > 0) {
          rejections.push({ file, errors: errs });
        } else {
          accepted.push(file);
          room--;
        }
      }

      // Collapse repeated "too many" messages into one line.
      const messages: string[] = [];
      for (const r of rejections)
        for (const e of r.errors)
          if (!messages.includes(e.message)) messages.push(e.message);
      setErrors(messages);
      if (rejections.length > 0) onReject?.(rejections);
      if (accepted.length > 0) {
        const seen = new Set(base.map(fileKey));
        commit([
          ...base,
          ...accepted.filter((file) => !seen.has(fileKey(file))),
        ]);
      }
    };

    const removeAt = (index: number) => {
      focusAfterRemove.current = index;
      setErrors([]);
      commit(files.filter((_, i) => i !== index));
    };

    // Keep focus in place after a row disappears: next row, else the dropzone.
    React.useEffect(() => {
      const index = focusAfterRemove.current;
      if (index === null) return;
      focusAfterRemove.current = null;
      const buttons = listRef.current?.querySelectorAll<HTMLButtonElement>(
        "[data-slot=file-upload-remove]",
      );
      const target = buttons?.[Math.min(index, buttons.length - 1)];
      (target ?? buttonRef.current)?.focus();
    }, [files]);

    const onDragEnter = (e: React.DragEvent) => {
      e.preventDefault();
      if (disabled) return;
      dragDepth.current++;
      setDragging(true);
    };
    const onDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      dragDepth.current = Math.max(0, dragDepth.current - 1);
      if (dragDepth.current === 0) setDragging(false);
    };
    const onDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer)
        e.dataTransfer.dropEffect = disabled ? "none" : "copy";
    };
    const onDrop = (e: React.DragEvent) => {
      e.preventDefault();
      dragDepth.current = 0;
      setDragging(false);
      if (disabled) return;
      addFiles(Array.from(e.dataTransfer?.files ?? []));
    };

    const [cameraOpen, setCameraOpen] = React.useState(false);
    const [linkOpen, setLinkOpen] = React.useState(false);
    const [link, setLink] = React.useState("");
    const [linkError, setLinkError] = React.useState(false);
    const linkId = `${autoId}-link`;
    const linkErrorId = `${autoId}-link-error`;
    const submitLink = () => {
      const url = link.trim();
      if (!isHttpUrl(url)) {
        setLinkError(true);
        return;
      }
      setLinkError(false);
      setLink("");
      onLink?.(url);
    };

    const hintParts: string[] = [];
    if (maxSize !== undefined) hintParts.push(t.maxSize(sizeText));
    if (multiple && maxFiles !== undefined)
      hintParts.push(t.maxFiles(maxFiles));
    const hint =
      description ?? (hintParts.length > 0 ? hintParts.join(" · ") : null);

    return (
      <div
        ref={ref}
        data-slot="file-upload"
        data-disabled={disabled || undefined}
        className={cn("flex w-full flex-col gap-2", className)}
        {...props}
      >
        <input
          ref={inputRef}
          type="file"
          name={name}
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          tabIndex={-1}
          aria-hidden
          aria-label={multiple ? t.title : t.titleSingle}
          className="sr-only"
          onChange={(e) => {
            addFiles(Array.from(e.target.files ?? []));
            // Allow choosing the same file again after removing it.
            e.target.value = "";
          }}
        />
        <button
          ref={buttonRef}
          id={buttonId}
          type="button"
          data-slot="file-upload-dropzone"
          data-dragging={dragging || undefined}
          disabled={disabled}
          aria-describedby={
            cn(hint ? hintId : "", errors.length > 0 ? errorId : "") ||
            undefined
          }
          onClick={() => inputRef.current?.click()}
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          onDragOver={onDragOver}
          onDrop={onDrop}
          className={cn(
            "flex w-full cursor-pointer flex-col items-center justify-center gap-1.5 !rounded-xl border-[1.5px] border-dashed border-hairline bg-ui-surface-2 px-4 py-6 text-center transition-colors hover:border-brand/50 hover:bg-mist/60",
            "data-[dragging]:border-brand data-[dragging]:bg-mist",
            "disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-hairline disabled:hover:bg-ui-surface-2",
            errors.length > 0 && "border-tj-error/50",
            focusRing,
          )}
        >
          <span
            aria-hidden
            className="inline-flex size-10 items-center justify-center !rounded-full bg-ui-surface text-brand-ink shadow-tj-sm"
          >
            <Upload className="size-5" />
          </span>
          <span className="text-ui-control font-semibold text-ink-1">
            {dragging
              ? t.drop
              : (title ?? (multiple ? t.title : t.titleSingle))}
          </span>
          <span className="text-ui-label text-brand-ink underline-offset-4">
            {t.browse}
          </span>
          {hint ? (
            <span id={hintId} className="text-ui-helper text-ink-3">
              {hint}
            </span>
          ) : null}
        </button>

        {camera || linkInput ? (
          <div data-slot="file-upload-sources" className="flex flex-wrap items-center gap-1.5">
            {camera ? (
              <Button
                variant="subtle"
                size="sm"
                disabled={disabled}
                data-slot="file-upload-camera"
                iconLeft={<Camera className="size-4" aria-hidden />}
                onClick={() => setCameraOpen(true)}
              >
                {t.camera}
              </Button>
            ) : null}
            {linkInput ? (
              <Button
                variant="subtle"
                size="sm"
                disabled={disabled}
                data-slot="file-upload-link-toggle"
                aria-expanded={linkOpen}
                aria-controls={linkOpen ? linkId : undefined}
                iconLeft={<Link2 className="size-4" aria-hidden />}
                onClick={() => setLinkOpen((o) => !o)}
              >
                {t.fromLink}
              </Button>
            ) : null}
          </div>
        ) : null}

        {linkInput && linkOpen ? (
          <form
            id={linkId}
            data-slot="file-upload-link"
            className="flex flex-col gap-1"
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              submitLink();
            }}
          >
            <div className="flex items-center gap-1.5">
              <Input
                type="url"
                size="sm"
                inputMode="url"
                aria-label={t.linkLabel}
                placeholder={t.linkPlaceholder}
                value={link}
                disabled={disabled}
                aria-invalid={linkError || undefined}
                aria-describedby={linkError ? linkErrorId : undefined}
                onChange={(e) => {
                  setLink(e.target.value);
                  setLinkError(false);
                }}
              />
              <Button type="submit" size="sm" disabled={disabled || !link.trim()}>
                {t.addLink}
              </Button>
            </div>
            {linkError ? (
              <p id={linkErrorId} role="alert" className="text-ui-helper text-tj-error-ink">
                {t.invalidLink}
              </p>
            ) : null}
          </form>
        ) : null}

        {camera ? (
          <CameraCaptureDialog
            open={cameraOpen}
            onOpenChange={setCameraOpen}
            onCapture={(file) => addFiles([file])}
            t={t}
          />
        ) : null}

        <div
          id={errorId}
          role="alert"
          data-slot="file-upload-errors"
          className="empty:hidden"
        >
          {errors.length > 0 ? (
            <ul className="flex flex-col gap-0.5 text-ui-helper text-tj-error-ink">
              {errors.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          ) : null}
        </div>

        {!hideFileList && files.length > 0 ? (
          <ul
            ref={listRef}
            aria-label={t.fileList}
            data-slot="file-upload-list"
            className="flex flex-col gap-1.5"
          >
            {files.map((file, index) => {
              const pct = progress?.[file.name];
              const hasProgress = pct !== undefined && Number.isFinite(pct);
              const clamped = hasProgress ? Math.min(100, Math.max(0, pct)) : 0;
              return (
                <li
                  key={fileKey(file)}
                  data-slot="file-upload-item"
                  className="flex items-center gap-3 !rounded-lg border border-hairline bg-ui-surface px-3 py-2"
                >
                  <span
                    aria-hidden
                    className="inline-flex size-8 shrink-0 items-center justify-center !rounded-md bg-mist text-mist-ink"
                  >
                    <FileIcon file={file} />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="flex min-w-0 items-baseline gap-2">
                      <span
                        title={file.name}
                        className="min-w-0 truncate text-ui-body font-medium text-ink-1"
                      >
                        {file.name}
                      </span>
                      <span className="shrink-0 text-ui-caption text-ink-3 tabular-nums">
                        {formatFileSize(file.size, f, t)}
                        {hasProgress && clamped < 100
                          ? ` · ${f.number(clamped, { maximumFractionDigits: 0 })}\u00a0%`
                          : null}
                      </span>
                    </span>
                    {hasProgress ? (
                      <span
                        role="progressbar"
                        aria-label={t.uploading(file.name)}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={Math.round(clamped)}
                        className="block h-1 w-full overflow-hidden !rounded-pill bg-ui-surface-2"
                      >
                        <span
                          className={cn(
                            "block h-full !rounded-pill transition-[width] duration-300",
                            clamped >= 100 ? "bg-tj-success" : "bg-brand-solid",
                          )}
                          style={{ width: `${clamped}%` }}
                        />
                      </span>
                    ) : null}
                  </span>
                  <button
                    type="button"
                    data-slot="file-upload-remove"
                    aria-label={t.remove(file.name)}
                    disabled={disabled}
                    onClick={() => removeAt(index)}
                    className={cn(
                      "inline-flex size-8 shrink-0 cursor-pointer items-center justify-center !rounded-md text-ink-3 transition-colors hover:bg-ui-surface-2 hover:text-ink-1 disabled:cursor-not-allowed disabled:opacity-60 [[data-density=touch]_&]:size-11",
                      focusRing,
                    )}
                  >
                    <X className="size-4" aria-hidden />
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    );
  },
);
FileUpload.displayName = "FileUpload";

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function stopStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}

function photoName(date = new Date()) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `photo-${date.getFullYear()}${p(date.getMonth() + 1)}${p(date.getDate())}-${p(date.getHours())}${p(date.getMinutes())}${p(date.getSeconds())}.jpg`;
}

/** getUserMedia capture: live preview → still → File (JPEG). */
function CameraCaptureDialog({
  open,
  onOpenChange,
  onCapture,
  t,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCapture: (file: File) => void;
  t: FileUploadMessages;
}) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [facing, setFacing] = React.useState<"environment" | "user">("environment");
  const [stream, setStream] = React.useState<MediaStream | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [canSwitch, setCanSwitch] = React.useState(false);
  const [shot, setShot] = React.useState<{ blob: Blob; url: string } | null>(null);
  // Messages via a ref: a new `labels` object must not restart the camera.
  const tRef = React.useRef(t);
  tRef.current = t;

  // Live stream while the dialog is open and no still is shown.
  React.useEffect(() => {
    if (!open || shot) return;
    const media = typeof navigator !== "undefined" ? navigator.mediaDevices : undefined;
    if (!media?.getUserMedia) {
      setError(tRef.current.cameraUnsupported);
      return;
    }
    let cancelled = false;
    let current: MediaStream | null = null;
    setError(null);
    media
      .getUserMedia({ video: { facingMode: facing }, audio: false })
      .then((s) => {
        if (cancelled) {
          stopStream(s);
          return;
        }
        current = s;
        setStream(s);
        media
          .enumerateDevices?.()
          .then((devices) => {
            if (!cancelled) setCanSwitch(devices.filter((d) => d.kind === "videoinput").length > 1);
          })
          .catch(() => undefined);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const name = (err as { name?: string } | null)?.name;
        setError(
          name === "NotAllowedError" || name === "SecurityError"
            ? tRef.current.cameraDenied
            : tRef.current.cameraError,
        );
      });
    return () => {
      cancelled = true;
      stopStream(current);
      setStream(null);
    };
  }, [open, shot, facing]);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) return;
    video.srcObject = stream;
    const p = video.play?.();
    if (p && typeof p.catch === "function") p.catch(() => undefined);
  }, [stream]);

  // Free the still's object URL when it is replaced or the dialog unmounts.
  React.useEffect(() => () => {
    if (shot) URL.revokeObjectURL(shot.url);
  }, [shot]);

  const close = (next: boolean) => {
    if (!next) {
      setShot(null);
      setError(null);
    }
    onOpenChange(next);
  };

  const take = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (blob) setShot({ blob, url: URL.createObjectURL(blob) });
      },
      "image/jpeg",
      0.9,
    );
  };

  const use = () => {
    if (!shot) return;
    onCapture(new File([shot.blob], photoName(), { type: "image/jpeg", lastModified: Date.now() }));
    close(false);
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent size="lg" data-slot="file-upload-camera-dialog">
        <DialogHeader>
          <DialogTitle>{t.cameraTitle}</DialogTitle>
          <DialogDescription>{t.cameraHint}</DialogDescription>
        </DialogHeader>
        <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden !rounded-lg bg-ui-surface-inset">
          {error ? (
            <p role="alert" className="px-4 text-center text-ui-body text-tj-error-ink">
              {error}
            </p>
          ) : shot ? (
            <img src={shot.url} alt={t.photoPreview} className="size-full object-contain" />
          ) : (
            <video
              ref={videoRef}
              aria-label={t.cameraPreview}
              playsInline
              muted
              className={cn("size-full object-contain", facing === "user" && "-scale-x-100")}
            />
          )}
        </div>
        <DialogFooter>
          {shot ? (
            <>
              <Button
                variant="subtle"
                size="md"
                iconLeft={<RefreshCw className="size-4" aria-hidden />}
                onClick={() => setShot(null)}
              >
                {t.retake}
              </Button>
              <Button size="md" onClick={use}>
                {t.usePhoto}
              </Button>
            </>
          ) : (
            <>
              {canSwitch ? (
                <Button
                  variant="subtle"
                  size="md"
                  iconLeft={<SwitchCamera className="size-4" aria-hidden />}
                  onClick={() => setFacing((f) => (f === "user" ? "environment" : "user"))}
                >
                  {t.switchCamera}
                </Button>
              ) : null}
              <Button
                size="md"
                disabled={!stream || !!error}
                iconLeft={<Camera className="size-4" aria-hidden />}
                onClick={take}
              >
                {t.takePhoto}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
