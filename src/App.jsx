import './App.css'

import { useState, useRef } from 'react';
import { Plus, ArrowRight, Settings, Database, Server, GitBranch, Package } from 'lucide-react';
import Navbar from "./components/layout/Navbar"
import SideBar from './components/layout/SideBar';
const COMPONENT_TYPES = {
  SERVICE: {
    name: 'Microservice',
    icon: <Server className="mr-2" size={16} />,
    color: 'bg-[#6cb52d] border-white text-white',
    description: 'Spring Boot service with REST endpoints'
  },
  CONFIG: {
    name: 'Config Server',
    icon: <Settings className="mr-2" size={16} />,
    color: 'bg-[#6cb52d] border-white text-white',
    description: 'Spring Cloud Config Server'
  },
  GATEWAY: {
    name: 'API Gateway',
    icon: <ArrowRight className="mr-2" size={16} />,
    color: 'bg-[#6cb52d] border-white text-white',
    description: 'Spring Cloud Gateway'
  },
  REGISTRY: {
    name: 'Service Discovery',
    icon: <GitBranch className="mr-2" size={16} />,
    color: 'bg-[#6cb52d] border-white text-white',
    description: 'Eureka Service Discovery'
  },
  DATABASE: {
    name: 'Database',
    icon: <Database className="mr-2" size={16} />,
    color: 'bg-[#6cb52d] border-white text-white',
    description: 'Database resource'
  },
  MODULE: {
    name: 'Library Module',
    icon: <Package className="mr-2" size={16} />,
    color: 'bg-[#6cb52d] border-white text-white',
    description: 'Shared library module'
  }
};

