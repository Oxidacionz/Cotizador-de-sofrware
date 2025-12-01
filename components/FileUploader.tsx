import React from 'react';
import { UploadedFile } from '../types';

interface FileUploaderProps {
  onFilesSelected: (files: UploadedFile[]) => void;
  files: UploadedFile[];
  onRemove: (index: number) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFilesSelected, files, onRemove }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const newFiles: UploadedFile[] = [];
      const fileList = Array.from(event.target.files) as File[];
      
      let processedCount = 0;

      fileList.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newFiles.push({
            name: file.name,
            type: file.type || 'application/json', // Fallback for JSON sometimes missing type in older browsers
            data: reader.result as string
          });
          processedCount++;
          if (processedCount === fileList.length) {
            onFilesSelected(newFiles);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const isImage = (type: string, name: string) => {
    return type.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(name);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center w-full">
        <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 dark:border-slate-600 border-dashed rounded-xl cursor-pointer bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg className="w-8 h-8 mb-4 text-slate-400 dark:text-slate-500 group-hover:text-brand-500 dark:group-hover:text-brand-400 transition-colors" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
            </svg>
            <p className="mb-2 text-sm text-slate-500 dark:text-slate-400"><span className="font-semibold text-brand-600 dark:text-brand-400">Click para subir</span></p>
            <p className="text-xs text-slate-400 dark:text-slate-500">Imágenes (PNG, JPG) o Flujos (JSON)</p>
          </div>
          <input 
            id="dropzone-file" 
            type="file" 
            className="hidden" 
            multiple 
            accept="image/*,.json,application/json" 
            onChange={handleFileChange} 
          />
        </label>
      </div>

      {files.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {files.map((file, index) => (
            <div key={index} className="relative group">
              {isImage(file.type, file.name) ? (
                <img src={file.data} alt={file.name} className="h-24 w-full object-cover rounded-xl border border-slate-200 dark:border-slate-700" />
              ) : (
                <div className="h-24 w-full flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600">
                   <svg className="w-8 h-8 text-slate-400 dark:text-slate-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                   <span className="text-[10px] uppercase font-bold text-slate-500">JSON / CODE</span>
                </div>
              )}
              
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                <button
                    onClick={() => onRemove(index)}
                    className="bg-red-500 text-white rounded-full p-1.5 shadow-md hover:bg-red-600 transition-colors"
                    type="button"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate px-1">{file.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUploader;