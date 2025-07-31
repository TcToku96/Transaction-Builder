import React from 'react';
export default function StepWrapper({title,children}:{title:string,children:React.ReactNode}){
  return <section className="mb-8 bg-white rounded-2xl p-6 shadow">
    <h2 className="text-xl font-semibold mb-4">{title}</h2>{children}
  </section>;
}
