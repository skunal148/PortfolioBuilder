import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { storage, db, auth } from '../components/firebase'; // Adjusted path
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '../components/quill.css'; // Adjusted path
import { Disclosure, Transition } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';

import PortfolioDisplay from '../components/PortfolioDisplay'; // Adjusted path

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

// --- Definitions for Visual Storyteller Template ---
const VISUAL_STORYTELLER_DEFAULTS = {
    fontFamily: "'Playfair Display', serif",
    headingColor: '#2c3e50', // Dark grayish blue
    bodyTextColor: '#34495e', // Slightly lighter grayish blue
    accentColor: '#e74c3c',   // Muted Red / Coral
    secondaryAccentColor: '#f39c12', // Orange/Gold
    headerLayout: 'hero-banner',
    skillDisplayStyle: 'icon-only-chip',
    backgroundColor: '#ecf0f1', // Very light gray / clouds
    skillIconChipBackgroundColor: '#ffffff', // White chips
    skillIconChipTextColor: '#2c3e50',     // Dark text on chips
};

const fontOptions = [ // Could be tailored for visual templates
    { name: 'Playfair Display', value: "'Playfair Display', serif" },
    { name: 'Merriweather', value: "'Merriweather', serif" },
    { name: 'Montserrat', value: "'Montserrat', sans-serif" },
    { name: 'Open Sans', value: "'Open Sans', sans-serif" },
    { name: 'Lato', value: "'Lato', sans-serif" },
    { name: 'System Default', value: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"' },
];

const headerLayoutOptions = [ // Added 'hero-banner'
    { id: 'hero-banner', name: 'Hero Banner (Image Background)'},
    { id: 'image-top-center', name: 'Image Top, Text Centered' },
    { id: 'image-left-text-right', name: 'Image Left, Text Right' },
    { id: 'text-only-center', name: 'Text Only, Centered' },
];

const skillDisplayOptions = [ // Icon-focused options might be preferred
    { id: 'icon-only-chip', name: 'Icon Only (Chip)' },
    { id: 'icon-text-chip', name: 'Icon & Text (Chip)' },
    { id: 'text-only-list', name: 'Text Only (List)' },
];

const predefinedColorPalettes = [
    { name: 'Storyteller Default', ...VISUAL_STORYTELLER_DEFAULTS },
    { name: 'Warm Neutrals', headingColor: '#5D4037', bodyTextColor: '#795548', accentColor: '#FF9800', secondaryAccentColor: '#FFC107', backgroundColor: '#F5F5F5', skillIconChipBackgroundColor: '#FFFFFF', skillIconChipTextColor: '#5D4037'},
    { name: 'Cool & Crisp', headingColor: '#263238', bodyTextColor: '#455A64', accentColor: '#00ACC1', secondaryAccentColor: '#00838F', backgroundColor: '#ECEFF1', skillIconChipBackgroundColor: '#FFFFFF', skillIconChipTextColor: '#263238' },
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


function LiveVisualStorytellerEditor() {
    const { templateIdFromUrl, portfolioId } = useParams();
    const id = portfolioId;
    const navigate = useNavigate();
    const THIS_TEMPLATE_ID = 'style-visual-heavy';

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
    const [customSections, setCustomSections] = useState([]);

    // Styling & Layout States
    const [fontFamily, setFontFamily] = useState(VISUAL_STORYTELLER_DEFAULTS.fontFamily);
    const [headingColor, setHeadingColor] = useState(VISUAL_STORYTELLER_DEFAULTS.headingColor);
    const [bodyTextColor, setBodyTextColor] = useState(VISUAL_STORYTELLER_DEFAULTS.bodyTextColor);
    const [accentColor, setAccentColor] = useState(VISUAL_STORYTELLER_DEFAULTS.accentColor);
    const [secondaryAccentColor, setSecondaryAccentColor] = useState(VISUAL_STORYTELLER_DEFAULTS.secondaryAccentColor);
    const [headerLayout, setHeaderLayout] = useState(VISUAL_STORYTELLER_DEFAULTS.headerLayout);
    const [skillDisplayStyle, setSkillDisplayStyle] = useState(VISUAL_STORYTELLER_DEFAULTS.skillDisplayStyle);
    const [sectionSpacing, setSectionSpacing] = useState(4);
    const [skillChipStyleOverride, setSkillChipStyleOverride] = useState('theme');
    const [portfolioBackgroundColor, setPortfolioBackgroundColor] = useState(VISUAL_STORYTELLER_DEFAULTS.backgroundColor);
    const [heroImageUrl, setHeroImageUrl] = useState(''); // For hero banner layout
    const [heroImageFile, setHeroImageFile] = useState(null);

    // Technical States
    const [activeTemplateIdForPreview, setActiveTemplateIdForPreview] = useState(templateIdFromUrl || THIS_TEMPLATE_ID);
    const [isUploadingProfilePic, setIsUploadingProfilePic] = useState(false);
    const [isUploadingHeroImage, setIsUploadingHeroImage] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isMobileView, setIsMobileView] = useState(window.innerWidth < 1024);
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // Increased for potentially larger hero/project images

    
    useEffect(() => {
            const handleResize = () => setIsMobileView(window.innerWidth < 1024);
            window.addEventListener('resize', handleResize);
            handleResize();
            return () => window.removeEventListener('resize', handleResize);
    }, []);

    const loadPortfolioData = useCallback(async () => {
        setLoading(true);
        setError('');
        setActiveTemplateIdForPreview(THIS_TEMPLATE_ID); // This editor is only for style-visual-heavy

        // Apply defaults first
        setFontFamily(VISUAL_STORYTELLER_DEFAULTS.fontFamily);
        setHeadingColor(VISUAL_STORYTELLER_DEFAULTS.headingColor);
        setBodyTextColor(VISUAL_STORYTELLER_DEFAULTS.bodyTextColor);
        setAccentColor(VISUAL_STORYTELLER_DEFAULTS.accentColor);
        setSecondaryAccentColor(VISUAL_STORYTELLER_DEFAULTS.secondaryAccentColor);
        setHeaderLayout(VISUAL_STORYTELLER_DEFAULTS.headerLayout);
        setSkillDisplayStyle(VISUAL_STORYTELLER_DEFAULTS.skillDisplayStyle);
        setPortfolioBackgroundColor(VISUAL_STORYTELLER_DEFAULTS.backgroundColor);

        if (id) { // Editing existing portfolio
            try {
                const portfolioRef = doc(db, 'portfolios', id);
                const docSnap = await getDoc(portfolioRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setName(data.name || '');
                    setProfilePicture(data.profilePicture || '');
                    setHeroImageUrl(data.heroImageUrl || ''); // Load hero image
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

                    // Load customizable styles, overriding defaults if they exist
                    setFontFamily(data.fontFamily || VISUAL_STORYTELLER_DEFAULTS.fontFamily);
                    setHeadingColor(data.headingColor || VISUAL_STORYTELLER_DEFAULTS.headingColor);
                    setBodyTextColor(data.bodyTextColor || VISUAL_STORYTELLER_DEFAULTS.bodyTextColor);
                    setAccentColor(data.accentColor || VISUAL_STORYTELLER_DEFAULTS.accentColor);
                    setSecondaryAccentColor(data.secondaryAccentColor || VISUAL_STORYTELLER_DEFAULTS.secondaryAccentColor);
                    setHeaderLayout(data.headerLayout || VISUAL_STORYTELLER_DEFAULTS.headerLayout);
                    setSkillDisplayStyle(data.skillDisplayStyle || VISUAL_STORYTELLER_DEFAULTS.skillDisplayStyle);
                    setPortfolioBackgroundColor(data.portfolioBackgroundColor || VISUAL_STORYTELLER_DEFAULTS.backgroundColor);
                    
                    setSectionSpacing(data.sectionSpacing !== undefined ? data.sectionSpacing : 4);
                    setSkillChipStyleOverride(data.skillChipStyleOverride || 'theme');

                } else { setError('Portfolio not found.'); }
            } catch (err) {
                console.error("Error loading portfolio data:", err);
                setError('Failed to load portfolio data. Please try again.');
            } finally { setLoading(false); }
        } else { // New portfolio for style-visual-heavy
            setProjects([createNewProject()]);
            setLoading(false);
        }
    }, [id, templateIdFromUrl]); // templateIdFromUrl ensures re-fetch if user somehow changes it in URL for new

    useEffect(() => { loadPortfolioData(); }, [loadPortfolioData]);

    // --- Content Handler Functions ---
    // (Skills, Projects, Custom Sections handlers are similar to LiveBlankPortfolioEditor)
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
    
    // --- File Upload Handlers ---
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

    const handleHeroImageChange = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (file.size > MAX_FILE_SIZE) { // Use a general MAX_FILE_SIZE or a specific one for hero
            alert(`Hero image is too large. Max ${MAX_FILE_SIZE / (1024 * 1024)}MB.`);
            return;
        }
        setHeroImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setHeroImageUrl(reader.result); // For local preview
        reader.readAsDataURL(file);
    };
     const handleRemoveHeroImage = () => {
        setHeroImageUrl('');
        setHeroImageFile(null);
    };


    const handlePaletteChange = (paletteName) => {
        const selected = predefinedColorPalettes.find(p => p.name === paletteName);
        if (selected) {
            setFontFamily(selected.fontFamily || VISUAL_STORYTELLER_DEFAULTS.fontFamily);
            setHeadingColor(selected.headingColor);
            setBodyTextColor(selected.bodyTextColor);
            setAccentColor(selected.accentColor);
            setSecondaryAccentColor(selected.secondaryAccentColor);
            setPortfolioBackgroundColor(selected.backgroundColor || VISUAL_STORYTELLER_DEFAULTS.backgroundColor);
        } else { // Reset to visual storyteller defaults
            setFontFamily(VISUAL_STORYTELLER_DEFAULTS.fontFamily);
            setHeadingColor(VISUAL_STORYTELLER_DEFAULTS.headingColor);
            setBodyTextColor(VISUAL_STORYTELLER_DEFAULTS.bodyTextColor);
            setAccentColor(VISUAL_STORYTELLER_DEFAULTS.accentColor);
            setSecondaryAccentColor(VISUAL_STORYTELLER_DEFAULTS.secondaryAccentColor);
            setPortfolioBackgroundColor(VISUAL_STORYTELLER_DEFAULTS.backgroundColor);
        }
    };

const handleSavePortfolio = async () => {
        // ... (Full save logic, ensure it uses VISUAL_STORYTELLER_DEFAULTS for fixed styles when template is style-visual-heavy)
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
                fontFamily: activeTemplateIdForPreview === 'style-visual-heavy' ? VISUAL_STORYTELLER_DEFAULTS.fontFamily : fontFamily,
                headingColor: activeTemplateIdForPreview === 'style-visual-heavy' ? VISUAL_STORYTELLER_DEFAULTS.headingColor : headingColor,
                bodyTextColor: activeTemplateIdForPreview === 'style-visual-heavy' ? VISUAL_STORYTELLER_DEFAULTS.bodyTextColor : bodyTextColor,
                accentColor: activeTemplateIdForPreview === 'style-visual-heavy' ? VISUAL_STORYTELLER_DEFAULTS.accentColor : accentColor,
                secondaryAccentColor: activeTemplateIdForPreview === 'style-visual-heavy' ? VISUAL_STORYTELLER_DEFAULTS.secondaryAccentColor : secondaryAccentColor,
                headerLayout: activeTemplateIdForPreview === 'style-visual-heavy' ? VISUAL_STORYTELLER_DEFAULTS.headerLayout : headerLayout,
                skillDisplayStyle: activeTemplateIdForPreview === 'style-visual-heavy' ? VISUAL_STORYTELLER_DEFAULTS.skillDisplayStyle : skillDisplayStyle,
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
    // ... save button text logic ...

    const portfolioDataForPreview = {
        name, profilePicture, linkedinUrl, githubUrl, aboutMe, projects, skills, 
        customSections, 
        fontFamily, headingColor, bodyTextColor, accentColor, secondaryAccentColor,
        templateId: activeTemplateIdForPreview, 
        headerLayout, skillDisplayStyle, sectionSpacing,
        skillIconChipBackgroundColor: skillChipStyleOverride === 'light' ? '#E5E7EB' : (skillChipStyleOverride === 'dark' ? '#2D3748' : VISUAL_STORYTELLER_DEFAULTS.skillIconChipBackgroundColor),
        skillIconChipTextColor: skillChipStyleOverride === 'light' ? '#2D3748' : (skillChipStyleOverride === 'dark' ? '#E5E7EB' : VISUAL_STORYTELLER_DEFAULTS.skillIconChipTextColor),
        portfolioBackgroundColor: portfolioBackgroundColor, // Pass this for PortfolioDisplay
        heroImageUrl: heroImageUrl, // Pass hero image for preview
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
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                        <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-4 sm:mb-0 text-center sm:text-left">
                            {id ? `Edit Visual Portfolio` : `Create Visual Storyteller Portfolio`}
                        </h2>
                        {id && ( <button onClick={() => navigate(`/portfolio/${id}`)} className={`${secondaryButtonClasses} py-2 px-4 text-xs sm:text-sm whitespace-nowrap mt-2 sm:mt-0`}> View Live Portfolio </button> )}
                    </div>

                    {/* Basic Info Section */}
                    <div className={`${editorSectionBg} p-4 rounded-lg grid grid-cols-1 gap-y-6`}>
                        <h3 className={editorSectionHeaderClasses.replace('cursor-pointer', '')}>Basic Information</h3>
                        {/* ... Name, Profile Pic, LinkedIn, GitHub, About Me with Quill ... */}
                        <div>
                            <label htmlFor="heroImage-visual" className={editorLabelClasses}>Header Hero Image (Optional)</label>
                            <input type="file" id="heroImage-visual" accept="image/*" onChange={handleHeroImageChange} className={`${editorInputClasses} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-500 file:text-white hover:file:bg-emerald-600`} />
                            {isUploadingHeroImage && <p className="text-xs text-slate-400 mt-1">Uploading hero image...</p>}
                            <div className="mt-2 flex items-center space-x-2">
                                {heroImageUrl && heroImageUrl.startsWith('data:') && !isUploadingHeroImage && <img src={heroImageUrl} alt="Hero Preview" className="rounded max-h-32 object-contain"/>}
                                {heroImageUrl && !heroImageUrl.startsWith('data:') && !isUploadingHeroImage && <img src={heroImageUrl} alt="Current Hero" className="rounded max-h-32 object-contain"/>}
                                {heroImageUrl && (
                                    <button type="button" onClick={handleRemoveHeroImage} className="text-rose-500 hover:text-rose-400 p-1.5 rounded-full hover:bg-slate-700 transition-colors" aria-label="Remove hero image" >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                )}
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

                    {/* Custom Sections UI - Re-enabled */}
                    <Disclosure as="div" className={`${editorSectionBg} p-4 rounded-lg`} defaultOpen={false}>
                         {({ open }) => (
                            <>
                                <Disclosure.Button className={editorSectionHeaderClasses}>
                                    <span>Custom Sections (e.g., Testimonials, Services)</span>
                                     <ChevronDownIcon className={`w-5 h-5 text-emerald-400 transform transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
                                </Disclosure.Button>
                                <Transition show={open} enter="transition duration-100 ease-out" enterFrom="transform scale-95 opacity-0 max-h-0" enterTo="transform scale-100 opacity-100 max-h-screen" leave="transition duration-75 ease-out" leaveFrom="transform scale-100 opacity-100 max-h-screen" leaveTo="transform scale-95 opacity-0 max-h-0" >
                                    <Disclosure.Panel className="custom-sections-list mt-3 space-y-2 overflow-hidden">
                                        {/* ... Full Custom Sections UI from LiveBlankPortfolioEditor (with AnimatePresence for items) ... */}
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
                                        {/* Tailor these options for Visual Storyteller */}
                                        <div>
                                            <label htmlFor="fontFamilyVisual" className={editorLabelClasses}>Font Family</label>
                                            <select id="fontFamilyVisual" value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} className={editorInputClasses}>
                                                {fontOptions.map(font => ( <option key={font.value} value={font.value}>{font.name}</option> ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label htmlFor="colorPaletteVisual" className={editorLabelClasses}>Color Palette</label>
                                            <select id="colorPaletteVisual" onChange={(e) => handlePaletteChange(e.target.value)} className={editorInputClasses} >
                                                <option value="">Select a Palette (Optional)</option>
                                                {predefinedColorPalettes.map(palette => ( <option key={palette.name} value={palette.name}> {palette.name} </option> ))}
                                            </select>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                            {/* ... Color pickers ... */}
                                        </div>
                                        <div>
                                            <label htmlFor="headerLayoutVisual" className={editorLabelClasses}>Header Layout</label>
                                            <select id="headerLayoutVisual" value={headerLayout} onChange={(e) => setHeaderLayout(e.target.value)} className={editorInputClasses}>
                                                {headerLayoutOptions.map(layout => ( <option key={layout.id} value={layout.id}>{layout.name}</option> ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label htmlFor="skillDisplayStyleVisual" className={editorLabelClasses}>Skill Display Style</label>
                                            <select id="skillDisplayStyleVisual" value={skillDisplayStyle} onChange={(e) => setSkillDisplayStyle(e.target.value)} className={editorInputClasses}>
                                                {skillDisplayOptions.map(option => ( <option key={option.id} value={option.id}>{option.name}</option> ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label htmlFor="skillChipStyleOverrideVisual" className={editorLabelClasses}>Skill Chip Background</label>
                                            <select id="skillChipStyleOverrideVisual" value={skillChipStyleOverride} onChange={(e) => setSkillChipStyleOverride(e.target.value)} className={editorInputClasses} >
                                                <option value="theme">Follow Template Default</option>
                                                <option value="light">Light Background Chips</option>
                                                <option value="dark">Dark Background Chips</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label htmlFor="sectionSpacingVisual" className={editorLabelClasses}> Section Spacing: <span className="font-normal text-slate-400 text-xs">({sectionSpacing * 0.25}rem)</span> </label>
                                            <input type="range" id="sectionSpacingVisual" min="0" max="8" step="1" value={sectionSpacing} onChange={(e) => setSectionSpacing(Number(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                                            <div className="flex justify-between text-xs text-slate-400 px-1 mt-1"><span>Tight</span><span>Default</span><span>Spacious</span></div>
                                        </div>
                                        {/* Background color for the portfolio itself (can be part of palettes or a separate color picker) */}
                                        <div>
                                            <label htmlFor="portfolioBackgroundColorVisual" className={editorLabelClasses}>Portfolio Background Color</label>
                                            <input type="color" id="portfolioBackgroundColorVisual" value={portfolioBackgroundColor} onChange={(e) => setPortfolioBackgroundColor(e.target.value)} className={`${editorInputClasses} h-12 p-1 w-full`} />
                                        </div>
                                    </Disclosure.Panel>
                                </Transition>
                            </>
                        )}
                    </Disclosure>

                    <div className="save-button-container mt-8">
                        <button onClick={handleSavePortfolio} disabled={loading || isUploadingProfilePic || isUploadingHeroImage || projects.some(p => p.isUploadingThumbnail)} className={`${buttonClasses} w-full text-lg py-3 disabled:opacity-70 disabled:cursor-not-allowed`}>
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

export default LiveVisualStorytellerEditor;
