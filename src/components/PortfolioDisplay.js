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
} from './icons/SkillIcons'; // Assuming these are SVG components

// Social Icons
const LinkedInIcon = ({ fill = "#FFFFFF", className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={fill} className={`${className} transition-opacity hover:opacity-75`}>
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
  </svg>
);
const GitHubIcon = ({ fill = "#FFFFFF", className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={fill} className={`${className} transition-opacity hover:opacity-75`}>
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

const SkillDisplay = ({ skillName, level, fallbackTextColor, displayStyle, accentColor, templateId }) => {
  const normalizedSkillName = skillName && typeof skillName === 'string' ? skillName.toLowerCase().trim() : '';
  let iconComponent;

  switch (normalizedSkillName) {
    case 'react': case 'react.js': iconComponent = <ReactIcon />; break;
    case 'javascript': case 'js': iconComponent = <JavaScriptIcon />; break;
    case 'python': iconComponent = <PythonIcon />; break;
    case 'html': case 'html5': iconComponent = <HtmlIcon />; break;
    case 'css': case 'css3': iconComponent = <CssIcon />; break;
    case 'java': iconComponent = <JavaIcon />; break;
    case 'node': case 'nodejs': iconComponent = <NodeIcon />; break;
    default: iconComponent = <GenericSkillIcon fill={fallbackTextColor || "#9CA3AF"} size="24" />;
  }

  const proficiencyBaseClass = "text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm";
  let proficiencyTextClass = "text-white"; 
  
  if (templateId === 'style-coder-min' && level) {
      // For coder template, pills are on a dark item bg (slate-800), so white text is fine.
  }

  const proficiencyColors = {
    Beginner: 'bg-slate-500 hover:bg-slate-600',
    Intermediate: `bg-sky-500 hover:bg-sky-600`,
    Advanced: `bg-emerald-500 hover:bg-emerald-600`,
    Expert: 'bg-purple-600 hover:bg-purple-700',
  };
  const proficiencyPillClass = `${proficiencyBaseClass} ${proficiencyTextClass} ${proficiencyColors[level] || 'bg-gray-400 hover:bg-gray-500'}`;

  if (displayStyle === 'icon-only-chip') {
    return (
        <div className="relative group transition-transform duration-150 ease-in-out hover:scale-110">
            {iconComponent}
            {level && (
            <span
                className={`absolute -top-1.5 -right-1.5 block h-3 w-3 rounded-full ring-2 ring-offset-1 ring-offset-current transition-all duration-150 ${proficiencyColors[level] || 'bg-gray-400'}`}
                title={level}
            />
            )}
        </div>
    );
  } else if (displayStyle === 'text-only-list') {
    return (
      <div className="flex items-center justify-between w-full" style={{ color: fallbackTextColor }}>
        <span>{skillName}</span>
        {level && <span className={`ml-2 ${proficiencyPillClass}`}>{level}</span>}
      </div>
    );
  } else if (displayStyle === 'icon-text-chip') {
    return (
      <div className="flex flex-col items-center space-y-1.5" style={{ color: fallbackTextColor }}>
        <div className="transform transition-transform duration-150 ease-in-out group-hover:scale-110">
            {iconComponent}
        </div>
        <span className="text-sm font-medium">{skillName}</span>
        {level && <span className={proficiencyPillClass}>{level}</span>}
      </div>
    );
  }

  return ( // Default style
    <div className="flex flex-col items-center text-center w-full space-y-1.5">
      <div className="transform transition-transform duration-150 ease-in-out group-hover:scale-110">
        {iconComponent}
      </div>
      <span className="text-sm font-medium" style={{ color: fallbackTextColor }}>
        {skillName || "Unknown Skill"}
      </span>
      {level && <span className={`${proficiencyPillClass} mt-0.5`}>{level}</span>}
    </div>
  );
};

const predefinedBackgroundThemes = [
  { id: 'blank-default', name: 'Default (Dark)', style: { backgroundColor: '#374151' }, headingColor: '#E5E7EB', bodyTextColor: '#D1D5DB', accentColor: '#34D399', secondaryAccentColor: '#A78BFA', skillIconChipBackgroundColor: '#4A5568', skillIconChipTextColor: '#F7FAFC' },
  { id: 'light-gentle', name: 'Light Gentle', style: { backgroundColor: '#F3F4F6' }, headingColor: '#1F2937', bodyTextColor: '#374151', accentColor: '#3B82F6', secondaryAccentColor: '#EC4899', skillIconChipBackgroundColor: '#E5E7EB', skillIconChipTextColor: '#1F2937'},
  {id: 'ocean-breeze', name: 'Ocean Breeze', style: { backgroundImage: 'linear-gradient(to top right, #00c6ff, #0072ff)' }, headingColor: '#FFFFFF', bodyTextColor: '#E0F2FE', accentColor: '#FDE047', secondaryAccentColor: '#FF7E5F', skillIconChipBackgroundColor: 'rgba(255, 255, 255, 0.2)', skillIconChipTextColor: '#FFFFFF' },
  { id: 'sunset-glow', name: 'Sunset Glow', style: { backgroundImage: 'linear-gradient(to top right, #ff7e5f, #feb47b)' }, headingColor: '#FFFFFF', bodyTextColor: '#FFF7ED', accentColor: '#8B5CF6', secondaryAccentColor: '#FFC700', skillIconChipBackgroundColor: 'rgba(255, 255, 255, 0.25)', skillIconChipTextColor: '#FFFFFF' },
  { id: 'deep-space', name: 'Deep Space', style: { backgroundImage: 'linear-gradient(to bottom, #232526, #414345)' }, headingColor: '#E5E7EB', bodyTextColor: '#D1D5DB', accentColor: '#A78BFA', secondaryAccentColor: '#FBBF24', skillIconChipBackgroundColor: 'rgba(255, 255, 255, 0.1)', skillIconChipTextColor: '#E5E7EB' },
];
const templateBackgroundImages = {
    'style-coder-min': '', // No specific background image, uses color
    // Removed style-1 and style-2 as they are no longer in TemplateSelection.js
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
    customSections = [], // This will now only be rendered if templateId is 'blank'
    fontFamily: dataFontFamily,
    headingColor: dataHeadingColor,
    bodyTextColor: dataBodyTextColor,
    accentColor: dataAccentColor,
    secondaryAccentColor: dataSecondaryAccentColor,
    templateId,
    backgroundType, 
    selectedBackgroundTheme, 
    customBackgroundImageUrl, 
    headerLayout: dataHeaderLayout,
    skillDisplayStyle: dataSkillDisplayStyle,
    sectionSpacing = 4,
    skillIconChipBackgroundColor: dataSkillChipBg,
    skillIconChipTextColor: dataSkillChipText,
  } = portfolioData;

  const sectionMarginClass = getMarginBottomClass(sectionSpacing);

  let finalHeadingColor = dataHeadingColor;
  let finalBodyTextColor = dataBodyTextColor;
  let finalAccentColor = dataAccentColor;
  let finalSecondaryAccentColor = dataSecondaryAccentColor;
  let finalSkillChipBg = dataSkillChipBg;
  let finalSkillChipText = dataSkillChipText;
  let livePreviewBackgroundStyle = {};
  let portfolioContainerClasses = "portfolio-display-container p-6 md:p-8 lg:p-12";
  let currentFontFamily = dataFontFamily || 'Inter, sans-serif';
  let currentHeaderLayout = dataHeaderLayout;
  let currentSkillDisplayStyle = dataSkillDisplayStyle;


  if (templateId === 'style-coder-min') {
    finalHeadingColor = '#e5e7eb'; 
    finalBodyTextColor = '#9ca3af'; 
    finalAccentColor = '#34d399';   
    finalSecondaryAccentColor = '#60a5fa'; 
    livePreviewBackgroundStyle = { backgroundColor: '#111827' }; // slate-900
    portfolioContainerClasses = "portfolio-display-container p-6 md:p-10 lg:p-16 font-['Inter',_sans-serif] max-w-4xl mx-auto";
    currentFontFamily = 'Inter, sans-serif';
    currentHeaderLayout = 'image-left-text-right'; 
    currentSkillDisplayStyle = 'text-only-list'; 
    finalSkillChipBg = '#1f2937'; // slate-800 for skill list item background (slightly lighter than page bg)
    finalSkillChipText = '#d1d5db'; 
  } else if (templateId === 'blank') { // Logic for Blank Canvas
    if (backgroundType === 'theme') {
        const currentTheme = predefinedBackgroundThemes.find(t => t.id === selectedBackgroundTheme) || predefinedBackgroundThemes[0];
        livePreviewBackgroundStyle = currentTheme.style;
        finalHeadingColor = dataHeadingColor || currentTheme.headingColor;
        finalBodyTextColor = dataBodyTextColor || currentTheme.bodyTextColor;
        finalAccentColor = dataAccentColor || currentTheme.accentColor;
        finalSecondaryAccentColor = dataSecondaryAccentColor || currentTheme.secondaryAccentColor;
        finalSkillChipBg = dataSkillChipBg || currentTheme.skillIconChipBackgroundColor;
        finalSkillChipText = dataSkillChipText || currentTheme.skillIconChipTextColor;
    } else if (backgroundType === 'customImage' && customBackgroundImageUrl) {
        livePreviewBackgroundStyle = { backgroundImage: `url(${customBackgroundImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' };
        finalHeadingColor = dataHeadingColor || '#E5E7EB';
        finalBodyTextColor = dataBodyTextColor || '#D1D5DB';
        finalAccentColor = dataAccentColor || '#34D399';
        finalSecondaryAccentColor = dataSecondaryAccentColor || '#A78BFA';
        finalSkillChipBg = dataSkillChipBg || '#4A5568';
        finalSkillChipText = dataSkillChipText || '#F7FAFC';
    } else { // Fallback for blank if no theme/image selected by user
        livePreviewBackgroundStyle = predefinedBackgroundThemes[0].style; // Default dark
        finalHeadingColor = dataHeadingColor || predefinedBackgroundThemes[0].headingColor;
        finalBodyTextColor = dataBodyTextColor || predefinedBackgroundThemes[0].bodyTextColor;
        finalAccentColor = dataAccentColor || predefinedBackgroundThemes[0].accentColor;
        finalSecondaryAccentColor = dataSecondaryAccentColor || predefinedBackgroundThemes[0].secondaryAccentColor;
        finalSkillChipBg = dataSkillChipBg || predefinedBackgroundThemes[0].skillIconChipBackgroundColor;
        finalSkillChipText = dataSkillChipText || predefinedBackgroundThemes[0].skillIconChipTextColor;
    }
  } else { // Fallback for any other (future) styled templates or if templateId is somehow unknown
    const templateBgImage = templateBackgroundImages[templateId];
    livePreviewBackgroundStyle = templateBgImage
      ? { backgroundImage: `url(${process.env.PUBLIC_URL}${templateBgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
      : { backgroundColor: '#111827' }; // Default dark background
    finalHeadingColor = dataHeadingColor || '#E5E7EB';
    finalBodyTextColor = dataBodyTextColor || '#D1D5DB';
    finalAccentColor = dataAccentColor || '#34D399';
    finalSecondaryAccentColor = dataSecondaryAccentColor || '#A78BFA';
    finalSkillChipBg = dataSkillChipBg || '#4A5568';
    finalSkillChipText = dataSkillChipText || '#F7FAFC';
  }

  const renderHeader = () => {
    const socialLinks = (
        <div className={`flex items-center space-x-4 mt-2 ${currentHeaderLayout === 'image-top-center' || currentHeaderLayout === 'text-only-center' || templateId === 'style-coder-min' ? 'justify-start' : 'justify-start'}`}>
            {linkedinUrl && <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn Profile"><LinkedInIcon fill={finalAccentColor} className="w-5 h-5 md:w-6 md:h-6"/></a>}
            {githubUrl && <a href={githubUrl} target="_blank" rel="noopener noreferrer" aria-label="GitHub Profile"><GitHubIcon fill={finalAccentColor} className="w-5 h-5 md:w-6 md:h-6"/></a>}
        </div>
    );

    if (templateId === 'style-coder-min') {
        return (
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                <div className="mb-4 md:mb-0">
                    {name && <h1 className="text-4xl md:text-5xl font-bold mb-1" style={{color: finalHeadingColor}}>{name}</h1>}
                    {/* Example: A concise title/tagline for a coder. Could be from a new 'tagline' field in portfolioData */}
                    <p className="text-lg md:text-xl" style={{color: finalBodyTextColor}}>{portfolioData.tagline || "Software Engineer | Full-Stack Developer"}</p> 
                    {socialLinks}
                </div>
                {profilePicture && <img src={profilePicture} alt={name || "Profile"} className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-2 self-center md:self-auto" style={{borderColor: finalAccentColor}} />}
            </div>
        );
    }

    // Default header rendering for other templates (e.g., Blank Canvas)
    const textContent = (
        <div className={`${currentHeaderLayout === 'image-left-text-right' ? 'text-left' : 'text-center'}`}>
            {name && <h1 className={`text-3xl md:text-4xl font-bold mb-1 ${currentHeaderLayout === 'image-left-text-right' ? '' : 'mx-auto'}`} style={{color: finalHeadingColor}}>{name}</h1>}
            {(linkedinUrl || githubUrl) && socialLinks}
        </div>
    );
    if (currentHeaderLayout === 'image-left-text-right') {
        return (
            <div className="flex flex-col md:flex-row items-center md:items-start text-left">
                {profilePicture && <img src={profilePicture} alt={name || "Profile"} className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover mb-4 md:mb-0 md:mr-8 border-4 border-slate-500 shadow-lg flex-shrink-0" />}
                <div className="flex-1 mt-2 md:mt-0">{textContent}</div>
            </div>
        );
    } else if (currentHeaderLayout === 'text-only-center') {
        return <div className="text-center py-4">{textContent}</div>;
    }
    // Default: image-top-center
    return (
        <div className="text-center">
            {profilePicture && <img src={profilePicture} alt={name || "Profile"} className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover mx-auto mb-4 border-4 border-slate-500 shadow-lg" />}
            {textContent}
        </div>
    );
  };


  return (
    <div
      className={portfolioContainerClasses}
      style={{
        ...livePreviewBackgroundStyle,
        fontFamily: currentFontFamily,
      }}
    >
      <div className={`portfolio-header pb-6 md:pb-8 border-b ${sectionMarginClass}`} style={{borderColor: templateId === 'style-coder-min' ? '#334155' /*slate-700*/ : finalAccentColor}}>
          {renderHeader()}
      </div>

      {aboutMe && (
        <div className={`portfolio-about ${sectionMarginClass}`}>
          <h2 className="text-2xl md:text-3xl font-semibold mb-3 md:mb-4" style={{color: finalHeadingColor}}>About Me</h2>
          <div
            className={`rich-text-content prose prose-sm md:prose-base ${templateId === 'style-coder-min' ? 'prose-invert max-w-none prose-p:text-slate-400 prose-headings:text-slate-200 prose-strong:text-slate-100 prose-a:text-emerald-400 hover:prose-a:text-emerald-300' : 'dark:prose-invert'} prose-p:my-2 prose-headings:my-3`}
            style={{color: templateId === 'style-coder-min' ? undefined : finalBodyTextColor }}
            dangerouslySetInnerHTML={{ __html: aboutMe }}
          />
        </div>
      )}

      {skills && skills.length > 0 && (
        <div className={`portfolio-skills ${sectionMarginClass}`}>
          <h2 className="text-2xl md:text-3xl font-semibold mb-4" style={{color: finalHeadingColor}}>Skills</h2>
          {currentSkillDisplayStyle === 'text-only-list' ? ( // This will be true for style-coder-min
            <ul className="space-y-2">
              {skills.map((skillObj, index) => (
                <li key={`skill-list-${index}-${skillObj.name || index}`} 
                    className={`flex items-center justify-between p-3 rounded-md ${templateId === 'style-coder-min' ? 'bg-slate-800 border border-slate-700 hover:border-emerald-500/50' : ''}`}
                >
                  <SkillDisplay
                    skillName={skillObj.name}
                    level={skillObj.level}
                    fallbackTextColor={templateId === 'style-coder-min' ? '#d1d5db' : finalBodyTextColor}
                    displayStyle={'text-only-list'}
                    accentColor={finalAccentColor}
                    templateId={templateId}
                  />
                </li>
              ))}
            </ul>
          ) : ( // This block is for other templates that might use chip styles
            <ul className="flex flex-wrap gap-3 md:gap-4 items-stretch">
              {skills.map((skillObj, index) => (
                <li
                  key={`skill-chip-${index}-${skillObj.name || index}`}
                  className="group flex flex-col items-center justify-center p-3 rounded-xl shadow-lg transition-all duration-200 ease-in-out hover:shadow-xl hover:scale-105"
                  style={{ backgroundColor: finalSkillChipBg, border: `1px solid ${finalSkillChipBg === '#4A5568' || finalSkillChipBg === '#2D3748' ? finalAccentColor : 'rgba(0,0,0,0.05)'}`}}
                  title={`${skillObj.name} - ${skillObj.level}`}
                >
                  <SkillDisplay
                    skillName={skillObj.name}
                    level={skillObj.level}
                    fallbackTextColor={finalSkillChipText}
                    displayStyle={currentSkillDisplayStyle}
                    accentColor={finalAccentColor}
                    templateId={templateId}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* MODIFIED: Conditionally render Custom Sections ONLY for 'blank' template */}
      {templateId === 'blank' && customSections && customSections.length > 0 && customSections.map((section, sectionIndex) => (
        <div key={section.id || `custom-section-${sectionIndex}`} className={`portfolio-custom-section-block ${sectionMarginClass}`}>
            {section.sectionTitle && (
                <h2 className="text-2xl md:text-3xl font-semibold mb-4" style={{color: finalHeadingColor}}>
                    {section.sectionTitle}
                </h2>
            )}
            {section.items && section.items.length > 0 && (
                <div className="space-y-4 md:space-y-6">
                    {section.items.map((item, itemIndex) => (
                        <div key={item.id || `custom-item-${sectionIndex}-${itemIndex}`} 
                             className={`custom-section-item ml-0 pl-4 border-l-2 md:border-l-4 py-3`} // Generic styling for blank
                             style={{borderColor: finalAccentColor}}>
                            {item.itemTitle && (
                                <h3 className="text-lg md:text-xl font-semibold mb-1" style={{color: finalHeadingColor }}>
                                    {item.itemTitle}
                                </h3>
                            )}
                            {item.itemDetails && (
                                <div
                                    className={`rich-text-content prose prose-sm md:prose-base dark:prose-invert prose-p:my-1 prose-ul:my-1 prose-ol:my-1`}
                                    style={{color: finalBodyTextColor }}
                                    dangerouslySetInnerHTML={{ __html: item.itemDetails }}
                                />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
      ))}

      {projects && projects.some(p => p.title || p.description || p.thumbnailUrl || p.liveDemoUrl || p.sourceCodeUrl || p.videoUrl) && (
        <div className={`portfolio-projects ${sectionMarginClass}`}>
          <h2 className="text-2xl md:text-3xl font-semibold mb-4 md:mb-6" style={{color: finalHeadingColor}}>Projects</h2>
          <div className={`grid grid-cols-1 ${templateId === 'style-coder-min' ? 'gap-6 md:gap-8' : 'md:grid-cols-2 gap-6 lg:gap-8'}`}>
          {projects.map((project, index) => (
            (project.title || project.description || project.thumbnailUrl || project.liveDemoUrl || project.sourceCodeUrl || project.videoUrl) && (
            <div 
                key={project.id || `project-preview-${index}`} 
                className={`portfolio-project rounded-lg shadow-lg overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl ${templateId === 'style-coder-min' ? 'bg-slate-800 border border-slate-700 hover:border-emerald-500/70' : 'bg-slate-700/30 dark:bg-slate-800/50'}`}
            >
              {project.thumbnailUrl && templateId !== 'style-coder-min' && (
                <img
                  src={project.thumbnailUrl}
                  alt={`${project.title || 'Project'} thumbnail`}
                  className="w-full h-48 object-cover shadow"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              )}
              <div className="p-4 md:p-6 flex flex-col flex-grow">
                {project.title && <h3 className="text-xl md:text-2xl font-bold mb-2" style={{color: finalHeadingColor}}>{project.title}</h3>}

                {project.description && (
                  <div
                    className={`text-sm md:text-base mb-3 md:mb-4 rich-text-content prose prose-sm ${templateId === 'style-coder-min' ? 'prose-invert text-slate-400 max-w-none prose-p:text-slate-400 prose-headings:text-slate-200 prose-strong:text-slate-100 prose-a:text-emerald-400 hover:prose-a:text-emerald-300' : 'dark:prose-invert'}`}
                    style={{color: templateId !== 'style-coder-min' ? finalBodyTextColor : undefined }}
                    dangerouslySetInnerHTML={{ __html: project.description }}
                  />
                )}
                
                {templateId === 'style-coder-min' && project.skillsUsed && Array.isArray(project.skillsUsed) && project.skillsUsed.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-2">
                        {project.skillsUsed.map(skillTag => (
                            <span key={skillTag} className="bg-slate-700 text-emerald-400 text-xs font-mono px-2 py-1 rounded">
                                {skillTag}
                            </span>
                        ))}
                    </div>
                )}

                {project.videoUrl && templateId !== 'style-coder-min' && (
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

                <div className="flex flex-wrap gap-3 mt-auto pt-4 border-t" style={{borderColor: templateId === 'style-coder-min' ? '#334155' /*slate-700*/ : finalAccentColor}}>
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
                      className={`inline-block text-xs font-semibold py-2 px-3 rounded-md transition-colors ${templateId === 'style-coder-min' ? 'bg-slate-600 hover:bg-slate-500 text-slate-200' : 'bg-slate-500 hover:bg-slate-600 text-white'}`}
                    >
                      Source Code
                    </a>
                  )}
                </div>
              </div>
            </div>
            )
          ))}
          </div>
        </div>
      )}

      {!name && !profilePicture && !aboutMe && (!skills || skills.length === 0) && (templateId === 'blank' && (!customSections || customSections.length === 0)) && (!projects || !projects.some(p => p.title || p.description)) && (
        <p className="text-center text-lg py-10" style={{color: finalBodyTextColor}}>This portfolio is currently empty.</p>
      )}
    </div>
  );
}

const getEmbedUrl = (url) => {
    if (!url) return '';
    let youtubeMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (youtubeMatch && youtubeMatch[1]) {
        return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }
    let vimeoMatch = url.match(/(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/)?(\d+)(?:$|\/|\?)/);
    if (vimeoMatch && vimeoMatch[3]) {
        return `https://player.vimeo.com/video/${vimeoMatch[3]}`;
    }
    console.warn("Could not generate embed URL for:", url);
    return '';
};

export default PortfolioDisplay;
