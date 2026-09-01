import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Download, Play, FileText, Target, Brain, ArrowRight } from 'lucide-react';

interface ExamKitTabProps {
  videoId: string;
}

export const ExamKitTab: React.FC<ExamKitTabProps> = ({ videoId }) => {
  const [examKit, setExamKit] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // States for interactive mockup
  const [activeView, setActiveView] = useState<'overview' | 'mock_exam'>('overview');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);

  useEffect(() => {
    fetchExamKit();
  }, [videoId]);

  const fetchExamKit = async () => {
    try {
      setLoading(true);
      const kit = await api.getExamKit(videoId);
      setExamKit(kit);
    } catch (err: any) {
      setError(err.message || 'Error fetching exam kit');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      setError(null);
      const kit = await api.generateExamKit(videoId);
      setExamKit(kit);
    } catch (err: any) {
      setError(err.message || 'Error generating exam kit');
    } finally {
      setGenerating(false);
    }
  };

  const generatePDFBlob = () => {
    if (!examKit) return null;
    
    // A simple text/markdown representation for the "PDF/Download" action
    let content = `# Complete Exam Kit\n\n`;
    
    content += `## 📚 Revision Notes\n\n`;
    examKit.revision_notes?.forEach((note: any) => {
      content += `### ${note.topic}\n`;
      note.key_points?.forEach((kp: string) => {
        content += `- ${kp}\n`;
      });
      content += `\n`;
    });

    content += `## 🎯 Important Questions\n\n`;
    examKit.important_questions?.forEach((q: any) => {
      content += `**Q: ${q.question}**\n`;
      content += `A: ${q.answer}\n\n`;
    });

    content += `## 🧠 Weak Topic Focus\n\n`;
    examKit.weak_topic_revision?.forEach((w: any) => {
      content += `### ${w.topic}\n`;
      content += `${w.explanation}\n\n`;
      content += `Focus Areas:\n`;
      w.focus_areas?.forEach((f: string) => content += `- ${f}\n`);
      content += `\n`;
    });

    return new Blob([content], { type: 'text/markdown' });
  };

  const downloadNotes = () => {
    const blob = generatePDFBlob();
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ExamKit_${videoId}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading Exam Kit...</div>;
  }

  if (!examKit) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '24px', textAlign: 'center' }}>
        <Target size={48} color="#8b5cf6" style={{ marginBottom: '16px' }} />
        <h2 style={{ margin: '0 0 8px 0' }}>Personalized Exam Kit</h2>
        <p style={{ color: '#64748b', marginBottom: '24px' }}>
          Generate a comprehensive exam prep kit tailored to your weak areas. Includes revision notes, important questions, targeted explanations, and a final mock exam.
        </p>
        <button
          onClick={handleGenerate}
          disabled={generating}
          style={{
            padding: '10px 20px',
            backgroundColor: '#8b5cf6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: generating ? 'not-allowed' : 'pointer',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          {generating ? 'Generating Kit (Takes ~10s)...' : 'Generate My Exam Kit'}
        </button>
        {error && <p style={{ color: 'red', marginTop: '12px' }}>{error}</p>}
      </div>
    );
  }

  if (activeView === 'mock_exam') {
    const question = examKit.final_mock_exam[currentQuestionIdx];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Final Mock Exam</h2>
          <button 
            onClick={() => setActiveView('overview')}
            style={{ padding: '6px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', background: 'white', cursor: 'pointer' }}
          >
            Exit Exam
          </button>
        </div>
        
        <div style={{ marginBottom: '12px', color: '#64748b', fontWeight: 500 }}>
          Question {currentQuestionIdx + 1} of {examKit.final_mock_exam.length}
        </div>
        
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', flex: 1 }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem' }}>{question.question}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {question.options.map((opt: string, i: number) => (
              <button 
                key={i}
                style={{ 
                  textAlign: 'left', padding: '12px', borderRadius: '6px', 
                  border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer'
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
          <button 
            disabled={currentQuestionIdx === 0}
            onClick={() => setCurrentQuestionIdx(i => i - 1)}
            style={{ padding: '8px 16px', border: '1px solid #e2e8f0', borderRadius: '6px', background: 'white', cursor: currentQuestionIdx === 0 ? 'not-allowed' : 'pointer' }}
          >
            Previous
          </button>
          <button 
            disabled={currentQuestionIdx === examKit.final_mock_exam.length - 1}
            onClick={() => setCurrentQuestionIdx(i => i + 1)}
            style={{ padding: '8px 16px', border: 'none', borderRadius: '6px', background: '#3b82f6', color: 'white', cursor: currentQuestionIdx === examKit.final_mock_exam.length - 1 ? 'not-allowed' : 'pointer' }}
          >
            Next
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px', padding: '12px', overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>🎓 Exam Kit</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={downloadNotes}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', background: 'white', cursor: 'pointer', fontSize: '0.875rem' }}
          >
            <Download size={14} /> Download PDF
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '16px', borderRadius: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534', fontWeight: 600, marginBottom: '8px' }}>
            <FileText size={18} /> Revision Notes
          </div>
          <p style={{ margin: 0, color: '#15803d', fontSize: '0.9rem' }}>{examKit.revision_notes?.length} topics summarized</p>
        </div>
        
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '16px', borderRadius: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#991b1b', fontWeight: 600, marginBottom: '8px' }}>
            <Brain size={18} /> Weak Areas
          </div>
          <p style={{ margin: 0, color: '#b91c1c', fontSize: '0.9rem' }}>{examKit.weak_topic_revision?.length} concepts targeted</p>
        </div>
      </div>

      <div style={{ background: 'white', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '8px' }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem', color: '#1e293b' }}>Important Questions</h3>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {examKit.important_questions?.slice(0, 3).map((q: any, i: number) => (
            <li key={i} style={{ fontSize: '0.9rem' }}>{q.question}</li>
          ))}
        </ul>
      </div>

      <button
        onClick={() => { setActiveView('mock_exam'); setCurrentQuestionIdx(0); }}
        style={{
          marginTop: 'auto',
          padding: '12px',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          fontSize: '1rem'
        }}
      >
        <Play size={18} /> Start Final Mock Exam <ArrowRight size={18} />
      </button>
    </div>
  );
};
