import React from 'react';
import NetworkGraphVisualizer from '../components/NetworkGraphVisualizer';
import { Network, Zap, ShieldCheck } from 'lucide-react';

const NetworkVisualization = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan text-xs font-bold mb-3">
            <Network className="w-4 h-4" /> Real-Time Network Engine
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            Union Suyradev <span className="gradient-text-cyan">Connection Graph</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Explore live interconnected nodes representing members, corporate entities, sector categories, and active business opportunity contracts.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-300 glass-panel p-3 rounded-2xl border border-slate-700">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-cyan animate-pulse" /> Active Node Mesh
          </span>
          <span className="text-slate-500">|</span>
          <span className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-400" /> 100% Parameterized
          </span>
        </div>
      </div>

      <NetworkGraphVisualizer />
    </div>
  );
};

export default NetworkVisualization;
