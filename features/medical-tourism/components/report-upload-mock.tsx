"use client"

/**
 * ReportUploadMock — file-name/type/size display ONLY (Agent A06).
 *
 * Contract source: implementation/12-international-enquiry.md ("ReportUploadMock")
 * + task contract: never transmits or uploads anything. Files chosen via the
 * hidden input are converted to plain {name, size, type} labels and the raw
 * File handles are dropped immediately; removal discards the label. A visible
 * "demo only — nothing is uploaded" note is always shown.
 */

import * as React from "react"
import { FileHeartIcon, PaperclipIcon, Trash2Icon, UploadIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface MockReport {
  /** Original file name, shown as a label only. */
  name: string
  /** Size in bytes, formatted for display. */
  size: number
  /** MIME type as reported by the browser. */
  type: string
}

export interface ReportUploadMockProps {
  reports: readonly MockReport[]
  onAdd: (reports: readonly MockReport[]) => void
  onRemove: (index: number) => void
  /** Applied to the input accept attribute — display-only demo, no validation enforcement. */
  accept?: string
  maxFiles?: number
  className?: string
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function ReportUploadMock({
  reports,
  onAdd,
  onRemove,
  accept = ".pdf,.jpg,.jpeg,.png,.doc,.docx",
  maxFiles = 5,
  className,
}: ReportUploadMockProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [notice, setNotice] = React.useState<string | null>(null)
  const inputId = React.useId()

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return
    const room = maxFiles - reports.length
    if (room <= 0) {
      setNotice(`Demo limit: at most ${maxFiles} report labels can be listed.`)
      return
    }
    const incoming = Array.from(fileList).slice(0, room).map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type || "unknown type",
    }))
    if (fileList.length > room) {
      setNotice(`Demo limit: only the first ${room} file label(s) were added.`)
    } else {
      setNotice(null)
    }
    onAdd([...reports, ...incoming])
    // Reset so re-selecting the same file still fires change; raw File objects
    // are never kept — only the extracted name/size/type labels above.
    if (inputRef.current) inputRef.current.value = ""
  }

  const removeAt = (index: number) => {
    onRemove(index)
    setNotice(null)
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <Input
          ref={inputRef}
          id={inputId}
          type="file"
          multiple
          accept={accept}
          className="max-w-xs file:mr-2 file:rounded-md file:border-0 file:bg-muted file:px-2 file:py-1 file:text-xs file:font-medium file:text-foreground"
          onChange={(event) => handleFiles(event.target.files)}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
        >
          <UploadIcon data-icon="inline-start" aria-hidden />
          Add report label
        </Button>
        <span className="sr-only" id={`${inputId}-hint`}>
          Choose files to list their names for the demo enquiry. Nothing is uploaded.
        </span>
      </div>
      <p className="text-xs text-muted-foreground">
        Demo only — file names are listed as text and nothing is uploaded or
        transmitted anywhere.
      </p>
      {notice ? (
        <p role="status" className="text-xs font-medium text-warning">
          {notice}
        </p>
      ) : null}
      {reports.length > 0 ? (
        <ul className="space-y-1.5" aria-label="Listed report files (demo labels only)">
          {reports.map((report, index) => (
            <li
              key={`${report.name}-${index}`}
              className="flex items-center gap-2 rounded-md border bg-muted/30 px-2.5 py-1.5 text-sm"
            >
              <FileHeartIcon aria-hidden className="size-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate font-medium text-foreground">
                {report.name}
              </span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {report.type} · {formatBytes(report.size)}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label={`Remove ${report.name} from the demo list`}
                onClick={() => removeAt(index)}
              >
                <Trash2Icon aria-hidden />
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <PaperclipIcon aria-hidden className="size-3.5" />
          No report labels listed yet (optional).
        </p>
      )}
    </div>
  )
}
