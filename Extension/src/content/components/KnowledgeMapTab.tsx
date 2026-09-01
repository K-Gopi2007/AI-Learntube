import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Loader2, AlertCircle, Map as MapIcon } from 'lucide-react';

export default function KnowledgeMapTab() {
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mastery, setMastery] = useState<Record<string, number>>({});
  const loadPath = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const data = await api.getKnowledgeMap();
      const masteryMap: Record<string, number> = {};
      data.knowledge_map?.forEach((item: any) => {
        masteryMap[item.topic] = item.mastery;
      });
      setMastery(masteryMap);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load knowledge map.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPath();
  }, []);

  if (errorMsg) {
    return (
      <div className="error-state" style={{ color: '#ef4444', padding: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <AlertCircle size={20} />
        <span>{errorMsg}</span>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '24px', opacity: 0.7 }}>
        <Loader2 className="animate-spin" size={32} style={{ marginBottom: '12px', color: '#6366f1' }} />
        <span>Rendering knowledge map...</span>
      </div>
    );
  }

  const renderNode = (topic: string) => {
    const score = mastery[topic] !== undefined ? mastery[topic] : null;
    let color = '#334155';
    let label = 'Untested';
    
    if (score !== null) {
      if (score >= 80) { color = '#4ade80'; label = `${score.toFixed(0)}% 🟢`; }
      else if (score >= 50) { color = '#fbbf24'; label = `${score.toFixed(0)}% 🟡`; }
      else { color = '#ef4444'; label = `${score.toFixed(0)}% 🔴`; }
    }

    return (
      <div style={{ 
        border: `1px solid ${color}`, background: 'rgba(30, 41, 59, 0.8)',
        padding: '8px 12px', borderRadius: '8px', display: 'flex', flexDirection: 'column',
        alignItems: 'center', minWidth: '80px', boxShadow: `0 2px 8px ${color}20`
      }}>
        <span style={{ fontSize: '12px', fontWeight: 600, color: '#f8fafc', marginBottom: '4px', textAlign: 'center' }}>
          {topic}
        </span>
        <span style={{ fontSize: '11px', color }}>{label}</span>
      </div>
    );
  };

  return (
    <div style={{ padding: '16px', overflowY: 'auto', height: '100%', display: 'flex', flexDirection: 'column' }}>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f8fafc', marginBottom: '24px' }}>
        <MapIcon size={24} color="#6366f1" />
        <h3 style={{ margin: 0, fontSize: '18px' }}>Knowledge Map</h3>
      </div>

      {/* Tree Visualization */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', paddingTop: '20px' }}>
        
        {/* Level 1 */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          {renderNode('Data Structures')}
        </div>
        
        <div style={{ width: '2px', height: '20px', background: '#334155' }} />
        
        <div style={{ width: '80%', borderTop: '2px solid #334155', display: 'flex', justifyContent: 'space-between', position: 'relative', marginTop: '-26px' }}>
          <div style={{ width: '2px', height: '20px', background: '#334155' }} />
          <div style={{ width: '2px', height: '20px', background: '#334155' }} />
        </div>

        {/* Level 2 */}
        <div style={{ display: 'flex', width: '100%', justifyContent: 'space-around', marginTop: '-24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '10px', color: '#64748b', letterSpacing: '1px' }}>LINEAR</span>
            {renderNode('Arrays')}
            <div style={{ width: '2px', height: '16px', background: '#334155' }} />
            {renderNode('Linked Lists')}
            <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
               {renderNode('Stacks')}
               {renderNode('Queues')}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '10px', color: '#64748b', letterSpacing: '1px' }}>NON-LINEAR</span>
            <div style={{ display: 'flex', gap: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {renderNode('Trees')}
                <div style={{ width: '2px', height: '16px', background: '#334155' }} />
                {renderNode('Binary Trees')}
                <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                  {renderNode('BST')}
                  {renderNode('AVL')}
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {renderNode('Graphs')}
                <div style={{ width: '2px', height: '16px', background: '#334155' }} />
                {renderNode('Graph Fundamentals')}
                <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                  {renderNode('BFS')}
                  {renderNode('DFS')}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
