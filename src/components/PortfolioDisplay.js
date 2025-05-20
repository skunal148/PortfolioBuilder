import React from 'react';
// Ensure this path is correct based on your file structure
import { 
    ReactIcon, 
    JavaScriptIcon, 
    PythonIcon, 
    HtmlIcon, 
    CssIcon, 
    GenericSkillIcon, 
    JavaIcon,
    NodeIcon
} from './icons/SkillIcons'; 

// Social Icons
const LinkedInIcon = ({ fill = "#FFFFFF" }) => ( 
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={fill} className="transition-opacity hover:opacity-75">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
  </svg>
);
const GitHubIcon = ({ fill = "#FFFFFF" }) => ( 
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={fill} className="transition-opacity hover:opacity-75">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

const SkillDisplay = ({ skillName, fallbackTextColor, displayStyle }) => { 
  const normalizedSkillName = skillName && typeof skillName === 'string' ? skillName.toLowerCase().trim() : '';
  let iconComponent;
  switch (normalizedSkillName) {
    case 'react': case 'react.js': iconComponent = <ReactIcon fill={fallbackTextColor} />; break;
    case 'javascript': case 'js': iconComponent = <JavaScriptIcon fill={fallbackTextColor} />; break;
    case 'python': iconComponent = <PythonIcon fill={fallbackTextColor} />; break;
    case 'html': case 'html5': iconComponent = <HtmlIcon fill={fallbackTextColor} />; break;
    case 'css': case 'css3': iconComponent = <CssIcon fill={fallbackTextColor} />; break;
    case 'java': iconComponent = <JavaIcon fill={fallbackTextColor} />; break; 
    case 'node': case 'nodejs': iconComponent = <NodeIcon fill={fallbackTextColor} />; break; 
    default: iconComponent = <GenericSkillIcon fill={fallbackTextColor || "#9CA3AF"} size="24" />;
  }

  if (displayStyle === 'icon-only-chip') {
    return iconComponent; 
  } else if (displayStyle === 'text-only-list') {
    return <span style={{ color: fallbackTextColor }}>{skillName}</span>; 
  } else if (displayStyle === 'icon-text-chip') { 
    return (
      <span className="inline-flex items-center" style={{ color: fallbackTextColor }}>
        {iconComponent}
        <span className="ml-1.5 text-sm">{skillName}</span> 
      </span>
    );
  }
  
  return (
    <div className="flex flex-col items-center text-center w-full"> 
      {iconComponent} 
      <span className="text-xs mt-1" style={{ color: fallbackTextColor }}>
        {skillName || "Unknown Skill"}
      </span>
    </div>
  );
};

const predefinedBackgroundThemes = [ 
  { id: 'blank-default', name: 'Default (Dark)', style: { backgroundColor: '#374151' }, headingColor: '#E5E7EB', bodyTextColor: '#D1D5DB', accentColor: '#34D399' },
  { id: 'light-gentle', name: 'Light Gentle', style: { backgroundColor: '#F3F4F6' }, headingColor: '#1F2937', bodyTextColor: '#374151', accentColor: '#3B82F6' },
  {id: 'ocean-breeze', name: 'Ocean Breeze', style: { backgroundImage: 'linear-gradient(to top right, #00c6ff, #0072ff)' }, headingColor: '#FFFFFF', bodyTextColor: '#E0F2FE', accentColor: '#FDE047' },
  { id: 'sunset-glow', name: 'Sunset Glow', style: { backgroundImage: 'linear-gradient(to top right, #ff7e5f, #feb47b)' }, headingColor: '#FFFFFF', bodyTextColor: '#FFF7ED', accentColor: '#8B5CF6' },
  { id: 'deep-space', name: 'Deep Space', style: { backgroundImage: 'linear-gradient(to bottom, #232526, #414345)' }, headingColor: '#E5E7EB', bodyTextColor: '#D1D5DB', accentColor: '#A78BFA' },
];
const templateBackgroundImages = { 
    'style-1': '/images/template-1-preview.jpg', 
    'style-2': '/images/template-2-preview.jpg',
};

const getMarginBottomClass = (spacingValue) => { 
    const trueSpacingValue = Number(spacingValue); 
    const spacingMap = ['mb-0', 'mb-2', 'mb-4', 'mb-6', 'mb-8', 'mb-12', 'mb-16', 'mb-20', 'mb-24']; 
    const index = Math.max(0, Math.min(isNaN(trueSpacingValue) ? 4 : trueSpacingValue, spacingMap.length - 1)); 
    return spacingMap[index];
};


function PortfolioDisplay({ portfolioData }) {
  if (!portfolioData || typeof portfolioData !== 'object' || Object.keys(portfolioData).length === 0) {
    return <div className="text-center p-10 text-slate-400 text-lg">Portfolio data is not available or is empty.</div>;
  }

  const {
    name, profilePicture, linkedinUrl, githubUrl, aboutMe,
    projects = [], skills = [],   
    customSections = [], // Destructure customSections, defaulting to an empty array
    fontFamily = 'Arial, sans-serif', 
    headingColor = '#E5E7EB',         
    bodyTextColor = '#D1D5DB',       
    accentColor = '#34D399',         
    templateId, backgroundType, selectedBackgroundTheme, customBackgroundImageUrl,
    headerLayout = 'image-top-center', 
    skillDisplayStyle = 'icon-text-chip', 
    sectionSpacing = 4, 
    skillIconChipBackgroundColor, 
    skillIconChipTextColor 
  } = portfolioData;

  const sectionMarginClass = getMarginBottomClass(sectionSpacing);

  let currentBlankTheme = predefinedBackgroundThemes.find(t => t.id === selectedBackgroundTheme) || predefinedBackgroundThemes[0];
  
  const finalHeadingColor = (templateId === 'blank' && backgroundType === 'theme' && currentBlankTheme.headingColor) || headingColor;
  const finalBodyTextColor = (templateId === 'blank' && backgroundType === 'theme' && currentBlankTheme.bodyTextColor) || bodyTextColor;
  const finalAccentColor = (templateId === 'blank' && backgroundType === 'theme' && currentBlankTheme.accentColor) || accentColor;

  const finalSkillChipBg = skillIconChipBackgroundColor || (templateId === 'blank' && currentBlankTheme.skillIconChipBackgroundColor) || 'rgba(71, 85, 105, 0.5)';
  const finalSkillChipText = skillIconChipTextColor || (templateId === 'blank' && currentBlankTheme.skillIconChipTextColor) || finalBodyTextColor;


  let livePreviewBackgroundStyle = {};
  if (templateId && templateId !== 'blank') {
    const templateBgImage = templateBackgroundImages[templateId];
    livePreviewBackgroundStyle = templateBgImage 
      ? { backgroundImage: `url(${process.env.PUBLIC_URL}${templateBgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
      : { backgroundColor: '#111827' }; 
  } else if (templateId === 'blank') {
    if (backgroundType === 'theme') {
        livePreviewBackgroundStyle = currentBlankTheme.style || predefinedBackgroundThemes[0].style;
    } else if (backgroundType === 'customImage' && customBackgroundImageUrl) {
        livePreviewBackgroundStyle = { backgroundImage: `url(${customBackgroundImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' };
    } else {
        livePreviewBackgroundStyle = predefinedBackgroundThemes[0].style; 
    }
  }

  const basePreviewClasses = "shadow-xl rounded-xl p-6 md:p-8 overflow-y-auto portfolio-display-container";
  const finalPreviewClasses = `${basePreviewClasses}`; 

  const renderHeader = () => { 
    const socialLinks = (
        <div className={`social-links flex items-center space-x-4 mt-2 ${headerLayout === 'image-top-center' || headerLayout === 'text-only-center' ? 'justify-center' : 'justify-start'}`}>
            {linkedinUrl && <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn Profile"><LinkedInIcon fill={finalAccentColor} /></a>}
            {githubUrl && <a href={githubUrl} target="_blank" rel="noopener noreferrer" aria-label="GitHub Profile"><GitHubIcon fill={finalAccentColor} /></a>}
        </div>
    );
    const textContent = (
        <div className={`${headerLayout === 'image-left-text-right' ? 'text-left' : 'text-center'}`}>
            {name && <h1 className={`text-3xl md:text-4xl font-bold mb-1 ${headerLayout === 'image-left-text-right' ? '' : 'mx-auto'}`} style={{color: finalHeadingColor}}>{name}</h1>}
            {(linkedinUrl || githubUrl) && socialLinks}
        </div>
    );
    if (headerLayout === 'image-left-text-right') {
        return (
            <div className="flex flex-col md:flex-row items-center md:items-start text-left">
                {profilePicture && <img src={profilePicture} alt={name || "Profile"} className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover mb-4 md:mb-0 md:mr-8 border-4 border-slate-500 shadow-lg flex-shrink-0" />}
                <div className="flex-1 mt-2 md:mt-0">{textContent}</div>
            </div>
        );
    } else if (headerLayout === 'text-only-center') {
        return <div className="text-center py-4">{textContent}</div>;
    } 
    return (
        <div className="text-center">
            {profilePicture && <img src={profilePicture} alt={name || "Profile"} className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover mx-auto mb-4 border-4 border-slate-500 shadow-lg" />}
            {textContent}
        </div>
    );
  };

  return (
    <div
      className={finalPreviewClasses}
      style={{
        ...livePreviewBackgroundStyle, 
        fontFamily: fontFamily,       
      }}
    >
      {(name || profilePicture || linkedinUrl || githubUrl) && (
        <div className={`portfolio-header pb-6 border-b border-gray-700 dark:border-slate-600 ${sectionMarginClass}`}>
          {renderHeader()}
        </div>
      )}

      {aboutMe && (
        <div className={`portfolio-about ${sectionMarginClass}`}>
          <h2 className="text-2xl font-semibold mb-3" style={{color: finalHeadingColor}}>About Me</h2>
          <p 
            className="text-base leading-relaxed whitespace-pre-line" 
            style={{color: finalBodyTextColor }}
          >
            {aboutMe}
          </p>
        </div>
      )}

      {skills.length > 0 && (
        <div className={`portfolio-skills ${sectionMarginClass}`}>
          <h2 className="text-2xl font-semibold mb-3" style={{color: finalHeadingColor}}>Skills</h2>
          {skillDisplayStyle === 'text-only-list' ? (
            <ul className="list-disc list-inside pl-5 space-y-1">
              {skills.map((skill, index) => (
                <li key={index} style={{ color: finalBodyTextColor }}>{skill}</li>
              ))}
            </ul>
          ) : ( 
            <ul className="flex flex-wrap gap-3 items-center"> 
              {skills.map((skill, index) => (
                <li 
                  key={index} 
                  className="flex items-center justify-center p-2.5 rounded-lg shadow-md transition-all duration-150 hover:opacity-85"
                  style={{ backgroundColor: finalSkillChipBg }}
                  title={skill} 
                >
                  <SkillDisplay skillName={skill} fallbackTextColor={finalSkillChipText} displayStyle={skillDisplayStyle} />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      
      {/* --- MODIFIED: Rendering Custom Sections with Nested Items --- */}
      {customSections && customSections.length > 0 && customSections.map((section, sectionIndex) => (
        // Each custom section block
        <div key={section.id || `custom-section-${sectionIndex}`} className={`portfolio-custom-section-block ${sectionMarginClass}`}>
            {section.sectionTitle && ( 
                <h2 className="text-2xl font-semibold mb-4" style={{color: finalHeadingColor}}> {/* Increased bottom margin for main title */}
                    {section.sectionTitle}
                </h2>
            )}
            {/* Render items within this section */}
            {section.items && section.items.length > 0 && (
                <div className="space-y-4"> {/* Spacing between items in a section */}
                    {section.items.map((item, itemIndex) => (
                        <div key={item.id || `custom-item-${sectionIndex}-${itemIndex}`} className="custom-section-item ml-2 pl-4 border-l-2 border-slate-600"> {/* Indent and style individual items */}
                            {item.itemTitle && (
                                <h3 className="text-lg font-semibold mb-1" style={{color: finalHeadingColor}}> {/* Sub-heading for item title */}
                                    {item.itemTitle}
                                </h3>
                            )}
                            {item.itemDetails && (
                                <p 
                                    className="text-base leading-relaxed whitespace-pre-line" // Use pre-line for plain text details
                                    style={{color: finalBodyTextColor }}
                                >
                                    {item.itemDetails}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
      ))}
      {/* --- END MODIFIED: Rendering Custom Sections --- */}

      {projects && projects.some(p => p.title || p.description || p.thumbnailUrl || p.liveDemoUrl || p.sourceCodeUrl || p.videoUrl) && (
        <div className={`portfolio-projects ${sectionMarginClass}`}> 
          <h2 className="text-2xl font-semibold mb-4" style={{color: finalHeadingColor}}>Projects</h2>
          <div className="space-y-6">
          {projects.map((project, index) => (
            (project.title || project.description || project.thumbnailUrl || project.liveDemoUrl || project.sourceCodeUrl || project.videoUrl) && ( 
            <div key={project.id || `project-preview-${index}`} className="portfolio-project bg-slate-700/30 dark:bg-slate-800/50 p-4 rounded-lg shadow"> 
              {project.thumbnailUrl && (
                <img 
                  src={project.thumbnailUrl} 
                  alt={`${project.title || 'Project'} thumbnail`} 
                  className="w-full h-48 object-cover rounded-md mb-4 shadow" 
                  onError={(e) => { e.currentTarget.style.display = 'none'; }} 
                />
              )}
              {project.title && <h3 className="text-xl font-bold mb-1" style={{color: finalHeadingColor}}>{project.title}</h3>}
              
              {project.description && (
                <p 
                    className="text-sm whitespace-pre-line mb-3" 
                    style={{color: finalBodyTextColor }}
                >
                    {project.description}
                </p>
              )}
              
              {project.videoUrl && (
                <div className="aspect-w-16 aspect-h-9 my-4"> 
                  <iframe 
                    src={getEmbedUrl(project.videoUrl)} 
                    title={`${project.title || 'Project'} Video`}
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                    className="w-full h-full rounded"
                  ></iframe>
                </div>
              )}

              <div className="flex flex-wrap gap-3 mt-3"> 
                {project.liveDemoUrl && (
                  <a 
                    href={project.liveDemoUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block text-white text-xs font-semibold py-2 px-3 rounded-md transition-colors hover:opacity-85" 
                    style={{backgroundColor: finalAccentColor}} 
                  >
                    Live Demo
                  </a>
                )}
                {project.sourceCodeUrl && (
                  <a 
                    href={project.sourceCodeUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block bg-slate-500 hover:bg-slate-600 text-white text-xs font-semibold py-2 px-3 rounded-md transition-colors"
                  >
                    Source Code
                  </a>
                )}
              </div>
            </div>
            )
          ))}
          </div>
        </div>
      )}

      {!name && !profilePicture && !aboutMe && (!skills || skills.length === 0) && (!customSections || customSections.length === 0) && (!projects || !projects.some(p => p.title || p.description)) && (
        <p className="text-center text-slate-400 text-lg py-10" style={{color: finalBodyTextColor}}>This portfolio is currently empty.</p>
      )}
    </div>
  );
}

const getEmbedUrl = (url) => {
    if (!url) return '';
    let youtubeMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (youtubeMatch && youtubeMatch[1]) {
        return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }
    let vimeoMatch = url.match(/(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/)?(\d+)(?:$|\/|\?)/);
    if (vimeoMatch && vimeoMatch[3]) {
        return `https://player.vimeo.com/video/${vimeoMatch[3]}`;
    }
    return ''; 
};

export default PortfolioDisplay;