export function App() {
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectingNodeId, setConnectingNodeId] = useState(null);
  const [selectedPanel, setSelectedPanel] = useState('components');
  const canvasRef = useRef(null);
  const [nextId, setNextId] = useState(1);


  const handleDrop = (e) => {
    e.preventDefault();
    const nodeType = e.dataTransfer.getData('nodeType');
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - 75; 
    const y = e.clientY - rect.top - 25;  

    if (nodeType) {
      const newNode = {
        id: `node-${nextId}`,
        type: nodeType,
        x: Math.max(0, x),
        y: Math.max(0, y),
        name: `${COMPONENT_TYPES[nodeType].name} ${nextId}`,
        properties: {
          port: nodeType === 'SERVICE' ? 8080 + nextId : '',
          dependencies: [],
          dbType: nodeType === 'DATABASE' ? 'MySQL' : '',
          version: '3.0.0',
          group: 'com.example',
          artifact: `${nodeType.toLowerCase()}-service`
        }
      };

      setNodes([...nodes, newNode]);
      setNextId(nextId + 1);
    } else {
      const nodeId = e.dataTransfer.getData('nodeId');
      const node = nodes.find(n => n.id === nodeId);

      if (node) {
        const updatedNodes = nodes.map(n => {
          if (n.id === nodeId) {
            return {
              ...n,
              x: Math.max(0, x),
              y: Math.max(0, y)
            };
          }
          return n;
        });

        setNodes(updatedNodes);
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleNodeDragStart = (e, nodeId) => {
    e.stopPropagation();
    e.dataTransfer.setData('nodeId', nodeId);
  };

  const handleNodeClick = (e, nodeId) => {
    e.stopPropagation();

    if (isConnecting) {
      if (connectingNodeId !== nodeId) {
        const newConnection = {
          id: `conn-${connectingNodeId}-${nodeId}`,
          from: connectingNodeId,
          to: nodeId,
          type: 'default'
        };

        setConnections([...connections, newConnection]);
        setIsConnecting(false);
        setConnectingNodeId(null);
      }
    } else {
      const node = nodes.find(n => n.id === nodeId);
      setSelectedNode(node);
      setSelectedNodeId(nodeId);
      setSelectedPanel('properties');
    }
  };

  const handleStartConnecting = (e, nodeId) => {
    e.stopPropagation();
    setIsConnecting(true);
    setConnectingNodeId(nodeId);
  };


  const getConnectionPath = (fromNode, toNode) => {
    const startX = fromNode.x + 75; // Node width/2
    const startY = fromNode.y + 25; // Node height/2
    const endX = toNode.x + 75;
    const endY = toNode.y + 25;

    return `M ${startX} ${startY} C ${(startX + endX) / 2} ${startY}, ${(startX + endX) / 2} ${endY}, ${endX} ${endY}`;
  };

  const handleCanvasClick = () => {
    setSelectedNode(null);
    setSelectedNodeId(null);
    if (isConnecting) {
      setIsConnecting(false);
      setConnectingNodeId(null);
    }
  };

  const generateCode = () => {
    alert("Code generation would export Spring Boot project files for each microservice in the architecture.");
  };

  const saveProject = () => {
    const project = { nodes, connections };
    alert("Project saved! (This would save to a file or backend)");
    console.log("Project data:", project);
  };

  const exportDiagram = () => {
    const diagram = { nodes, connections };
    const blob = new Blob([JSON.stringify(diagram, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'microservice-architecture.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-screen">
      <Navbar
        saveProject={saveProject}
        exportDiagram={exportDiagram}
        generateCode={generateCode} />

      <div className="flex flex-1 overflow-hidden bg-[#1b1f23]">
        <SideBar
          selectedNode={selectedNode}
          selectedPanel={selectedPanel}
          COMPONENT_TYPES={COMPONENT_TYPES}
          setSelectedNode={selectedNode}
          setSelectedNodeId={setSelectedNodeId}
          nodes={nodes}
          selectedNodeId={selectedNodeId}
          setSelectedPanel={setSelectedPanel}
          setNodes={setNodes}
        />

        <div
          className="flex-1  relative overflow-auto"
          ref={canvasRef}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={handleCanvasClick}
        >
          <div className="absolute top-0 left-0 w-full h-full bg-[#1b1f23]  ">
            <svg width="100%" height="100%">
              <defs>
                <pattern id="smallGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#smallGrid)" />
            </svg>

            <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
              {connections.map(conn => {
                const fromNode = nodes.find(n => n.id === conn.from);
                const toNode = nodes.find(n => n.id === conn.to);
                if (!fromNode || !toNode) return null;
                return (
                  <path
                    key={conn.id}
                    d={getConnectionPath(fromNode, toNode)}
                    stroke="#64748b"
                    strokeWidth="2"
                    fill="none"
                    markerEnd="url(#arrowhead)"
                  />
                );
              })}

              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
                </marker>
              </defs>
            </svg>

            {isConnecting && connectingNodeId && (
              <div className="fixed top-0 left-0 w-screen h-screen cursor-crosshair z-10"
                style={{ pointerEvents: 'none' }}>
                <svg className="w-full h-full">
                  <line
                    x1={nodes.find(n => n.id === connectingNodeId).x + 75}
                    y1={nodes.find(n => n.id === connectingNodeId).y + 25}
                    x2={window.mouseX || 0}
                    y2={window.mouseY || 0}
                    stroke="#2563eb"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                  />
                </svg>
              </div>
            )}

            {nodes.map(node => {
              const componentType = COMPONENT_TYPES[node.type];

              return (
                <div
                  key={node.id}
                  className={`absolute rounded-none p-3 shadow-md border-2 ${componentType.color} ${selectedNodeId === node.id ? 'ring-2 ring-blue-500' : ''
                    } ${isConnecting ? 'cursor-crosshair' : 'cursor-grab'}`}
                  style={{
                    left: `${node.x}px`,
                    top: `${node.y}px`,
                    width: '150px',
                  }}
                  draggable
                  onDragStart={(e) => handleNodeDragStart(e, node.id)}
                  onClick={(e) => handleNodeClick(e, node.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center mb-1">
                      {componentType.icon}
                      <span className="font-medium text-sm truncate max-w-[100px]">{node.name}</span>
                    </div>
                    <button
                      className="w-5 h-5 bg-slate-200 hover:bg-slate-300 rounded-none flex items-center justify-center"
                      onClick={(e) => handleStartConnecting(e, node.id)}
                      title="Connect to another component"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                  <div className="text-xs opacity-70 mt-1">
                    {node.type === 'SERVICE' && `Port: ${node.properties.port}`}
                    {node.type === 'DATABASE' && `DB: ${node.properties.dbType}`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
export default App
