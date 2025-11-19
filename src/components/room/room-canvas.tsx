"use client";

import {
  ReactFlow,
  Edge,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  NodeTypes,
  ReactFlowProvider,
  useReactFlow,
  ConnectionMode,
} from "@xyflow/react";
import { ReactElement, useCallback, useEffect, useState, useMemo } from "react";
import "@xyflow/react/dist/style.css";
import { debounce } from "lodash";
import type { NodeChange } from "@xyflow/react";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/auth/auth-provider";
import { CanvasNavigation } from "./canvas-navigation";
import { useCanvasNodes } from "./hooks/useCanvasNodes";
import { Id } from "@/convex/_generated/dataModel";
import {
  PlayerNode,
  ResultsNode,
  StoryNode,
  SessionNode,
  TimerNode,
  VotingCardNode,
} from "./nodes";
import type { CustomNodeType } from "./types";
import type { RoomWithRelatedData, SanitizedVote } from "@/convex/model/rooms";

interface RoomCanvasProps {
  roomData: RoomWithRelatedData;
}

// Define node types outside component to prevent re-renders
const nodeTypes: NodeTypes = {
  player: PlayerNode,
  story: StoryNode,
  session: SessionNode,
  votingCard: VotingCardNode,
  results: ResultsNode,
  timer: TimerNode,
} as const;

