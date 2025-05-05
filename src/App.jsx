import './App.css'

import { useState, useRef, useCallback } from 'react';
import { Check, Plus, ArrowRight, Trash2, Save, Download, Code, Settings, Database, Server, GitBranch, Package } from 'lucide-react';

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

// Main Application Component
export function App() {
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectingNodeId, setConnectingNodeId] = useState(null);
  const [selectedPanel, setSelectedPanel] = useState('components'); // 'components' or 'properties'
  const canvasRef = useRef(null);
  const [nextId, setNextId] = useState(1);
  
  // Handle node dragging
  const handleDragStart = (e, nodeType) => {
    e.dataTransfer.setData('nodeType', nodeType);
  };

  // Handle dropping a new node onto the canvas
  const handleDrop = (e) => {
    e.preventDefault();
    const nodeType = e.dataTransfer.getData('nodeType');
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - 75; // Adjust for node width
    const y = e.clientY - rect.top - 25;  // Adjust for node height
    
    if (nodeType) {
      // Create new node from palette
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
      // This is an existing node being moved
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

  // Allow dropping on the canvas
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Start dragging an existing node
  const handleNodeDragStart = (e, nodeId) => {
    e.stopPropagation();
    e.dataTransfer.setData('nodeId', nodeId);
  };

  // Handle node selection
  const handleNodeClick = (e, nodeId) => {
    e.stopPropagation();
    
    if (isConnecting) {
      // Creating a connection
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
      // Just selecting a node
      const node = nodes.find(n => n.id === nodeId);
      setSelectedNode(node);
      setSelectedNodeId(nodeId);
      setSelectedPanel('properties');
    }
  };

  // Start creating a connection
  const handleStartConnecting = (e, nodeId) => {
    e.stopPropagation();
    setIsConnecting(true);
    setConnectingNodeId(nodeId);
  };

  // Delete a node and its connections
  const handleDeleteNode = (nodeId) => {
    setNodes(nodes.filter(node => node.id !== nodeId));
    setConnections(connections.filter(
      conn => conn.from !== nodeId && conn.to !== nodeId
    ));
    
    if (selectedNodeId === nodeId) {
      setSelectedNode(null);
      setSelectedNodeId(null);
    }
  };

  // Update node properties
  const updateNodeProperty = (property, value) => {
    if (!selectedNodeId) return;
    
    const updatedNodes = nodes.map(node => {
      if (node.id === selectedNodeId) {
        if (property === 'name') {
          return { ...node, name: value };
        } else {
          return {
            ...node,
            properties: {
              ...node.properties,
              [property]: value
            }
          };
        }
      }
      return node;
    });
    
    setNodes(updatedNodes);
    setSelectedNode(updatedNodes.find(node => node.id === selectedNodeId));
  };

  // Calculate connection path
  const getConnectionPath = (fromNode, toNode) => {
    const startX = fromNode.x + 75; // Node width/2
    const startY = fromNode.y + 25; // Node height/2
    const endX = toNode.x + 75;
    const endY = toNode.y + 25;
    
    return `M ${startX} ${startY} C ${(startX + endX) / 2} ${startY}, ${(startX + endX) / 2} ${endY}, ${endX} ${endY}`;
  };

  // Clear the canvas selection
  const handleCanvasClick = () => {
    setSelectedNode(null);
    setSelectedNodeId(null);
    if (isConnecting) {
      setIsConnecting(false);
      setConnectingNodeId(null);
    }
  };

  // Generate Spring Boot microservices code (mock)
  const generateCode = () => {
    alert("Code generation would export Spring Boot project files for each microservice in the architecture.");
  };

  // Save the diagram (mock)
  const saveProject = () => {
    const project = { nodes, connections };
    alert("Project saved! (This would save to a file or backend)");
    console.log("Project data:", project);
  };

  // Export diagram as JSON
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
      {/* Top navbar */}
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

      <div className="flex flex-1 overflow-hidden bg-[#1b1f23]">
        {/* Left sidebar */}
        <div className="w-64 border-r border-slate-200 flex flex-col">
          <div className="p-3 border-b border-slate-200">
            <div className="flex space-x-1">
              <button 
                onClick={() => setSelectedPanel('components')}
                className={`flex-1 py-2 text-sm font-medium rounded-none ${
                  selectedPanel === 'components' 
                    ? 'bg-slate-200 text-slate-800' 
                    : 'bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                Components
              </button>
              <button 
                onClick={() => setSelectedPanel('properties')}
                className={`flex-1 py-2 text-sm font-medium rounded-none ${
                  selectedPanel === 'properties' 
                    ? 'bg-slate-200 text-slate-800' 
                    : 'bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                Properties
              </button>
            </div>
          </div>
          
          {selectedPanel === 'components' ? (
            <div className="p-3 overflow-y-auto flex-1">
              <h2 className="text-sm font-semibold text-slate-100 mb-3">Microservice Components</h2>
              <div className="space-y-2">
                {Object.entries(COMPONENT_TYPES).map(([key, component]) => (
                  <div 
                    key={key}
                    className={`p-2 border ${component.color} cursor-grab flex items-center`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, key)}
                  >
                    {component.icon}
                    <div>
                      <div className="font-medium text-sm">{component.name}</div>
                      <div className="text-xs opacity-80">{component.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-3 overflow-y-auto flex-1">
              <h2 className="text-sm font-semibold text-slate-100 mb-3">
                {selectedNode ? `${selectedNode.name} Properties` : 'No Component Selected'}
              </h2>
              
              {selectedNode && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-100 mb-1">Component Name</label>
                    <input
                      type="text"
                      value={selectedNode.name}
                      onChange={(e) => updateNodeProperty('name', e.target.value)}
                      className="w-full border border-slate-300 text-slate-200 rounded-none px-2 py-1 text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-slate-100 mb-1">Group ID</label>
                    <input
                      type="text"
                      value={selectedNode.properties.group || ''}
                      onChange={(e) => updateNodeProperty('group', e.target.value)}
                      className="w-full border border-slate-300 text-slate-200 rounded-none px-2 py-1 text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-slate-100 mb-1">Artifact ID</label>
                    <input
                      type="text"
                      value={selectedNode.properties.artifact || ''}
                      onChange={(e) => updateNodeProperty('artifact', e.target.value)}
                      className="w-full border border-slate-300 text-slate-200 rounded-none px-2 py-1 text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-slate-100 mb-1">Version</label>
                    <input
                      type="text"
                      value={selectedNode.properties.version || ''}
                      onChange={(e) => updateNodeProperty('version', e.target.value)}
                      className="w-full border border-slate-300 text-slate-200 rounded-none px-2 py-1 text-sm"
                    />
                  </div>
                  
                  {selectedNode.type === 'SERVICE' && (
                    <div>
                      <label className="block text-xs font-medium text-slate-100 mb-1">Port</label>
                      <input
                        type="number"
                        value={selectedNode.properties.port || ''}
                        onChange={(e) => updateNodeProperty('port', e.target.value)}
                        className="w-full border border-slate-300 text-slate-200 rounded-none px-2 py-1 text-sm"
                      />
                    </div>
                  )}
                  
                  {selectedNode.type === 'DATABASE' && (
                    <div>
                      <label className="block text-xs font-medium text-slate-100 mb-1">Database Type</label>
                      <select
                        value={selectedNode.properties.dbType || 'MySQL'}
                        onChange={(e) => updateNodeProperty('dbType', e.target.value)}
                        className="w-full border border-slate-300 text-slate-200 rounded-none px-2 py-1 text-sm"
                      >
                        <option value="MySQL">MySQL</option>
                        <option value="PostgreSQL">PostgreSQL</option>
                        <option value="MongoDB">MongoDB</option>
                        <option value="Redis">Redis</option>
                      </select>
                    </div>
                  )}
                  
                  <div className="pt-2">
                    <button
                      onClick={() => handleDeleteNode(selectedNodeId)}
                      className="flex items-center text-red-600 hover:text-red-800 text-xs font-medium"
                    >
                      <Trash2 size={14} className="mr-1" /> Delete Component
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Main canvas area */}
        <div 
          className="flex-1  relative overflow-auto"
          ref={canvasRef}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={handleCanvasClick}
        >
          <div className="absolute top-0 left-0 w-full h-full bg-[#1b1f23]  ">
            {/* Grid background */}
            <svg width="100%" height="100%">
              <defs>
                <pattern id="smallGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#smallGrid)" />
            </svg>
            
            {/* Connection lines */}
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
              
              {/* Arrow marker definition */}
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
            
            {/* Active connecting line (when creating a connection) */}
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
            
            {/* Nodes */}
            {nodes.map(node => {
              const componentType = COMPONENT_TYPES[node.type];
              
              return (
                <div
                  key={node.id}
                  className={`absolute rounded-none p-3 shadow-md border-2 ${componentType.color} ${
                    selectedNodeId === node.id ? 'ring-2 ring-blue-500' : ''
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
