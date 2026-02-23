import { useState } from "react";
import { Page } from "@/pages/tools/smart-resize-and-crop/_component/page";
import { SmartResizeHeader } from "@/components/SmartResizeHeader";

export function SmartResizeToolPage() {
  const [zipName, setZipName] = useState("images");

  return (
    <div className="min-h-screen bg-white">
      <SmartResizeHeader zipName={zipName} onZipNameChange={setZipName} />
      <main>
        <Page zipName={zipName} />
      </main>
    </div>
  );
}