function RoomCanvasInner({
  roomData,
}: RoomCanvasProps): ReactElement {
  const { user } = useAuth();
  const [nodes, setNodes, onNodesChange] = useNodesState<CustomNodeType>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const { fitView } = useReactFlow();

  // Convex mutations
  const showCards = useMutation(api.rooms.showCards);
  const resetGame = useMutation(api.rooms.resetGame);
  const pickCard = useMutation(api.votes.pickCard);
  const updateNodePosition = useMutation(api.canvas.updateNodePosition);

  const handleRevealCards = useCallback(async () => {
    if (!roomData) return;
    try {
      await showCards({ roomId: roomData.room._id });
    } catch (error) {
      console.error("Failed to show cards:", error);
    }
  }, [showCards, roomData]);

  const handleResetGame = useCallback(async () => {
    if (!roomData) return;
    try {
      await resetGame({ roomId: roomData.room._id });
    } catch (error) {
      console.error("Failed to reset game:", error);
    }
  }, [resetGame, roomData]);

  // Track selected cards locally (server doesn't send card value until reveal)
  const [selectedCardValue, setSelectedCardValue] = useState<string | null>(
    null,
  );

  // Reset selected card when game is reset
  useEffect(() => {
    if (!roomData || !user) return;
    
    const userVote = roomData.votes.find((v: SanitizedVote) => v.userId === user.id);
    
    // If no card is picked on server (game was reset), clear local selection
    if (!userVote || !userVote.hasVoted) {
      setSelectedCardValue(null);
    }
    // If game is revealed and we have a card value from server, sync it
    else if (roomData.room.isGameOver && userVote.cardLabel) {
      setSelectedCardValue(userVote.cardLabel);
    }
  }, [user, roomData]);

  // Handle card selection
  const handleCardSelect = useCallback(async (cardValue: string) => {
    if (!user || !roomData) return;
    
    setSelectedCardValue(cardValue);
    
    try {
      await pickCard({
        roomId: roomData.room._id,
        userId: user.id,
        cardLabel: cardValue,
        cardValue: parseInt(cardValue) || 0,
      });
    } catch (error) {
      console.error("Failed to pick card:", error);
      setSelectedCardValue(null);
    }
  }, [pickCard, user, roomData]);

  // Get room ID
  const roomId = roomData?.room._id as Id<"rooms">;

  // Use the canvas nodes hook to get persisted nodes
  const { nodes: layoutNodes, edges: layoutEdges } = useCanvasNodes({
    roomId,
    roomData,
    currentUserId: user?.id,
    selectedCardValue,
    onRevealCards: handleRevealCards,
    onResetGame: handleResetGame,
    onCardSelect: handleCardSelect,
  });

  // Update nodes and edges when layout changes
  useEffect(() => {
    setNodes(layoutNodes);
  }, [layoutNodes, setNodes]);

  useEffect(() => {
    setEdges(layoutEdges);
  }, [layoutEdges, setEdges]);

  // Debounced position update to prevent database overload
  const debouncedPositionUpdate = useMemo(
    () => debounce((nodeId: string, position: { x: number; y: number }) => {
      if (!user || !roomId) return;
      
      updateNodePosition({
        roomId,
        nodeId,
        position,
        userId: user.id,
      }).catch((error) => {
        console.error("Failed to update node position:", error);
      });
    }, 100),
    [roomId, user, updateNodePosition]
  );

  // Cleanup debounced function on unmount
  useEffect(() => {
    return () => {
      debouncedPositionUpdate.cancel();
    };
  }, [debouncedPositionUpdate]);

  // Handle node position changes
  const handleNodesChange = useCallback((changes: NodeChange<CustomNodeType>[]) => {
    // Call the original handler to update local state
    onNodesChange(changes);
    
    // Send position updates to database
    changes.forEach((change) => {
      if (change.type === 'position' && change.position && !change.dragging) {
        debouncedPositionUpdate(change.id, change.position);
      }
    });
  }, [onNodesChange, debouncedPositionUpdate]);

  // Handle connection between nodes - prevent manual connections
  const onConnect = useCallback(() => {
    // Manual connections are not allowed in this application
    return;
  }, []);

  // Fit view when users change with debounce
  useEffect(() => {
    if (!roomData?.users) return;
    
    const timeoutId = setTimeout(() => {
      fitView({
        padding: 0.1,
        duration: 800,
        maxZoom: 1.2,
        minZoom: 0.6,
      });
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [roomData?.users, fitView]);

  if (!roomData || !user) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="w-full h-screen relative">
      <CanvasNavigation roomData={roomData} />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView={false}
        proOptions={{ hideAttribution: true }}
        minZoom={0.1}
        maxZoom={4}
        defaultViewport={{ x: 0, y: 50, zoom: 0.75 }}
        nodesDraggable
        nodesConnectable={false}
        elementsSelectable
        snapToGrid
        snapGrid={[25, 25]}
        preventScrolling={false}
        attributionPosition="bottom-right"
        panOnScroll
        selectionOnDrag
        panOnDrag={[1, 2]}
        translateExtent={[
          [-2000, -2000],
          [2000, 2000],
        ]}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          className="[&>*]:stroke-gray-300 dark:[&>*]:stroke-gray-700"
        />

        <div
          style={{
            position: "absolute",
            bottom: 20,
            left: 20,
            width: 280,
            padding: 12,
            borderRadius: 12,
            background: "#ffffffdd",
            backdropFilter: "blur(6px)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            fontFamily: "Inter, sans-serif",
            fontSize: 13,
            lineHeight: "16px",
            color: "#333",
          }}
        >
          <div style={{ height: "100%", overflowY: "auto", paddingRight: 8 }}>
            <div style={{ marginBottom: 8 }}>
              <strong style={{ color: "#4d8fdaff" }}>1 – Muito baixo:</strong> ~
              1h – 2h
              <br />
              Simples, baixo risco
              <br />
              Ex: Ajustar um texto ou botão
            </div>

            <div style={{ marginBottom: 8 }}>
              <strong style={{ color: "#2f8bff" }}>2 – Baixo:</strong> ~ 2h – 4h
              <br />
              Pouca complexidade
              <br />
              Ex: Ajustar layout ou endpoint simples
            </div>

            <div style={{ marginBottom: 8 }}>
              <strong style={{ color: "#124facff" }}>3 – Médio-baixo:</strong> ~
              4h – 6h
              <br />
              Poucas dependências
              <br />
              Ex: Criar componente simples
            </div>

            <div style={{ marginBottom: 8 }}>
              <strong style={{ color: "#0b8542ff" }}>5 – Médio:</strong> ~ 1 dia
              <br />
              Risco moderado
              <br />
              Ex: Criar API pequena ou refatoração de módulo
            </div>

            <div style={{ marginBottom: 8 }}>
              <strong style={{ color: "#027030ff" }}>8 – Médio-alto:</strong> ~
              1,5 – 2 dias
              <br />
              Mais dependências
              <br />
              Ex: Integração com outro sistema / tecnologia
            </div>

            <div style={{ marginBottom: 8 }}>
              <strong style={{ color: "#c7a408ff" }}>13 – Alto:</strong> ~ 3 – 4
              dias
              <br />
              Impacta mais áreas
              <br />
              Ex: Tela com lógica complexa
            </div>

            <div style={{ marginBottom: 8 }}>
              <strong style={{ color: "#b98e00ff" }}>21 – Muito alto:</strong> ~
              1 semana
              <br />
              Muitas dependências
              <br />
              Ex: Integração com múltiplos sistemas
            </div>

            <div style={{ marginBottom: 8 }}>
              <strong style={{ color: "#ff8a33" }}>34 – Altíssimo:</strong> ~ 2
              semanas
              <br />
              Risco elevado
              <br />
              Ex: Módulo novo ou arquitetura complexa
            </div>

            <div style={{ marginBottom: 8 }}>
              <strong style={{ color: "#ff6d00" }}>55 – Grande demais:</strong>{" "}
              ~ 3 – 4 semanas
              <br />
              Altíssima incerteza
              <br />
              Ex: Refatoração completa de plataforma
            </div>

            <div>
              <strong style={{ color: "#e53935" }}>
                89 – Quebra de épico:
              </strong>{" "}
              &gt; 1 mês
              <br />
              Dividir
            </div>
          </div>
        </div>
      </ReactFlow>
    </div>
  );
}

export function RoomCanvas(props: RoomCanvasProps): ReactElement {
  return (
    <ReactFlowProvider>
      <RoomCanvasInner {...props} />
    </ReactFlowProvider>
  );
}