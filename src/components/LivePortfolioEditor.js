import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// import './LivePortfolioEditor.css'; // Assuming Tailwind handles most styling
import { storage, db, auth } from './firebase'; 
import { doc, getDoc, addDoc, updateDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

// Import Skill Icons and PortfolioDisplay (ensure paths are correct)
/* import { 
    ReactIcon, 
    JavaScriptIcon, 
    PythonIcon, 
    HtmlIcon, 
    CssIcon, 
    GenericSkillIcon 
} from './icons/SkillIcons';  */
import PortfolioDisplay from './PortfolioDisplay'; 

// Social Icons & Remove Icon (Consider moving to a shared icons file)
/* const LinkedInIcon = ({ fill }) => ( 
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={fill} className="transition-opacity hover:opacity-75">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
  </svg>
);
const GitHubIcon = ({ fill }) => ( /* ... SVG ... 
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={fill} className="transition-opacity hover:opacity-75">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
); */
const RemoveIcon = ({ className = "w-4 h-4" }) => ( /* ... SVG ... */ 
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12.56 0c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
  </svg>
);

// Font and other option definitions
const fontOptions = [ /* ... */ 
    { name: 'System Default', value: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"' },
    { name: 'Arial', value: 'Arial, Helvetica, sans-serif' },
    { name: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
    { name: 'Georgia', value: 'Georgia, serif' },
    { name: 'Times New Roman', value: '"Times New Roman", Times, serif' },
    { name: 'Roboto', value: "'Roboto', sans-serif" },
    { name: 'Open Sans', value: "'Open Sans', sans-serif" },
    { name: 'Lato', value: "'Lato', sans-serif" },
    { name: 'Montserrat', value: "'Montserrat', sans-serif" },
    { name: 'Source Code Pro', value: "'Source Code Pro', monospace" },
];
const headerLayoutOptions = [ /* ... */ 
    { id: 'image-top-center', name: 'Image Top, Text Centered' },
    { id: 'image-left-text-right', name: 'Image Left, Text Right' },
    { id: 'text-only-center', name: 'Text Only, Centered' },
];
const skillDisplayOptions = [ 
    { id: 'icon-text-chip', name: 'Icon & Text (Chip)' }, 
    { id: 'icon-only-chip', name: 'Icon Only (Chip)' },
    { id: 'text-only-list', name: 'Text Only (List)' },
];
// Default colors for styled templates (can be overridden by template-specific defaults or user choices)
const defaultStyledHeadingColor = '#1F2937'; 
const defaultStyledBodyTextColor = '#374151';
const defaultStyledAccentColor = '#059669'; 

const createNewProject = () => ({
    id: Date.now(), title: '', description: '', 
    thumbnailUrl: '', thumbnailFile: null, isUploadingThumbnail: false, thumbnailUploadProgress: 0,
    liveDemoUrl: '', sourceCodeUrl: '', videoUrl: ''
});

function LivePortfolioEditor() {
    // Use 'portfolioId' for editing, 'templateIdFromUrl' for creating new from a template
    const { templateIdFromUrl, portfolioId } = useParams(); 
    const id = portfolioId; 
    const navigate = useNavigate();

    console.log("[LivePortfolioEditor Init] Params: portfolioId (for editing) =", id, ", templateIdFromUrl (for new from template) =", templateIdFromUrl);

    const [name, setName] = useState('');
    const [profilePicture, setProfilePicture] = useState('');
    const [profilePictureFile, setProfilePictureFile] = useState(null); 
    const [linkedinUrl, setLinkedinUrl] = useState('');
    const [githubUrl, setGithubUrl] = useState('');
    const [aboutMe, setAboutMe] = useState('');
    const [projects, setProjects] = useState([createNewProject()]);
    const [skills, setSkills] = useState([]);
    const [newSkill, setNewSkill] = useState('');

    // Customization states
    const [fontFamily, setFontFamily] = useState(fontOptions[0].value); 
    const [headingColor, setHeadingColor] = useState(defaultStyledHeadingColor);
    const [bodyTextColor, setBodyTextColor] = useState(defaultStyledBodyTextColor);
    const [accentColor, setAccentColor] = useState(defaultStyledAccentColor);
    const [headerLayout, setHeaderLayout] = useState(headerLayoutOptions[0].id); 
    const [skillDisplayStyle, setSkillDisplayStyle] = useState(skillDisplayOptions[0].id);
    const [sectionSpacing, setSectionSpacing] = useState(4); 

    // MODIFIED: Correctly declare and initialize activeTemplateIdForPreview
    const [activeTemplateIdForPreview, setActiveTemplateIdForPreview] = useState(templateIdFromUrl || null);

    const [projectsVisible, setProjectsVisible] = useState(false); 
    const [skillsVisible, setSkillsVisible] = useState(false);   
    const [customizeVisible, setCustomizeVisible] = useState(true); 

    const MAX_PROJECT_THUMBNAIL_SIZE = 2 * 1024 * 1024; 
    const MAX_PROFILE_PIC_SIZE = 5 * 1024 * 1024;       
    
    const [isUploadingProfilePic, setIsUploadingProfilePic] = useState(false); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // For styled templates, the background is usually part of the template itself.
    // These are kept for consistency if PortfolioDisplay expects them, but won't be user-editable here.
/*     const backgroundType = 'template'; // Fixed for styled templates
    const selectedBackgroundTheme = null;
    const customBackgroundImageUrl = ''; */


    const loadPortfolioData = useCallback(async () => {
        setLoading(true);
        setError(null); 
        if (id) { // Editing existing portfolio
            try {
                const portfolioRef = doc(db, 'portfolios', id);
                const docSnap = await getDoc(portfolioRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setName(data.name || '');
                    setProfilePicture(data.profilePicture || '');
                    setLinkedinUrl(data.linkedinUrl || '');
                    setGithubUrl(data.githubUrl || '');
                    setAboutMe(data.aboutMe || '');
                    setProjects(
                        Array.isArray(data.projects) && data.projects.length > 0 
                        ? data.projects.map(p => ({ ...createNewProject(), ...p, thumbnailFile: null, isUploadingThumbnail: false, thumbnailUploadProgress: 0 }))
                        : [createNewProject()]
                    );
                    setSkills(Array.isArray(data.skills) ? data.skills : []);
                    
                    setFontFamily(data.fontFamily || fontOptions[0].value);
                    setHeadingColor(data.headingColor || defaultStyledHeadingColor);
                    setBodyTextColor(data.bodyTextColor || defaultStyledBodyTextColor);
                    setAccentColor(data.accentColor || defaultStyledAccentColor);
                    setHeaderLayout(data.headerLayout || headerLayoutOptions[0].id);
                    setSkillDisplayStyle(data.skillDisplayStyle || skillDisplayOptions[0].id);
                    setSectionSpacing(data.sectionSpacing !== undefined ? data.sectionSpacing : 4);
                    
                    setActiveTemplateIdForPreview(data.templateId); // Load the base template ID
                } else { setError('Portfolio not found!'); }
            } catch (err) { setError(err.message || 'Failed to load portfolio data.');
            } finally { setLoading(false); }
        } else if (templateIdFromUrl) { // Creating new styled portfolio
            setActiveTemplateIdForPreview(templateIdFromUrl);
            // Initialize with defaults (these can be overridden by template-specific defaults if needed)
            setFontFamily(fontOptions[0].value);
            setHeadingColor(defaultStyledHeadingColor);
            setBodyTextColor(defaultStyledBodyTextColor);
            setAccentColor(defaultStyledAccentColor);
            setHeaderLayout(headerLayoutOptions[0].id);
            setSkillDisplayStyle(skillDisplayOptions[0].id);
            setSectionSpacing(4);
            setProjects([createNewProject()]);
            setLoading(false);
        } else {
             setError("Cannot load editor: Missing portfolio or template information."); setLoading(false);
        }
    }, [id, templateIdFromUrl]); 

    useEffect(() => { loadPortfolioData(); }, [loadPortfolioData]);

    const handleAddProject = () => setProjects([...projects, createNewProject()]);
    const handleProjectChange = (index, field, value) => setProjects(projects.map((p, i) => i === index ? { ...p, [field]: value } : p));
    const handleRemoveProject = (projectId) => setProjects(projects.filter(p => p.id !== projectId));
    const toggleProjects = () => setProjectsVisible(!projectsVisible);
    const toggleCustomize = () => setCustomizeVisible(!customizeVisible);
    const toggleSkills = () => setSkillsVisible(!skillsVisible); 
    const arrowDown = '▼'; const arrowUp = '▲';

    const handleProjectThumbnailChange = async (projectIndex, event) => { /* ... same as in LiveBlankPortfolioEditor ... */ 
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.size > MAX_PROJECT_THUMBNAIL_SIZE) {
            alert(`Project thumbnail size too large. Max ${MAX_PROJECT_THUMBNAIL_SIZE / (1024 * 1024)}MB.`);
            event.target.value = ''; 
            return;
        }
        const updatedProjects = [...projects];
        const currentProject = updatedProjects[projectIndex];
        currentProject.thumbnailFile = file;
        currentProject.isUploadingThumbnail = true;
        currentProject.thumbnailUploadProgress = 0;
        const reader = new FileReader();
        reader.onloadend = () => {
            updatedProjects[projectIndex].thumbnailUrl = reader.result; 
            setProjects(updatedProjects);
        };
        reader.readAsDataURL(file);
        setError(null); 
        try {
            const storagePath = `projectThumbnails/${auth.currentUser.uid}/${currentProject.id || Date.now()}/${file.name}`;
            const storageRefFirebase = ref(storage, storagePath);
            const uploadTask = uploadBytesResumable(storageRefFirebase, file);
            uploadTask.on('state_changed', 
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setProjects(prevProjects => prevProjects.map((p, idx) => 
                        idx === projectIndex ? { ...p, thumbnailUploadProgress: progress } : p
                    ));
                },
                (uploadError) => {
                    setError(`Failed to upload thumbnail for Project ${projectIndex + 1}.`);
                    setProjects(prevProjects => prevProjects.map((p, idx) => 
                        idx === projectIndex ? { ...p, isUploadingThumbnail: false, thumbnailFile: null } : p
                    ));
                },
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    setProjects(prevProjects => prevProjects.map((p, idx) => 
                        idx === projectIndex ? { ...p, thumbnailUrl: downloadURL, isUploadingThumbnail: false, thumbnailFile: null } : p
                    ));
                }
            );
        } catch (initUploadError) {
            setError(`Failed to start thumbnail upload for Project ${projectIndex + 1}.`);
            setProjects(prevProjects => prevProjects.map((p, idx) => 
                idx === projectIndex ? { ...p, isUploadingThumbnail: false } : p
            ));
        }
    };

    const handleSavePortfolio = async () => {
        if (!auth.currentUser) { setError("You must be logged in to save."); return; }
        if (isUploadingProfilePic || (profilePictureFile && profilePicture.startsWith('data:'))) { 
            setError("Profile picture is still uploading. Please wait."); setLoading(false); return; 
        }
        if (projects.some(p => p.isUploadingThumbnail || (p.thumbnailFile && p.thumbnailUrl.startsWith('data:')))) {
            setError("One or more project thumbnails are still uploading or haven't finished. Please wait."); setLoading(false); return;
        }
        setLoading(true); setError(null); 

        const projectsToSave = projects.map(p => ({
            id: p.id, title: p.title, description: p.description,
            thumbnailUrl: p.thumbnailUrl && !p.thumbnailUrl.startsWith('data:') ? p.thumbnailUrl : '', 
            videoUrl: p.videoUrl || '',
            liveDemoUrl: p.liveDemoUrl || '',
            sourceCodeUrl: p.sourceCodeUrl || ''
        }));

        const portfolioData = {
            userId: auth.currentUser.uid, 
            templateId: activeTemplateIdForPreview, // This is the ID of the styled template
            name, profilePicture, linkedinUrl, githubUrl, aboutMe, 
            projects: projectsToSave, 
            fontFamily, headingColor, bodyTextColor, accentColor, headerLayout, 
            skills, skillDisplayStyle, sectionSpacing,
            projectsVisible, customizeVisible, skillsVisible, 
            lastUpdated: serverTimestamp(),
            // No backgroundType, selectedBackgroundTheme, customBackgroundImageUrl for styled templates
        };
        console.log("[LivePortfolioEditor Save] Saving data:", portfolioData);
        try {
            let newPortfolioId = id;
            if (id) { 
                await updateDoc(doc(db, 'portfolios', id), portfolioData);
            } else { 
                const docRef = await addDoc(collection(db, 'portfolios'), portfolioData);
                newPortfolioId = docRef.id;
            }
            if (!id && newPortfolioId) { 
                navigate(`/edit-styled/${newPortfolioId}`, { replace: true }); 
            } else {
                navigate('/dashboard');
            }
        } catch (error) {
            setError(error.message || 'Failed to save portfolio data.');
        } finally {
            setLoading(false); 
        }
    };

    const handleProfilePictureChange = async (event) => { /* ... same as before ... */ 
        const file = event.target.files?.[0];
        if (!file) return;
        if (file.size > MAX_PROFILE_PIC_SIZE) { 
            alert(`Max profile picture size is ${MAX_PROFILE_PIC_SIZE / (1024 * 1024)}MB.`);
            event.target.value = ''; return;
        }
        setProfilePictureFile(file); 
        const reader = new FileReader();
        reader.onloadend = () => setProfilePicture(reader.result);
        reader.readAsDataURL(file);
        setIsUploadingProfilePic(true); setError(null);
        try {
            const storageRefFirebase = ref(storage, `profilePictures/${auth.currentUser.uid}/${Date.now()}_${file.name}`);
            const uploadTask = uploadBytesResumable(storageRefFirebase, file);
            uploadTask.on('state_changed', (snapshot) => {},
                (uploadError) => {
                    setError("Profile Pic Upload failed: " + uploadError.message);
                    setIsUploadingProfilePic(false); setProfilePictureFile(null); setProfilePicture('');
                },
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    setProfilePicture(downloadURL); 
                    setIsUploadingProfilePic(false); setProfilePictureFile(null); 
                }
            );
        } catch (initUploadError) {
            setError("Profile Pic Upload failed to start.");
            setIsUploadingProfilePic(false); setProfilePictureFile(null);
        }
    };
    const handleAddSkill = () => { /* ... same as before ... */ 
        if (newSkill.trim() && !skills.includes(newSkill.trim())) {
            setSkills([...skills, newSkill.trim()]); 
            setNewSkill('');
        }
    };
    const handleRemoveSkill = (skillToRemove) => setSkills(skills.filter(skill => skill !== skillToRemove));
    const handleViewLivePortfolio = () => { /* ... same as before ... */ 
        if (id) { 
            navigate(`/portfolio/${id}`);
        } else {
            setError("Please save the portfolio first to view it live.");
        }
    };

    // ... (Loading and Error return JSX remains the same) ...
    if (loading) return <div className="flex justify-center items-center min-h-screen text-xl text-slate-300">Loading Editor...</div>;
    if (error) return ( 
        <div className="flex flex-col justify-center items-center min-h-screen text-red-400 p-4">
            <h2 className="text-2xl mb-4">Something went wrong</h2>
            <p className="mb-4">{error}</p>
            <div className="flex space-x-4">
                <button onClick={() => { setError(null); loadPortfolioData(); }} className="bg-emerald-500 text-white py-2 px-4 rounded-lg hover:bg-emerald-600">Try again</button>
                <button onClick={() => navigate('/dashboard')} className="bg-slate-600 text-white py-2 px-4 rounded-lg hover:bg-slate-700">Go to Dashboard</button>
            </div>
        </div>
    );

    const inputClasses = "shadow-inner appearance-none border border-slate-700 rounded w-full py-3 px-4 bg-slate-700 text-slate-100 leading-tight focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-slate-500";
    const labelClasses = "block text-slate-300 text-sm font-semibold mb-2";
    const sectionHeaderClasses = "text-2xl font-semibold text-emerald-400 mb-3 cursor-pointer flex justify-between items-center";
    const buttonClasses = "bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 px-4 rounded-lg text-sm shadow-md transition-colors";
    const secondaryButtonClasses = "bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg text-sm shadow-md transition-colors";
    const smallButtonClasses = "text-xs py-1 px-2 rounded-md";
    
    let saveButtonText = id ? 'Update Portfolio' : 'Save Portfolio';
    if (isUploadingProfilePic) saveButtonText = 'Uploading Pic...';
    else if (projects.some(p => p.isUploadingThumbnail)) saveButtonText = 'Uploading Project Thumbnails...';
    else if (loading) saveButtonText = 'Saving...'; 

    const portfolioDataForPreview = {
        name, profilePicture, linkedinUrl, githubUrl, aboutMe, projects, skills,
        fontFamily, headingColor, bodyTextColor, accentColor,
        templateId: activeTemplateIdForPreview, // Pass the active styled template ID
        // No backgroundType, selectedBackgroundTheme, customBackgroundImageUrl for styled templates (handled by template itself in PortfolioDisplay)
        headerLayout, skillDisplayStyle, sectionSpacing,
    };

    return (
        <div className="live-portfolio-editor-container container mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="input-area bg-slate-800 p-6 rounded-xl shadow-2xl space-y-8 max-h-[calc(100vh-120px)] overflow-y-auto">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-slate-100 mb-4 sm:mb-0">
                        {id ? 'Edit Your Portfolio' : `Create Portfolio (Template: ${activeTemplateIdForPreview || 'Default'})`}
                    </h2>
                    {id && (
                        <button
                            onClick={handleViewLivePortfolio}
                            className={`${secondaryButtonClasses} py-2 px-5 text-sm whitespace-nowrap`}
                        >
                            View Live Portfolio
                        </button>
                    )}
                </div>
                
                 {/* Basic Info Section */}
                 <div className="input-section bg-slate-850 p-4 rounded-lg grid grid-cols-1 gap-y-6">
                     <h3 className="text-xl font-semibold text-emerald-400">Basic Information</h3>
                    <div>
                        <label htmlFor="name" className={labelClasses}>Full Name</label>
                        <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className={inputClasses} placeholder="Your Full Name" />
                    </div>
                    <div> 
                        <label htmlFor="profilePicture" className={labelClasses}>Profile Picture URL or Upload</label>
                        <input type="file" id="profilePicture" accept="image/*" onChange={handleProfilePictureChange} className={`${inputClasses} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100`} />
                        {isUploadingProfilePic && <p className="text-xs text-slate-400 mt-1">Uploading Profile Pic...</p>}
                        {profilePicture && !profilePicture.startsWith('data:') && !isUploadingProfilePic && (
                            <p className="text-xs text-emerald-400 mt-1">Profile picture uploaded.</p>
                        )}
                    </div>
                    <div> 
                        <label htmlFor="linkedinUrl" className={labelClasses}>LinkedIn URL</label>
                        <input type="url" id="linkedinUrl" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} className={inputClasses} placeholder="https://linkedin.com/in/yourprofile"/>
                    </div>
                    <div> 
                        <label htmlFor="githubUrl" className={labelClasses}>GitHub URL</label>
                        <input type="url" id="githubUrl" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} className={inputClasses} placeholder="https://github.com/yourusername"/>
                    </div>
                    <div> 
                        <label htmlFor="aboutMe" className={labelClasses}>About Me</label>
                        <textarea id="aboutMe" value={aboutMe} onChange={(e) => setAboutMe(e.target.value)} className={`${inputClasses} min-h-[100px]`} placeholder="Tell a bit about yourself..."/>
                    </div>
                </div>

                {/* Skills Section */}
                <div className="collapsible-section bg-slate-850 p-4 rounded-lg">
                    <h3 onClick={toggleSkills} className={sectionHeaderClasses}>
                        <span>Skills</span>
                        <span>{skillsVisible ? arrowUp : arrowDown}</span>
                    </h3>
                    {skillsVisible && ( 
                        <div className="skills-section mt-3 space-y-3">
                            <div className="add-skill-input flex items-end space-x-2">
                                <div className="flex-grow">
                                    <label htmlFor="newSkill" className={labelClasses}>Add Skill</label>
                                    <input type="text" id="newSkill" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyPress={(e) => { if (e.key === 'Enter') handleAddSkill();}} className={`${inputClasses} md:w-full`} placeholder="e.g., React, JavaScript"/>
                                </div>
                                <button type="button" onClick={handleAddSkill} className={`${buttonClasses} ${smallButtonClasses} self-end mb-px`}>Add</button>
                            </div>
                            {skills.length > 0 && (
                                <ul className="skills-list space-y-1">
                                    {skills.map((skill, index) => (
                                        <li key={index} className="flex justify-between items-center bg-slate-700 p-2 rounded text-sm text-slate-200">
                                            <span>{skill}</span>
                                            <button type="button" onClick={() => handleRemoveSkill(skill)} className="text-rose-400 hover:text-rose-300 p-1 rounded-full hover:bg-slate-600 transition-colors" aria-label={`Remove skill ${skill}`}>
                                                <RemoveIcon className="w-4 h-4" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                </div>
                
                {/* Projects Section with Thumbnail and URL Inputs */}
                <div className="collapsible-section bg-slate-850 p-4 rounded-lg">
                    <h3 onClick={toggleProjects} className={sectionHeaderClasses}>
                        <span>Projects</span>
                        <span>{projectsVisible ? arrowUp : arrowDown}</span>
                    </h3>
                    {projectsVisible && (
                        <div className="projects-section mt-3 space-y-6">
                            {projects.map((project, index) => (
                                <div key={project.id || `project-input-${index}`} className="project-item bg-slate-700 p-4 rounded-md space-y-4"> 
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-lg font-semibold text-slate-200">Project {index + 1}</h4>
                                        {projects.length > 1 && (
                                            <button type="button" onClick={() => handleRemoveProject(project.id)} className={`bg-rose-600 hover:bg-rose-700 text-white ${smallButtonClasses}`}>Remove</button>
                                        )}
                                    </div>
                                    <div>
                                        <label htmlFor={`project-title-${project.id}`} className={labelClasses}>Title</label>
                                        <input type="text" id={`project-title-${project.id}`} value={project.title} onChange={(e) => handleProjectChange(index, 'title', e.target.value)} className={inputClasses}/>
                                    </div>
                                    <div>
                                        <label htmlFor={`project-description-${project.id}`} className={labelClasses}>Description</label>
                                        <textarea id={`project-description-${project.id}`} value={project.description} onChange={(e) => handleProjectChange(index, 'description', e.target.value)} className={`${inputClasses} min-h-[80px]`}/>
                                    </div>
                                    <div>
                                        <label htmlFor={`project-thumbnail-${project.id}`} className={labelClasses}>Project Thumbnail</label>
                                        <input type="file" id={`project-thumbnail-${project.id}`} accept="image/*" onChange={(e) => handleProjectThumbnailChange(index, e)} className={`${inputClasses} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100`} />
                                        {project.isUploadingThumbnail && <p className="text-xs text-slate-400 mt-1">Uploading thumbnail ({project.thumbnailUploadProgress?.toFixed(0) || 0}%)...</p>}
                                        {project.thumbnailUrl && !project.thumbnailUrl.startsWith('data:') && !project.isUploadingThumbnail && (
                                            <p className="text-xs text-emerald-400 mt-1">Thumbnail uploaded.</p>
                                        )}
                                        {project.thumbnailUrl && project.thumbnailUrl.startsWith('data:') && !project.isUploadingThumbnail && (
                                            <img src={project.thumbnailUrl} alt="Project thumbnail preview" className="mt-2 rounded max-h-28 object-contain"/>
                                        )}
                                    </div>
                                    <div>
                                        <label htmlFor={`project-liveDemoUrl-${project.id}`} className={labelClasses}>Live Demo URL (Optional)</label>
                                        <input type="url" id={`project-liveDemoUrl-${project.id}`} value={project.liveDemoUrl || ''} onChange={(e) => handleProjectChange(index, 'liveDemoUrl', e.target.value)} className={inputClasses} placeholder="https://your-live-project.com"/>
                                    </div>
                                    <div>
                                        <label htmlFor={`project-sourceCodeUrl-${project.id}`} className={labelClasses}>Source Code URL (Optional)</label>
                                        <input type="url" id={`project-sourceCodeUrl-${project.id}`} value={project.sourceCodeUrl || ''} onChange={(e) => handleProjectChange(index, 'sourceCodeUrl', e.target.value)} className={inputClasses} placeholder="https://github.com/your/project"/>
                                    </div>
                                    <div>
                                        <label htmlFor={`project-video-${project.id}`} className={labelClasses}>Video URL (YouTube/Vimeo - Optional)</label>
                                        <input type="url" id={`project-video-${project.id}`} value={project.videoUrl || ''} onChange={(e) => handleProjectChange(index, 'videoUrl', e.target.value)} className={inputClasses} placeholder="e.g., https://www.youtube.com/watch?v=..."/>
                                    </div>
                                </div>
                            ))}
                            <button type="button" onClick={handleAddProject} className={`${buttonClasses} w-full py-3 text-base`}>Add Another Project</button>
                        </div>
                    )}
                </div>

                {/* Customize Styles & Layout Section */}
                <div className="collapsible-section bg-slate-850 p-4 rounded-lg">
                    <h3 onClick={toggleCustomize} className={sectionHeaderClasses}>
                        <span>Customize Styles & Layout</span>
                        <span>{customizeVisible ? arrowUp : arrowDown}</span>
                    </h3>
                    {customizeVisible && ( 
                        <div className="customization-section mt-3 space-y-6">
                           <div>
                                <label htmlFor="fontFamily" className={labelClasses}>Font Family</label>
                                <select id="fontFamily" value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} className={inputClasses}>
                                    {fontOptions.map(font => (
                                        <option key={font.value} value={font.value}>{font.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                <div>
                                    <label htmlFor="headingColor" className={labelClasses}>Heading Color</label>
                                    <input type="color" id="headingColor" value={headingColor} onChange={(e) => setHeadingColor(e.target.value)} className={`${inputClasses} h-12 p-1 w-full`} />
                                </div>
                                <div>
                                    <label htmlFor="bodyTextColor" className={labelClasses}>Body Text Color</label>
                                    <input type="color" id="bodyTextColor" value={bodyTextColor} onChange={(e) => setBodyTextColor(e.target.value)} className={`${inputClasses} h-12 p-1 w-full`} />
                                </div>
                                <div>
                                    <label htmlFor="accentColor" className={labelClasses}>Accent Color</label>
                                    <input type="color" id="accentColor" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className={`${inputClasses} h-12 p-1 w-full`} />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="headerLayout" className={labelClasses}>Header Layout</label>
                                <select id="headerLayout" value={headerLayout} onChange={(e) => setHeaderLayout(e.target.value)} className={inputClasses}>
                                    {headerLayoutOptions.map(layout => (
                                        <option key={layout.id} value={layout.id}>{layout.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="skillDisplayStyle" className={labelClasses}>Skill Display Style (Preview)</label>
                                <select id="skillDisplayStyle" value={skillDisplayStyle} onChange={(e) => setSkillDisplayStyle(e.target.value)} className={inputClasses}>
                                    {skillDisplayOptions.map(option => (
                                        <option key={option.id} value={option.id}>{option.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="sectionSpacing" className={labelClasses}>
                                    Section Spacing (Preview): <span className="font-normal text-slate-400 text-xs">({sectionSpacing * 0.25}rem / {sectionSpacing * 4}px approx.)</span>
                                </label>
                                <input 
                                    type="range" 
                                    id="sectionSpacing" 
                                    min="0" 
                                    max="8" 
                                    step="1" 
                                    value={sectionSpacing} 
                                    onChange={(e) => setSectionSpacing(Number(e.target.value))}
                                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                />
                                <div className="flex justify-between text-xs text-slate-400 px-1 mt-1">
                                    <span>Tight</span>
                                    <span>Default</span>
                                    <span>Spacious</span>
                                </div>
                            </div>
                            {/* Background options are typically NOT controlled for styled templates */}
                        </div>
                    )}
                </div>

                <div className="save-button-container mt-8">
                    <button onClick={handleSavePortfolio} disabled={loading || isUploadingProfilePic || projects.some(p => p.isUploadingThumbnail)} className={`${buttonClasses} w-full text-lg py-3 disabled:opacity-70 disabled:cursor-not-allowed`}>
                         {saveButtonText}
                    </button>
                </div>
            </div>

            {/* Live Preview Area - Uses PortfolioDisplay component */}
            <div className="sticky top-20 max-h-[calc(100vh-120px)] overflow-y-auto"> 
                <PortfolioDisplay portfolioData={portfolioDataForPreview} />
            </div>
        </div>
    );
}

export default LivePortfolioEditor;
