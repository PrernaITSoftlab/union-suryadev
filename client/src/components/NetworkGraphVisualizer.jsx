import React, { useState } from 'react';
import { Network, Users, Building, Layers, Briefcase, Zap, CheckCircle2, ChevronRight } from 'lucide-react';

const SAMPLE_NODES = [
  { id: 'n1', label: 'Aarav Suyradev', type: 'person', category: 'Executive Leadership', connections: ['n2', 'n3', 'n4', 'n5'], detail: 'Founder & Director — Union Suyradev Network' },
  { id: 'n2', label: 'Priya Sharma', type: 'person', category: 'Fintech', connections: ['n1', 'n6', 'n9'], detail: 'VP Enterprise Solutions — Nexus Fintech' },
  { id: 'n3', label: 'Marcus Vance', type: 'person', category: 'Consulting', connections: ['n1', 'n7', 'n10'], detail: 'Managing Partner — Vance Global Strategy' },
  { id: 'n4', label: 'Dr. Elena Rodriguez', type: 'person', category: 'Cybersecurity', connections: ['n1', 'n2', 'n8'], detail: 'CISO — CyberPulse Security' },
  { id: 'n5', label: 'Vikram Singh', type: 'person', category: 'Clean Energy', connections: ['n1', 'n7', 'n11'], detail: 'CEO — SunGrid Clean Energy' },
  
  { id: 'n6', label: 'Nexus Fintech', type: 'business', category: 'Fintech', connections: ['n2', 'n9'], detail: 'Cross-Border B2B Payment Gateway Stack' },
  { id: 'n7', label: 'SunGrid Energy', type: 'business', category: 'Clean Energy', connections: ['n5', 'n11'], detail: 'Commercial Rooftop Solar Infrastructure' },
  { id: 'n8', label: 'CyberPulse', type: 'business', category: 'Cybersecurity', connections: ['n4', 'n10'], detail: 'Zero-Trust Security & ISO Compliance' },
  
  { id: 'n9', label: '$150k Payment Gateway Deal', type: 'opportunity', category: 'Fintech', connections: ['n2', 'n6'], detail: 'Regional Merchant Payout Integration' },
  { id: 'n10', label: 'UK Tech M&A Advisory', type: 'opportunity', category: 'Consulting', connections: ['n3', 'n8'], detail: 'Acquisition Search for SaaS Founder' },
  { id: 'n11', label: '500kW Solar Installation', type: 'opportunity', category: 'Clean Energy', connections: ['n5', 'n7'], detail: 'Rooftop EPC Engineering Partnership' }
];

