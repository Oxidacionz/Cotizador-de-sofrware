
import React, { useState } from 'react';
import { ProjectInput, QuoteResponse, UploadedFile } from './types';
import FileUploader from './components/FileUploader';
import { CostChart } from './components/CostChart';
import { generateQuote } from './services/geminiService';

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(true);
  
  // Theme state
  const [darkMode, setDarkMode] = useState(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return true;
    }
    return false;
  });

  const [files, setFiles] = useState<UploadedFile[]>([]);
  
  const [input, setInput] = useState<ProjectInput>({
    projectName: '',
    projectType: 'Web App / SaaS',
    description: '',
    teamSize: 2,
    hourlyRate: 35,
    serverCost: 50,
    hoursPerDay: 6, 
    estimatedWeeks: 8,
    targetCost: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInput(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFilesSelected = (newFiles: UploadedFile[]) => {
    setFiles(prev => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setQuote(null);

    try {
      const result = await generateQuote(input, files);
      setQuote(result);
      setIsEditing(false); // Hide the form after success
    } catch (err: any) {
      setError(err.message || "Error generando la cotización. Verifica tu API Key o intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById('quote-content');
    if (!element) return;

    const opt = {
      margin: [10, 10, 10, 10], // top, left, bottom, right
      filename: `cotizacion-${input.projectName.replace(/\s+/g, '-').toLowerCase()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Use specific class to force light mode styles for PDF if needed, 
    // or just rely on current view. HTML2PDF captures what is seen.
    // If user is in dark mode, PDF will be dark.
    if (window.html2pdf) {
      window.html2pdf().set(opt).from(element).save();
    } else {
      alert("La librería PDF no se ha cargado correctamente.");
    }
  };

  return (
    <div className={`${darkMode ? 'dark' : ''}`}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-300 pb-20 font-sans">
        
        {/* Header */}
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-brand-500 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-brand-500/20">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-indigo-600 dark:from-brand-400 dark:to-indigo-400">
                  Cotizador de Software
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide">
                  SMART BYTES
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                aria-label="Toggle Dark Mode"
              >
                {darkMode ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
                )}
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Form (Visible if Editing, Hidden or Minimized if Quote exists) */}
            <div className={`${!isEditing && quote ? 'hidden lg:block lg:col-span-3' : 'lg:col-span-5'} space-y-6 transition-all duration-500`}>
              
              {!isEditing && quote ? (
                 <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 text-center animate-fade-in">
                    <div className="w-16 h-16 bg-brand-100 dark:bg-brand-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white mb-2">¿Necesitas actualizar la cotización?</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Puedes modificar la descripción o subir nuevos diagramas para recalcular.</p>
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="w-full py-3 px-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold rounded-xl transition-colors"
                    >
                      Modificar Datos
                    </button>
                 </div>
              ) : (
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 p-6 transition-colors duration-300 animate-fade-in">
                  <h2 className="text-lg font-bold mb-6 text-slate-800 dark:text-white flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/50 text-brand-600 dark:text-brand-300 text-sm font-bold border border-brand-200 dark:border-brand-700/50">1</span>
                    {quote ? "Actualizar Detalles" : "Detalles del Proyecto"}
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Nombre del Proyecto</label>
                      <input required name="projectName" value={input.projectName} onChange={handleInputChange} type="text" className="w-full rounded-xl border-slate-200 dark:border-slate-600 border bg-white dark:bg-slate-900/50 p-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all placeholder-slate-400" placeholder="Ej: E-commerce de Zapatos" />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Tipo de Proyecto</label>
                      <select name="projectType" value={input.projectType} onChange={handleInputChange} className="w-full rounded-xl border-slate-200 dark:border-slate-600 border bg-white dark:bg-slate-900/50 p-3 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500">
                        <option>Web App / SaaS</option>
                        <option>Sitio Web Corporativo</option>
                        <option>App Móvil (iOS/Android)</option>
                        <option>E-commerce / Tienda</option>
                        <option>API / Backend System</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Descripción y Requerimientos</label>
                      <textarea required name="description" value={input.description} onChange={handleInputChange} rows={4} className="w-full rounded-xl border-slate-200 dark:border-slate-600 border bg-white dark:bg-slate-900/50 p-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none placeholder-slate-400" placeholder="Describe las funcionalidades clave, usuarios, integraciones..."></textarea>
                    </div>

                    <div className="pt-6 border-t border-slate-100 dark:border-slate-700">
                      <h2 className="text-lg font-bold mb-4 text-slate-800 dark:text-white flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/50 text-brand-600 dark:text-brand-300 text-sm font-bold border border-brand-200 dark:border-brand-700/50">2</span>
                        Recursos y Costos Base
                      </h2>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Equipo</label>
                          <input required name="teamSize" type="number" min="1" value={input.teamSize} onChange={handleInputChange} className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900/50 p-2.5 text-sm dark:text-white focus:ring-2 focus:ring-brand-500 outline-none" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Rate ($/h)</label>
                          <input required name="hourlyRate" type="number" min="10" value={input.hourlyRate} onChange={handleInputChange} className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900/50 p-2.5 text-sm dark:text-white focus:ring-2 focus:ring-brand-500 outline-none" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Horas/Día</label>
                          <input required name="hoursPerDay" type="number" min="1" max="12" value={input.hoursPerDay} onChange={handleInputChange} className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900/50 p-2.5 text-sm dark:text-white focus:ring-2 focus:ring-brand-500 outline-none" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Semanas</label>
                          <input required name="estimatedWeeks" type="number" min="1" value={input.estimatedWeeks} onChange={handleInputChange} className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900/50 p-2.5 text-sm dark:text-white focus:ring-2 focus:ring-brand-500 outline-none" />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Infraestructura Mensual</label>
                            <div className="relative">
                              <span className="absolute left-3 top-2.5 text-slate-400">$</span>
                              <input required name="serverCost" type="number" min="0" value={input.serverCost} onChange={handleInputChange} className="w-full pl-7 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900/50 p-2.5 text-sm dark:text-white focus:ring-2 focus:ring-brand-500 outline-none" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-brand-600 dark:text-brand-400 mb-1.5 uppercase tracking-wider">Costo Objetivo (Opcional)</label>
                            <div className="relative">
                              <span className="absolute left-3 top-2.5 text-slate-400">$</span>
                              <input 
                                name="targetCost" 
                                type="number" 
                                min="0" 
                                value={input.targetCost} 
                                onChange={handleInputChange} 
                                placeholder="Manual"
                                className="w-full pl-7 rounded-xl border border-brand-200 dark:border-brand-800 bg-brand-50/50 dark:bg-brand-900/20 p-2.5 text-sm dark:text-white focus:ring-2 focus:ring-brand-500 outline-none" 
                              />
                            </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 dark:border-slate-700">
                      <h2 className="text-lg font-bold mb-4 text-slate-800 dark:text-white flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/50 text-brand-600 dark:text-brand-300 text-sm font-bold border border-brand-200 dark:border-brand-700/50">3</span>
                        Diagramas y Capturas
                      </h2>
                      <FileUploader files={files} onFilesSelected={handleFilesSelected} onRemove={handleRemoveFile} />
                    </div>

                    <button 
                      type="submit" 
                      disabled={loading}
                      className={`w-full py-4 px-6 rounded-xl text-white font-bold text-lg shadow-lg shadow-brand-500/30 transition-all ${
                        loading 
                          ? 'bg-slate-400 dark:bg-slate-600 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 hover:shadow-xl hover:-translate-y-0.5'
                      }`}
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-3">
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Analizando Proyecto...
                        </span>
                      ) : (quote ? "Recalcular Cotización" : "Generar Cotización Smart Bytes")}
                    </button>
                    {quote && (
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="w-full py-3 px-6 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        Cancelar
                      </button>
                    )}
                  </form>
                </div>
              )}
            </div>

            {/* Right Column: Results */}
            <div className={`${!isEditing && quote ? 'lg:col-span-9' : 'lg:col-span-7'} transition-all duration-500`}>
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 p-4 rounded-xl border border-red-100 dark:border-red-800 mb-6 flex items-start gap-3 animate-fade-in">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  <p>{error}</p>
                </div>
              )}

              {!quote && !loading && !error && (
                 <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 p-12 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-white/50 dark:bg-slate-800/30">
                    <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                      <svg className="w-10 h-10 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    </div>
                    <p className="text-xl font-semibold text-slate-600 dark:text-slate-300">Listo para cotizar</p>
                    <p className="text-sm mt-2 text-center max-w-xs">Completa el formulario y sube tus diagramas (Imágenes o JSON) para obtener un análisis de Smart Bytes.</p>
                 </div>
              )}

              {loading && (
                 <div className="h-full min-h-[500px] flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <div className="w-full max-w-md space-y-6">
                       <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded animate-pulse w-3/4 mx-auto"></div>
                       <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded animate-pulse w-1/2 mx-auto"></div>
                       <div className="h-64 bg-slate-50 dark:bg-slate-700/50 rounded-lg animate-pulse mt-8"></div>
                       <div className="grid grid-cols-3 gap-4 mt-6">
                          <div className="h-20 bg-slate-100 dark:bg-slate-700 rounded animate-pulse"></div>
                          <div className="h-20 bg-slate-100 dark:bg-slate-700 rounded animate-pulse"></div>
                          <div className="h-20 bg-slate-100 dark:bg-slate-700 rounded animate-pulse"></div>
                       </div>
                    </div>
                    <p className="mt-8 text-brand-600 dark:text-brand-400 font-medium animate-pulse">Smart Bytes AI está analizando...</p>
                 </div>
              )}

              {quote && (
                <div className="space-y-6 animate-fade-in">
                  
                  {/* Action Bar */}
                  <div className="flex justify-end">
                    <button
                      onClick={handleDownloadPDF}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-800 dark:bg-slate-700 text-white rounded-lg hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors shadow-lg"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                      Descargar PDF
                    </button>
                  </div>

                  {/* Printable Area */}
                  <div id="quote-content" className="space-y-6">
                    {/* Header Summary */}
                    <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-500 to-indigo-500"></div>
                      <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
                        <div>
                          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{quote.projectTitle}</h2>
                          <div className="flex gap-2 mt-3">
                             <span className="inline-block px-3 py-1 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 rounded-full text-xs font-bold uppercase tracking-wide border border-brand-200 dark:border-brand-800">
                              Cotización Oficial
                            </span>
                             <span className="inline-block px-3 py-1 bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 rounded-full text-xs font-bold uppercase tracking-wide border border-slate-200 dark:border-slate-600">
                              Smart Bytes
                            </span>
                          </div>
                        </div>
                        <div className="text-left sm:text-right bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700 min-w-[150px]">
                          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Inversión Total</p>
                          <p className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">${quote.totalEstimatedCost.toLocaleString()}</p>
                        </div>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/50 p-5 rounded-xl border border-slate-100 dark:border-slate-700/50">
                        {quote.executiveSummary}
                      </p>
                    </div>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
                        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Costo MVP</p>
                        <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">${quote.mvpCost.toLocaleString()}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">Versión inicial funcional</p>
                      </div>
                      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
                        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Infraestructura Crítica</p>
                        <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">${quote.infrastructureCriticalCost.toLocaleString()}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">Servidores / Licencias iniciales</p>
                      </div>
                      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
                        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Tiempo Mercado</p>
                        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{Math.round(quote.marketComparison.averageDays / 7)} Semanas</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">~{quote.marketComparison.averageDays} días hábiles</p>
                      </div>
                    </div>

                    {/* Charts */}
                    {/* We pass a specific ID for these if we wanted to manipulate them for PDF, but standard render is fine */}
                    <CostChart 
                      breakdown={quote.breakdown} 
                      totalCost={quote.totalEstimatedCost} 
                      marketComparison={quote.marketComparison}
                      darkMode={darkMode}
                    />

                    {/* Detailed Breakdown Table */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden break-inside-avoid">
                      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                        <h3 className="font-bold text-slate-800 dark:text-white">Desglose Detallado</h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                          <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-900/50">
                            <tr>
                              <th className="px-6 py-3">Categoría</th>
                              <th className="px-6 py-3">Descripción</th>
                              <th className="px-6 py-3 text-right">Costo Estimado</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {quote.breakdown.map((item, idx) => (
                              <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200">{item.category}</td>
                                <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{item.description}</td>
                                <td className="px-6 py-4 text-right font-mono text-slate-700 dark:text-slate-300 font-medium">${item.cost.toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Recommendations */}
                    <div className="bg-gradient-to-br from-brand-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800 p-6 rounded-2xl border border-brand-100 dark:border-slate-700 shadow-sm break-inside-avoid">
                      <h3 className="font-bold text-brand-900 dark:text-brand-300 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        Recomendaciones Técnicas
                      </h3>
                      <ul className="space-y-3">
                        {quote.technicalRecommendations.map((rec, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-slate-700 dark:text-slate-300 text-sm">
                            <span className="mt-1.5 w-1.5 h-1.5 bg-brand-500 rounded-full flex-shrink-0"></span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Email Draft - Only visible on screen, usually valid to include in PDF too */}
                    <div className="bg-slate-900 dark:bg-black p-6 rounded-2xl shadow-lg border border-slate-800 break-inside-avoid">
                      <h3 className="font-bold mb-4 text-slate-300 flex justify-between items-center">
                        Borrador de Correo para Cliente
                        <button 
                          onClick={() => navigator.clipboard.writeText(quote.clientEmailDraft)}
                          className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg transition-colors border border-slate-600"
                        >
                          Copiar Texto
                        </button>
                      </h3>
                      <div className="bg-slate-950 p-5 rounded-xl font-mono text-xs md:text-sm whitespace-pre-wrap text-slate-400 leading-relaxed border border-slate-800/50">
                        {quote.clientEmailDraft}
                      </div>
                    </div>
                  </div>

                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;