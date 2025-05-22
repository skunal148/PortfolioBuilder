import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { storage, db, auth } from '../components/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { doc, getDoc, addDoc, updateDoc, collection, serverTimestamp } from 'firebase/firestore';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '../components/quill.css';
import { Disclosure, Transition } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';

import PortfolioDisplay from '../components/PortfolioDisplay';

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
const TrashIcon = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12.56 0c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
);
// --- END Icons ---


// --- Definitions (Fonts, Layouts, Skills) ---
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

const CODER_MIN_DEFAULTS = {
    fontFamily: "'Inter', sans-serif",
    headingColor: '#e5e7eb', // slate-200
    bodyTextColor: '#9ca3af', // slate-400
    accentColor: '#34d399',   // emerald-400
    secondaryAccentColor: '#60a5fa', // blue-400
    headerLayout: 'image-left-text-right',
    skillDisplayStyle: 'text-only-list',
    skillIconChipBackgroundColor: '#2d3748', // For consistency if skillChipStyleOverride is 'theme'
    skillIconChipTextColor: '#d1d5db',     // For consistency
};

// Fallback defaults for any other future styled templates
const defaultStyledHeadingColor = '#1F2937';
const defaultStyledBodyTextColor = '#374151';
const defaultStyledAccentColor = '#059669';
const defaultStyledSecondaryAccentColor = '#4f46e5';
const defaultStyledFontFamily = 'sans-serif"';
const predefinedColorPalettes = [
    { name: 'Emerald & Indigo (Default)', headingColor: defaultStyledHeadingColor, bodyTextColor: defaultStyledBodyTextColor, accentColor: defaultStyledAccentColor, secondaryAccentColor: defaultStyledSecondaryAccentColor },
    { name: 'Sky & Rose', headingColor: '#0c4a6e', bodyTextColor: '#1e3a8a', accentColor: '#0284c7', secondaryAccentColor: '#e11d48' },
    { name: 'Amber & Teal', headingColor: '#451a03', bodyTextColor: '#713f12', accentColor: '#f59e0b', secondaryAccentColor: '#14b8a6' },
    { name: 'Slate & Fuchsia', headingColor: '#1e293b', bodyTextColor: '#334155', accentColor: '#64748b', secondaryAccentColor: '#c026d3' },
    { name: 'Charcoal & Lime', headingColor: '#171717', bodyTextColor: '#262626', accentColor: '#404040', secondaryAccentColor: '#84cc16' }
];
// --- END Definitions ---

// --- Quill Configuration ---
const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{'list': 'ordered'}, {'list': 'bullet'}],
    ['link'],
    ['clean']
  ],
};
const quillFormats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet',
  'link'
];
// --- END Quill Configuration ---

const generateStableId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
const createNewProject = () => ({ id: generateStableId('project'), title: '', description: '', skillsUsed: [], thumbnailUrl: '', thumbnailFile: null, isUploadingThumbnail: false, thumbnailUploadProgress: 0, liveDemoUrl: '', sourceCodeUrl: '', videoUrl: '', isCollapsed: false });
const createNewCustomSection = () => ({ id: generateStableId('customSection'), sectionTitle: '', items: [] });
const createNewCustomSectionItem = () => ({ id: generateStableId('customItem'), itemTitle: '', itemDetails: '', isCollapsed: false });


