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

// SkillDisplay Component with enhanced styling for proficiency
const SkillDisplay = ({ skillName, level, fallbackTextColor, displayStyle, accentColor }) => {
  const normalizedSkillName = skillName && typeof skillName === 'string' ? skillName.toLowerCase().trim() : '';
  let iconComponent;

  // Icons use their own brand colors by default, or fallbackTextColor for GenericSkillIcon
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

  // Enhanced proficiency pill styling
  const proficiencyBaseClass = "text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm";
  const proficiencyTextClass = "text-white"; // Ensuring good contrast for pill text

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
                className={`absolute -top-1.5 -right-1.5 block h-3 w-3 rounded-full ring-2 ring-offset-1 ring-offset-slate-800 group-hover:ring-offset-slate-700 transition-all duration-150 ${proficiencyColors[level] || 'bg-gray-400'}`}
                title={level} // Tooltip shows the level name
            />
            )}
        </div>
    );
  } else if (displayStyle === 'text-only-list') {
    return (
      <div className="flex items-center" style={{ color: fallbackTextColor }}>
        <span>{skillName}</span>
        {level && <span className={`ml-2 ${proficiencyPillClass}`}>{level}</span>}
      </div>
    );
  } else if (displayStyle === 'icon-text-chip') {
    // MODIFIED: Icon on top, then name, then pill, all centered
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

  // Default: Icon + Text Below (Enhanced) - This is now the same as icon-text-chip
  return (
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
    customSections = [],
    fontFamily = 'Arial, sans-serif',
    headingColor,
    bodyTextColor,
    accentColor,
    //secondaryAccentColor,
    templateId,
    backgroundType,
    selectedBackgroundTheme,
    customBackgroundImageUrl,
    headerLayout = 'image-top-center',
    skillDisplayStyle = 'icon-text-chip',
    sectionSpacing = 4,
    skillIconChipBackgroundColor,
    skillIconChipTextColor,
  } = portfolioData;

  const sectionMarginClass = getMarginBottomClass(sectionSpacing);

  const finalHeadingColor = headingColor || '#E5E7EB';
  const finalBodyTextColor = bodyTextColor || '#D1D5DB';
  const finalAccentColor = accentColor || '#34D399';
  //const finalSecondaryAccentColor = secondaryAccentColor || '#A78BFA';

  const finalSkillChipBg = skillIconChipBackgroundColor || (finalBodyTextColor === '#D1D5DB' ? '#4A5568' : '#E5E7EB');
  const finalSkillChipText = skillIconChipTextColor || (finalBodyTextColor === '#D1D5DB' ? '#F7FAFC' : '#1F2937');


  let livePreviewBackgroundStyle = {};
  if (templateId && templateId !== 'blank') {
    const templateBgImage = templateBackgroundImages[templateId];
    livePreviewBackgroundStyle = templateBgImage
      ? { backgroundImage: `url(${process.env.PUBLIC_URL}${templateBgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
      : { backgroundColor: '#111827' };
  } else if (templateId === 'blank') {
    if (backgroundType === 'theme') {
        const currentTheme = predefinedBackgroundThemes.find(t => t.id === selectedBackgroundTheme) || predefinedBackgroundThemes[0];
        livePreviewBackgroundStyle = currentTheme.style;
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
          <div
            className="text-base leading-relaxed rich-text-content"
            style={{color: finalBodyTextColor }}
            dangerouslySetInnerHTML={{ __html: aboutMe }}
          />
        </div>
      )}

      {skills && skills.length > 0 && (
        <div className={`portfolio-skills ${sectionMarginClass}`}>
          <h2 className="text-2xl font-semibold mb-4" style={{color: finalHeadingColor}}>Skills</h2>
          {skillDisplayStyle === 'text-only-list' ? (
            <ul className="list-disc list-inside pl-1 space-y-2">
              {skills.map((skillObj, index) => (
                <li key={`skill-list-${index}-${skillObj.name}`} className="flex items-center" style={{ color: finalBodyTextColor }}>
                  <SkillDisplay
                    skillName={skillObj.name}
                    level={skillObj.level}
                    fallbackTextColor={finalBodyTextColor}
                    displayStyle={skillDisplayStyle}
                    accentColor={finalAccentColor}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <ul className="flex flex-wrap gap-4 items-stretch"> {/* Changed items-center to items-stretch for consistent height */}
              {skills.map((skillObj, index) => (
                <li
                  key={`skill-chip-${index}-${skillObj.name}`}
                  className="group flex flex-col items-center justify-center p-3 rounded-xl shadow-lg transition-all duration-200 ease-in-out hover:shadow-xl hover:scale-105" // flex-col for vertical stacking
                  style={{
                    backgroundColor: finalSkillChipBg,
                    border: `1px solid ${finalSkillChipBg === '#4A5568' || finalSkillChipBg === '#2D3748' ? finalAccentColor : 'rgba(255,255,255,0.1)'}`,
                  }}
                  title={`${skillObj.name} - ${skillObj.level}`}
                >
                  <SkillDisplay
                    skillName={skillObj.name}
                    level={skillObj.level}
                    fallbackTextColor={finalSkillChipText}
                    displayStyle={skillDisplayStyle} // This will now trigger the updated 'icon-text-chip' logic
                    accentColor={finalAccentColor}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {customSections && customSections.length > 0 && customSections.map((section, sectionIndex) => (
        <div key={section.id || `custom-section-${sectionIndex}`} className={`portfolio-custom-section-block ${sectionMarginClass}`}>
            {section.sectionTitle && (
                <h2 className="text-2xl font-semibold mb-4" style={{color: finalHeadingColor}}>
                    {section.sectionTitle}
                </h2>
            )}
            {section.items && section.items.length > 0 && (
                <div className="space-y-4">
                    {section.items.map((item, itemIndex) => (
                        <div key={item.id || `custom-item-${sectionIndex}-${itemIndex}`} className="custom-section-item ml-2 pl-4 border-l-2" style={{borderColor: finalAccentColor}}>
                            {item.itemTitle && (
                                <h3 className="text-lg font-semibold mb-1" style={{color: finalHeadingColor}}>
                                    {item.itemTitle}
                                </h3>
                            )}
                            {item.itemDetails && (
                                <div
                                    className="text-base leading-relaxed rich-text-content"
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
                <div
                  className="text-sm mb-3 rich-text-content"
                  style={{color: finalBodyTextColor }}
                  dangerouslySetInnerHTML={{ __html: project.description }}
                />
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
    // Updated regex to better handle various YouTube URL formats including shorts and direct video links
    let youtubeMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (youtubeMatch && youtubeMatch[1]) {
        return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }
    // Vimeo regex remains the same, seems robust enough
    let vimeoMatch = url.match(/(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/)?(\d+)(?:$|\/|\?)/);
    if (vimeoMatch && vimeoMatch[3]) {
        return `https://player.vimeo.com/video/${vimeoMatch[3]}`;
    }
    // Fallback if no match, or consider returning an error/empty string based on desired behavior
    console.warn("Could not generate embed URL for:", url);
    return '';
};

export default PortfolioDisplay;
