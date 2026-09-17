'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BrainCircuit, 
  Sparkles, 
  Zap, 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  Terminal, 
  Sliders, 
  ArrowUpRight,
  Search,
  CheckCircle2,
  Cpu,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const AI_MODELS = [
  { id: 'alpha-v4', name: 'LLM Quant-Alpha v4.2', accuracy: '94.8%', latency: '1.2ms', status: 'ACTIVE' },
  { id: 'lstm-anomaly', name: 'Deep-LSTM Anomaly Engine', accuracy: '91.3%', latency: '2.4ms', status: 'ACTIVE' },
  { id: 'garch-vol', name: 'GARCH Volatility Surface', accuracy: '89.6%', latency: '0.8ms', status: 'READY' },
];

const ANOMALIES = [
  { ticker: 'NVDA', type: 'LIQUIDITY SWEEP', confidence: 96, impact: 'HIGH', direction: 'BULLISH', details: 'Institutional block order detected at $878.50 with dark pool volume spike +240%.' },
  { ticker: 'TSLA', type: 'GAMMA SQUEEZE', confidence: 88, impact: 'HIGH', direction: 'BEARISH', details: 'Unusual OTM put purchasing concentration across weekly expiration chains.' },
  { ticker: 'AAPL', type: 'MEAN REVERSION', confidence: 82, impact: 'MED', direction: 'BULLISH', details: 'Intraday RSI divergence confirmed on 15m timeframe near 200 EMA support.' },
  { ticker: 'MSFT', type: 'SENTIMENT PIVOT', confidence: 91, impact: 'MED', direction: 'BULLISH', details: 'LLM news extraction detected positive enterprise AI contract catalysts.' },
];

export default function AIAnalysisPage() {
  const [selectedModel, setSelectedModel] = useState('alpha-v4');
  const [userPrompt, setUserPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  const handleRunAnalysis = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userPrompt.trim()) return;

    setIsGenerating(true);
    toast.info('Querying Neural Quant Nodes...');

    setTimeout(() => {
      setIsGenerating(false);
      setAiResponse(`[QUANT MODEL ANALYSIS - ${selectedModel.toUpperCase()}]\nTarget Query: "${userPrompt}"\n\n- Technical Confluence: Bullish break above 50-day SMA ($184.20) with heavy volume confirmation.\n- Sentiment Score: 8.4/10 (Positive news velocity across institutional wires).\n- Expected Volatility (1W): ±2.45%\n- Strategic Action Recommendation: ACCUMULATE on dip toward $182.10 support level.`);
      toast.success('AI Model response generated.');
    }, 1200);
  };

  return (
    <div className="space-y-6 font-sans max-w-[1400px] mx-auto pb-12 select-none">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/70 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5 font-sans">
            <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/30 shadow-[0_0_12px_rgba(59,130,246,0.2)]">
              <BrainCircuit className="w-6 h-6 text-blue-400 animate-pulse" />
            </div>
            AI Quantitative Intelligence Center
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/30">
              NEURAL MATRIX
            </span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1 font-sans">
            Predictive machine learning models, LLM sentiment summaries, and real-time market anomaly detectors.
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card border border-border text-xs text-muted-foreground">
            <Cpu className="w-4 h-4 text-amber-400" />
            <span>Node Load:</span>
            <span className="text-emerald-400 font-bold">14.2%</span>
          </div>
        </div>
      </div>

      {/* KPI Models Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {AI_MODELS.map((model) => (
          <Card 
            key={model.id}
            onClick={() => setSelectedModel(model.id)}
            className={`cursor-pointer transition-all border ${
              selectedModel === model.id 
                ? 'bg-card border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.15)]' 
                : 'bg-card/70 border-border/70 hover:border-border'
            }`}
          >
            <CardContent className="p-4 flex items-center justify-between font-mono">
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{model.status}</span>
                <h3 className="text-sm font-bold text-foreground">{model.name}</h3>
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span>Accuracy: <span className="text-emerald-400 font-bold">{model.accuracy}</span></span>
                  <span>Latency: <span className="text-foreground font-bold">{model.latency}</span></span>
                </div>
              </div>
              <div className={`w-3 h-3 rounded-full ${selectedModel === model.id ? 'bg-amber-400 shadow-[0_0_8px_#F59E0B]' : 'bg-muted/40'}`} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main split: AI Interactive Assistant & Real-Time Anomaly Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* AI Prompt Assistant Terminal (Col 7) */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="bg-card border-border/80 shadow-xl overflow-hidden">
            <CardHeader className="p-4 border-b border-border/60 bg-secondary/30 flex flex-row items-center justify-between font-mono">
              <CardTitle className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <Terminal className="w-4 h-4 text-amber-400" />
                Quant Neural Prompt Console
              </CardTitle>
              <span className="text-[10px] text-muted-foreground">Model: {selectedModel}</span>
            </CardHeader>
            <CardContent className="p-5 space-y-4 font-mono">
              <form onSubmit={handleRunAnalysis} className="space-y-3">
                <div className="relative">
                  <textarea
                    rows={3}
                    placeholder="Ask AI for stock forecast, risk assessment, or momentum model... (e.g. 'Analyze NVDA breakout probability next 5 trading days')"
                    value={userPrompt}
                    onChange={(e) => setUserPrompt(e.target.value)}
                    className="w-full rounded-xl bg-background/80 p-3 text-xs text-foreground border border-border/80 outline-none focus:border-amber-500/50 resize-none font-sans"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Real-time Market Memory Loaded</span>
                  </div>
                  <button
                    type="submit"
                    disabled={isGenerating || !userPrompt.trim()}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer border border-amber-400/40 disabled:opacity-50"
                  >
                    {isGenerating ? 'ANALYZING...' : 'RUN QUANT QUERY'}
                  </button>
                </div>
              </form>

              {aiResponse && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-secondary/40 border border-amber-500/30 text-xs text-foreground space-y-2 whitespace-pre-wrap font-mono leading-relaxed"
                >
                  {aiResponse}
                </motion.div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Real-Time Market Anomaly Stream (Col 5) */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="bg-card border-border/80 shadow-xl overflow-hidden">
            <CardHeader className="p-4 border-b border-border/60 bg-secondary/30 flex flex-row items-center justify-between font-mono">
              <CardTitle className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                Live Anomaly Telemetry
              </CardTitle>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/20">STREAMING</span>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {ANOMALIES.map((item, idx) => (
                <div 
                  key={idx} 
                  className="p-3 rounded-xl bg-secondary/20 border border-border/60 hover:border-amber-500/30 transition-all space-y-1.5 font-mono"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-foreground">{item.ticker}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
                        {item.type}
                      </span>
                    </div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                      item.direction === 'BULLISH' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
                    }`}>
                      {item.direction}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground font-sans leading-relaxed">
                    {item.details}
                  </p>
                  <div className="flex justify-between items-center text-[10px] text-muted-foreground pt-1 border-t border-border/30">
                    <span>Confidence: <span className="text-foreground font-bold">{item.confidence}%</span></span>
                    <span>Impact: <span className="text-amber-400 font-bold">{item.impact}</span></span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
