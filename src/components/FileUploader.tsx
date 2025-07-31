import React,{useRef} from 'react';
export default function FileUploader({label,onFile}:{label:string,onFile:(f:File)=>void}){
  const ref = useRef<HTMLInputElement>(null);
  return <div className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-blue-500" onClick={()=>ref.current?.click()}>
    <p className="text-gray-600 text-center px-4">{label}</p>
    <input type="file" accept=".csv,text/csv" ref={ref} className="hidden" onChange={e=>{const f=e.target.files?.[0];if(f)onFile(f);}}/>
  </div>;
}
