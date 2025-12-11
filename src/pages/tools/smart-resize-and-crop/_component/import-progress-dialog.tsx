import { Dialog, DialogContent } from "@/components/ui/dialog";
import React from "react";

export function ImportProgressDialog({ open, importDone, importTotal }: { open: boolean; importDone: number; importTotal: number }) {
  return (
    <Dialog open={open}>
      <DialogContent className="w-[420px]" showCloseButton={false}>
        <div className="flex flex-col gap-2">
          <div className="text-sm font-semibold">Carregando imagens</div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-neutral-600">Processando arquivos</span>
            <span className="text-xs text-neutral-600">{importDone}/{importTotal}</span>
          </div>
          <div className="w-full h-2 rounded bg-neutral-100 overflow-hidden">
            <div
              className="h-2 bg-neutral-800"
              style={{ width: `${importTotal ? Math.round((importDone / importTotal) * 100) : 0}%` }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

