import React, { useState } from 'react';
import { folderStructureData } from '../data/folderStructure';
import { FileNode } from '../types';
import { Folder, File, Code2, Copy, Check, Info } from 'lucide-react';

export default function FolderView() {
  const [selectedFilePath, setSelectedFilePath] = useState<string>(
    '/src/services/token.service.ts',
  );
  const [copied, setCopied] = useState<boolean>(false);

  // Helper function to search for a file in the recursive tree structure
  const findNodeByPath = (node: FileNode, path: string): FileNode | null => {
    if (node.path === path) return node;
    if (node.children) {
      for (const child of node.children) {
        const found = findNodeByPath(child, path);
        if (found) return found;
      }
    }
    return null;
  };

  const selectedNode = findNodeByPath(folderStructureData, selectedFilePath);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Sidebar File Tree Renderer Component
  const RenderTree = ({ node, depth = 0 }: { node: FileNode; depth: number; key?: any }) => {
    const [isOpen, setIsOpen] = useState<boolean>(true);
    const isFolder = node.type === 'folder';
    const isCurrentFile = node.path === selectedFilePath;

    const handleNodeClick = () => {
      if (isFolder) {
        setIsOpen(!isOpen);
      } else {
        setSelectedFilePath(node.path);
      }
    };

    return (
      <div className="select-none text-xs">
        <button
          onClick={handleNodeClick}
          style={{ paddingLeft: `${depth * 14 + 12}px` }}
          className={`w-full flex items-center space-x-2 py-2 text-left transition-all cursor-pointer ${
            isCurrentFile
              ? 'bg-slate-950/80 border-r-2 border-[#10b981] text-[#10b981] font-bold'
              : 'text-slate-350 hover:bg-slate-900 hover:text-white'
          }`}
        >
          {isFolder ? (
            <Folder
              className={`h-4 w-4 shrink-0 ${isOpen ? 'text-[#10b981] fill-emerald-950/35' : 'text-slate-500'}`}
            />
          ) : (
            <File
              className={`h-4 w-4 shrink-0 ${isCurrentFile ? 'text-[#10b981]' : 'text-slate-500'}`}
            />
          )}
          <span className="truncate">{node.name}</span>
        </button>

        {isFolder && isOpen && node.children && (
          <div className="border-l border-[#1e293b] ml-3.5 my-0.5">
            {node.children.map((child, idx) => (
              <RenderTree key={idx} node={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row h-full overflow-hidden bg-[#020617]">
      {/* File Tree Column */}
      <div className="w-full lg:w-80 bg-[#0f172a] border-b lg:border-b-0 lg:border-r border-[#1e293b] flex flex-col shrink-0">
        <div className="p-4 border-b border-[#1e293b] bg-slate-950/30">
          <h3 className="font-semibold text-white text-xs font-sans flex items-center space-x-1.5 leading-none">
            <Code2 className="h-4.5 w-4.5 text-[#10b981]" />
            <span>Folder Structure</span>
          </h3>
          <p className="text-[10px] text-slate-400 font-sans mt-2">
            Select a folder or source file to inspect its reference blueprint.
          </p>
        </div>
        <div className="flex-grow overflow-y-auto py-2 bg-slate-950/10">
          <RenderTree node={folderStructureData} depth={0} />
        </div>
      </div>

      {/* Code Inspector Frame */}
      <div className="flex-grow flex flex-col overflow-hidden bg-[#020617]">
        {selectedNode ? (
          <div className="flex-grow flex flex-col overflow-hidden">
            {/* File Header */}
            <div className="p-5 border-b border-[#1e293b] bg-[#0f172a] flex flex-col sm:flex-row sm:items-center sm:justify-between shrink-0">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] uppercase bg-emerald-950/65 text-[#10b981] border border-[#10b981]/25 px-2 py-0.5 rounded font-mono font-bold">
                    {selectedNode.type}
                  </span>
                  <h4 className="font-extrabold text-white text-xs font-mono">
                    {selectedNode.name}
                  </h4>
                </div>
                <p className="text-xs text-slate-450 font-sans mt-1">{selectedNode.description}</p>
              </div>

              {selectedNode.codeSample && (
                <button
                  onClick={() => handleCopy(selectedNode.codeSample || '')}
                  className="mt-3 sm:mt-0 px-3 py-1.5 bg-[#1e293b] hover:bg-slate-800 text-[#10b981] font-semibold border border-[#1e293b] rounded-md transition-all flex items-center justify-center space-x-1.5 text-xs self-start cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-[#10b981]" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy Snippet</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Code sample block */}
            <div className="flex-grow overflow-y-auto bg-slate-950 text-slate-350 p-6 font-mono text-xs relative select-text">
              {selectedNode.codeSample ? (
                <pre className="leading-relaxed bg-transparent">{selectedNode.codeSample}</pre>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-550 space-y-4 max-w-sm mx-auto p-4 select-none">
                  <Info className="h-8 w-8 text-[#10b981]/50 animate-bounce" />
                  <div>
                    <h5 className="font-bold text-white text-xs font-sans">
                      Directories Repository
                    </h5>
                    <p className="text-[11px] text-slate-400 mt-2 leading-relaxed font-sans">
                      This folder exists to index and modularize FortifyAuth business logics
                      perfectly. Select code files inside directories to review secure code
                      implementations.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center text-center text-slate-500 p-6 select-none">
            <Info className="h-8 w-8 text-slate-600" />
            <h4 className="font-bold mt-2">File not selected</h4>
            <p className="text-xs text-slate-500 mt-1">
              Please explore folders of project in sidebar to review operational codes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
