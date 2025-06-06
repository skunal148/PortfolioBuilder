// skunal148/portfoliobuilder/PortfolioBuilder-ad74f8854a7d0e220f440f62c535b153baf3850c/src/components/TemplateSelection.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from './firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

// Define your templates here
const templates = [
  {
    id: 'blank',
    name: 'Blank Canvas',
    previewImage: '/images/blank.jpg', // Ensure this image exists or use a placeholder
    description: 'Start from scratch with a clean slate. Full control over your content, styles, and layout, including custom sections.'
  },
  {
    id: 'style-coder-min',
    name: 'The Minimalist Coder',
    previewImage: '/images/template-1-preview.jpg', // Replace with your actual preview
    description: 'A clean, technical, and focused template with a fixed layout. Ideal for developers. Custom sections are available.'
  },
  {
    id: 'style-visual-heavy', // NEW TEMPLATE
    name: 'The Visual Storyteller',
    description: 'Image-centric, perfect for designers, photographers, and artists. Focus on high-quality visuals and creative project displays. Custom sections available.',
    previewImage: '/images/template-2-preview.jpg', // Replace with your actual preview for this
  },
  { // New Template Definition
    id: 'style-corp-sleek',
    name: 'The Modern Professional',
    previewImage: '/images/template-corp-preview.png', // Ensure this image exists
    description: 'Structured and clean, designed for consultants, freelancers, and business professionals. Highlights expertise, services, and credibility with clear calls to action.'
  },
  {
    id: 'style-bold-asymm',
    name: 'The Bold Innovator',
    previewImage: '/images/template-bold-asymm-preview.png', // CREATE THIS IMAGE
    description: 'Modern, dynamic, and asymmetrical. For those wanting a high-impact, less conventional design with potential for animations and unique visual presentation.'
  },

];

function TemplateSelection() {
  const navigate = useNavigate();
  const [selectedTemplateVisual, setSelectedTemplateVisual] = useState(templates[0]?.id || '');
  const [ setUserPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserPortfolios = async () => {
      if (auth.currentUser) {
        try {
          const q = query(collection(db, 'portfolios'), where('userId', '==', auth.currentUser.uid));
          const querySnapshot = await getDocs(q);
          setUserPortfolios(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
          console.error("Error fetching user portfolios: ", error);
        }
      }
      setLoading(false);
    };
    fetchUserPortfolios();
  }, [setUserPortfolios]);

  const handleTemplateSelect = (templateId) => {
    console.log("Attempting to navigate for templateId:", templateId); 


    if (templateId === 'blank') {
      navigate('/create-blank-portfolio');
    } else if (templateId === 'style-coder-min') {
      navigate(`/create-coder-portfolio/${templateId}`);
    } else if (templateId === 'style-visual-heavy') {
      navigate(`/create-visual-portfolio/${templateId}`);
    }else if (templateId === 'style-corp-sleek') {
      navigate(`/create-corp-portfolio/${templateId}`); 
    } else if (templateId === 'style-bold-asymm') { // New Case
      navigate(`/create-bold-asymm-portfolio/${templateId}`);
    } else {
      // Fallback for any other styled templates
      navigate(`/create-styled-portfolio/${templateId}`);
    }
  };

  const handleVisualSelect = (templateId) => {
    setSelectedTemplateVisual(templateId);
  };

/*   const handleEditPortfolio = (portfolio) => {
    if (!portfolio || !portfolio.id) {
      console.error("Invalid portfolio data for editing", portfolio);
      return;
    }
    
    if (portfolio.templateId === 'blank') {
      navigate(`/edit-blank/${portfolio.id}`);
    } else if (portfolio.templateId === 'style-coder-min') {
      navigate(`/edit-coder-portfolio/${portfolio.id}`);
    } else if (portfolio.templateId === 'style-visual-heavy') {
      navigate(`/edit-visual-portfolio/${portfolio.id}`);
    }else if (portfolio.templateId === 'style-corp-sleek') { // New Case for Modern Professional
      navigate(`/edit-corp-portfolio/${portfolio.id}`); 
    } else if (portfolio.templateId === 'style-bold-asymm') { // New Case
      navigate(`/edit-bold-asymm-portfolio/${portfolio.id}`);
    } else {
      // Fallback for any other styled templates or older ones
      navigate(`/edit-styled/${portfolio.id}`); 
    }
  }; */


  if (loading && !auth.currentUser) {
      return <div className="flex justify-center items-center min-h-screen bg-slate-900 text-slate-100 text-xl">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-slate-100 p-4 md:p-8 transition-colors duration-300">
      <div className="container mx-auto py-10 px-4">
        <h2 className="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-10 text-center">
          Choose Your Portfolio Template
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-300 mb-12 text-center max-w-2xl mx-auto">
          Select a template that best fits your style. "Blank Canvas" offers full customization. Styled templates provide a head start with specific aesthetics.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {templates.map(template => (
            <div
              key={template.id}
              className={`
                bg-white dark:bg-slate-800 rounded-xl shadow-2xl overflow-hidden 
                flex flex-col justify-between cursor-pointer
                transition-all duration-300 ease-in-out transform 
                hover:scale-[1.03] hover:shadow-emerald-400/40 dark:hover:shadow-emerald-500/40
                ${selectedTemplateVisual === template.id ? 'ring-4 ring-emerald-500 dark:ring-emerald-400 shadow-emerald-500/60 dark:shadow-emerald-400/60 scale-[1.02]' : 'ring-2 ring-slate-300 dark:ring-slate-700'}
              `}
              onClick={() => {
                handleVisualSelect(template.id);
              }}
            >
              <div>
                <img 
                  src={template.previewImage.startsWith('https') ? template.previewImage : `${process.env.PUBLIC_URL}${template.previewImage}`} 
                  alt={`${template.name} Preview`} 
                  className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => { e.currentTarget.src = `https://placehold.co/600x400/475569/cbd5e1?text=Preview+Error`; }}
                />
                <div className="p-6">
                  <h3 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-2 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">
                    {template.name}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 min-h-[6rem]">
                    {template.description}
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

{/*         {userPortfolios.length > 0 && !loading && (
          <div className="mt-16">
            <h2 className="text-3xl font-semibold text-center text-slate-800 dark:text-slate-200 mb-8">
              Or continue editing one of your existing portfolios:
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userPortfolios.map(portfolio => (
                <div key={portfolio.id} className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                  <h3 className="text-xl font-semibold text-emerald-600 dark:text-emerald-400 mb-2">{portfolio.name || "Untitled Portfolio"}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Template: {portfolio.templateId || 'N/A'}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                    Last updated: {portfolio.lastUpdated ? new Date(portfolio.lastUpdated.seconds * 1000).toLocaleDateString() : 'N/A'}
                  </p>
                  <button
                    onClick={() => handleEditPortfolio(portfolio)}
                    className="w-full bg-sky-500 hover:bg-sky-600 text-white font-medium py-2 px-4 rounded-md text-sm transition duration-150 ease-in-out"
                  >
                    Edit
                  </button>
                </div>
              ))}
            </div>
          </div>
        )} */}
      </div>
    </div>
  );
}

export default TemplateSelection;