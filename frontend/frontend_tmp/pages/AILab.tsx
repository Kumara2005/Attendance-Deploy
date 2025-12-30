import React, { useState } from 'react';
import { Sparkles, Image as ImageIcon, Video, Wand2, Download, Play, Loader2, Upload } from 'lucide-react';
import { editImage, generateVeoVideo } from '../geminiService';

const AILab: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'edit' | 'animate'>('edit');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleProcess = async () => {
    if (!selectedImage || !prompt) return;
    setLoading(true);
    setEditedImage(null);
    setGeneratedVideo(null);

    try {
      if (mode === 'edit') {
        const result = await editImage(selectedImage, prompt);
        setEditedImage(result);
      } else {
        const result = await generateVeoVideo(selectedImage, prompt);
        setGeneratedVideo(result);
      }
    } catch (err) {
      alert("AI processing failed. Please check your prompt and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20 max-w-[1500px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h1 className="text-7xl font-black text-slate-900 tracking-tighter flex items-center gap-6 leading-none">
            <div className="w-16 h-16 bg-indigo-600 rounded-[2rem] flex items-center justify-center shadow-xl shadow-indigo-600/20">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            AI Creative <br/>Workshop
          </h1>
          <p className="text-slate-500 font-medium text-xl mt-6">Transforming institutional assets with generative intelligence.</p>
        </div>
        <div className="flex bg-white p-2.5 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <button 
            onClick={() => setMode('edit')}
            className={`px-10 py-4 rounded-[1.8rem] text-xs font-black uppercase tracking-[0.2em] transition-all ${mode === 'edit' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 scale-105' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'}`}
          >
            Magic Edit
          </button>
          <button 
            onClick={() => setMode('animate')}
            className={`px-10 py-4 rounded-[1.8rem] text-xs font-black uppercase tracking-[0.2em] transition-all ${mode === 'animate' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 scale-105' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'}`}
          >
            Veo Animator
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Panel: Input */}
        <div className="space-y-10">
          <div className="bg-white p-12 rounded-[4rem] border border-slate-100 card-shadow">
            <h3 className="font-black text-slate-900 mb-10 flex items-center gap-4 text-2xl tracking-tighter">
              <Upload className="w-8 h-8 text-indigo-500" /> 1. Source Asset
            </h3>
            
            <label className="block w-full h-[400px] border-2 border-dashed border-slate-100 rounded-[3.5rem] hover:border-indigo-300 hover:bg-indigo-50/20 transition-all cursor-pointer overflow-hidden relative group">
              {selectedImage ? (
                <img src={selectedImage} alt="Source" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-300">
                  <ImageIcon className="w-20 h-20 mb-6 group-hover:scale-110 group-hover:text-indigo-400 transition-all" />
                  <p className="font-black text-lg tracking-tight text-slate-400">Drop institutional photo</p>
                  <p className="text-[10px] mt-2 uppercase tracking-[0.3em] font-black opacity-60">High-Res PNG / JPEG</p>
                </div>
              )}
              <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
            </label>
          </div>

          <div className="bg-slate-50 p-12 rounded-[4rem] border border-slate-100 shadow-sm relative overflow-hidden group">
            <h3 className="font-black text-slate-900 mb-8 flex items-center gap-4 text-2xl tracking-tighter">
              <Wand2 className="w-8 h-8 text-indigo-500" /> 2. Intelligence Prompt
            </h3>
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={mode === 'edit' ? "e.g., 'Enhance the lighting and add a modern glass atrium to the building'..." : "e.g., 'A professional cinematic drone shot moving towards the campus entrance'..."}
              className="w-full h-48 bg-white border border-slate-200 rounded-[2.5rem] p-8 text-lg font-medium text-slate-700 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300 resize-none shadow-inner"
            />
            <button 
              onClick={handleProcess}
              disabled={loading || !selectedImage || !prompt}
              className="w-full mt-10 py-6 bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed rounded-[2.5rem] font-black text-xs uppercase tracking-[0.3em] text-white shadow-2xl transition-all flex items-center justify-center gap-4 active:scale-95 group"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                  Execute Generation
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Panel: Output */}
        <div className="bg-white rounded-[4rem] border border-slate-100 card-shadow p-12 flex flex-col">
          <div className="flex items-center justify-between mb-10">
            <h3 className="font-black text-slate-900 text-3xl tracking-tighter leading-none">Neural Output</h3>
            <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">Verified AI</span>
          </div>
          
          <div className="flex-1 bg-slate-50 border border-slate-100 rounded-[3.5rem] overflow-hidden relative flex items-center justify-center min-h-[500px]">
            {loading && (
              <div className="absolute inset-0 z-20 bg-white/90 backdrop-blur-md flex flex-col items-center justify-center text-center p-12">
                <Loader2 className="w-20 h-20 text-indigo-600 animate-spin mb-8" />
                <h4 className="font-black text-slate-900 text-3xl tracking-tighter">Gemini is Thinking...</h4>
                <p className="text-lg text-slate-500 mt-4 max-w-sm leading-relaxed font-medium">
                  {mode === 'animate' 
                    ? "Compiling high-resolution temporal frames with Veo. This process is complex."
                    : "Analyzing deep semantic layers and applying pixels. High-fidelity rendering active."}
                </p>
              </div>
            )}

            {editedImage && (
              <div className="w-full h-full flex flex-col items-center justify-center p-8">
                <img src={editedImage} alt="Result" className="max-h-full rounded-[3rem] shadow-2xl transition-all duration-1000 animate-in zoom-in-95" />
                <button 
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = editedImage;
                    link.download = 'attendx-ai-asset.png';
                    link.click();
                  }}
                  className="mt-10 flex items-center gap-4 px-12 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-slate-800 transition-all"
                >
                  <Download className="w-5 h-5" /> Archive Masterpiece
                </button>
              </div>
            )}

            {generatedVideo && (
              <div className="w-full h-full flex flex-col items-center justify-center p-8">
                <video controls className="max-h-full rounded-[3rem] shadow-2xl">
                  <source src={generatedVideo} type="video/mp4" />
                </video>
                <div className="mt-10 flex gap-6">
                  <button className="flex items-center gap-4 px-12 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-slate-800 transition-all">
                    <Download className="w-5 h-5" /> Download MP4
                  </button>
                  <button className="flex items-center gap-4 px-12 py-5 bg-indigo-50 text-indigo-600 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] border border-indigo-100 hover:bg-indigo-100 transition-all">
                    <Play className="w-5 h-5" /> Replay Session
                  </button>
                </div>
              </div>
            )}

            {!loading && !editedImage && !generatedVideo && (
              <div className="text-center p-20 text-slate-300">
                <div className="w-32 h-32 bg-white rounded-[3rem] border border-slate-100 flex items-center justify-center mx-auto mb-10 shadow-sm">
                   {mode === 'edit' ? <ImageIcon className="w-12 h-12 opacity-30" /> : <Video className="w-12 h-12 opacity-30" />}
                </div>
                <p className="font-black text-xl text-slate-400 tracking-tight">Awaiting Neural Prompt</p>
                <p className="text-sm mt-2 font-bold uppercase tracking-widest opacity-60">Output will manifest here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AILab;