function LivePortfolioEditor() {
    const { templateIdFromUrl, portfolioId } = useParams();
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
    const [newSkillName, setNewSkillName] = useState('');
    const [newSkillLevel, setNewSkillLevel] = useState('Beginner');
    const [customSections, setCustomSections] = useState([]); // Kept for style-coder-min

    // Styling & Layout States
    const [fontFamily, setFontFamily] = useState(CODER_MIN_DEFAULTS.fontFamily);
    const [headingColor, setHeadingColor] = useState(CODER_MIN_DEFAULTS.headingColor);
    const [bodyTextColor, setBodyTextColor] = useState(CODER_MIN_DEFAULTS.bodyTextColor);
    const [accentColor, setAccentColor] = useState(CODER_MIN_DEFAULTS.accentColor);
    const [secondaryAccentColor, setSecondaryAccentColor] = useState(CODER_MIN_DEFAULTS.secondaryAccentColor);
    const [headerLayout, setHeaderLayout] = useState(CODER_MIN_DEFAULTS.headerLayout);
    const [skillDisplayStyle, setSkillDisplayStyle] = useState(CODER_MIN_DEFAULTS.skillDisplayStyle);
    const [sectionSpacing, setSectionSpacing] = useState(4);
    const [skillChipStyleOverride, setSkillChipStyleOverride] = useState('theme');

    // Technical States
    const [activeTemplateIdForPreview, setActiveTemplateIdForPreview] = useState(templateIdFromUrl || 'style-coder-min');
    const [isUploadingProfilePic, setIsUploadingProfilePic] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isMobileView, setIsMobileView] = useState(window.innerWidth < 1024);
    const MAX_FILE_SIZE = 2 * 1024 * 1024;

    useEffect(() => {
            const handleResize = () => setIsMobileView(window.innerWidth < 1024);
            window.addEventListener('resize', handleResize);
            handleResize();
            return () => window.removeEventListener('resize', handleResize);
        }, []);

    const loadPortfolioData = useCallback(async () => {
        setLoading(true);
        setError('');
        const currentTemplateId = templateIdFromUrl || 'style-coder-min';
        setActiveTemplateIdForPreview(currentTemplateId);

        // Always apply fixed styles if it's the coder template
        if (currentTemplateId === 'style-coder-min') {
            setFontFamily(CODER_MIN_DEFAULTS.fontFamily);
            setHeadingColor(CODER_MIN_DEFAULTS.headingColor);
            setBodyTextColor(CODER_MIN_DEFAULTS.bodyTextColor);
            setAccentColor(CODER_MIN_DEFAULTS.accentColor);
            setSecondaryAccentColor(CODER_MIN_DEFAULTS.secondaryAccentColor);
            setHeaderLayout(CODER_MIN_DEFAULTS.headerLayout);
            setSkillDisplayStyle(CODER_MIN_DEFAULTS.skillDisplayStyle);
        }

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
                        ? data.projects.map(p => ({ ...createNewProject(), ...p, id: String(p.id || generateStableId('project')), skillsUsed: p.skillsUsed || [], isCollapsed: p.isCollapsed !== undefined ? p.isCollapsed : false, thumbnailFile: null, isUploadingThumbnail: false, thumbnailUploadProgress: 0 }))
                        : [createNewProject()]
                    );
                    setSkills(Array.isArray(data.skills) ? data.skills.map(s => ({...s, id: s.id || generateStableId('skill') })) : []);
                    setCustomSections(Array.isArray(data.customSections) ? data.customSections.map(cs => ({ ...createNewCustomSection(), ...cs, id: String(cs.id || generateStableId('customSection')), items: Array.isArray(cs.items) ? cs.items.map(item => ({ ...createNewCustomSectionItem(), ...item, id: String(item.id || generateStableId('customItem')), isCollapsed: item.isCollapsed !== undefined ? item.isCollapsed : false })) : [] })) : []);


                    // If not coder template, load potentially customized styles
                    if (data.templateId !== 'style-coder-min') {
                         setFontFamily(data.fontFamily || defaultStyledFontFamily); // Ensure defaultStyledFontFamily is defined or use fontOptions[0].value
                         setHeadingColor(data.headingColor || defaultStyledHeadingColor);
                         setBodyTextColor(data.bodyTextColor || defaultStyledBodyTextColor);
                         setAccentColor(data.accentColor || defaultStyledAccentColor);
                         setSecondaryAccentColor(data.secondaryAccentColor || defaultStyledSecondaryAccentColor);
                         setHeaderLayout(data.headerLayout || headerLayoutOptions[0].id);
                         setSkillDisplayStyle(data.skillDisplayStyle || skillDisplayOptions[0].id);
                    }
                    // These are always loaded from data if present, as they are not "fixed" for coder-min
                    setSectionSpacing(data.sectionSpacing !== undefined ? data.sectionSpacing : 4);
                    setSkillChipStyleOverride(data.skillChipStyleOverride || 'theme');

                } else {
                    setError('Portfolio not found.');
                }
            } catch (err) {
                console.error("Error loading portfolio data:", err);
                setError('Failed to load portfolio data. Please try again.');
            } finally {
                setLoading(false);
            }
        } else if (currentTemplateId) { // New portfolio
            // Defaults for style-coder-min are already set above.
            // If other styled templates were supported, their specific defaults would go here.
            // For now, if it's not coder-min (which it should be if !id and templateIdFromUrl is style-coder-min),
            // it might fall back to general styled defaults.
            if (currentTemplateId !== 'style-coder-min') {
                setFontFamily(fontOptions[0].value); // General default
                setHeadingColor(defaultStyledHeadingColor);
                setBodyTextColor(defaultStyledBodyTextColor);
                setAccentColor(defaultStyledAccentColor);
                setSecondaryAccentColor(defaultStyledSecondaryAccentColor);
                setHeaderLayout(headerLayoutOptions[0].id);
                setSkillDisplayStyle(skillDisplayOptions[0].id);
            }
            setProjects([createNewProject()]);
            setLoading(false);
        } else {
            setError("Cannot load editor: Missing template information for new portfolio.");
            setLoading(false);
        }
    }, [id, templateIdFromUrl]);

    useEffect(() => { loadPortfolioData(); }, [loadPortfolioData]);

    const handleAddProject = () => setProjects(prev => [...prev, createNewProject()]);
    const handleProjectChange = (index, field, value) => setProjects(prev => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
    const handleRemoveProject = (projectId) => setProjects(prev => prev.filter(p => p.id !== projectId));
    const handleToggleProjectItemCollapse = (projectId) => setProjects(prev => prev.map(p => p.id === projectId ? { ...p, isCollapsed: !p.isCollapsed } : p));

        const handleAddSkill = () => {
        if (newSkillName.trim()) {
            const newSkillWithId = { id: generateStableId('skill'), name: newSkillName.trim(), level: newSkillLevel };
            const skillExists = skills.some(skill => skill.name.toLowerCase() === newSkillWithId.name.toLowerCase());
            if (!skillExists) {
                setSkills(prevSkills => [...prevSkills, newSkillWithId]);
                setNewSkillName(''); setNewSkillLevel('Beginner');
            } else { alert("This skill has already been added."); }
        }
    };
    const handleRemoveSkill = (skillIdToRemove) => setSkills(prevSkills => prevSkills.filter(skill => skill.id !== skillIdToRemove));

    const handleAddCustomSection = () => setCustomSections(prev => [...prev, createNewCustomSection()]);
    const handleCustomSectionTitleChange = (sectionIndex, title) => setCustomSections(prev => prev.map((s, i) => i === sectionIndex ? { ...s, sectionTitle: title } : s));
    const handleRemoveCustomSection = (sectionId) => setCustomSections(prev => prev.filter(s => s.id !== sectionId));
    const handleAddCustomSectionItem = (sectionIndex) => setCustomSections(prev => prev.map((s, i) => i === sectionIndex ? { ...s, items: [...s.items, createNewCustomSectionItem()] } : s));
    const handleCustomSectionItemChange = (sectionIndex, itemIndex, field, value) => {
        setCustomSections(prev => prev.map((s, i) => i === sectionIndex ? { ...s, items: s.items.map((item, j) => j === itemIndex ? { ...item, [field]: value } : item) } : s));
    };
    const handleRemoveCustomSectionItem = (sectionIndex, itemId) => setCustomSections(prev => prev.map((s, i) => i === sectionIndex ? { ...s, items: s.items.filter(item => item.id !== itemId) } : s));
    const handleToggleCustomSectionItemCollapse = (sectionIndex, itemId) => setCustomSections(prev => prev.map((s, i) => i === sectionIndex ? { ...s, items: s.items.map(item => item.id === itemId ? { ...item, isCollapsed: !item.isCollapsed } : item) } : s));

    const handleImageUpload = async (file, pathPrefix, onProgressUpdate) => {
            if (!file) return '';
            if (!auth.currentUser) {
                setError("Authentication error. Cannot upload image.");
                return '';
            }
            const fileName = `${pathPrefix}/${auth.currentUser.uid}/${Date.now()}_${file.name}`;
            const storageRefFirebase = ref(storage, fileName);
            const uploadTask = uploadBytesResumable(storageRefFirebase, file);
    
            return new Promise((resolve, reject) => {
                uploadTask.on('state_changed',
                    (snapshot) => {
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        if (onProgressUpdate) onProgressUpdate(progress);
                    },
                    (error) => {
                        console.error('File upload error:', error);
                        setError(`Failed to upload. ${error.code}`);
                        if (onProgressUpdate) onProgressUpdate(0);
                        reject(error);
                    },
                    async () => {
                        try {
                            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                            resolve(downloadURL);
                        } catch (urlError) {
                            console.error('Error getting download URL:', urlError);
                            setError(`Failed to get URL.`);
                            reject(urlError);
                        }
                    }
                );
            });
        };
        const handleProfilePictureChange = async (event) => {
            const file = event.target.files?.[0];
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
        const handleRemoveProfilePicture = () => {
            setProfilePicture('');
            setProfilePictureFile(null);
        };
        const handleProjectThumbnailChange = async (projectIndex, event) => {
            const file = event.target.files?.[0];
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
         const handleRemoveProjectThumbnail = (projectIndex) => {
            setProjects(prev => prev.map((p, idx) => idx === projectIndex ? { ...p, thumbnailUrl: '', thumbnailFile: null, isUploadingThumbnail: false, thumbnailUploadProgress: 0 } : p));
        };

    const handlePaletteChange = (paletteName) => {
        if (activeTemplateIdForPreview === 'style-coder-min') {
            // Reset to coder defaults if this is somehow triggered
            setHeadingColor(CODER_MIN_DEFAULTS.headingColor);
            setBodyTextColor(CODER_MIN_DEFAULTS.bodyTextColor);
            setAccentColor(CODER_MIN_DEFAULTS.accentColor);
            setSecondaryAccentColor(CODER_MIN_DEFAULTS.secondaryAccentColor);
            return; 
        }
        const selected = predefinedColorPalettes.find(p => p.name === paletteName);
        if (selected) {
            setHeadingColor(selected.headingColor);
            setBodyTextColor(selected.bodyTextColor);
            setAccentColor(selected.accentColor);
            setSecondaryAccentColor(selected.secondaryAccentColor || defaultStyledSecondaryAccentColor);
        } else {
            setHeadingColor(defaultStyledHeadingColor);
            setBodyTextColor(defaultStyledBodyTextColor);
            setAccentColor(defaultStyledAccentColor);
            setSecondaryAccentColor(defaultStyledSecondaryAccentColor);
        }
    };

    const handleSavePortfolio = async () => {
        // ... (Full save logic, ensure it uses CODER_MIN_DEFAULTS for fixed styles when template is style-coder-min)
        // ... and saves customSections
        if (!auth.currentUser) { setError("You must be logged in to save your portfolio."); return; }
        setLoading(true); setError('');
        let finalProfilePictureUrl = profilePicture;
        let finalProjects = [...projects];
        let uploadErrorOccurred = false;

        try {
            if (profilePictureFile) {
                setIsUploadingProfilePic(true);
                finalProfilePictureUrl = await handleImageUpload(profilePictureFile, `profilePictures_${activeTemplateIdForPreview}`, (progress) => {/* Progress */});
                setProfilePictureFile(null);
                setIsUploadingProfilePic(false);
            } else if (!profilePicture) {
                finalProfilePictureUrl = '';
            }

            for (let i = 0; i < finalProjects.length; i++) {
                let project = { ...finalProjects[i] };
                if (project.thumbnailFile) {
                    project.isUploadingThumbnail = true;
                    finalProjects[i] = project;
                    setProjects([...finalProjects]);
                    try {
                        const newUrl = await handleImageUpload(
                            project.thumbnailFile,
                            `projectThumbnails_${activeTemplateIdForPreview}/${project.id || Date.now()}`,
                            (progress) => {
                                setProjects(prev => prev.map((p, idx) => idx === i ? { ...p, thumbnailUploadProgress: progress } : p));
                            }
                        );
                        project.thumbnailUrl = newUrl;
                        project.thumbnailFile = null;
                    } catch (thumbError) {
                        setError(`Failed to upload thumbnail for Project "${project.title || i + 1}".`);
                        uploadErrorOccurred = true;
                    }
                    project.isUploadingThumbnail = false;
                    finalProjects[i] = project;
                    setProjects([...finalProjects]);
                } else if (!project.thumbnailUrl) {
                     project.thumbnailUrl = '';
                }
            }
            
            if(uploadErrorOccurred){
                setLoading(false);
                return;
            }

            const projectsToSave = finalProjects.map(p => ({
                id: String(p.id), title: p.title, description: p.description, skillsUsed: p.skillsUsed || [],
                thumbnailUrl: p.thumbnailUrl && !p.thumbnailUrl.startsWith('data:') ? p.thumbnailUrl : '',
                liveDemoUrl: p.liveDemoUrl || '', sourceCodeUrl: p.sourceCodeUrl || '', videoUrl: p.videoUrl || '',
                isCollapsed: p.isCollapsed !== undefined ? p.isCollapsed : false,
            }));

            const customSectionsToSave = customSections.map(cs => ({ // Custom sections are saved
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
                projects: projectsToSave, skills, 
                customSections: customSectionsToSave, // Save custom sections
                fontFamily: activeTemplateIdForPreview === 'style-coder-min' ? CODER_MIN_DEFAULTS.fontFamily : fontFamily,
                headingColor: activeTemplateIdForPreview === 'style-coder-min' ? CODER_MIN_DEFAULTS.headingColor : headingColor,
                bodyTextColor: activeTemplateIdForPreview === 'style-coder-min' ? CODER_MIN_DEFAULTS.bodyTextColor : bodyTextColor,
                accentColor: activeTemplateIdForPreview === 'style-coder-min' ? CODER_MIN_DEFAULTS.accentColor : accentColor,
                secondaryAccentColor: activeTemplateIdForPreview === 'style-coder-min' ? CODER_MIN_DEFAULTS.secondaryAccentColor : secondaryAccentColor,
                headerLayout: activeTemplateIdForPreview === 'style-coder-min' ? CODER_MIN_DEFAULTS.headerLayout : headerLayout,
                skillDisplayStyle: activeTemplateIdForPreview === 'style-coder-min' ? CODER_MIN_DEFAULTS.skillDisplayStyle : skillDisplayStyle,
                sectionSpacing,
                skillChipStyleOverride: skillChipStyleOverride,
                lastUpdated: serverTimestamp(),
            };

            if (id) {
                const portfolioRef = doc(db, 'portfolios', id);
                await updateDoc(portfolioRef, portfolioData);
                alert('Portfolio updated successfully!');
                loadPortfolioData();
            } else {
                const docRef = await addDoc(collection(db, 'portfolios'), {
                    ...portfolioData, createdAt: serverTimestamp(),
                });
                alert('Portfolio created successfully!');
                navigate(`/edit-styled/${docRef.id}`, { replace: true }); 
            }

        } catch (err) {
            console.error('Error saving portfolio:', err);
            if(!error) setError('Failed to save portfolio. Please check console for details.');
        } finally {
            setLoading(false);
            setIsUploadingProfilePic(false);
            setProjects(prev => prev.map(p => ({...p, isUploadingThumbnail: false, thumbnailUploadProgress: 0})));
        }
    };
        const onDragEnd = (result) => {
        const { source, destination, type } = result;
        if (!destination || (source.droppableId === destination.droppableId && source.index === destination.index)) return;

        if (type === 'PROJECTS') {
            const reordered = Array.from(projects);
            const [removed] = reordered.splice(source.index, 1);
            reordered.splice(destination.index, 0, removed);
            setProjects(reordered);
        } else if (type === 'SKILLS') {
            const reordered = Array.from(skills);
            const [removed] = reordered.splice(source.index, 1);
            reordered.splice(destination.index, 0, removed);
            setSkills(reordered);
        } else if (type === 'CUSTOM_SECTIONS') {
             const reordered = Array.from(customSections);
            const [removed] = reordered.splice(source.index, 1);
            reordered.splice(destination.index, 0, removed);
            setCustomSections(reordered);
        }
    };

    if (loading && !id && !templateIdFromUrl) return <div className="flex justify-center items-center min-h-screen text-xl text-slate-700 dark:text-slate-300">Loading Editor...</div>;
    if (loading && (id || templateIdFromUrl)) return <div className="flex justify-center items-center min-h-screen text-xl text-slate-700 dark:text-slate-300">Loading Portfolio Data...</div>;
    if (error && !loading) return (
        <div className="flex flex-col justify-center items-center min-h-screen text-red-500 dark:text-red-400 p-4">
            <h2 className="text-2xl mb-4">Something went wrong</h2>
            <p className="mb-4">{error}</p>
            <div className="flex space-x-4">
                <button onClick={() => { setError(null); loadPortfolioData(); }} className="bg-emerald-500 text-white py-2 px-4 rounded-lg hover:bg-emerald-600">Try again</button>
                <button onClick={() => navigate('/dashboard')} className="bg-slate-600 text-white py-2 px-4 rounded-lg hover:bg-slate-700">Go to Dashboard</button>
            </div>
        </div>
    );

    const editorPanelBg = "bg-slate-800";
    const editorSectionBg = "bg-slate-850";
    const editorInputClasses = "shadow-inner appearance-none border border-slate-700 rounded w-full py-3 px-4 bg-slate-700 text-slate-100 leading-tight focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-inset placeholder-slate-500";
    const editorLabelClasses = "block text-slate-300 text-sm font-semibold mb-2";
    const editorSectionHeaderClasses = "text-2xl font-semibold text-emerald-400 mb-3 cursor-pointer flex justify-between items-center w-full";
    const editorDraggableItemBg = "bg-slate-700";
    const editorDraggableItemText = "text-slate-200";
    const editorQuillWrapperClasses = "bg-slate-700 text-slate-100 rounded-md";

    const buttonClasses = "bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 px-4 rounded-lg text-sm shadow-md transition-colors";
    const secondaryButtonClasses = "bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg text-sm shadow-md transition-colors";
    const smallButtonClasses = "text-xs py-1 px-2 rounded-md";

    let saveButtonText = id ? `Update Portfolio (${activeTemplateIdForPreview})` : `Create Portfolio (${activeTemplateIdForPreview})`;
    if (loading) saveButtonText = 'Processing...';
    else if (isUploadingProfilePic) saveButtonText = 'Uploading Profile Pic...';
    else if (projects.some(p => p.isUploadingThumbnail)) saveButtonText = 'Uploading Thumbs...';

    const portfolioDataForPreview = {
        name, profilePicture, linkedinUrl, githubUrl, aboutMe, projects, skills, 
        customSections, // Pass customSections to preview
        fontFamily: activeTemplateIdForPreview === 'style-coder-min' ? CODER_MIN_DEFAULTS.fontFamily : fontFamily,
        headingColor: activeTemplateIdForPreview === 'style-coder-min' ? CODER_MIN_DEFAULTS.headingColor : headingColor,
        bodyTextColor: activeTemplateIdForPreview === 'style-coder-min' ? CODER_MIN_DEFAULTS.bodyTextColor : bodyTextColor,
        accentColor: activeTemplateIdForPreview === 'style-coder-min' ? CODER_MIN_DEFAULTS.accentColor : accentColor,
        secondaryAccentColor: activeTemplateIdForPreview === 'style-coder-min' ? CODER_MIN_DEFAULTS.secondaryAccentColor : secondaryAccentColor,
        templateId: activeTemplateIdForPreview,
        headerLayout: activeTemplateIdForPreview === 'style-coder-min' ? CODER_MIN_DEFAULTS.headerLayout : headerLayout,
        skillDisplayStyle: activeTemplateIdForPreview === 'style-coder-min' ? CODER_MIN_DEFAULTS.skillDisplayStyle : skillDisplayStyle,
        sectionSpacing,
        skillIconChipBackgroundColor: skillChipStyleOverride === 'light' ? '#E2E8F0' : (skillChipStyleOverride === 'dark' ? '#2D3748' : (activeTemplateIdForPreview === 'style-coder-min' ? CODER_MIN_DEFAULTS.skillIconChipBackgroundColor : '#4A5568')),
        skillIconChipTextColor: skillChipStyleOverride === 'light' ? '#2D3748' : (skillChipStyleOverride === 'dark' ? '#E2E8F0' : (activeTemplateIdForPreview === 'style-coder-min' ? CODER_MIN_DEFAULTS.skillIconChipTextColor : '#F7FAFC')),
    };
    
    const listItemVariants = {
        initial: { opacity: 0, y: -10, height: 0 },
        animate: { opacity: 1, y: 0, height: 'auto', transition: { duration: 0.3, ease: "easeOut" } },
        exit: { opacity: 0, y: -10, height: 0, transition: { duration: 0.2, ease: "easeIn" } }
    };


    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className={`live-portfolio-editor-container container mx-auto p-4 md:p-6 grid ${isMobileView ? 'grid-cols-1' : 'lg:grid-cols-2'} gap-6 items-start`}>
                <div className={`${editorPanelBg} p-4 sm:p-6 rounded-xl shadow-2xl space-y-6 ${isMobileView ? 'w-full' : 'max-h-[calc(100vh-100px)] overflow-y-auto custom-scrollbar'}`}>
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                        <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-4 sm:mb-0 text-center sm:text-left">
                            {id ? `Edit Portfolio (Style: ${activeTemplateIdForPreview})` : `Create Portfolio (Style: ${activeTemplateIdForPreview})`}
                        </h2>
                        {id && ( <button onClick={() => navigate(`/portfolio/${id}`)} className={`${secondaryButtonClasses} py-2 px-4 text-xs sm:text-sm whitespace-nowrap mt-2 sm:mt-0`}> View Live Portfolio </button> )}
                    </div>

                    {/* Basic Info Section */}
                    <div className={`${editorSectionBg} p-4 rounded-lg grid grid-cols-1 gap-y-6`}>
                        <h3 className={editorSectionHeaderClasses.replace('cursor-pointer', '')}>Basic Information</h3>
                        <div>
                            <label htmlFor="name-styled" className={editorLabelClasses}>Full Name</label>
                            <input type="text" id="name-styled" value={name} onChange={(e) => setName(e.target.value)} className={editorInputClasses} placeholder="Your Full Name" />
                        </div>
                        <div>
                            <label htmlFor="profilePicture-styled" className={editorLabelClasses}>Profile Picture</label>
                            <input type="file" id="profilePicture-styled" accept="image/*" onChange={handleProfilePictureChange} className={`${editorInputClasses} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-500 file:text-white hover:file:bg-emerald-600`} />
                            {isUploadingProfilePic && <p className="text-xs text-slate-400 mt-1">Uploading...</p>}
                            <div className="mt-2 flex items-center space-x-2">
                                {(profilePicture && profilePicture.startsWith('data:')) && !isUploadingProfilePic && <img src={profilePicture} alt="Preview" className="rounded-full h-16 w-16 sm:h-20 sm:w-20 object-cover"/>}
                                {(profilePicture && !profilePicture.startsWith('data:')) && !isUploadingProfilePic && <img src={profilePicture} alt="Current" className="rounded-full h-16 w-16 sm:h-20 sm:w-20 object-cover"/>}
                                {profilePicture && (
                                    <button type="button" onClick={handleRemoveProfilePicture} className="text-rose-500 hover:text-rose-400 p-1.5 rounded-full hover:bg-slate-700 transition-colors" aria-label="Remove profile picture" >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        </div>
                        <div>
                            <label htmlFor="linkedinUrl-styled" className={editorLabelClasses}>LinkedIn URL</label>
                            <input type="url" id="linkedinUrl-styled" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} className={editorInputClasses} placeholder="https://linkedin.com/in/yourprofile"/>
                        </div>
                        <div>
                            <label htmlFor="githubUrl-styled" className={editorLabelClasses}>GitHub URL</label>
                            <input type="url" id="githubUrl-styled" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} className={editorInputClasses} placeholder="https://github.com/yourusername"/>
                        </div>
                        <div>
                            <label htmlFor="aboutMe-styled" className={editorLabelClasses}>About Me</label>
                            <div className={`quill-editor-override ${editorQuillWrapperClasses}`}>
                                <ReactQuill
                                    theme="snow"
                                    value={aboutMe}
                                    onChange={setAboutMe}
                                    modules={quillModules}
                                    formats={quillFormats}
                                    placeholder="Tell a bit about yourself..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Skills Section with Disclosure */}
                    <Disclosure as="div" className={`${editorSectionBg} p-4 rounded-lg`} defaultOpen={true}>
                        {({ open }) => (
                            <>
                                <Disclosure.Button className={editorSectionHeaderClasses}>
                                    <span>Skills</span>
                                    <ChevronDownIcon className={`w-5 h-5 text-emerald-400 transform transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
                                </Disclosure.Button>
                                <Transition show={open} enter="transition duration-100 ease-out" enterFrom="transform scale-95 opacity-0 max-h-0" enterTo="transform scale-100 opacity-100 max-h-screen" leave="transition duration-75 ease-out" leaveFrom="transform scale-100 opacity-100 max-h-screen" leaveTo="transform scale-95 opacity-0 max-h-0" >
                                    <Disclosure.Panel className="skills-section mt-3 space-y-3 overflow-hidden">
                                        {/* Skills input and list (same as LiveBlankPortfolioEditor, with AnimatePresence) */}
                                        <div className="add-skill-input flex items-start space-x-2">
                                            <div className="flex-grow">
                                                <label htmlFor="newSkillNameStyled" className={editorLabelClasses}>Skill Name</label>
                                                <input type="text" id="newSkillNameStyled" value={newSkillName} onChange={(e) => setNewSkillName(e.target.value)} onKeyPress={(e) => { if (e.key === 'Enter') handleAddSkill();}} className={`${editorInputClasses} md:w-full`} placeholder="e.g., React"/>
                                            </div>
                                            <div className="flex-grow-0 w-1/3">
                                                <label htmlFor="newSkillLevelStyled" className={editorLabelClasses}>Proficiency</label>
                                                <select id="newSkillLevelStyled" value={newSkillLevel} onChange={(e) => setNewSkillLevel(e.target.value)} className={`${editorInputClasses} md:w-full`}>
                                                    <option value="Beginner">Beginner</option>
                                                    <option value="Intermediate">Intermediate</option>
                                                    <option value="Advanced">Advanced</option>
                                                    <option value="Expert">Expert</option>
                                                </select>
                                            </div>
                                            <button type="button" onClick={handleAddSkill} className={`${buttonClasses} ${smallButtonClasses} self-end mb-px`}>Add</button>
                                        </div>
                                        {skills.length > 0 && (
                                            <Droppable droppableId="skillsDroppableStyled" type="SKILLS">
                                                {(provided) => (
                                                    <ul ref={provided.innerRef} {...provided.droppableProps} className={`skills-list space-y-1 mt-2`}>
                                                        <AnimatePresence>
                                                            {skills.map((skillObj, index) => (
                                                                <Draggable key={skillObj.id} draggableId={skillObj.id} index={index} isDragDisabled={isMobileView}>
                                                                    {(providedDraggable) => (
                                                                        <motion.li
                                                                            ref={providedDraggable.innerRef}
                                                                            {...providedDraggable.draggableProps}
                                                                            variants={listItemVariants}
                                                                            initial="initial"
                                                                            animate="animate"
                                                                            exit="exit"
                                                                            layout
                                                                            className={`flex justify-between items-center ${editorDraggableItemBg} p-2 rounded text-sm ${editorDraggableItemText}`}
                                                                        >
                                                                            <div {...providedDraggable.dragHandleProps} className={`p-1 mr-2 ${isMobileView ? 'cursor-default opacity-50' : 'cursor-grab active:cursor-grabbing'}`}> <DragHandleIcon className="w-4 h-4 text-slate-400" /> </div>
                                                                            <span className="flex-grow">{skillObj.name} ({skillObj.level})</span>
                                                                            <button type="button" onClick={() => handleRemoveSkill(skillObj.id)} className="text-rose-400 hover:text-rose-300 p-1 rounded-full hover:bg-slate-600 transition-colors"> <RemoveIcon className="w-4 h-4" /> </button>
                                                                        </motion.li>
                                                                    )}
                                                                </Draggable>
                                                            ))}
                                                        </AnimatePresence>
                                                        {provided.placeholder}
                                                    </ul>
                                                )}
                                            </Droppable>
                                        )}
                                    </Disclosure.Panel>
                                </Transition>
                            </>
                        )}
                    </Disclosure>

                    {/* Projects Section with Disclosure */}
                    <Disclosure as="div" className={`${editorSectionBg} p-4 rounded-lg`} defaultOpen={true}>
                         {({ open }) => (
                            <>
                                <Disclosure.Button className={editorSectionHeaderClasses}>
                                    <span>Projects</span>
                                     <ChevronDownIcon className={`w-5 h-5 text-emerald-400 transform transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
                                </Disclosure.Button>
                                <Transition show={open} enter="transition duration-100 ease-out" enterFrom="transform scale-95 opacity-0 max-h-0" enterTo="transform scale-100 opacity-100 max-h-screen" leave="transition duration-75 ease-out" leaveFrom="transform scale-100 opacity-100 max-h-screen" leaveTo="transform scale-95 opacity-0 max-h-0" >
                                    <Disclosure.Panel className="projects-section mt-3 space-y-2 overflow-hidden">
                                        <Droppable droppableId="projectsDroppableStyled" type="PROJECTS">
                                            {(provided) => (
                                                <div ref={provided.innerRef} {...provided.droppableProps} className={`space-y-2`}>
                                                    <AnimatePresence>
                                                        {projects.map((project, index) => (
                                                            <Draggable key={project.id} draggableId={String(project.id)} index={index} isDragDisabled={isMobileView}>
                                                                {(providedDraggable) => (
                                                                    <motion.div
                                                                        ref={providedDraggable.innerRef}
                                                                        {...providedDraggable.draggableProps}
                                                                        variants={listItemVariants}
                                                                        initial="initial"
                                                                        animate="animate"
                                                                        exit="exit"
                                                                        layout
                                                                        className={`project-item-editor-wrapper ${editorDraggableItemBg} rounded-md shadow-md`}
                                                                    >
                                                                        <div className="flex justify-between items-center p-3 border-b border-slate-600">
                                                                            <div className="flex items-center flex-grow">
                                                                                <div {...providedDraggable.dragHandleProps} className={`p-1 mr-2 ${isMobileView ? 'cursor-default opacity-50' : 'cursor-grab active:cursor-grabbing'}`}> <DragHandleIcon /> </div>
                                                                                <h4 className={`text-md font-semibold ${editorDraggableItemText} flex-grow cursor-pointer`} onClick={() => handleToggleProjectItemCollapse(project.id)}> {project.title || `Project ${index + 1}`} </h4>
                                                                            </div>
                                                                            <button type="button" onClick={() => handleToggleProjectItemCollapse(project.id)} className="p-1 text-slate-400 hover:text-slate-200 mr-2"> {project.isCollapsed ? <ChevronDownIcon /> : <ChevronDownIcon className="transform rotate-180"/>} </button>
                                                                            {projects.length > 1 && ( <button type="button" onClick={() => handleRemoveProject(project.id)} className="text-rose-500 hover:text-rose-400 p-1.5 rounded-full hover:bg-slate-600 transition-colors" aria-label="Remove project"> <TrashIcon className="w-5 h-5" /> </button> )}
                                                                        </div>
                                                                        <Transition
                                                                            show={!project.isCollapsed}
                                                                            enter="transition-all duration-300 ease-out" enterFrom="opacity-0 max-h-0" enterTo="opacity-100 max-h-[1000px]"
                                                                            leave="transition-all duration-200 ease-in" leaveFrom="opacity-100 max-h-[1000px]" leaveTo="opacity-0 max-h-0"
                                                                        >
                                                                            <div className="p-3 space-y-4 overflow-hidden">
                                                                                <div>
                                                                                    <label htmlFor={`project-title-styled-${project.id}`} className={editorLabelClasses}>Title</label>
                                                                                    <input type="text" id={`project-title-styled-${project.id}`} value={project.title} onChange={(e) => handleProjectChange(index, 'title', e.target.value)} className={editorInputClasses}/>
                                                                                </div>
                                                                                <div>
                                                                                    <label htmlFor={`project-description-styled-${project.id}`} className={editorLabelClasses}>Description</label>
                                                                                    <div className={`quill-editor-override ${editorQuillWrapperClasses}`}>
                                                                                        <ReactQuill
                                                                                            theme="snow"
                                                                                            value={project.description}
                                                                                            onChange={(content) => handleProjectChange(index, 'description', content)}
                                                                                            modules={quillModules}
                                                                                            formats={quillFormats}
                                                                                            placeholder="Describe your project..."
                                                                                        />
                                                                                    </div>
                                                                                </div>
                                                                                <div>
                                                                                    <label htmlFor={`project-thumbnail-styled-${project.id}`} className={editorLabelClasses}>Project Thumbnail</label>
                                                                                    <input type="file" id={`project-thumbnail-styled-${project.id}`} accept="image/*" onChange={(e) => handleProjectThumbnailChange(index, e)} className={`${editorInputClasses} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-500 file:text-white hover:file:bg-emerald-600`} />
                                                                                    {projects[index].isUploadingThumbnail && <p className="text-xs text-slate-400 mt-1">Uploading thumbnail ({projects[index].thumbnailUploadProgress?.toFixed(0) || 0}%)...</p>}
                                                                                    <div className="mt-2 flex items-center space-x-2">
                                                                                        {(projects[index].thumbnailUrl && projects[index].thumbnailUrl.startsWith('data:')) && !projects[index].isUploadingThumbnail && <img src={projects[index].thumbnailUrl} alt="Preview" className="rounded max-h-28 object-contain"/>}
                                                                                        {(projects[index].thumbnailUrl && !projects[index].thumbnailUrl.startsWith('data:')) && !projects[index].isUploadingThumbnail && <img src={projects[index].thumbnailUrl} alt="Current" className="rounded max-h-28 object-contain"/>}
                                                                                        {projects[index].thumbnailUrl && ( <button type="button" onClick={() => handleRemoveProjectThumbnail(index)} className="text-rose-500 hover:text-rose-400 p-1.5 rounded-full hover:bg-slate-700 transition-colors"> <TrashIcon className="w-5 h-5" /> </button> )}
                                                                                    </div>
                                                                                </div>
                                                                                <div>
                                                                                    <label htmlFor={`project-liveDemoUrl-styled-${project.id}`} className={editorLabelClasses}>Live Demo URL (Optional)</label>
                                                                                    <input type="url" id={`project-liveDemoUrl-styled-${project.id}`} value={project.liveDemoUrl || ''} onChange={(e) => handleProjectChange(index, 'liveDemoUrl', e.target.value)} className={editorInputClasses} placeholder="https://your-live-project-demo.com"/>
                                                                                </div>
                                                                                <div>
                                                                                    <label htmlFor={`project-sourceCodeUrl-styled-${project.id}`} className={editorLabelClasses}>Source Code URL (Optional)</label>
                                                                                    <input type="url" id={`project-sourceCodeUrl-styled-${project.id}`} value={project.sourceCodeUrl || ''} onChange={(e) => handleProjectChange(index, 'sourceCodeUrl', e.target.value)} className={editorInputClasses} placeholder="https://github.com/yourusername/your-project"/>
                                                                                </div>
                                                                                 <div>
                                                                                    <label htmlFor={`project-videoUrl-styled-${project.id}`} className={editorLabelClasses}>Video URL (YouTube/Vimeo - Optional)</label>
                                                                                    <input type="url" id={`project-videoUrl-styled-${project.id}`} value={project.videoUrl || ''} onChange={(e) => handleProjectChange(index, 'videoUrl', e.target.value)} className={editorInputClasses} placeholder="https://youtube.com/watch?v=..."/>
                                                                                </div>
                                                                            </div>
                                                                        </Transition>
                                                                    </motion.div>
                                                                )}
                                                            </Draggable>
                                                        ))}
                                                    </AnimatePresence>
                                                    {provided.placeholder}
                                                </div>
                                            )}
                                        </Droppable>
                                        <button type="button" onClick={handleAddProject} className={`${buttonClasses} w-full py-3 text-base mt-4`}>Add Another Project</button>
                                    </Disclosure.Panel>
                                </Transition>
                            </>
                        )}
                    </Disclosure>

                    {/* Custom Sections UI - Kept for style-coder-min */}
                    <Disclosure as="div" className={`${editorSectionBg} p-4 rounded-lg`} defaultOpen={false}>
                         {({ open }) => (
                            <>
                                <Disclosure.Button className={editorSectionHeaderClasses}>
                                    <span>Custom Sections</span>
                                     <ChevronDownIcon className={`w-5 h-5 text-emerald-400 transform transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
                                </Disclosure.Button>
                                <Transition show={open} enter="transition duration-100 ease-out" enterFrom="transform scale-95 opacity-0 max-h-0" enterTo="transform scale-100 opacity-100 max-h-screen" leave="transition duration-75 ease-out" leaveFrom="transform scale-100 opacity-100 max-h-screen" leaveTo="transform scale-95 opacity-0 max-h-0" >
                                    <Disclosure.Panel className="custom-sections-list mt-3 space-y-2 overflow-hidden">
                                        <Droppable droppableId="customSectionsDroppableStyled" type="CUSTOM_SECTIONS">
                                            {(provided) => (
                                                <div ref={provided.innerRef} {...provided.droppableProps} className={`space-y-2`}>
                                                    <AnimatePresence>
                                                        {customSections.map((section, sectionIndex) => (
                                                            <Draggable key={section.id} draggableId={String(section.id)} index={sectionIndex} isDragDisabled={isMobileView}>
                                                                {(providedDraggable) => (
                                                                    <motion.div
                                                                        ref={providedDraggable.innerRef}
                                                                        {...providedDraggable.draggableProps}
                                                                        variants={listItemVariants}
                                                                        initial="initial"
                                                                        animate="animate"
                                                                        exit="exit"
                                                                        layout
                                                                        className={`custom-section-block-editor bg-slate-750 rounded-lg border border-slate-700`}
                                                                    >
                                                                        <div className="flex justify-between items-center p-3 border-b border-slate-600">
                                                                            <div {...providedDraggable.dragHandleProps} className={`p-1 mr-2 ${isMobileView ? 'cursor-default opacity-50' : 'cursor-grab active:cursor-grabbing'}`}> <DragHandleIcon /> </div>
                                                                            <input type="text" value={section.sectionTitle} onChange={(e) => handleCustomSectionTitleChange(sectionIndex, e.target.value)} placeholder="Custom Section Title" className={`${editorInputClasses} text-lg font-semibold flex-grow !py-2`}/>
                                                                            <button type="button" onClick={() => handleRemoveCustomSection(section.id)} className="text-rose-500 hover:text-rose-400 p-1.5 rounded-full hover:bg-slate-700 transition-colors ml-2" aria-label="Remove section"> <RemoveIcon className="w-5 h-5" /> </button>
                                                                        </div>
                                                                        <div className="space-y-3 p-3">
                                                                            <AnimatePresence>
                                                                                {section.items && section.items.map((item, itemIndex) => (
                                                                                    <motion.div
                                                                                        key={item.id}
                                                                                        variants={listItemVariants}
                                                                                        initial="initial"
                                                                                        animate="animate"
                                                                                        exit="exit"
                                                                                        layout
                                                                                        className={`${editorDraggableItemBg} p-3 rounded-md shadow`}
                                                                                    >
                                                                                        <div className="flex justify-between items-center mb-2">
                                                                                            <h5 className={`text-md font-medium ${editorDraggableItemText} flex-grow cursor-pointer`} onClick={() => handleToggleCustomSectionItemCollapse(sectionIndex, item.id)}> {item.itemTitle || `Entry ${itemIndex + 1}`} </h5>
                                                                                            <button type="button" onClick={() => handleToggleCustomSectionItemCollapse(sectionIndex, item.id)} className="p-1 text-slate-400 hover:text-slate-200 mr-1"> {item.isCollapsed ? <ChevronDownIcon className="w-4 h-4"/> : <ChevronDownIcon className="w-4 h-4 transform rotate-180"/>} </button>
                                                                                            <button type="button" onClick={() => handleRemoveCustomSectionItem(sectionIndex, item.id)} className={`text-rose-400 hover:text-rose-300 p-1 rounded-full hover:bg-slate-600 transition-colors`}> <RemoveIcon className="w-4 h-4" /> </button>
                                                                                        </div>
                                                                                        <Transition
                                                                                            show={!item.isCollapsed}
                                                                                            enter="transition-all duration-300 ease-out" enterFrom="opacity-0 max-h-0" enterTo="opacity-100 max-h-[1000px]"
                                                                                            leave="transition-all duration-200 ease-in" leaveFrom="opacity-100 max-h-[1000px]" leaveTo="opacity-0 max-h-0"
                                                                                        >
                                                                                            <div className="space-y-3 overflow-hidden">
                                                                                                <input type="text" value={item.itemTitle} onChange={(e) => handleCustomSectionItemChange(sectionIndex, itemIndex, 'itemTitle', e.target.value)} placeholder="Entry Title" className={`${editorInputClasses} !py-2`}/>
                                                                                                <div className={`quill-editor-override ${editorQuillWrapperClasses}`}>
                                                                                                    <ReactQuill
                                                                                                        theme="snow"
                                                                                                        value={item.itemDetails}
                                                                                                        onChange={(content) => handleCustomSectionItemChange(sectionIndex, itemIndex, 'itemDetails', content)}
                                                                                                        modules={quillModules}
                                                                                                        formats={quillFormats}
                                                                                                        placeholder="Details for this entry..."
                                                                                                    />
                                                                                                </div>
                                                                                            </div>
                                                                                        </Transition>
                                                                                    </motion.div>
                                                                                ))}
                                                                            </AnimatePresence>
                                                                            <button type="button" onClick={() => handleAddCustomSectionItem(sectionIndex)} className="bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 px-3 rounded-full text-xs shadow-md transition-colors mt-2"> + Add Entry </button>
                                                                        </div>
                                                                    </motion.div>
                                                                )}
                                                            </Draggable>
                                                        ))}
                                                    </AnimatePresence>
                                                    {provided.placeholder}
                                                </div>
                                            )}
                                        </Droppable>
                                        <button type="button" onClick={handleAddCustomSection} className={`${buttonClasses} w-full py-3 text-base mt-4`}> Add New Custom Section Block </button>
                                    </Disclosure.Panel>
                                </Transition>
                            </>
                        )}
                    </Disclosure>

                    {/* Customize Styles & Layout Section with Disclosure */}
                    <Disclosure as="div" className={`${editorSectionBg} p-4 rounded-lg`} defaultOpen={false}>
                        {({ open }) => (
                            <>
                                <Disclosure.Button className={editorSectionHeaderClasses}>
                                    <span>Customize Styles & Layout (Preview)</span>
                                    <ChevronDownIcon className={`w-5 h-5 text-emerald-400 transform transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
                                </Disclosure.Button>
                                <Transition show={open} enter="transition duration-100 ease-out" enterFrom="transform scale-95 opacity-0 max-h-0" enterTo="transform scale-100 opacity-100 max-h-screen" leave="transition duration-75 ease-out" leaveFrom="transform scale-100 opacity-100 max-h-screen" leaveTo="transform scale-95 opacity-0 max-h-0" >
                                    <Disclosure.Panel className="customization-section mt-3 space-y-6 overflow-hidden">
                                        {/* Conditionally show options NOT fixed by style-coder-min */}
                                        {activeTemplateIdForPreview !== 'style-coder-min' && (
                                            <>
                                                <div>
                                                    <label htmlFor="fontFamilyStyled" className={editorLabelClasses}>Font Family</label>
                                                    <select id="fontFamilyStyled" value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} className={editorInputClasses}>
                                                        {fontOptions.map(font => ( <option key={font.value} value={font.value}>{font.name}</option> ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label htmlFor="colorPaletteStyled" className={editorLabelClasses}>Color Palette</label>
                                                    <select id="colorPaletteStyled" onChange={(e) => handlePaletteChange(e.target.value)} className={editorInputClasses} >
                                                        <option value="">Select a Palette (Optional)</option>
                                                        {predefinedColorPalettes.map(palette => ( <option key={palette.name} value={palette.name}> {palette.name} </option> ))}
                                                    </select>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                                    <div>
                                                        <label htmlFor="headingColorStyled" className={editorLabelClasses}>Heading Color</label>
                                                        <input type="color" id="headingColorStyled" value={headingColor} onChange={(e) => setHeadingColor(e.target.value)} className={`${editorInputClasses} h-12 p-1 w-full`} />
                                                    </div>
                                                    <div>
                                                        <label htmlFor="bodyTextColorStyled" className={editorLabelClasses}>Body Text Color</label>
                                                        <input type="color" id="bodyTextColorStyled" value={bodyTextColor} onChange={(e) => setBodyTextColor(e.target.value)} className={`${editorInputClasses} h-12 p-1 w-full`} />
                                                    </div>
                                                    <div>
                                                        <label htmlFor="accentColorStyled" className={editorLabelClasses}>Primary Accent</label>
                                                        <input type="color" id="accentColorStyled" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className={`${editorInputClasses} h-12 p-1 w-full`} />
                                                    </div>
                                                    <div>
                                                        <label htmlFor="secondaryAccentColorStyled" className={editorLabelClasses}>Secondary Accent</label>
                                                        <input type="color" id="secondaryAccentColorStyled" value={secondaryAccentColor} onChange={(e) => setSecondaryAccentColor(e.target.value)} className={`${editorInputClasses} h-12 p-1 w-full`} />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label htmlFor="headerLayoutStyled" className={editorLabelClasses}>Header Layout</label>
                                                    <select id="headerLayoutStyled" value={headerLayout} onChange={(e) => setHeaderLayout(e.target.value)} className={editorInputClasses}>
                                                        {headerLayoutOptions.map(layout => ( <option key={layout.id} value={layout.id}>{layout.name}</option> ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label htmlFor="skillDisplayStyleStyled" className={editorLabelClasses}>Skill Display Style</label>
                                                    <select id="skillDisplayStyleStyled" value={skillDisplayStyle} onChange={(e) => setSkillDisplayStyle(e.target.value)} className={editorInputClasses}>
                                                        {skillDisplayOptions.map(option => ( <option key={option.id} value={option.id}>{option.name}</option> ))}
                                                    </select>
                                                </div>
                                            </>
                                        )}
                                        {/* Options always available */}
                                        <div>
                                            <label htmlFor="skillChipStyleOverrideStyled" className={editorLabelClasses}>Skill Chip Background</label>
                                            <select id="skillChipStyleOverrideStyled" value={skillChipStyleOverride} onChange={(e) => setSkillChipStyleOverride(e.target.value)} className={editorInputClasses} >
                                                <option value="theme">Follow Template Default</option>
                                                <option value="light">Light Background Chips</option>
                                                <option value="dark">Dark Background Chips</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label htmlFor="sectionSpacingStyled" className={editorLabelClasses}> Section Spacing: <span className="font-normal text-slate-400 text-xs">({sectionSpacing * 0.25}rem)</span> </label>
                                            <input type="range" id="sectionSpacingStyled" min="0" max="8" step="1" value={sectionSpacing} onChange={(e) => setSectionSpacing(Number(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                                            <div className="flex justify-between text-xs text-slate-400 px-1 mt-1"><span>Tight</span><span>Default</span><span>Spacious</span></div>
                                        </div>
                                    </Disclosure.Panel>
                                </Transition>
                            </>
                        )}
                    </Disclosure> 

                    <div className="save-button-container mt-8">
                        <button onClick={handleSavePortfolio} disabled={loading || isUploadingProfilePic || projects.some(p => p.isUploadingThumbnail)} className={`${buttonClasses} w-full text-lg py-3 disabled:opacity-70 disabled:cursor-not-allowed`}>
                            {saveButtonText}
                        </button>
                    </div>
                    {error && <p className="text-red-400 text-sm mt-4 text-center">{error}</p>}
                </div>

                {!isMobileView && (
                    <div className="preview-area sticky top-[calc(theme(spacing.4)+env(safe-area-inset-top))] max-h-[calc(100vh-100px)] overflow-y-auto custom-scrollbar bg-slate-100 dark:bg-slate-900 rounded-xl shadow-2xl transition-colors duration-300">
                         <PortfolioDisplay portfolioData={portfolioDataForPreview} />
                    </div>
                )}
            </div>
        </DragDropContext>
    );
}

export default LivePortfolioEditor;
