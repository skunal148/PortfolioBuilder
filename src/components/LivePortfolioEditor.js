import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { storage, db, auth } from './firebase'; 
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { doc, getDoc, addDoc, updateDoc, collection, serverTimestamp } from 'firebase/firestore';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

import PortfolioDisplay from './PortfolioDisplay'; 

// --- Icons ---
const RemoveIcon = ({ className = "w-4 h-4" }) => ( 
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12.56 0c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
  </svg>
);
const DragHandleIcon = ({ className = "w-5 h-5 text-slate-400 cursor-grab" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
    </svg>
);
const ChevronDownIcon = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
);
const ChevronUpIcon = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
    </svg>
);
// --- NEW: Trash Icon for deleting images ---
const TrashIcon = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12.56 0c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
);


// --- Definitions (Fonts, Layouts, Skills - Keep your existing ones) ---
const fontOptions = [ 
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
const headerLayoutOptions = [ 
    { id: 'image-top-center', name: 'Image Top, Text Centered' },
    { id: 'image-left-text-right', name: 'Image Left, Text Right' },
    { id: 'text-only-center', name: 'Text Only, Centered' },
];
const skillDisplayOptions = [ 
    { id: 'icon-text-chip', name: 'Icon & Text (Chip)' }, 
    { id: 'icon-only-chip', name: 'Icon Only (Chip)' },
    { id: 'text-only-list', name: 'Text Only (List)' },
];

const defaultStyledHeadingColor = '#1F2937'; 
const defaultStyledBodyTextColor = '#374151';
const defaultStyledAccentColor = '#059669'; 

const generateStableId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const createNewProject = () => ({ 
    id: generateStableId('project'), 
    title: '', description: '', 
    thumbnailUrl: '', thumbnailFile: null, isUploadingThumbnail: false, thumbnailUploadProgress: 0,
    liveDemoUrl: '', sourceCodeUrl: '', videoUrl: '',
    isCollapsed: false 
});

const createNewCustomSection = () => ({
    id: generateStableId('customSection'), 
    sectionTitle: '', 
    items: []         
});

const createNewCustomSectionItem = () => ({
    id: generateStableId('customItem'),
    itemTitle: '',    
    itemDetails: '',
    isCollapsed: false 
});


function LivePortfolioEditor() {
    const { templateId: templateIdFromUrl, portfolioId } = useParams();
    const id = portfolioId; 
    const navigate = useNavigate();

    // Content States
    const [name, setName] = useState('');
    const [profilePicture, setProfilePicture] = useState('');
    const [profilePictureFile, setProfilePictureFile] = useState(null); 
    const [linkedinUrl, setLinkedinUrl] = useState('');
    const [githubUrl, setGithubUrl] = useState('');
    const [aboutMe, setAboutMe] = useState('');
    const [projects, setProjects] = useState([createNewProject()]);
    const [skills, setSkills] = useState([]);
    const [newSkill, setNewSkill] = useState('');
    const [customSections, setCustomSections] = useState([]);

    // Styling & Layout States
    const [fontFamily, setFontFamily] = useState(fontOptions[0].value); 
    const [headingColor, setHeadingColor] = useState(defaultStyledHeadingColor);
    const [bodyTextColor, setBodyTextColor] = useState(defaultStyledBodyTextColor);
    const [accentColor, setAccentColor] = useState(defaultStyledAccentColor);
    const [headerLayout, setHeaderLayout] = useState(headerLayoutOptions[0].id); 
    const [skillDisplayStyle, setSkillDisplayStyle] = useState(skillDisplayOptions[0].id);
    const [sectionSpacing, setSectionSpacing] = useState(4); 
    
    // Editor UI Visibility States
    const [projectsVisible, setProjectsVisible] = useState(true);
    const [skillsVisible, setSkillsVisible] = useState(true);
    const [customSectionsVisible, setCustomSectionsVisible] = useState(false);
    const [customizeStylesLayoutVisible, setCustomizeStylesLayoutVisible] = useState(true);

    // Technical States
    const [activeTemplateIdForPreview, setActiveTemplateIdForPreview] = useState(templateIdFromUrl || null);
    const [isUploadingProfilePic, setIsUploadingProfilePic] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const MAX_FILE_SIZE = 2 * 1024 * 1024; 

    const loadPortfolioData = useCallback(async () => {
        setLoading(true);
        setError('');
        if (id) { 
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
                        ? data.projects.map(p => ({ 
                            ...createNewProject(), 
                            ...p, 
                            id: p.id ? String(p.id) : generateStableId('project'),
                            isCollapsed: p.isCollapsed !== undefined ? p.isCollapsed : false,
                            thumbnailFile: null, isUploadingThumbnail: false, thumbnailUploadProgress: 0 
                        }))
                        : [createNewProject()]
                    );
                    setSkills(Array.isArray(data.skills) ? data.skills : []);
                    setCustomSections(
                        Array.isArray(data.customSections) 
                        ? data.customSections.map(cs => ({
                            ...createNewCustomSection(), 
                            ...cs, 
                            id: cs.id ? String(cs.id) : generateStableId('customSection'),
                            items: Array.isArray(cs.items) 
                                   ? cs.items.map(item => ({
                                       ...createNewCustomSectionItem(), 
                                       ...item, 
                                       id: item.id ? String(item.id) : generateStableId('customItem'),
                                       isCollapsed: item.isCollapsed !== undefined ? item.isCollapsed : false
                                    })) 
                                   : [] 
                          }))
                        : []
                    );

                    setFontFamily(data.fontFamily || fontOptions[0].value);
                    setHeadingColor(data.headingColor || defaultStyledHeadingColor);
                    setBodyTextColor(data.bodyTextColor || defaultStyledBodyTextColor);
                    setAccentColor(data.accentColor || defaultStyledAccentColor);
                    setHeaderLayout(data.headerLayout || headerLayoutOptions[0].id);
                    setSkillDisplayStyle(data.skillDisplayStyle || skillDisplayOptions[0].id);
                    setSectionSpacing(data.sectionSpacing !== undefined ? data.sectionSpacing : 4);
                    
                    setProjectsVisible(data.projectsVisible !== undefined ? data.projectsVisible : true);
                    setSkillsVisible(data.skillsVisible !== undefined ? data.skillsVisible : true);
                    setCustomSectionsVisible(data.customSectionsVisible !== undefined ? data.customSectionsVisible : false);
                    setCustomizeStylesLayoutVisible(data.customizeStylesLayoutVisible !== undefined ? data.customizeStylesLayoutVisible : true);

                    setActiveTemplateIdForPreview(data.templateId || templateIdFromUrl); 
                } else {
                    setError('Portfolio not found. Creating a new one with this style.');
                    setActiveTemplateIdForPreview(templateIdFromUrl); 
                    setProjects([createNewProject()]); 
                }
            } catch (err) {
                console.error("Error loading portfolio data:", err);
                setError('Failed to load portfolio data. Please try again.');
            } finally {
                setLoading(false);
            }
        } else if (templateIdFromUrl) { 
            setActiveTemplateIdForPreview(templateIdFromUrl);
            setFontFamily(fontOptions[0].value);
            setHeadingColor(defaultStyledHeadingColor);
            setBodyTextColor(defaultStyledBodyTextColor);
            setAccentColor(defaultStyledAccentColor);
            setProjects([createNewProject()]);
            setLoading(false);
        } else {
            setError("Cannot load editor: Missing portfolio or template information."); 
            setLoading(false);
        }
    }, [id, templateIdFromUrl]); 

    useEffect(() => { loadPortfolioData(); }, [loadPortfolioData]);

    // --- Content Handler Functions ---
    const handleAddProject = () => setProjects(prev => [...prev, createNewProject()]);
    const handleProjectChange = (index, field, value) => setProjects(prev => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
    const handleRemoveProject = (projectId) => setProjects(prev => prev.filter(p => p.id !== projectId));
    const handleToggleProjectItemCollapse = (projectId) => setProjects(prev => prev.map(p => p.id === projectId ? { ...p, isCollapsed: !p.isCollapsed } : p));

    const handleAddSkill = () => {
        if (newSkill.trim() && !skills.includes(newSkill.trim())) {
            setSkills(prev => [...prev, newSkill.trim()]);
            setNewSkill('');
        }
    };
    const handleRemoveSkill = (skillToRemove) => setSkills(prev => prev.filter(skill => skill !== skillToRemove));

    const handleAddCustomSection = () => setCustomSections(prev => [...prev, createNewCustomSection()]);
    const handleCustomSectionTitleChange = (sectionIndex, title) => setCustomSections(prev => prev.map((s, i) => i === sectionIndex ? { ...s, sectionTitle: title } : s));
    const handleRemoveCustomSection = (sectionId) => setCustomSections(prev => prev.filter(s => s.id !== sectionId));
    const handleAddCustomSectionItem = (sectionIndex) => setCustomSections(prev => prev.map((s, i) => i === sectionIndex ? { ...s, items: [...s.items, createNewCustomSectionItem()] } : s));
    const handleCustomSectionItemChange = (sectionIndex, itemIndex, field, value) => setCustomSections(prev => prev.map((s, i) => i === sectionIndex ? { ...s, items: s.items.map((item, j) => j === itemIndex ? { ...item, [field]: value } : item) } : s));
    const handleRemoveCustomSectionItem = (sectionIndex, itemId) => setCustomSections(prev => prev.map((s, i) => i === sectionIndex ? { ...s, items: s.items.filter(item => item.id !== itemId) } : s));
    const handleToggleCustomSectionItemCollapse = (sectionIndex, itemId) => setCustomSections(prev => prev.map((s, i) => i === sectionIndex ? { ...s, items: s.items.map(item => item.id === itemId ? { ...item, isCollapsed: !item.isCollapsed } : item) } : s));
    
    // --- UI Toggle Handlers ---
    const toggleProjects = () => setProjectsVisible(!projectsVisible);
    const toggleSkills = () => setSkillsVisible(!skillsVisible);
    const toggleCustomSections = () => setCustomSectionsVisible(!customSectionsVisible);
    const toggleCustomizeStylesLayout = () => setCustomizeStylesLayoutVisible(!customizeStylesLayoutVisible);


    // --- File Upload Handlers ---
    const handleImageUpload = async (file, pathPrefix, onProgress, currentImageUrl = '') => {
        if (!file) return currentImageUrl; 
        if (!auth.currentUser) {
            setError("Authentication error. Cannot upload image.");
            return currentImageUrl;
        }
        const fileName = `${pathPrefix}/${auth.currentUser.uid}/${Date.now()}_${file.name}`;
        const storageRef = ref(storage, fileName);
        const uploadTask = uploadBytesResumable(storageRef, file);
        return new Promise((resolve, reject) => {
            uploadTask.on('state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    if (onProgress) onProgress(progress);
                },
                (error) => {
                    console.error('File upload error:', error);
                    setError(`Failed to upload ${pathPrefix.slice(0,-1)}. ${error.code}`);
                    reject(error);
                },
                async () => {
                    try {
                        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                        resolve(downloadURL);
                    } catch (urlError) {
                        console.error('Error getting download URL:', urlError);
                        setError(`Failed to get URL for ${pathPrefix.slice(0,-1)}.`);
                        reject(urlError);
                    }
                }
            );
        });
    };

    const handleProfilePictureChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        if (file.size > MAX_FILE_SIZE) {
            alert(`Profile picture is too large. Max ${MAX_FILE_SIZE / (1024 * 1024)}MB.`);
            return;
        }
        setProfilePictureFile(file); 
        const reader = new FileReader(); 
        reader.onloadend = () => setProfilePicture(reader.result);
        reader.readAsDataURL(file);
    };

    // --- NEW: Handler to remove profile picture ---
    const handleRemoveProfilePicture = () => {
        setProfilePicture('');
        setProfilePictureFile(null);
        // Note: This does not delete from Firebase Storage.
        // Deletion from storage would typically happen on save if the URL is empty,
        // or via a separate "delete from storage" function if needed.
    };

    const handleProjectThumbnailChange = async (projectIndex, event) => {
        const file = event.target.files[0];
        if (!file) return;
        if (file.size > MAX_FILE_SIZE) {
            alert(`Project thumbnail is too large. Max ${MAX_FILE_SIZE / (1024 * 1024)}MB.`);
            return;
        }
        const updatedProjects = [...projects];
        updatedProjects[projectIndex].thumbnailFile = file; 
        const reader = new FileReader(); 
        reader.onloadend = () => {
            updatedProjects[projectIndex].thumbnailUrl = reader.result;
            setProjects(updatedProjects);
        };
        reader.readAsDataURL(file);
    };

    // --- NEW: Handler to remove a project's thumbnail ---
    const handleRemoveProjectThumbnail = (projectIndex) => {
        setProjects(prevProjects => 
            prevProjects.map((p, idx) => 
                idx === projectIndex 
                ? { ...p, thumbnailUrl: '', thumbnailFile: null, isUploadingThumbnail: false, thumbnailUploadProgress: 0 } 
                : p
            )
        );
    };


    // --- Save Portfolio ---
    const handleSavePortfolio = async () => {
        if (!auth.currentUser) { setError("You must be logged in to save your portfolio."); return; }
        setLoading(true); setError('');
        let finalProfilePictureUrl = profilePicture;
        let finalProjects = [...projects];

        try {
            if (profilePictureFile) {
                setIsUploadingProfilePic(true);
                finalProfilePictureUrl = await handleImageUpload(profilePictureFile, 'profilePictures_styled', (progress) => {/* Progress */});
                setProfilePictureFile(null); 
                setIsUploadingProfilePic(false);
            } else if (!profilePicture) { // If profilePicture state is empty (e.g., after deletion)
                finalProfilePictureUrl = ''; // Ensure it's saved as empty
            }


            for (let i = 0; i < finalProjects.length; i++) {
                if (finalProjects[i].thumbnailFile) {
                    finalProjects[i].isUploadingThumbnail = true;
                    const thumbnailUrl = await handleImageUpload(
                        finalProjects[i].thumbnailFile, 
                        `projectThumbnails_styled/${finalProjects[i].id}`, 
                        (progress) => {
                            const progressProjects = [...projects]; // Use current projects state for progress update
                            if(progressProjects[i]) progressProjects[i].thumbnailUploadProgress = progress;
                            setProjects(progressProjects); 
                        },
                        finalProjects[i].thumbnailUrl
                    );
                    finalProjects[i].thumbnailUrl = thumbnailUrl;
                    finalProjects[i].thumbnailFile = null; 
                    finalProjects[i].isUploadingThumbnail = false;
                } else if (!finalProjects[i].thumbnailUrl) { // If thumbnailUrl is empty (e.g. after deletion)
                     finalProjects[i].thumbnailUrl = ''; // Ensure it's saved as empty
                }
            }
            // Update projects state once after all uploads (or if no uploads needed)
            // This ensures the UI reflects the final URLs before saving project data
            setProjects(finalProjects.map(p => ({...p, isUploadingThumbnail: false, thumbnailUploadProgress: 0}))); 

            const projectsToSave = finalProjects.map(p => ({
                id: String(p.id), title: p.title, description: p.description,
                thumbnailUrl: p.thumbnailUrl && !p.thumbnailUrl.startsWith('data:') ? p.thumbnailUrl : '',
                liveDemoUrl: p.liveDemoUrl || '', sourceCodeUrl: p.sourceCodeUrl || '', videoUrl: p.videoUrl || '',
                isCollapsed: p.isCollapsed !== undefined ? p.isCollapsed : false,
            }));

            const customSectionsToSave = customSections.map(cs => ({
                id: String(cs.id), sectionTitle: cs.sectionTitle,
                items: cs.items.map(item => ({
                    id: String(item.id), itemTitle: item.itemTitle, itemDetails: item.itemDetails,
                    isCollapsed: item.isCollapsed !== undefined ? item.isCollapsed : false,
                }))
            }));

            const portfolioData = {
                userId: auth.currentUser.uid,
                templateId: activeTemplateIdForPreview, 
                name, profilePicture: finalProfilePictureUrl,
                linkedinUrl, githubUrl, aboutMe,
                projects: projectsToSave, skills, customSections: customSectionsToSave,
                fontFamily, headingColor, bodyTextColor, accentColor,
                headerLayout, skillDisplayStyle, sectionSpacing,
                projectsVisible, skillsVisible, customSectionsVisible, customizeStylesLayoutVisible,
                lastUpdated: serverTimestamp(),
            };

            if (id) { 
                const portfolioRef = doc(db, 'portfolios', id);
                await updateDoc(portfolioRef, portfolioData);
            } else { 
                const docRef = await addDoc(collection(db, 'portfolios'), {
                    ...portfolioData, createdAt: serverTimestamp(),
                });
                navigate(`/editor/${activeTemplateIdForPreview}/${docRef.id}`, { replace: true });
            }
            alert('Portfolio saved successfully!');
            if (id) loadPortfolioData(); 

        } catch (err) {
            console.error('Error saving portfolio:', err);
            setError('Failed to save portfolio. Please check console for details.');
        } finally {
            setLoading(false);
            setIsUploadingProfilePic(false);
        }
    };
    
    // --- onDragEnd Handler ---
    const onDragEnd = (result) => {
        const { source, destination, type } = result;
        if (!destination) return;
        if (source.droppableId === destination.droppableId && source.index === destination.index) return;

        if (type === 'PROJECTS') {
            const reorderedProjects = Array.from(projects);
            const [removed] = reorderedProjects.splice(source.index, 1);
            reorderedProjects.splice(destination.index, 0, removed);
            setProjects(reorderedProjects);
        } else if (type === 'SKILLS') {
            const reorderedSkills = Array.from(skills);
            const [removed] = reorderedSkills.splice(source.index, 1);
            reorderedSkills.splice(destination.index, 0, removed);
            setSkills(reorderedSkills);
        } else if (type === 'CUSTOM_SECTIONS') {
            const reorderedCustomSections = Array.from(customSections);
            const [removed] = reorderedCustomSections.splice(source.index, 1);
            reorderedCustomSections.splice(destination.index, 0, removed);
            setCustomSections(reorderedCustomSections);
        }
    };

    // --- Loading and Error JSX ---
    if (loading && !id && !templateIdFromUrl) return <div className="flex justify-center items-center min-h-screen text-xl text-slate-300">Loading Editor...</div>;
    if (loading && (id || templateIdFromUrl)) return <div className="flex justify-center items-center min-h-screen text-xl text-slate-300">Loading Portfolio Data...</div>;
    if (error && !loading) return ( 
        <div className="flex flex-col justify-center items-center min-h-screen text-red-400 p-4">
            <h2 className="text-2xl mb-4">Something went wrong</h2>
            <p className="mb-4">{error}</p>
            <div className="flex space-x-4">
                <button onClick={() => { setError(null); loadPortfolioData(); }} className="bg-emerald-500 text-white py-2 px-4 rounded-lg hover:bg-emerald-600">Try again</button>
                <button onClick={() => navigate('/dashboard')} className="bg-slate-600 text-white py-2 px-4 rounded-lg hover:bg-slate-700">Go to Dashboard</button>
            </div>
        </div>
    );

    // --- Class Definitions ---
    const inputClasses = "shadow-inner appearance-none border border-slate-700 rounded w-full py-3 px-4 bg-slate-700 text-slate-100 leading-tight focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-slate-500";
    const labelClasses = "block text-slate-300 text-sm font-semibold mb-2";
    const sectionHeaderClasses = "text-2xl font-semibold text-emerald-400 mb-3 cursor-pointer flex justify-between items-center";
    const buttonClasses = "bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 px-4 rounded-lg text-sm shadow-md transition-colors";
    const secondaryButtonClasses = "bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg text-sm shadow-md transition-colors";
    const smallButtonClasses = "text-xs py-1 px-2 rounded-md";
    
    let saveButtonText = id ? `Update Portfolio (${activeTemplateIdForPreview})` : `Create Portfolio (${activeTemplateIdForPreview})`;
    if (loading) saveButtonText = 'Processing...';
    else if (isUploadingProfilePic) saveButtonText = 'Uploading Profile Pic...';
    else if (projects.some(p => p.isUploadingThumbnail)) saveButtonText = 'Uploading Thumbs...';


    const portfolioDataForPreview = {
        name, profilePicture, linkedinUrl, githubUrl, aboutMe, projects, skills, customSections,
        fontFamily, headingColor, bodyTextColor, accentColor,
        templateId: activeTemplateIdForPreview, 
        headerLayout, skillDisplayStyle, sectionSpacing,
    };

    const arrowDown = '▼'; 
    const arrowUp = '▲';

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="live-portfolio-editor-container container mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-editor gap-8 items-start" style={{gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)'}}>
                <div className="input-area bg-slate-800 p-6 rounded-xl shadow-2xl space-y-8 max-h-[calc(100vh-100px)] overflow-y-auto custom-scrollbar">
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                        <h2 className="text-3xl font-bold text-slate-100 mb-4 sm:mb-0">
                            {id ? `Edit Portfolio (Style: ${activeTemplateIdForPreview})` : `Create Portfolio (Style: ${activeTemplateIdForPreview})`}
                        </h2>
                        {id && ( <button onClick={() => navigate(`/portfolio/${id}`)} className={`${secondaryButtonClasses} py-2 px-5 text-sm whitespace-nowrap`}> View Live Portfolio </button> )}
                    </div>

                    {/* Basic Info Section */}
                    <div className="input-section bg-slate-850 p-4 rounded-lg grid grid-cols-1 gap-y-6">
                        <h3 className="text-xl font-semibold text-emerald-400">Basic Information</h3>
                        <div>
                            <label htmlFor="name" className={labelClasses}>Full Name</label>
                            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className={inputClasses} placeholder="Your Full Name" />
                        </div>
                        <div> 
                            <label htmlFor="profilePicture" className={labelClasses}>Profile Picture</label>
                            <input type="file" id="profilePicture" accept="image/*" onChange={handleProfilePictureChange} className={`${inputClasses} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100`} />
                            {isUploadingProfilePic && <p className="text-xs text-slate-400 mt-1">Uploading...</p>}
                            <div className="mt-2 flex items-center space-x-2">
                                {(profilePicture && profilePicture.startsWith('data:')) && !isUploadingProfilePic && <img src={profilePicture} alt="Preview" className="rounded-full h-20 w-20 object-cover"/>}
                                {(profilePicture && !profilePicture.startsWith('data:')) && !isUploadingProfilePic && <img src={profilePicture} alt="Current" className="rounded-full h-20 w-20 object-cover"/>}
                                {profilePicture && (
                                    <button 
                                        type="button" 
                                        onClick={handleRemoveProfilePicture} 
                                        className="text-rose-500 hover:text-rose-400 p-1.5 rounded-full hover:bg-slate-700 transition-colors"
                                        aria-label="Remove profile picture"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
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
                                        <input type="text" id="newSkill" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyPress={(e) => { if (e.key === 'Enter') handleAddSkill();}} className={`${inputClasses} md:w-full`} placeholder="e.g., React, JavaScript, Python"/>
                                    </div>
                                    <button type="button" onClick={handleAddSkill} className={`${buttonClasses} ${smallButtonClasses} self-end mb-px`}>Add</button>
                                </div>
                                {skills.length > 0 && (
                                    <Droppable droppableId="skillsDroppable" type="SKILLS">
                                        {(provided, snapshot) => (
                                            <ul
                                                ref={provided.innerRef}
                                                {...provided.droppableProps}
                                                className={`skills-list space-y-1 mt-2 ${snapshot.isDraggingOver ? 'bg-slate-700/20 rounded p-1' : ''}`}
                                            >
                                                {skills.map((skill, index) => (
                                                    <Draggable key={`skill-${skill}-${index}`} draggableId={`skill-${skill}-${index}`} index={index}>
                                                        {(providedDraggable, snapshotDraggable) => (
                                                            <li
                                                                ref={providedDraggable.innerRef}
                                                                {...providedDraggable.draggableProps}
                                                                className={`flex justify-between items-center bg-slate-700 p-2 rounded text-sm text-slate-200 ${snapshotDraggable.isDragging ? 'shadow-lg ring-1 ring-emerald-400' : ''}`}
                                                            >
                                                                <div {...providedDraggable.dragHandleProps} className="p-1 mr-2 cursor-grab active:cursor-grabbing">
                                                                    <DragHandleIcon className="w-4 h-4 text-slate-500" />
                                                                </div>
                                                                <span className="flex-grow">{skill}</span>
                                                                <button 
                                                                    type="button" 
                                                                    onClick={() => handleRemoveSkill(skill)} 
                                                                    className="text-rose-400 hover:text-rose-300 p-1 rounded-full hover:bg-slate-600 transition-colors"
                                                                    aria-label={`Remove skill ${skill}`}
                                                                >
                                                                    <RemoveIcon className="w-4 h-4" />
                                                                </button>
                                                            </li>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}
                                            </ul>
                                        )}
                                    </Droppable>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Projects Section */}
                    <div className="collapsible-section bg-slate-850 p-4 rounded-lg">
                        <h3 onClick={toggleProjects} className={sectionHeaderClasses}>
                            <span>Projects</span>
                            <span>{projectsVisible ? arrowUp : arrowDown}</span>
                        </h3>
                        {projectsVisible && (
                            <Droppable droppableId="projectsDroppable" type="PROJECTS">
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className={`projects-section mt-3 space-y-2 ${snapshot.isDraggingOver ? 'bg-slate-700/30 rounded p-1' : ''}`}
                                    >
                                        {projects.map((project, index) => (
                                            <Draggable key={project.id} draggableId={String(project.id)} index={index}> 
                                                {(providedDraggable, snapshotDraggable) => (
                                                    <div
                                                        ref={providedDraggable.innerRef}
                                                        {...providedDraggable.draggableProps}
                                                        className={`project-item-editor-wrapper bg-slate-700 rounded-md shadow-md ${snapshotDraggable.isDragging ? 'shadow-xl ring-2 ring-emerald-500' : ''}`}
                                                    >
                                                        <div className="flex justify-between items-center p-3 border-b border-slate-600">
                                                            <div className="flex items-center flex-grow">
                                                                <div {...providedDraggable.dragHandleProps} className="p-1 mr-2 cursor-grab active:cursor-grabbing">
                                                                    <DragHandleIcon />
                                                                </div>
                                                                <h4 
                                                                    className="text-md font-semibold text-slate-200 flex-grow cursor-pointer"
                                                                    onClick={() => handleToggleProjectItemCollapse(project.id)}
                                                                >
                                                                    {project.title || `Project ${index + 1}`}
                                                                </h4>
                                                            </div>
                                                            <button 
                                                                type="button" 
                                                                onClick={() => handleToggleProjectItemCollapse(project.id)} 
                                                                className="p-1 text-slate-400 hover:text-slate-200 mr-2"
                                                                aria-label={project.isCollapsed ? "Expand project details" : "Collapse project details"}
                                                            >
                                                                {project.isCollapsed ? <ChevronDownIcon /> : <ChevronUpIcon />}
                                                            </button>
                                                            {projects.length > 1 && (
                                                                <button type="button" onClick={() => handleRemoveProject(project.id)} className={`bg-rose-600 hover:bg-rose-700 text-white ${smallButtonClasses} !px-2 !py-1`}>Remove</button>
                                                            )}
                                                        </div>
                                                        {!project.isCollapsed && (
                                                            <div className="p-3 space-y-4">
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
                                                                    {projects[index].isUploadingThumbnail && <p className="text-xs text-slate-400 mt-1">Uploading thumbnail ({projects[index].thumbnailUploadProgress?.toFixed(0) || 0}%)...</p>}
                                                                    <div className="mt-2 flex items-center space-x-2">
                                                                        {projects[index].thumbnailUrl && projects[index].thumbnailUrl.startsWith('data:') && !projects[index].isUploadingThumbnail && (
                                                                            <img src={projects[index].thumbnailUrl} alt="Project thumbnail preview" className="rounded max-h-28 object-contain"/>
                                                                        )}
                                                                        {projects[index].thumbnailUrl && !projects[index].thumbnailUrl.startsWith('data:') && !projects[index].isUploadingThumbnail && (
                                                                            <img src={projects[index].thumbnailUrl} alt="Project thumbnail" className="rounded max-h-28 object-contain"/>
                                                                        )}
                                                                        {projects[index].thumbnailUrl && (
                                                                            <button 
                                                                                type="button" 
                                                                                onClick={() => handleRemoveProjectThumbnail(index)} 
                                                                                className="text-rose-500 hover:text-rose-400 p-1.5 rounded-full hover:bg-slate-600 transition-colors"
                                                                                aria-label="Remove project thumbnail"
                                                                            >
                                                                                <TrashIcon className="w-5 h-5" />
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                    {projects[index].thumbnailUrl && !projects[index].thumbnailUrl.startsWith('data:') && !projects[index].isUploadingThumbnail && (
                                                                        <p className="text-xs text-emerald-400 mt-1">Thumbnail uploaded.</p>
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <label htmlFor={`project-liveDemoUrl-${project.id}`} className={labelClasses}>Live Demo URL (Optional)</label>
                                                                    <input type="url" id={`project-liveDemoUrl-${project.id}`} value={project.liveDemoUrl || ''} onChange={(e) => handleProjectChange(index, 'liveDemoUrl', e.target.value)} className={inputClasses} placeholder="https://your-live-project-demo.com"/>
                                                                </div>
                                                                <div>
                                                                    <label htmlFor={`project-sourceCodeUrl-${project.id}`} className={labelClasses}>Source Code URL (Optional)</label>
                                                                    <input type="url" id={`project-sourceCodeUrl-${project.id}`} value={project.sourceCodeUrl || ''} onChange={(e) => handleProjectChange(index, 'sourceCodeUrl', e.target.value)} className={inputClasses} placeholder="https://github.com/yourusername/your-project"/>
                                                                </div>
                                                                 <div>
                                                                    <label htmlFor={`project-videoUrl-${project.id}`} className={labelClasses}>Video URL (YouTube/Vimeo - Optional)</label>
                                                                    <input type="url" id={`project-videoUrl-${project.id}`} value={project.videoUrl || ''} onChange={(e) => handleProjectChange(index, 'videoUrl', e.target.value)} className={inputClasses} placeholder="https://youtube.com/watch?v=..."/>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder} 
                                    </div>
                                )}
                            </Droppable>
                        )}
                        <button type="button" onClick={handleAddProject} className={`${buttonClasses} w-full py-3 text-base mt-4`}>Add Another Project</button>
                    </div>

                    {/* Custom Sections UI */}
                    <div className="collapsible-section bg-slate-850 p-4 rounded-lg">
                        <h3 onClick={toggleCustomSections} className={sectionHeaderClasses}>
                            <span>Custom Sections</span>
                            <span>{customSectionsVisible ? arrowUp : arrowDown}</span>
                        </h3>
                        {customSectionsVisible && (
                            <>
                                <Droppable droppableId="customSectionsDroppable" type="CUSTOM_SECTIONS">
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className={`custom-sections-list mt-3 space-y-2 ${snapshot.isDraggingOver ? 'bg-slate-700/20 rounded p-1' : ''}`}
                                        >
                                            {customSections.map((section, sectionIndex) => (
                                                <Draggable key={section.id} draggableId={String(section.id)} index={sectionIndex}>
                                                    {(providedDraggable, snapshotDraggable) => (
                                                        <div
                                                            ref={providedDraggable.innerRef}
                                                            {...providedDraggable.draggableProps}
                                                            className={`custom-section-block-editor bg-slate-750 rounded-lg border border-slate-700 ${snapshotDraggable.isDragging ? 'shadow-xl ring-2 ring-emerald-500' : ''}`}
                                                        >
                                                            <div className="flex justify-between items-center p-3 border-b border-slate-600">
                                                                <div {...providedDraggable.dragHandleProps} className="p-1 mr-2 cursor-grab active:cursor-grabbing">
                                                                    <DragHandleIcon />
                                                                </div>
                                                                <input
                                                                    type="text"
                                                                    value={section.sectionTitle}
                                                                    onChange={(e) => handleCustomSectionTitleChange(sectionIndex, e.target.value)}
                                                                    placeholder="Custom Section Title (e.g., Experience)"
                                                                    className={`${inputClasses} text-lg font-semibold flex-grow !py-2`} 
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveCustomSection(section.id)}
                                                                    className="text-rose-500 hover:text-rose-400 p-1.5 rounded-full hover:bg-slate-700 transition-colors ml-2" 
                                                                    aria-label="Remove this custom section block"
                                                                >
                                                                    <RemoveIcon className="w-5 h-5" />
                                                                </button>
                                                            </div>
                                                            
                                                            <div className="space-y-3 p-3">
                                                                {section.items && section.items.map((item, itemIndex) => (
                                                                    <div key={item.id} className="custom-section-entry bg-slate-700 p-3 rounded-md shadow">
                                                                        <div className="flex justify-between items-center mb-2">
                                                                            <h5 
                                                                                className="text-md font-medium text-slate-300 flex-grow cursor-pointer"
                                                                                onClick={() => handleToggleCustomSectionItemCollapse(sectionIndex, item.id)}
                                                                            >
                                                                                {item.itemTitle || `Entry ${itemIndex + 1}`}
                                                                            </h5>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleToggleCustomSectionItemCollapse(sectionIndex, item.id)}
                                                                                className="p-1 text-slate-400 hover:text-slate-200 mr-1"
                                                                                aria-label={item.isCollapsed ? "Expand entry" : "Collapse entry"}
                                                                            >
                                                                                {item.isCollapsed ? <ChevronDownIcon className="w-4 h-4"/> : <ChevronUpIcon className="w-4 h-4"/>}
                                                                            </button>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleRemoveCustomSectionItem(sectionIndex, item.id)}
                                                                                className={`text-rose-500 hover:text-rose-400 p-1 rounded-full hover:bg-slate-600 transition-colors`}
                                                                                aria-label="Remove entry"
                                                                            >
                                                                                <RemoveIcon className="w-4 h-4" />
                                                                            </button>
                                                                        </div>
                                                                        {!item.isCollapsed && (
                                                                            <div className="space-y-3">
                                                                                <input
                                                                                    type="text"
                                                                                    value={item.itemTitle}
                                                                                    onChange={(e) => handleCustomSectionItemChange(sectionIndex, itemIndex, 'itemTitle', e.target.value)}
                                                                                    placeholder="Entry Title (e.g., Company Name, Degree)"
                                                                                    className={`${inputClasses} !py-2`}
                                                                                />
                                                                                <textarea
                                                                                    value={item.itemDetails}
                                                                                    onChange={(e) => handleCustomSectionItemChange(sectionIndex, itemIndex, 'itemDetails', e.target.value)}
                                                                                    placeholder="Details for this entry..."
                                                                                    className={`${inputClasses} min-h-[60px]`}
                                                                                />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleAddCustomSectionItem(sectionIndex)}
                                                                    className="bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 px-3 rounded-full text-xs shadow-md transition-colors mt-2" 
                                                                >
                                                                    + Add Entry
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                                <button
                                    type="button"
                                    onClick={handleAddCustomSection}
                                    className={`${buttonClasses} w-full py-3 text-base mt-4`}
                                >
                                    Add New Custom Section Block
                                </button>
                            </> 
                        )}
                    </div>
                    
                    {/* Customize Styles & Layout Section */}
                    <div className="collapsible-section bg-slate-850 p-4 rounded-lg">
                        <h3 onClick={toggleCustomizeStylesLayout} className={sectionHeaderClasses}>
                            <span>Customize Styles & Layout</span>
                            <span>{customizeStylesLayoutVisible ? arrowUp : arrowDown}</span>
                        </h3>
                        {customizeStylesLayoutVisible && ( 
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
                            </div>
                        )}
                    </div>

                    <div className="save-button-container mt-8">
                        <button onClick={handleSavePortfolio} disabled={loading || isUploadingProfilePic || projects.some(p => p.isUploadingThumbnail)} className={`${buttonClasses} w-full text-lg py-3 disabled:opacity-70 disabled:cursor-not-allowed`}>
                            {saveButtonText}
                        </button>
                    </div>
                    {error && <p className="text-red-400 text-sm mt-4 text-center">{error}</p>}
                </div>

                <div className="preview-area sticky top-[calc(theme(spacing.4)+env(safe-area-inset-top))] max-h-[calc(100vh-100px)] overflow-y-auto custom-scrollbar bg-slate-900 rounded-xl shadow-2xl"> 
                     <PortfolioDisplay portfolioData={portfolioDataForPreview} />
                </div>
            </div>
        </DragDropContext>
    );
}

export default LivePortfolioEditor;
