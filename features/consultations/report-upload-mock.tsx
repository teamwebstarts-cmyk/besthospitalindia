"use client";

/**
 * ReportUploadMock — A07 (free consultation).
 *
 * MOCK-ONLY file picker: reads file name/type/size into local state for
 * display and never transmits or stores anything. No FormData, no network.
 * Catalog: features/consultations/components/report-upload-mock.tsx.
 */

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatBytes } from "@/features/consultations/format-bytes";
import { FileTextIcon, PaperclipIcon, Trash2Icon } from "lucide-react";

/** Permitted demo file types (MIME types accepted by the mock picker). */
const ACCEPTED_MIME_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
] as const;

/** Demo size ceiling for a single report, in bytes. */
export const MAX_REPORT_SIZE_BYTES = 10 * 1024 * 1024;

/** One mock-selected report; the File object is never sent anywhere. */
export interface MockReport {
  /** Client-only local id (crypto.randomUUID when available). */
  id: string;
  name: string;
  type: string;
  size: number;
}

export interface ReportUploadMockProps {
  /** Accessible label for the picker button. */
  label?: string;
  /** Currently held mock reports (controlled by the parent form). */
  value: MockReport[];
  /** Replace the held reports (add/remove flow is owned by the parent). */
  onChange: (reports: MockReport[]) => void;
  /** Disable the whole control (e.g. while the form is submitting). */
  disabled?: boolean;
  /** Maximum number of mock files that can be held. */
  maxFiles?: number;
  /** Applied to the outer container. */
  className?: string;
}

/** Build a demo acceptance string for the native input. */
function acceptAttr(): string {
  return ACCEPTED_MIME_TYPES.join(",");
}

export function ReportUploadMock({
  label = "Attach reports (optional)",
  value,
  onChange,
  disabled = false,
  maxFiles = 4,
  className,
}: ReportUploadMockProps) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);

  const pick = () => {
    setNotice(null);
    inputRef.current?.click();
  };

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) return;

    const remaining = maxFiles - value.length;
    const next: MockReport[] = [];
    const rejected: string[] = [];

    for (const file of files.slice(0, Math.max(remaining, 0))) {
      if (file.size > MAX_REPORT_SIZE_BYTES) {
        rejected.push(`${file.name} (over 10 MB)`);
        continue;
      }
      next.push({
        id:
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: file.name,
        type: file.type || "unknown type",
        size: file.size,
      });
    }

    if (next.length > 0) onChange([...value, ...next]);
    if (rejected.length > 0 || files.length > Math.max(remaining, 0)) {
      setNotice(
        `Demo limit: up to ${maxFiles} files, 10 MB each. Skipped: ${[
          ...rejected,
          ...files.slice(Math.max(remaining, 0)).map((f) => `${f.name} (limit)`),
        ].join(", ")}`,
      );
    }
  };

  const remove = (id: string) => {
    setNotice(null);
    onChange(value.filter((report) => report.id !== id));
  };

  const hasFiles = value.length > 0;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={pick}
          disabled={disabled || value.length >= maxFiles}
        >
          <PaperclipIcon data-icon="inline-start" />
          {hasFiles ? "Add more files" : label}
        </Button>
        <span className="text-xs text-muted-foreground">
          {hasFiles ? `${value.length} of ${maxFiles} files attached` : "No files attached"}
        </span>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={acceptAttr()}
        onChange={onInputChange}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        data-testid="report-upload-mock-input"
      />

      {hasFiles ? (
        <ul className="flex flex-col gap-2" aria-label="Attached reports (demo)">
          {value.map((report) => (
            <li
              key={report.id}
              className="flex items-center justify-between gap-3 rounded-md border bg-muted/40 px-3 py-2"
            >
              <span className="flex min-w-0 items-center gap-2">
                <FileTextIcon aria-hidden className="size-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{report.name}</span>
                  <span className="block text-xs text-muted-foreground">
                    {report.type} · {formatBytes(report.size)}
                  </span>
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-2">
                <Badge variant="outline">Demo</Badge>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => remove(report.id)}
                  disabled={disabled}
                  aria-label={`Remove ${report.name} from demo attachments`}
                >
                  <Trash2Icon />
                </Button>
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      <p aria-live="polite" className="text-xs text-muted-foreground">
        {notice}
      </p>
    </div>
  );
}
