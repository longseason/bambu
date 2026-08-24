import LibraryPanel from "./components/LibraryPanel"
import PreviewPanel from "./components/PreviewPanel"

export default function App() {
  return (
    <div className="h-screen flex">
      <LibraryPanel />
      <PreviewPanel />
    </div>
  )
}