const NetworkGraphVisualizer = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [selectedNode, setSelectedNode] = useState(SAMPLE_NODES[0]);

  const filteredNodes = activeTab === 'All' 
    ? SAMPLE_NODES 
    : SAMPLE_NODES.filter(n => n.category === activeTab || n.type === 'person');

  const getNodeIcon = (type) => {
    switch (type) {
      case 'person': return <Users className="w-3.5 h-3.5 text-brand-cyan shrink-0" />;
      case 'business': return <Building className="w-3.5 h-3.5 text-brand-blue shrink-0" />;
      case 'opportunity': return <Briefcase className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
      default: return <Layers className="w-3.5 h-3.5 text-purple-400 shrink-0" />;
    }
  };

  const getNodeColor = (type, isSelected) => {
    if (isSelected) return 'border-brand-cyan bg-brand-cyan/20 text-white shadow-glow-cyan scale-[1.02]';
    switch (type) {
      case 'person': return 'border-cyan-500/40 bg-slate-900/90 text-slate-200 hover:border-brand-cyan';
      case 'business': return 'border-blue-500/40 bg-slate-900/90 text-slate-200 hover:border-brand-blue';
      case 'opportunity': return 'border-amber-500/40 bg-slate-900/90 text-slate-200 hover:border-amber-400';
      default: return 'border-purple-500/40 bg-slate-900/90 text-slate-200';
    }
  };

  return (
    <div className="glass-panel rounded-3xl p-4 sm:p-6 lg:p-8 border border-slate-700/80 shadow-card-dark">
      
      {/* Header & Category Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h3 className="text-lg sm:text-xl font-extrabold text-white flex items-center gap-2">
            <Network className="w-5 h-5 sm:w-6 sm:h-6 text-brand-cyan" /> Interactive Network Topology
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Visualizing real-time connections between Members → Businesses → Industries → Opportunities
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 max-w-full">
          {['All', 'Fintech', 'Clean Energy', 'Cybersecurity', 'Consulting'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                activeTab === cat
                  ? 'bg-brand-cyan text-navy-950 shadow-glow-cyan font-extrabold'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6 items-start">
        
        {/* Nodes Flow Layout (Left 2 cols) */}
        <div className="lg:col-span-2 relative min-h-[340px] bg-navy-950/70 rounded-2xl p-4 sm:p-6 border border-slate-800 network-bg-grid flex flex-col justify-between">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
            
            {/* Column 1: People Nodes */}
            <div className="space-y-2.5">
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-brand-cyan flex items-center gap-1 mb-1">
                <Users className="w-3.5 h-3.5" /> Professionals
              </span>
              {filteredNodes.filter(n => n.type === 'person').map((node) => (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className={`p-2.5 sm:p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all flex items-center justify-between gap-2 ${getNodeColor(node.type, selectedNode?.id === node.id)}`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {getNodeIcon(node.type)}
                    <span className="truncate">{node.label}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60 shrink-0" />
                </div>
              ))}
            </div>

            {/* Column 2: Business Nodes */}
            <div className="space-y-2.5">
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-brand-blue flex items-center gap-1 mb-1">
                <Building className="w-3.5 h-3.5" /> Entities
              </span>
              {filteredNodes.filter(n => n.type === 'business').map((node) => (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className={`p-2.5 sm:p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all flex items-center justify-between gap-2 ${getNodeColor(node.type, selectedNode?.id === node.id)}`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {getNodeIcon(node.type)}
                    <span className="truncate">{node.label}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60 shrink-0" />
                </div>
              ))}
            </div>

            {/* Column 3: Opportunity Nodes */}
            <div className="space-y-2.5">
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1 mb-1">
                <Briefcase className="w-3.5 h-3.5" /> Opportunities
              </span>
              {filteredNodes.filter(n => n.type === 'opportunity').map((node) => (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className={`p-2.5 sm:p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all flex items-center justify-between gap-2 ${getNodeColor(node.type, selectedNode?.id === node.id)}`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {getNodeIcon(node.type)}
                    <span className="truncate">{node.label}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60 shrink-0" />
                </div>
              ))}
            </div>

          </div>

          <div className="mt-6 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-400 gap-2">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse" />
              Click any node to inspect relationship data
            </span>
            <span className="font-mono text-brand-cyan">Active Topology Nodes: {filteredNodes.length}</span>
          </div>

        </div>

        {/* Selected Node Details Card (Right 1 col) */}
        {selectedNode && (
          <div className="glass-card rounded-2xl p-5 sm:p-6 border border-slate-700/80 space-y-4 animate-in fade-in w-full">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="px-2.5 py-1 rounded-full bg-brand-cyan/20 text-brand-cyan text-[10px] font-extrabold uppercase tracking-wider">
                Node Inspector
              </span>
              <span className="text-xs text-slate-400 font-mono">{selectedNode.id}</span>
            </div>

            <div>
              <h4 className="text-base sm:text-lg font-extrabold text-white">{selectedNode.label}</h4>
              <p className="text-xs text-brand-cyan mt-0.5">{selectedNode.category} Sector</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 leading-relaxed">
              {selectedNode.detail}
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> Relational Ties ({selectedNode.connections.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedNode.connections.map((connId) => {
                  const target = SAMPLE_NODES.find(n => n.id === connId);
                  return (
                    <span
                      key={connId}
                      onClick={() => target && setSelectedNode(target)}
                      className="px-2 py-1 rounded-lg bg-slate-800 text-[11px] text-slate-300 hover:text-brand-cyan cursor-pointer border border-slate-700 flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3 h-3 text-brand-cyan" /> {target?.label || connId}
                    </span>
                  );
                })}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default NetworkGraphVisualizer;
