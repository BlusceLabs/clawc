import { createMemo, createResource, createSignal } from "solid-js"
import { DialogSelect, type DialogSelectOption } from "../ui/dialog-select"
import { useDialog } from "../ui/dialog"
import { useSDK } from "../context/sdk"
import { useSync } from "../context/sync"
import { useLocation } from "../context/location"
import { useProject } from "../context/project"
import { useTuiPaths } from "../context/runtime"
import type { FileSystemEntry } from "@clawc/sdk/v2"
import path from "path"

export type DialogQuickOpenProps = {
  onSelect: (filePath: string) => void
}

export function DialogQuickOpen(props: DialogQuickOpenProps) {
  const dialog = useDialog()
  const sdk = useSDK()
  const sync = useSync()
  const location = useLocation()
  const project = useProject()
  const paths = useTuiPaths()

  const [search, setSearch] = createSignal("")

  const baseDir = createMemo(() => location()?.directory || sync.path.directory || paths.cwd)

  const [files] = createResource(
    () => ({ query: search(), directory: baseDir() }),
    async (input) => {
      if (!input.query) return []
      const result = await sdk.client.v2.fs.find({
        query: input.query,
        limit: "100",
        location: {
          directory: input.directory,
          workspace: project.workspace.current(),
        },
      })
      return result.data?.data ?? []
    },
    { initialValue: [] },
  )

  const options = createMemo((): DialogSelectOption<string>[] => {
    return files().map((item: FileSystemEntry) => ({
      title: search() ? getDisplayPath(item.path, baseDir()) : item.path,
      value: item.path,
      description: item.type === "directory" ? "dir" : undefined,
    }))
  })

  const handleSelect = (option: DialogSelectOption<string>) => {
    const filePath = option.value
    dialog.clear()
    props.onSelect(filePath)
  }

  return (
    <DialogSelect
      title="Quick Open"
      placeholder="Search files..."
      options={options()}
      onFilter={(query) => setSearch(query)}
      onSelect={handleSelect}
    />
  )
}

function getDisplayPath(filePath: string, baseDir: string): string {
  const relative = path.relative(baseDir, filePath)
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) {
    return filePath
  }
  return relative
}