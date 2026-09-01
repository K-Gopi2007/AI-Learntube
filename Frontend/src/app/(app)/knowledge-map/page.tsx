"use client";
import { useCallback } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Badge } from '@/components/ui/badge';
import type { NodeProps, Node, Connection } from '@xyflow/react';

type CustomNodeData = {
  label: string;
  status: 'mastered' | 'practice' | 'weak' | 'none';
};

const CustomNode = ({ data }: NodeProps<Node<CustomNodeData>>) => {
  let bgColor = "bg-white";
  let borderColor = "border-gray-200";
  let badgeProps: { variant: "outline" | "default" | "secondary" | "destructive"; text: string } = { variant: "outline", text: "Not Started" };
  
  if (data.status === "mastered") {
    bgColor = "bg-green-50";
    borderColor = "border-green-500";
    badgeProps = { variant: "default" as const, text: "Mastered" };
  } else if (data.status === "practice") {
    bgColor = "bg-yellow-50";
    borderColor = "border-yellow-500";
    badgeProps = { variant: "secondary" as const, text: "Needs Practice" };
  } else if (data.status === "weak") {
    bgColor = "bg-red-50";
    borderColor = "border-red-500";
    badgeProps = { variant: "destructive" as const, text: "Weak" };
  }

  return (
    <div className={`px-4 py-3 rounded-xl border-2 shadow-sm min-w-[150px] text-center ${bgColor} ${borderColor}`}>
      <Handle type="target" position={Position.Top} className="w-2 h-2" />
      <div className="font-bold text-sm mb-1 text-foreground">{data.label}</div>
      <Badge variant={badgeProps.variant} className="text-[10px] scale-90">{badgeProps.text}</Badge>
      <Handle type="source" position={Position.Bottom} className="w-2 h-2" />
    </div>
  );
};

const nodeTypes = { custom: CustomNode };

const initialNodes = [
  { id: 'dsa', type: 'custom', position: { x: 400, y: 50 }, data: { label: 'DSA', status: 'mastered' } },
  { id: 'arrays', type: 'custom', position: { x: 100, y: 150 }, data: { label: 'Arrays', status: 'mastered' } },
  { id: 'll', type: 'custom', position: { x: 250, y: 150 }, data: { label: 'Linked List', status: 'mastered' } },
  { id: 'stack', type: 'custom', position: { x: 400, y: 150 }, data: { label: 'Stack', status: 'mastered' } },
  { id: 'queue', type: 'custom', position: { x: 550, y: 150 }, data: { label: 'Queue', status: 'mastered' } },
  { id: 'trees', type: 'custom', position: { x: 700, y: 150 }, data: { label: 'Trees', status: 'practice' } },
  { id: 'graphs', type: 'custom', position: { x: 850, y: 150 }, data: { label: 'Graphs', status: 'weak' } },
  { id: 'bst', type: 'custom', position: { x: 625, y: 250 }, data: { label: 'BST', status: 'practice' } },
  { id: 'avl', type: 'custom', position: { x: 775, y: 250 }, data: { label: 'AVL', status: 'none' } },
];

const initialEdges = [
  { id: 'e-dsa-arrays', source: 'dsa', target: 'arrays', animated: true },
  { id: 'e-dsa-ll', source: 'dsa', target: 'll', animated: true },
  { id: 'e-dsa-stack', source: 'dsa', target: 'stack', animated: true },
  { id: 'e-dsa-queue', source: 'dsa', target: 'queue', animated: true },
  { id: 'e-dsa-trees', source: 'dsa', target: 'trees', animated: true },
  { id: 'e-dsa-graphs', source: 'dsa', target: 'graphs', animated: true },
  { id: 'e-trees-bst', source: 'trees', target: 'bst', animated: true },
  { id: 'e-trees-avl', source: 'trees', target: 'avl', animated: false },
];

export default function KnowledgeMapPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  return (
    <div className="h-[calc(100vh-100px)] w-full bg-white rounded-xl border overflow-hidden shadow-sm flex flex-col">
      <div className="p-4 border-b bg-muted/20 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Knowledge Map</h2>
          <p className="text-sm text-muted-foreground">Visual representation of your mastery</p>
        </div>
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-500"></div> Mastered</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-yellow-500"></div> Practice</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-500"></div> Weak</div>
        </div>
      </div>
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
        >
          <Controls />
          <MiniMap />
          <Background gap={12} size={1} />
        </ReactFlow>
      </div>
    </div>
  );
}