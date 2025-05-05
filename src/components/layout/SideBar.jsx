import { Trash2 } from "lucide-react";

export default function SideBar({
    selectedPanel,
    selectedNode,
    setSelectedNode,
    setSelectedNodeId,
    COMPONENT_TYPES,
    nodes,
    selectedNodeId,
    setSelectedPanel,
    setNodes }) {
    const handleDragStart = (e, nodeType) => {
        e.dataTransfer.setData('nodeType', nodeType);
    }
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
      };
    return (
        <div className="w-64 border-r border-slate-200 flex flex-col">
            <div className="p-3 border-b border-slate-200">
                <div className="flex space-x-1">
                    <button
                        onClick={() => setSelectedPanel('components')}
                        className={`flex-1 py-2 text-sm font-medium rounded-none ${selectedPanel === 'components'
                                ? 'bg-slate-200 text-slate-800'
                                : 'bg-white text-slate-600 hover:bg-slate-100'
                            }`}
                    >
                        Components
                    </button>
                    <button
                        onClick={() => setSelectedPanel('properties')}
                        className={`flex-1 py-2 text-sm font-medium rounded-none ${selectedPanel === 'properties'
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
    )
}