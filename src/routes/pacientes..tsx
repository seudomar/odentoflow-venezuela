
function FileTile({ file, onRemove }: { file: PatientFile; onRemove: () => void }) {
  const url = useFileUrl(PATIENT_BUCKET, file.path, file.dataUrl);
  const isPdf = file.type === "application/pdf";

  return (
    <div className="group relative overflow-hidden rounded-lg border bg-muted">
      <a href={url || undefined} target="_blank" rel="noreferrer" className="block aspect-square">
        {url && !isPdf ? (
          <img
            src={url}
            alt={file.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full w-full place-items-center">
            <FileText className="h-8 w-8 text-muted-foreground/60" />
          </div>
        )}
      </a>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
        <p className="truncate text-[11px] font-medium text-white">{file.name}</p>
      </div>
      <Button
        size="icon"
        variant="destructive"
        className="absolute right-1.5 top-1.5 h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
        onClick={onRemove}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
