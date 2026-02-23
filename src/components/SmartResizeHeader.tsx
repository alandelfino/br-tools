import { useEffect, useState } from "react";
import { Layers, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

type SmartResizeHeaderProps = {
  zipName: string;
  onZipNameChange: (value: string) => void;
};

export function SmartResizeHeader({ zipName, onZipNameChange }: SmartResizeHeaderProps) {
  const base = zipName;
  const [downloadDisabled, setDownloadDisabled] = useState(true);

  useEffect(() => {
    const onState = (e: Event) => {
      const ev = e as CustomEvent<{ disabled: boolean }>;
      setDownloadDisabled(!!ev.detail?.disabled);
    };
    window.addEventListener("smart-resize-download-state", onState as EventListener);
    return () => window.removeEventListener("smart-resize-download-state", onState as EventListener);
  }, []);

  const triggerDownloadAll = () => {
    window.dispatchEvent(new Event("smart-resize-download-all"));
  };

  return (
    <header className="relative bg-white border-b">
      <div className="px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex gap-2 items-center">
            <span className="text-sm text-slate-700">Grupo</span>
            <span className="text-lg text-slate-700 font-bold">TITANIUM</span>
            <span className="text-xs text-slate-500">Ferramentas digitais</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">Nome do arquivo</span>
          <div className="flex items-center gap-1">
            <input
              value={base}
              onChange={(e) => onZipNameChange(e.target.value)}
              className="h-8 px-2 rounded-md border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-slate-300"
              placeholder="images"
            />
            <span className="text-xs text-slate-400">.zip</span>
          </div>
          <Button
            size={"sm"}
            className="bg-neutral-900 text-white"
            onClick={triggerDownloadAll}
            disabled={downloadDisabled}
          >
            <Download className="w-4 h-4 mr-1" />
            Download All
          </Button>
        </div>
      </div>
    </header>
  );
}
