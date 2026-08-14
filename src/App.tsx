import { BrowserRouter, Routes, Route } from "react-router-dom";
import ActionManager from "./pages/ActionManager";
import Placeholder1 from "./pages/Placeholder1";
import Placeholder2 from "./pages/Placeholder2";
import HomePage from "./pages/Home";

export default function App() {
  return (
    <BrowserRouter>
      <main className="w-dvw h-dvh bg-neutral-900 text-neutral-200">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/action-manager" element={<ActionManager />} />
          <Route path="/placeholder1" element={<Placeholder1 />} />
          <Route path="/placeholder2" element={<Placeholder2 />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
