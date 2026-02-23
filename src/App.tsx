import { Routes, Route } from "react-router-dom";
import { SmartResizeToolPage } from "./routes/SmartResizeToolPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<SmartResizeToolPage />} />
      <Route path="/tools/smart-resize-and-crop" element={<SmartResizeToolPage />} />
    </Routes>
  );
}
