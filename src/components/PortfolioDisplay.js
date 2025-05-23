// skunal148/portfoliobuilder/PortfolioBuilder-ad74f8854a7d0e220f440f62c535b153baf3850c/src/components/PortfolioDisplay.js
import React from 'react';
import {
    ReactIcon, JavaScriptIcon, PythonIcon, HtmlIcon, CssIcon,
    GenericSkillIcon, JavaIcon, NodeIcon,
    Photoshop,
    Figma
} from './icons/SkillIcons';

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

const DownloadIcon = ({ fill = "currentColor", className = "w-4 h-4 inline-block mr-1" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill={fill} className={className}>
    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

// Default definitions from LiveVisualStorytellerEditor
const VISUAL_STORYTELLER_DEFAULTS = {
    fontFamily: "'Playfair Display', serif",
    headingColor: '#2c3e50',
    bodyTextColor: '#34495e',
    accentColor: '#e74c3c',
    secondaryAccentColor: '#f39c12',
    headerLayout: 'hero-banner',
    skillDisplayStyle: 'icon-only-chip',
    backgroundColor: '#ecf0f1',
    skillIconChipBackgroundColor: '#ffffff',
    skillIconChipTextColor: '#2c3e50',
    tagline: 'Visual Creator | Designer | Photographer'
};

const CODER_MIN_DEFAULTS = {
    fontFamily: "'Inter', sans-serif", // Or your chosen coder font
    headingColor: '#e5e7eb',
    bodyTextColor: '#9ca3af',
    accentColor: '#34d399',  
    secondaryAccentColor: '#60a5fa',
    headerLayout: 'image-left-text-right',
    skillDisplayStyle: 'text-only-list',
    backgroundColor: '#111827', // Default dark for coder
    skillIconChipBackgroundColor: '#1f2937',
    skillIconChipTextColor: '#d1d5db',
    tagline: "Software Engineer | Full-Stack Developer"
};


const SkillDisplay = ({ skillName, level, fallbackTextColor, displayStyle, accentColor, templateId, skillChipBg, skillChipText }) => {
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
    case 'photoshop': case 'PS': iconComponent = <Photoshop />; break;
    case 'Figma': case 'figma': iconComponent = <Figma />; break;
    default: iconComponent = <GenericSkillIcon fill={fallbackTextColor || "#9CA3AF"} size="24" />;
  }

  const proficiencyBaseClass = "text-xs font-semibold px-2 py-0.5 rounded-full shadow-sm";
  
  let currentProficiencyTextClass = "text-white"; // Default for dark pills
  if (skillChipBg && (skillChipBg.toLowerCase() === '#ffffff' || skillChipBg.toLowerCase() === '#e5e7eb' || skillChipBg.toLowerCase() === '#f5f5f5' || skillChipBg.toLowerCase() === '#ecf0f1')) {
      currentProficiencyTextClass = skillChipText || "text-slate-700"; // Dark text on light chips
  } else {
      currentProficiencyTextClass = skillChipText || "text-slate-100"; // Light text on dark chips
  }


  const proficiencyColors = {
    Beginner: 'bg-slate-500 hover:bg-slate-600',
    Intermediate: `bg-sky-500 hover:bg-sky-600`, // Use accent color from props
    Advanced: `bg-emerald-500 hover:bg-emerald-600`,
    Expert: 'bg-purple-600 hover:bg-purple-700',
  };
  const proficiencyPillClass = `${proficiencyBaseClass} ${currentProficiencyTextClass} ${proficiencyColors[level] || 'bg-gray-400 hover:bg-gray-500'}`;

  if (displayStyle === 'icon-only-chip') {
    return (
        <div className="relative group transition-transform duration-150 ease-in-out hover:scale-110">
            {iconComponent}
            {level && (
            <span
                className={`absolute -top-1 -right-1 block h-2.5 w-2.5 rounded-full ring-1 ring-offset-1 ring-current transition-all duration-150 ${proficiencyColors[level]?.split(' ')[0] || 'bg-gray-400'}`} // Use only the bg color for the dot
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
  } else { // Default: 'icon-text-chip'
    return (
      <div className="flex flex-col items-center space-y-1" style={{ color: fallbackTextColor }}>
        <div className="transform transition-transform duration-150 ease-in-out group-hover:scale-110">
            {iconComponent}
        </div>
        <span className="text-xs sm:text-sm font-medium">{skillName}</span>
        {level && <span className={proficiencyPillClass}>{level}</span>}
      </div>
    );
  }
};

const predefinedBackgroundThemes = [
  { id: 'blank-default', name: 'Default (Dark)', style: { backgroundColor: '#374151' }, headingColor: '#E5E7EB', bodyTextColor: '#D1D5DB', accentColor: '#34D399', secondaryAccentColor: '#A78BFA', skillIconChipBackgroundColor: '#4A5568', skillIconChipTextColor: '#F7FAFC' },
  { id: 'light-gentle', name: 'Light Gentle', style: { backgroundColor: '#F3F4F6' }, headingColor: '#1F2937', bodyTextColor: '#374151', accentColor: '#3B82F6', secondaryAccentColor: '#EC4899', skillIconChipBackgroundColor: '#E5E7EB', skillIconChipTextColor: '#1F2937'},
  { id: 'ocean-breeze', name: 'Ocean Breeze', style: { backgroundImage: 'linear-gradient(to top right, #00c6ff, #0072ff)' }, headingColor: '#FFFFFF', bodyTextColor: '#E0F2FE', accentColor: '#FDE047', secondaryAccentColor: '#FF7E5F', skillIconChipBackgroundColor: 'rgba(255, 255, 255, 0.2)', skillIconChipTextColor: '#FFFFFF' },
  { id: 'sunset-glow', name: 'Sunset Glow', style: { backgroundImage: 'linear-gradient(to top right, #ff7e5f, #feb47b)' }, headingColor: '#FFFFFF', bodyTextColor: '#FFF7ED', accentColor: '#8B5CF6', secondaryAccentColor: '#FFC700', skillIconChipBackgroundColor: 'rgba(255, 255, 255, 0.25)', skillIconChipTextColor: '#FFFFFF' },
  { id: 'deep-space', name: 'Deep Space', style: { backgroundImage: 'linear-gradient(to bottom, #232526, #414345)' }, headingColor: '#E5E7EB', bodyTextColor: '#D1D5DB', accentColor: '#A78BFA', secondaryAccentColor: '#FBBF24', skillIconChipBackgroundColor: 'rgba(255, 255, 255, 0.1)', skillIconChipTextColor: '#E5E7EB' },
];

const getMarginBottomClass = (spacingValue) => {
    const trueSpacingValue = Number(spacingValue);
    const spacingMap = ['mb-0', 'mb-2', 'mb-4', 'mb-6', 'mb-8', 'mb-12', 'mb-16', 'mb-20', 'mb-24']; // Tailwind classes
    const index = Math.max(0, Math.min(isNaN(trueSpacingValue) ? 4 : trueSpacingValue, spacingMap.length - 1));
    return spacingMap[index];
};

const getEmbedUrl = (url) => {
    if (!url) return '';
    // YouTube: handles standard, short, embed, and v links
    let youtubeMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (youtubeMatch && youtubeMatch[1]) {
        // Standard YouTube embed URL format
        return `https://www.youtube.com/embed/${youtubeMatch[1]}?rel=0&showinfo=0&modestbranding=1`; // Corrected YouTube embed URL
    }
    // Vimeo: handles standard, player, and ondemand links
    let vimeoMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:player\.)?vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|ondemand\/\w+\/)?(\d+)(?:$|\/|\?)/);
    if (vimeoMatch && vimeoMatch[3]) {
        return `https://player.vimeo.com/video/${vimeoMatch[3]}?title=0&byline=0&portrait=0`;
    }
    console.warn("Could not generate embed URL for:", url, "Using raw URL.");
    return ''; // Fallback to empty or original URL if no match; empty is safer for iframe
};


function PortfolioDisplay({ portfolioData }) {
  if (!portfolioData || typeof portfolioData !== 'object' || Object.keys(portfolioData).length === 0) {
    return <div className="text-center p-10 text-slate-400 text-lg">Portfolio data is not available or is empty.</div>;
  }


  const {
    name, profilePicture, linkedinUrl, githubUrl, aboutMe,
    projects = [], skills = [],
    customSections = [],
    tagline, // Used by Visual Storyteller and Coder
    fontFamily: dataFontFamily,
    headingColor: dataHeadingColor,
    bodyTextColor: dataBodyTextColor,
    accentColor: dataAccentColor,
    secondaryAccentColor: dataSecondaryAccentColor, // Not used by Visual by default, but could be
    templateId,
    backgroundType, 
    selectedBackgroundTheme, 
    customBackgroundImageUrl, 
    heroImageUrl, // Specific to Visual Storyteller
    headerLayout: dataHeaderLayout,
    skillDisplayStyle: dataSkillDisplayStyle,
    sectionSpacing = 4, // Default spacing
    portfolioBackgroundColor: dataPortfolioBackgroundColor, // Used by Visual and Blank
    skillIconChipBackgroundColor: dataSkillChipBg,
    skillIconChipTextColor: dataSkillChipText,
    resumeUrl,
  } = portfolioData;

  const sectionMarginClass = getMarginBottomClass(sectionSpacing);

  let finalHeadingColor, finalBodyTextColor, finalAccentColor, finalSecondaryAccentColor,
      finalSkillChipBg, finalSkillChipText, livePreviewBackgroundStyle = {},
      portfolioContainerClasses = "portfolio-display-container mx-auto", // Common base
      currentFontFamily = dataFontFamily || 'Inter, sans-serif',
      currentHeaderLayout = dataHeaderLayout,
      currentSkillDisplayStyle = dataSkillDisplayStyle,
      currentTagline = tagline;

  if (templateId === 'style-coder-min') {
    finalHeadingColor = dataHeadingColor || CODER_MIN_DEFAULTS.headingColor;
    finalBodyTextColor = dataBodyTextColor || CODER_MIN_DEFAULTS.bodyTextColor;
    finalAccentColor = dataAccentColor || CODER_MIN_DEFAULTS.accentColor;
    finalSecondaryAccentColor = dataSecondaryAccentColor || CODER_MIN_DEFAULTS.secondaryAccentColor;
    livePreviewBackgroundStyle = { backgroundColor: dataPortfolioBackgroundColor || CODER_MIN_DEFAULTS.backgroundColor };
    portfolioContainerClasses += " p-6 md:p-10 lg:p-16 font-['Inter',_sans-serif] max-w-5xl";
    currentFontFamily = dataFontFamily || CODER_MIN_DEFAULTS.fontFamily;
    currentHeaderLayout = dataHeaderLayout || CODER_MIN_DEFAULTS.headerLayout;
    currentSkillDisplayStyle = dataSkillDisplayStyle || CODER_MIN_DEFAULTS.skillDisplayStyle;
    finalSkillChipBg = dataSkillChipBg || CODER_MIN_DEFAULTS.skillIconChipBackgroundColor;
    finalSkillChipText = dataSkillChipText || CODER_MIN_DEFAULTS.skillIconChipTextColor;
    currentTagline = tagline || CODER_MIN_DEFAULTS.tagline;
  } else if (templateId === 'style-visual-heavy') {
    finalHeadingColor = dataHeadingColor || VISUAL_STORYTELLER_DEFAULTS.headingColor;
    finalBodyTextColor = dataBodyTextColor || VISUAL_STORYTELLER_DEFAULTS.bodyTextColor;
    finalAccentColor = dataAccentColor || VISUAL_STORYTELLER_DEFAULTS.accentColor;
    finalSecondaryAccentColor = dataSecondaryAccentColor || VISUAL_STORYTELLER_DEFAULTS.secondaryAccentColor;
    livePreviewBackgroundStyle = { backgroundColor: dataPortfolioBackgroundColor || VISUAL_STORYTELLER_DEFAULTS.backgroundColor };
    portfolioContainerClasses += " p-0 font-['Playfair_Display',_serif] max-w-5xl"; // Visual typically wants more width
    currentFontFamily = dataFontFamily || VISUAL_STORYTELLER_DEFAULTS.fontFamily;
    currentHeaderLayout = dataHeaderLayout || VISUAL_STORYTELLER_DEFAULTS.headerLayout;
    currentSkillDisplayStyle = dataSkillDisplayStyle || VISUAL_STORYTELLER_DEFAULTS.skillDisplayStyle;
    finalSkillChipBg = dataSkillChipBg || VISUAL_STORYTELLER_DEFAULTS.skillIconChipBackgroundColor;
    finalSkillChipText = dataSkillChipText || VISUAL_STORYTELLER_DEFAULTS.skillIconChipTextColor;
    currentTagline = tagline || VISUAL_STORYTELLER_DEFAULTS.tagline;
  } else if (templateId === 'blank') {
    if (backgroundType === 'theme') {
        const currentTheme = predefinedBackgroundThemes.find(t => t.id === selectedBackgroundTheme) || predefinedBackgroundThemes[0];
        livePreviewBackgroundStyle = currentTheme.style;
        finalHeadingColor = dataHeadingColor || currentTheme.headingColor;
        finalBodyTextColor = dataBodyTextColor || currentTheme.bodyTextColor;
        finalAccentColor = dataAccentColor || currentTheme.accentColor;
        finalSecondaryAccentColor = dataSecondaryAccentColor || currentTheme.secondaryAccentColor;
        finalSkillChipBg = dataSkillChipBg || currentTheme.skillIconChipBackgroundColor;
        finalSkillChipText = dataSkillChipText || currentTheme.skillIconChipTextColor;
        portfolioContainerClasses += " p-0 font-['Playfair_Display',_serif] max-w-5xl"; // This was likely meant for specific themes, adjusting default Blank padding later
    } else if (backgroundType === 'customImage' && customBackgroundImageUrl) {
        livePreviewBackgroundStyle = { backgroundImage: `url(${customBackgroundImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' };
        finalHeadingColor = dataHeadingColor || '#FFFFFF'; 
        finalBodyTextColor = dataBodyTextColor || '#E0E0E0'; 
        finalAccentColor = dataAccentColor || '#34D399';
        finalSecondaryAccentColor = dataSecondaryAccentColor || '#A78BFA';
        finalSkillChipBg = dataSkillChipBg || 'rgba(0,0,0,0.3)'; 
        finalSkillChipText = dataSkillChipText || '#FFFFFF';
    } else { // Default solid color for blank or fallback
        const defaultTheme = predefinedBackgroundThemes[0]; // Default dark
        livePreviewBackgroundStyle = { backgroundColor: dataPortfolioBackgroundColor || defaultTheme.style.backgroundColor }; // Allow custom solid color
        finalHeadingColor = dataHeadingColor || defaultTheme.headingColor;
        finalBodyTextColor = dataBodyTextColor || defaultTheme.bodyTextColor;
        finalAccentColor = dataAccentColor || defaultTheme.accentColor;
        finalSecondaryAccentColor = dataSecondaryAccentColor || defaultTheme.secondaryAccentColor;
        finalSkillChipBg = dataSkillChipBg || defaultTheme.skillIconChipBackgroundColor;
        finalSkillChipText = dataSkillChipText || defaultTheme.skillIconChipTextColor;
    }
    // General styling for 'blank' template container
    portfolioContainerClasses += " p-6 md:p-8 lg:p-12"; 
    currentFontFamily = dataFontFamily || 'Inter, sans-serif';
    currentHeaderLayout = dataHeaderLayout || 'image-top-center';
    currentSkillDisplayStyle = dataSkillDisplayStyle || 'icon-text-chip';
  } else { // Fallback for older/unknown templates
    livePreviewBackgroundStyle = { backgroundColor: '#111827' }; // Default dark background
    finalHeadingColor = dataHeadingColor || '#E5E7EB';
    finalBodyTextColor = dataBodyTextColor || '#D1D5DB';
    finalAccentColor = dataAccentColor || '#34D399';
    finalSecondaryAccentColor = dataSecondaryAccentColor || '#A78BFA';
    finalSkillChipBg = dataSkillChipBg || '#4A5568';
    finalSkillChipText = dataSkillChipText || '#F7FAFC';
    portfolioContainerClasses += " p-6 md:p-8 lg:p-12";
  }



  const renderHeader = () => {
    const socialLinks = (
        <div className={`flex items-center space-x-4 mt-3 ${currentHeaderLayout === 'image-top-center' || currentHeaderLayout === 'text-only-center' || currentHeaderLayout === 'hero-banner' ? 'justify-center' : 'justify-start'}`}>
            {linkedinUrl && <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn Profile" title="LinkedIn"><LinkedInIcon fill={finalAccentColor} className="w-5 h-5 md:w-6 md:h-6"/></a>}
            {githubUrl && <a href={githubUrl} target="_blank" rel="noopener noreferrer" aria-label="Other Link" title="External Link/GitHub"><GitHubIcon fill={finalAccentColor} className="w-5 h-5 md:w-6 md:h-6"/></a>}
        </div>
    );
  const resumeLinkTextColor = (currentHeaderLayout === 'hero-banner' && templateId === 'style-visual-heavy')
                                ? (heroImageUrl ? '#FFFFFF' : finalHeadingColor) // White on hero image, else heading color
                                : finalBodyTextColor;
  const resumeIconFillColor = (currentHeaderLayout === 'hero-banner' && templateId === 'style-visual-heavy')
                                ? (heroImageUrl ? '#FFFFFF' : finalAccentColor) // White icon on hero, else accent
                                : finalAccentColor;
    const resumeDownloadLink = resumeUrl && (
            <div className={`mt-3 ${currentHeaderLayout === 'image-top-center' || currentHeaderLayout === 'text-only-center' || currentHeaderLayout === 'hero-banner' ? 'text-center' : 'text-left'}`}>
                <a 
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="inline-flex items-center text-sm font-medium py-2 px-4 rounded-md transition-colors duration-150 hover:opacity-85"
                  style={{
                      color: resumeLinkTextColor,
                      backgroundColor: finalAccentColor ? `${finalAccentColor}30` : 'rgba(127,127,127,0.2)', // Slightly more visible background tint
                      border: `1px solid ${finalAccentColor || 'transparent'}`
                  }}
                >
                  <DownloadIcon fill={resumeIconFillColor} className="w-4 h-4 inline-block mr-2" />
                  Download Resume
                </a>
            </div>
        );

          

    if (currentHeaderLayout === 'hero-banner' && templateId === 'style-visual-heavy') {
      return (
        <div 
          className="relative text-white py-24 md:py-40 px-6 text-center bg-cover bg-center flex flex-col items-center justify-center" 
          style={{ 
            backgroundImage: heroImageUrl ? `url(${heroImageUrl})` : 'url(https://placehold.co/1200x600/2c3e50/ecf0f1?text=Your+Visual+Story)',
            minHeight: '60vh', 
            maxHeight: '85vh',
            // color: finalHeadingColor // Text color is handled by direct styling on h1/p
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-sm"></div> {/* Overlay for text readability */}
          <div className="relative z-10 max-w-3xl mx-auto">
            {name && <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-3" style={{ color: finalHeadingColor || '#FFFFFF' }}>{name}</h1>}
            {currentTagline && <p className="text-xl md:text-2xl lg:text-3xl mb-6" style={{ color: finalBodyTextColor || '#E0E0E0' }}>{currentTagline}</p>}
            {(linkedinUrl || githubUrl) && socialLinks}
            {resumeDownloadLink}
          </div>
        </div>
      );
    }
    
    const textContent = (
        <div className={`${currentHeaderLayout === 'image-left-text-right' ? 'text-left' : 'text-center'}`}>
            {name && <h1 className={`text-3xl md:text-4xl font-bold mb-1 ${currentHeaderLayout === 'image-left-text-right' ? '' : 'mx-auto'}`} style={{color: finalHeadingColor}}>{name}</h1>}
            {currentTagline && templateId === 'style-coder-min' && <p className="text-lg md:text-xl" style={{color: finalBodyTextColor}}>{currentTagline}</p>}
             {currentTagline && templateId !== 'style-coder-min' && templateId !== 'style-visual-heavy' && <p className="text-md md:text-lg" style={{color: finalBodyTextColor}}>{currentTagline}</p>} {/* Tagline for Blank template */}
            {(linkedinUrl || githubUrl) && socialLinks}
            {resumeDownloadLink}
        </div>
    );

    if (currentHeaderLayout === 'image-left-text-right') {
        return (
            <div className={`flex flex-col ${templateId === 'style-coder-min' ? 'md:flex-row md:items-center md:justify-between' : 'md:flex-row md:items-start'} text-left`}>
                {profilePicture && <img src={profilePicture} alt={name || "Profile"} className={`rounded-full object-cover border-4 shadow-lg flex-shrink-0 ${templateId === 'style-coder-min' ? 'w-20 h-20 md:w-24 md:h-24 self-center md:self-auto mb-4 md:mb-0 md:order-2' : 'w-24 h-24 md:w-32 md:h-32 mb-4 md:mb-0 md:mr-8'}`} style={{borderColor: finalAccentColor}} />}
                <div className={`flex-1 mt-2 md:mt-0 ${templateId === 'style-coder-min' ? 'md:order-1' : ''}`}>{textContent}</div>
            </div>
        );
    } else if (currentHeaderLayout === 'text-only-center') {
        return <div className="text-center py-4">{textContent}</div>;
    }
    // Default: image-top-center
    return (
        <div className="text-center">
            {profilePicture && <img src={profilePicture} alt={name || "Profile"} className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover mx-auto mb-4 border-4 shadow-lg" style={{borderColor: finalAccentColor}} />}
            {textContent}
        </div>
    );
  };

  const contentPaddingClass = (templateId === 'style-visual-heavy' && currentHeaderLayout === 'hero-banner') ? 
                            'p-6 md:p-8 lg:p-10' : // Padding for content below hero
                            (templateId === 'style-visual-heavy' ? 'p-0' : 'p-6 md:p-8 lg:p-12'); // p-0 for visual if no hero, else standard padding


  return (
    <div className={`${portfolioContainerClasses.replace('p-0', '')} ${(templateId === 'style-visual-heavy' && currentHeaderLayout !== 'hero-banner') ? 'p-0' : ''}`} // Ensure p-0 is only for visual-heavy full-width page, not just hero
      style={{
        ...livePreviewBackgroundStyle,
        fontFamily: currentFontFamily,
      }}
    >
      
      <div className={`${templateId === 'style-visual-heavy' && currentHeaderLayout === 'hero-banner' ? '' : (templateId === 'style-visual-heavy' ? '' : 'max-w-5xl mx-auto')}`}> {/* Max-width control */}
        {/* Header */}
        <div 
          className={`portfolio-header 
            ${currentHeaderLayout !== 'hero-banner' ? `pb-6 md:pb-8 border-b ${sectionMarginClass}` : ''}
            ${(currentHeaderLayout !== 'hero-banner' && templateId === 'style-coder-min') ? 'border-slate-700' : ''}
            ${(currentHeaderLayout !== 'hero-banner' && templateId === 'blank') ? (livePreviewBackgroundStyle.backgroundColor === '#F3F4F6' || livePreviewBackgroundStyle.backgroundColor === '#FFFFFF' ? 'border-gray-300' : 'border-gray-700') : ''}
            ${(currentHeaderLayout !== 'hero-banner' && templateId === 'style-visual-heavy') ? `border-b-2 pb-8 ${sectionMarginClass}` : ''}
            ${(currentHeaderLayout !== 'hero-banner' && templateId === 'style-visual-heavy') ? contentPaddingClass : ''} /* Add padding if not hero */
            `}
          style={{ borderColor: (currentHeaderLayout !== 'hero-banner' && templateId !== 'style-coder-min' && templateId !== 'blank' && !(templateId === 'style-visual-heavy' && livePreviewBackgroundStyle.backgroundColor && (livePreviewBackgroundStyle.backgroundColor ===VISUAL_STORYTELLER_DEFAULTS.backgroundColor || livePreviewBackgroundStyle.backgroundColor === '#FFFFFF'))) ? finalAccentColor : undefined }}
        >
          {renderHeader()}
        </div>

        <div className={contentPaddingClass}> {/* Apply padding to content sections */}
            {aboutMe && (
                <div className={`portfolio-about ${sectionMarginClass}`}>
                <h2 className="text-2xl md:text-3xl font-semibold mb-3 md:mb-4" style={{color: finalHeadingColor}}>
                    {templateId === 'style-visual-heavy' ? 'My Story / Approach' : 'About Me'}
                </h2>
                <div
                    className={`rich-text-content prose prose-sm md:prose-base max-w-none ${templateId === 'style-coder-min' || (templateId === 'style-visual-heavy' && heroImageUrl) || (templateId === 'blank' && (livePreviewBackgroundStyle.backgroundColor === '#374151' || livePreviewBackgroundStyle.backgroundImage)) || (templateId === 'style-visual-heavy' && livePreviewBackgroundStyle.backgroundColor !== VISUAL_STORYTELLER_DEFAULTS.backgroundColor && livePreviewBackgroundStyle.backgroundColor !== '#FFFFFF' && !heroImageUrl) ? 'prose-invert prose-p:text-slate-300 prose-headings:text-slate-100 prose-strong:text-slate-50 prose-a:text-emerald-400 hover:prose-a:text-emerald-300' : 'prose-p:text-slate-700 prose-headings:text-slate-800 prose-strong:text-slate-900 prose-a:text-blue-600 hover:prose-a:text-blue-500'} prose-p:my-2 prose-headings:my-3`}
                    style={{color: (templateId !== 'style-coder-min' && !(templateId === 'style-visual-heavy' && heroImageUrl) && !(templateId === 'blank' && (livePreviewBackgroundStyle.backgroundColor === '#374151' || livePreviewBackgroundStyle.backgroundImage)) && !(templateId === 'style-visual-heavy' && livePreviewBackgroundStyle.backgroundColor !== VISUAL_STORYTELLER_DEFAULTS.backgroundColor && livePreviewBackgroundStyle.backgroundColor !== '#FFFFFF' && !heroImageUrl) ) ? finalBodyTextColor : undefined }}
                    dangerouslySetInnerHTML={{ __html: aboutMe }}
                />
                </div>
            )}

            {skills && skills.length > 0 && (
                <div className={`portfolio-skills ${sectionMarginClass}`}>
                <h2 className="text-2xl md:text-3xl font-semibold mb-4 md:mb-6" style={{color: finalHeadingColor}}>
                    {templateId === 'style-visual-heavy' ? 'Tools & Expertise' : 'Skills'}
                </h2>
                {currentSkillDisplayStyle === 'text-only-list' ? (
                    <ul className="space-y-2">
                    {skills.map((skillObj, index) => (
                        <li key={`skill-list-${index}-${skillObj.id || skillObj.name}`} 
                            className={`flex items-center justify-between p-3 rounded-md ${templateId === 'style-coder-min' ? 'bg-slate-800 border border-slate-700 hover:border-emerald-500/50' : (templateId === 'blank' && (livePreviewBackgroundStyle.backgroundColor ==='#374151' || livePreviewBackgroundStyle.backgroundImage) ? 'bg-white/10 dark:bg-slate-700/50 border border-slate-600/50' : (templateId === 'blank' ? 'bg-slate-100 border border-slate-200' : 'bg-transparent'))}`}
                        >
                        <SkillDisplay
                            skillName={skillObj.name}
                            level={skillObj.level}
                            fallbackTextColor={finalBodyTextColor}
                            displayStyle={'text-only-list'}
                            accentColor={finalAccentColor}
                            templateId={templateId}
                            skillChipBg={finalSkillChipBg}
                            skillChipText={finalSkillChipText}
                        />
                        </li>
                    ))}
                    </ul>
                ) : (
                    <ul className={`flex flex-wrap gap-3 md:gap-4 ${templateId === 'style-visual-heavy' ? 'justify-center' : 'items-stretch'}`}>
                    {skills.map((skillObj, index) => (
                        <li
                        key={`skill-chip-${index}-${skillObj.id || skillObj.name}`}
                        className="group flex flex-col items-center justify-center p-3 rounded-xl shadow-lg transition-all duration-200 ease-in-out hover:shadow-xl hover:scale-105"
                        style={{ backgroundColor: finalSkillChipBg, border: `1px solid ${finalSkillChipBg === '#ffffff' || finalSkillChipBg === '#E5E7EB' || finalSkillChipBg === '#F3F4F6' ? 'rgba(0,0,0,0.1)' : finalAccentColor }`}}
                        title={`${skillObj.name}${skillObj.level ? ` - ${skillObj.level}` : ''}`}
                        >
                        <SkillDisplay
                            skillName={skillObj.name}
                            level={skillObj.level}
                            fallbackTextColor={finalSkillChipText}
                            displayStyle={currentSkillDisplayStyle}
                            accentColor={finalAccentColor}
                            templateId={templateId}
                            skillChipBg={finalSkillChipBg}
                            skillChipText={finalSkillChipText}
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
                        <h2 className="text-2xl md:text-3xl font-semibold mb-4" style={{color: finalHeadingColor}}>
                            {section.sectionTitle}
                        </h2>
                    )}
                    {section.items && section.items.length > 0 && (
                        <div className="space-y-4 md:space-y-6">
                            {section.items.map((item, itemIndex) => (
                                <div key={item.id || `custom-item-${sectionIndex}-${itemIndex}`} 
                                    className={`custom-section-item ml-0 pl-4 border-l-2 md:border-l-4 py-3`}
                                    style={{borderColor: finalAccentColor}}>
                                    {item.itemTitle && (
                                        <h3 className="text-lg md:text-xl font-semibold mb-1" style={{color: finalHeadingColor }}>
                                            {item.itemTitle}
                                        </h3>
                                    )}
                                    {item.itemDetails && (
                                        <div
                                            className={`rich-text-content prose prose-sm md:prose-base max-w-none ${templateId === 'style-coder-min' || (templateId === 'style-visual-heavy' && heroImageUrl) || (templateId === 'blank' && (livePreviewBackgroundStyle.backgroundColor === '#374151' || livePreviewBackgroundStyle.backgroundImage)) || (templateId === 'style-visual-heavy' && livePreviewBackgroundStyle.backgroundColor !== VISUAL_STORYTELLER_DEFAULTS.backgroundColor && livePreviewBackgroundStyle.backgroundColor !== '#FFFFFF' && !heroImageUrl) ? 'prose-invert prose-p:text-slate-300 prose-headings:text-slate-100 prose-strong:text-slate-50 prose-a:text-emerald-400 hover:prose-a:text-emerald-300' : 'prose-p:text-slate-700 prose-headings:text-slate-800 prose-strong:text-slate-900 prose-a:text-blue-600 hover:prose-a:text-blue-500'} prose-p:my-1 prose-ul:my-1 prose-ol:my-1`}
                                            style={{color: (templateId !== 'style-coder-min' && !(templateId === 'style-visual-heavy' && heroImageUrl) && !(templateId === 'blank' && (livePreviewBackgroundStyle.backgroundColor === '#374151' || livePreviewBackgroundStyle.backgroundImage)) && !(templateId === 'style-visual-heavy' && livePreviewBackgroundStyle.backgroundColor !== VISUAL_STORYTELLER_DEFAULTS.backgroundColor && livePreviewBackgroundStyle.backgroundColor !== '#FFFFFF' && !heroImageUrl) ) ? finalBodyTextColor : undefined }}
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
                <h2 className="text-2xl md:text-3xl font-semibold mb-4 md:mb-6 " style={{color: finalHeadingColor}}>
                    {templateId === 'style-visual-heavy' ? 'Selected Works' : 'Projects'}
                </h2>
                <div className={`grid grid-cols-1 ${templateId === 'style-visual-heavy' ? 'gap-6 md:gap-8': 'md-grid-cols-2 gap-6 lg-gap-8'} : (templateId === 'style-coder-min' || templateId === 'blank' ? 'gap-6 md:gap-8' : 'md:grid-cols-2 gap-6 lg:gap-8')}`}>
                {projects.map((project, index) => (
                    (project.title || project.description || project.thumbnailUrl || project.liveDemoUrl || project.sourceCodeUrl || project.videoUrl) && (
                    <div 
                        key={project.id || `project-preview-${index}`} 
                        className={`portfolio-project rounded-lg shadow-lg overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl
                                ${templateId === 'style-coder-min' ? 'bg-slate-800 border border-slate-700 hover:border-emerald-500/70' 
                                    : (templateId === 'style-visual-heavy' ? (heroImageUrl || livePreviewBackgroundStyle.backgroundImage || livePreviewBackgroundStyle.backgroundColor !== VISUAL_STORYTELLER_DEFAULTS.backgroundColor ? 'bg-white dark:bg-slate-800' : 'bg-white border border-gray-200')
                                        : (templateId === 'blank' && (livePreviewBackgroundStyle.backgroundColor === '#F3F4F6' || livePreviewBackgroundStyle.backgroundColor === '#FFFFFF') ? 'bg-white border border-gray-200' : 'bg-slate-800 dark:bg-slate-800/50' ) )}`}
                    >
                      {project.thumbnailUrl && (templateId === 'style-coder-min') && (
                        <div className={`relative ${templateId === 'style-coder-min' ? 'aspect-w-4 aspect-h-3 max-h-72 sm:max-h-80 md:max-h-96' : 'h-48 md:h-56'}`}>
                            <img
                            src={project.thumbnailUrl}
                            alt={`${project.title || 'Project'} thumbnail`}
                            className="w-full h-full object-cover" 
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                        </div>
                    )}
                    {project.thumbnailUrl && (templateId === 'style-visual-heavy' || templateId !== 'style-coder-min') && (
                        <div className={`relative ${templateId === 'style-visual-heavy' ? 'aspect-w-4 aspect-h-3 max-h-72 sm:max-h-80 md:max-h-96' : 'h-48 md:h-56'}`}>
                            <img
                            src={project.thumbnailUrl}
                            alt={`${project.title || 'Project'} thumbnail`}
                            className="w-full h-full object-cover" 
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                        </div>
                    )}
                    <div className="p-4 md:p-6 flex flex-col flex-grow">
                        {/* THIS IS THE MODIFIED LINE for project title */}
                        {project.title && <h3 className="text-xl md:text-2xl font-bold mb-2" style={{color: finalHeadingColor}}>{project.title}</h3>}

                        {project.description && (
                        <div
                            className={`text-sm md:text-base mb-3 md:mb-4 rich-text-content prose prose-sm ${templateId === 'style-coder-min' || (templateId === 'style-visual-heavy' && heroImageUrl) || (templateId === 'blank' && (livePreviewBackgroundStyle.backgroundColor === '#374151' || livePreviewBackgroundStyle.backgroundImage)) || (templateId === 'style-visual-heavy' && livePreviewBackgroundStyle.backgroundColor !== VISUAL_STORYTELLER_DEFAULTS.backgroundColor && livePreviewBackgroundStyle.backgroundColor !== '#FFFFFF' && !heroImageUrl) ? 'prose-invert text-slate-400 max-w-none prose-p:text-slate-400 prose-headings:text-slate-200 prose-strong:text-slate-100 prose-a:text-emerald-400 hover:prose-a:text-emerald-300' : 'prose-p:text-slate-700 prose-headings:text-slate-800 prose-strong:text-slate-900 prose-a:text-blue-600 hover:prose-a:text-blue-500 '}`}
                            style={{color: (templateId !== 'style-coder-min' && !(templateId === 'style-visual-heavy' && heroImageUrl) && !(templateId === 'blank' && (livePreviewBackgroundStyle.backgroundColor === '#374151' || livePreviewBackgroundStyle.backgroundImage)) && !(templateId === 'style-visual-heavy' && livePreviewBackgroundStyle.backgroundColor !== VISUAL_STORYTELLER_DEFAULTS.backgroundColor && livePreviewBackgroundStyle.backgroundColor !== '#FFFFFF' && !heroImageUrl) ) ? finalBodyTextColor : undefined}}
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

                        {project.videoUrl && (templateId === 'style-visual-heavy' || templateId !== 'style-coder-min') && getEmbedUrl(project.videoUrl) && (
                            <div className="aspect-w-16 aspect-h-9 my-4 rounded overflow-hidden shadow-inner">
                                <iframe
                                src={getEmbedUrl(project.videoUrl)}
                                title={`${project.title || 'Project'} Video`}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="w-full h-full"
                                ></iframe>
                            </div>
                        )}

                        <div className="flex flex-wrap gap-3 mt-auto pt-4 border-t" 
                                style={{borderColor: (templateId === 'style-coder-min' ? '#334155' : (templateId === 'style-visual-heavy' && (heroImageUrl || livePreviewBackgroundStyle.backgroundImage || livePreviewBackgroundStyle.backgroundColor !== VISUAL_STORYTELLER_DEFAULTS.backgroundColor) ? finalBodyTextColor : (templateId === 'blank' && (livePreviewBackgroundStyle.backgroundColor === '#F3F4F6' || livePreviewBackgroundStyle.backgroundColor === '#FFFFFF') ? '#e5e7eb' : finalAccentColor) ) )}}>
                        {project.liveDemoUrl && (
                            <a
                            href={project.liveDemoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-block text-xs sm:text-sm font-semibold py-2 px-3 rounded-md transition-colors duration-150 hover:opacity-85
                                    ${templateId === 'style-visual-heavy' && (heroImageUrl || livePreviewBackgroundStyle.backgroundImage || livePreviewBackgroundStyle.backgroundColor !== VISUAL_STORYTELLER_DEFAULTS.backgroundColor) ? 'bg-opacity-80 hover:bg-opacity-100 text-white' : 'text-white'}`}
                            style={{backgroundColor: finalAccentColor}}
                            >
                            {templateId === 'style-visual-heavy' ? 'View Project' : 'Live Demo'}
                            </a>
                        )}
                        {project.sourceCodeUrl && (
                            <a
                            href={project.sourceCodeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-block text-xs sm:text-sm font-semibold py-2 px-3 rounded-md transition-colors duration-150 
                                    ${templateId === 'style-coder-min' ? 'bg-slate-600 hover:bg-slate-500 text-slate-200' 
                                        : (templateId === 'style-visual-heavy' && (heroImageUrl || livePreviewBackgroundStyle.backgroundImage || livePreviewBackgroundStyle.backgroundColor !== VISUAL_STORYTELLER_DEFAULTS.backgroundColor) ? `border border-current text-current hover:bg-current hover:text-[${finalSkillChipBg}]` // Use current for text, relies on parent text color
                                            : (templateId === 'style-visual-heavy' ? `border border-[${finalAccentColor}] text-[${finalAccentColor}] hover:bg-[${finalAccentColor}] hover:text-white`
                                            : 'bg-slate-500 hover:bg-slate-600 text-white'))}`}
                            style={ 
                                templateId === 'style-visual-heavy' && (heroImageUrl || livePreviewBackgroundStyle.backgroundImage || livePreviewBackgroundStyle.backgroundColor !== VISUAL_STORYTELLER_DEFAULTS.backgroundColor) ? 
                                { color: finalBodyTextColor, borderColor: finalBodyTextColor } :
                                (templateId === 'style-visual-heavy' ? 
                                    { borderColor: finalAccentColor, color: finalAccentColor} : 
                                    {backgroundColor: finalSecondaryAccentColor || '#64748B'}) 
                            }
                            onMouseOver={(e) => { 
                                if(templateId === 'style-visual-heavy' && (heroImageUrl || livePreviewBackgroundStyle.backgroundImage || livePreviewBackgroundStyle.backgroundColor !== VISUAL_STORYTELLER_DEFAULTS.backgroundColor)) { 
                                    e.currentTarget.style.backgroundColor = finalBodyTextColor; 
                                    e.currentTarget.style.color = finalSkillChipBg || '#FFFFFF'; // Use chip bg for text on hover
                                } else if (templateId === 'style-visual-heavy') {
                                    e.currentTarget.style.backgroundColor = finalAccentColor; e.currentTarget.style.color = '#FFFFFF';
                                }
                            }}
                            onMouseOut={(e) => { 
                                if(templateId === 'style-visual-heavy' && (heroImageUrl || livePreviewBackgroundStyle.backgroundImage || livePreviewBackgroundStyle.backgroundColor !== VISUAL_STORYTELLER_DEFAULTS.backgroundColor)) { 
                                    e.currentTarget.style.backgroundColor = 'transparent'; 
                                    e.currentTarget.style.color = finalBodyTextColor;
                                } else if (templateId === 'style-visual-heavy') {
                                    e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = finalAccentColor;
                                }
                            }}

                            >
                            {templateId === 'style-visual-heavy' ? 'Learn More' : 'Source Code'}
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

            {(!name && !profilePicture && !heroImageUrl && !aboutMe && (!skills || skills.length === 0) && (!customSections || customSections.length === 0) && (!projects || !projects.some(p => p.title || p.description))) && (
                <p className="text-center text-lg py-10" style={{color: finalBodyTextColor}}>This portfolio is currently empty. Add some content in the editor!</p>
            )}
        </div>
    </div>
    </div>
  );
}

export default PortfolioDisplay;