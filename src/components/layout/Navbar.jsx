import { Code, Download, Save } from "lucide-react";

export default function Navbar({generateCode,saveProject,exportDiagram}){
    return(
        <header className="bg-[#1b1f23] text-white p-4 flex justify-between items-center border-b">
        <div className="flex items-center space-x-2 bg-[#6cb52d] p-2  ">
          <h1 className="text-xl font-semibold">Spring Microservice Architect</h1>
        </div>
        <div className="flex space-x-3">
          <button 
            className="bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded-none flex items-center text-sm"
            onClick={saveProject}
          >
            <Save size={16} className="mr-1" /> Save
          </button>
          <button 
            className="bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded-none flex items-center text-sm"
            onClick={exportDiagram}
          >
            <Download size={16} className="mr-1" /> Export
          </button>
          <button 
            className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded-none flex items-center text-sm"
            onClick={generateCode}
          >
            <Code size={16} className="mr-1" /> Generate Code
          </button>
        </div>
      </header>
    )
}