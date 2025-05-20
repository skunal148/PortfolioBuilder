import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function TemplateSelection() {
  const navigate = useNavigate();
  const [selectedTemplateVisual, setSelectedTemplateVisual] = useState('');

  const templates = [
    { 
      id: 'style-1', 
      name: 'Minimalist Dark', 
      previewImage: '/images/template-1-preview.jpg', 
      description: 'A clean, modern, and dark-themed minimalist design.' 
    },
    { 
      id: 'style-2', 
      name: 'Creative Grid Light', 
      previewImage: '/images/template-2-preview.jpg', 
      description: 'A vibrant and creative grid-based layout, light theme.' 
    },
    {
      id: 'blank', 
      name: 'Blank Canvas',
      previewImage: '/images/template-blank-preview.png', 
      description: 'Start from scratch with a clean slate. Full control over your content and basic styles.'
    }
  ];

  const handleTemplateSelect = (templateId) => {
    if (templateId === 'blank') {
      console.log('[TemplateSelection] Navigating to create-blank-portfolio');
      navigate('/create-blank-portfolio'); 
    } else {
      // MODIFIED: Changed navigation path to match App.js for creating styled portfolios
      console.log('[TemplateSelection] Navigating to create-styled-portfolio with templateId:', templateId);
      navigate(`/create-styled-portfolio/${templateId}`); 
    }
  };

  const handleVisualSelect = (templateId) => {
    setSelectedTemplateVisual(templateId);
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <h2 className="text-4xl font-bold text-slate-100 mb-10 text-center">
        Choose Your Portfolio Template
      </h2>
      <p className="text-lg text-slate-300 mb-12 text-center max-w-2xl mx-auto">
        Select a template that best fits your style, or start with a blank canvas. You can customize details later.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {templates.map(template => (
          <div
            key={template.id}
            className={`
              bg-slate-800 rounded-xl shadow-2xl overflow-hidden 
              flex flex-col justify-between cursor-pointer
              transition-all duration-300 ease-in-out transform 
              hover:scale-[1.03] hover:shadow-emerald-500/40
              ${selectedTemplateVisual === template.id ? 'ring-4 ring-emerald-500 shadow-emerald-500/60 scale-[1.02]' : 'ring-2 ring-slate-700'}
            `}
            onClick={() => {
              handleVisualSelect(template.id);
            }}
          >
            <div>
              <img 
                src={template.previewImage ? `${process.env.PUBLIC_URL}${template.previewImage}` : `https://placehold.co/600x400/334155/94a3b8?text=${template.name.replace(/\s+/g, '+')}`} 
                alt={`${template.name} Preview`} 
                className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => { e.currentTarget.src = `https://placehold.co/600x400/475569/cbd5e1?text=Preview+Error`; }}
              />
              <div className="p-6">
                <h3 className="text-2xl font-semibold text-slate-100 mb-2 group-hover:text-emerald-400 transition-colors">
                  {template.name}
                </h3>
                <p className="text-sm text-slate-400 mb-4 min-h-[3rem]">
                  {template.description || 'A beautifully designed template to showcase your work.'}
                </p>
              </div>
            </div>
            <div className="p-6 pt-0">
              <button
                onClick={(e) => {
                  e.stopPropagation(); 
                  handleTemplateSelect(template.id);
                }}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-4 rounded-lg text-md shadow-md
                           transform transition-transform duration-150 hover:scale-105 
                           focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-opacity-75"
              >
                {template.id === 'blank' ? 'Start Blank' : 'Use This Template'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TemplateSelection;
