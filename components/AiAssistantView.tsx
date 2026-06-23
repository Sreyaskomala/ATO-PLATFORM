import React, { useState } from 'react';
import { Student, Simulator, Invoice, UserRole, User } from '../types';
import { Send, Bot, User as UserIcon, Database, ShieldAlert, CheckCircle } from 'lucide-react';

interface AiAssistantViewProps {
  students: Student[];
  simulators: Simulator[];
  invoices: Invoice[];
  currentUser: User;
  onLogAudit: (action: string, details: string) => void;
}

const AiAssistantView: React.FC<AiAssistantViewProps> = ({
  students,
  simulators,
  invoices,
  currentUser,
  onLogAudit
}) => {
  const [messages, setMessages] = useState<{ sender: 'user' | 'bot'; text: string; dataTable?: any[] }[]>([
    { sender: 'bot', text: 'Hello! I am the ATMS AI Operations Assistant. You can query system records, compliance holdings, or simulator metrics using natural language. Try: "show cadets on hold", "simulate reliability check", or "show Akasa invoices".' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    const cleanQuery = userText.toLowerCase();
    
    // Add user message
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setInput('');
    onLogAudit('AI_QUERY', `AI Assistant queried: "${userText}"`);

    // Process responses against local state
    setTimeout(() => {
      let botText = "I parsed your query but couldn't find a matching record filter. Try asking: 'show cadets on hold', 'sim reliability', or 'billing summaries'.";
      let dataTable: any[] | undefined = undefined;

      if (cleanQuery.includes('cadet') || cleanQuery.includes('trainee') || cleanQuery.includes('student') || cleanQuery.includes('hold')) {
        const holdCadets = students.filter(s => s.status === 'HOLD');
        botText = `Compliance Scanning complete. Found ${holdCadets.length} cadets currently on Training Hold. Details are logged below:`;
        dataTable = holdCadets.map(c => ({
          Name: c.name,
          ID: c.employeeNo,
          Company: c.company,
          Status: c.status,
          Expiry: c.documents.find(d => d.type === 'MEDICAL')?.expiryDate || 'N/A'
        }));
      } else if (cleanQuery.includes('reliability') || cleanQuery.includes('sim') || cleanQuery.includes('fstd')) {
        botText = `FSTD Fleet technical telemetry retrieval successful. Current reliability records:`;
        dataTable = simulators.map(s => ({
          Name: s.name,
          Model: s.model,
          Facility: s.facility,
          Reliability: `${s.metrics.reliability}%`,
          Status: s.status
        }));
      } else if (cleanQuery.includes('invoice') || cleanQuery.includes('billing') || cleanQuery.includes('akasa') || cleanQuery.includes('india')) {
        botText = `Invoicing accounting ledger checked. Active billing items matching criteria:`;
        dataTable = invoices.map(i => ({
          Number: i.invoiceNumber,
          Client: i.customerName,
          Date: i.date,
          Amount: `$${i.amount.toLocaleString()}`,
          Status: i.status
        }));
      }

      setMessages(prev => [...prev, { sender: 'bot', text: botText, dataTable }]);
    }, 500);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px] animate-fade-in">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Bot className="w-5 h-5 text-red-600" />
          <div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">AI Operations Assistant</h3>
            <p className="text-[9px] text-slate-400 font-bold">RAG Retrieval over training files &amp; logs</p>
          </div>
        </div>
        <span className="flex items-center gap-1 text-[9px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          <CheckCircle className="w-3.5 h-3.5" /> Explainable AI
        </span>
      </div>

      {/* Chat messages */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex gap-3 max-w-[85%] ${m.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
              m.sender === 'user' ? 'bg-slate-100 text-slate-700' : 'bg-red-50 text-red-600 border-red-100'
            }`}>
              {m.sender === 'user' ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            
            <div className="space-y-3">
              <div className={`p-4 rounded-2xl text-xs font-bold leading-relaxed ${
                m.sender === 'user' ? 'bg-slate-900 text-white' : 'bg-slate-50 border border-slate-200 text-slate-700'
              }`}>
                {m.text}
              </div>

              {m.dataTable && (
                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm max-w-full overflow-x-auto bg-white">
                  <table className="text-left text-[11px] min-w-[320px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        {Object.keys(m.dataTable[0] || {}).map(k => (
                          <th key={k} className="px-4 py-2 font-black uppercase text-slate-400">{k}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {m.dataTable.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-slate-50/50">
                          {Object.values(row).map((val: any, cIdx) => (
                            <td key={cIdx} className="px-4 py-2 text-slate-700 font-semibold">{val}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input bar */}
      <form onSubmit={handleSend} className="p-4 border-t border-slate-100 flex gap-2.5 bg-slate-50/50">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask: 'show cadets on hold', 'sim reliability', etc..."
          className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-red-400"
        />
        <button
          type="submit"
          className="w-12 h-12 rounded-xl bg-slate-900 hover:bg-red-600 text-white flex items-center justify-center transition-all shadow"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default AiAssistantView;
