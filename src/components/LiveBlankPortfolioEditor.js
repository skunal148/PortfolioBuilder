import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { storage, db, auth } from './firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

import PortfolioDisplay from './PortfolioDisplay';

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

const TrashIcon = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12.56 0c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
);


const predefinedBackgroundThemes = [
  {
    id: 'blank-default', name: 'Default (Dark)',
    style: { backgroundColor: '#374151' },
    headingColor: '#E5E7EB', bodyTextColor: '#D1D5DB', accentColor: '#34D399',
    secondaryAccentColor: '#A78BFA', // Added for consistency with palettes
    skillIconChipBackgroundColor: '#4A5568',
    skillIconChipTextColor: '#F7FAFC'
  },
  {
    id: 'light-gentle', name: 'Light Gentle',
    style: { backgroundColor: '#F3F4F6' },
    headingColor: '#1F2937', bodyTextColor: '#374151', accentColor: '#3B82F6',
    secondaryAccentColor: '#EC4899',
    skillIconChipBackgroundColor: '#E5E7EB',
    skillIconChipTextColor: '#1F2937'
  },
  {
    id: 'ocean-breeze', name: 'Ocean Breeze',
    style: { backgroundImage: 'linear-gradient(to top right, #00c6ff, #0072ff)' },
    headingColor: '#FFFFFF', bodyTextColor: '#E0F2FE', accentColor: '#FDE047',
    secondaryAccentColor: '#FF7E5F',
    skillIconChipBackgroundColor: 'rgba(255, 255, 255, 0.2)',
    skillIconChipTextColor: '#FFFFFF'
  },
  {
    id: 'sunset-glow', name: 'Sunset Glow',
    style: { backgroundImage: 'linear-gradient(to top right, #ff7e5f, #feb47b)' },
    headingColor: '#FFFFFF', bodyTextColor: '#FFF7ED', accentColor: '#8B5CF6',
    secondaryAccentColor: '#FFC700',
    skillIconChipBackgroundColor: 'rgba(255, 255, 255, 0.25)',
    skillIconChipTextColor: '#FFFFFF'
  },
  {
    id: 'deep-space', name: 'Deep Space',
    style: { backgroundImage: 'linear-gradient(to bottom, #232526, #414345)' },
    headingColor: '#E5E7EB', bodyTextColor: '#D1D5DB', accentColor: '#A78BFA',
    secondaryAccentColor: '#FBBF24',
    skillIconChipBackgroundColor: 'rgba(255, 255, 255, 0.1)',
    skillIconChipTextColor: '#E5E7EB'
  },
];
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

const predefinedColorPalettes = [
    {
        name: 'Default Dark',
        headingColor: '#E5E7EB', bodyTextColor: '#D1D5DB',
        accentColor: '#34D399', secondaryAccentColor: '#A78BFA'
    },
    {
        name: 'Default Light',
        headingColor: '#1F2937', bodyTextColor: '#374151',
        accentColor: '#3B82F6', secondaryAccentColor: '#EC4899'
    },
    {
        name: 'Ocean Deep',
        headingColor: '#E0F2FE', bodyTextColor: '#93C5FD',
        accentColor: '#38BDF8', secondaryAccentColor: '#FDE047'
    },
    {
        name: 'Forest Whisper',
        headingColor: '#D1FAE5', bodyTextColor: '#A7F3D0',
        accentColor: '#34D399', secondaryAccentColor: '#F59E0B'
    },
    {
        name: 'Sunset Fire',
        headingColor: '#FFF7ED', bodyTextColor: '#FED7AA',
        accentColor: '#F97316', secondaryAccentColor: '#D946EF'
    },
    {
        name: 'Royal Purple',
        headingColor: '#E9D5FF', bodyTextColor: '#C084FC',
        accentColor: '#A855F7', secondaryAccentColor: '#FACC15'
    }
];


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


function LiveBlankPortfolioEditor() {
    const { portfolioId } = useParams();
    const id = portfolioId;
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [profilePicture, setProfilePicture] = useState('');
    const [profilePictureFile, setProfilePictureFile] = useState(null);
    const [linkedinUrl, setLinkedinUrl] = useState('');
    const [githubUrl, setGithubUrl] = useState('');
    const [aboutMe, setAboutMe] = useState('');
    const [projects, setProjects] = useState([createNewProject()]);
    // MODIFIED: Skills state to handle objects
    const [skills, setSkills] = useState([]);
    const [newSkillName, setNewSkillName] = useState('');
    const [newSkillLevel, setNewSkillLevel] = useState('Beginner'); // Default proficiency
    // END MODIFIED
    const [customSections, setCustomSections] = useState([]);
    const [customSectionsVisible, setCustomSectionsVisible] = useState(false);

    const initialTheme = predefinedBackgroundThemes[0];
    const [fontFamily, setFontFamily] = useState(fontOptions[0].value);
    const [headingColor, setHeadingColor] = useState(initialTheme.headingColor);
    const [bodyTextColor, setBodyTextColor] = useState(initialTheme.bodyTextColor);
    const [accentColor, setAccentColor] = useState(initialTheme.accentColor);
    const [secondaryAccentColor, setSecondaryAccentColor] = useState(initialTheme.secondaryAccentColor || predefinedColorPalettes[0].secondaryAccentColor);

    const [headerLayout, setHeaderLayout] = useState(headerLayoutOptions[0].id);
    const [skillDisplayStyle, setSkillDisplayStyle] = useState(skillDisplayOptions[0].id);
    const [sectionSpacing, setSectionSpacing] = useState(4);
    const [skillChipStyleOverride, setSkillChipStyleOverride] = useState('theme');


    const [backgroundType, setBackgroundType] = useState('theme');
    const [selectedBackgroundTheme, setSelectedBackgroundTheme] = useState(initialTheme.id);
    const [customBackgroundImageUrl, setCustomBackgroundImageUrl] = useState('');
    const [customBackgroundImageFile, setCustomBackgroundImageFile] = useState(null);
    const [isUploadingBackground, setIsUploadingBackground] = useState(false);
    const [backgroundUploadProgress, setBackgroundUploadProgress] = useState(0);

    const [projectsVisible, setProjectsVisible] = useState(true);
    const [skillsVisible, setSkillsVisible] = useState(true);
    const [customizeVisible, setCustomizeVisible] = useState(true);

    const MAX_PROJECT_THUMBNAIL_SIZE = 2 * 1024 * 1024;
    const MAX_PROFILE_PIC_SIZE = 5 * 1024 * 1024;
    const MAX_BACKGROUND_IMAGE_SIZE = 5 * 1024 * 1024;

    const [isUploadingProfilePic, setIsUploadingProfilePic] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isMobileView, setIsMobileView] = useState(window.innerWidth < 1024);


    const BLANK_TEMPLATE_ID = 'blank';

    useEffect(() => {
        const handleResize = () => {
            setIsMobileView(window.innerWidth < 1024);
        };
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);


    const loadPortfolioData = useCallback(async () => {
        setLoading(true);
        setError(null);
        if (id) {
            try {
                const portfolioDocRef = doc(db, 'portfolios', id);
                const portfolioSnap = await getDoc(portfolioDocRef);
                if (portfolioSnap.exists()) {
                    const data = portfolioSnap.data();
                    setName(data.name || '');
                    setProfilePicture(data.profilePicture || '');
                    setLinkedinUrl(data.linkedinUrl || '');
                    setGithubUrl(data.githubUrl || '');
                    setAboutMe(data.aboutMe || '');

                    setProjects(
                        Array.isArray(data.projects) && data.projects.length > 0
                        ? data.projects.map(p => {
                            const baseProject = createNewProject();
                            return {
                                ...baseProject,
                                ...p,
                                id: p.id ? String(p.id) : baseProject.id,
                                isCollapsed: p.isCollapsed !== undefined ? p.isCollapsed : false,
                                thumbnailFile: null,
                                isUploadingThumbnail: false,
                                thumbnailUploadProgress: 0
                            };
                          })
                        : [createNewProject()]
                    );

                    setFontFamily(data.fontFamily || fontOptions[0].value);
                    const loadedBgType = data.backgroundType || 'theme';
                    setBackgroundType(loadedBgType);
                    const loadedThemeId = data.selectedBackgroundTheme || predefinedBackgroundThemes[0].id;
                    setSelectedBackgroundTheme(loadedThemeId);

                    const themeForColors = predefinedBackgroundThemes.find(t => t.id === loadedThemeId) || predefinedBackgroundThemes[0];
                    setHeadingColor(data.headingColor || themeForColors.headingColor);
                    setBodyTextColor(data.bodyTextColor || themeForColors.bodyTextColor);
                    setAccentColor(data.accentColor || themeForColors.accentColor);
                    setSecondaryAccentColor(data.secondaryAccentColor || themeForColors.secondaryAccentColor || predefinedColorPalettes[0].secondaryAccentColor);

                    // MODIFIED: Load skills as array of objects
                    setSkills(Array.isArray(data.skills) ? data.skills : []);
                    // END MODIFIED

                    setCustomSections(
                        Array.isArray(data.customSections)
                        ? data.customSections.map(cs => {
                            const baseCustomSection = createNewCustomSection();
                            return {
                                ...baseCustomSection,
                                ...cs,
                                id: cs.id ? String(cs.id) : baseCustomSection.id,
                                items: Array.isArray(cs.items)
                                       ? cs.items.map(item => {
                                           const baseItem = createNewCustomSectionItem();
                                           return {...baseItem, ...item, id: item.id ? String(item.id) : baseItem.id, isCollapsed: item.isCollapsed !== undefined ? item.isCollapsed : false };
                                         })
                                       : []
                            };
                          })
                        : []
                    );

                    setSkillChipStyleOverride(data.skillChipStyleOverride || 'theme');

                    if (loadedBgType === 'customImage') {
                        setCustomBackgroundImageUrl(data.customBackgroundImageUrl || '');
                    } else {
                        setCustomBackgroundImageUrl('');
                    }
                    setHeaderLayout(data.headerLayout || headerLayoutOptions[0].id);
                    setSkillDisplayStyle(data.skillDisplayStyle || skillDisplayOptions[0].id);
                    setSectionSpacing(data.sectionSpacing !== undefined ? data.sectionSpacing : 4);
                    setProjectsVisible(data.projectsVisible !== undefined ? data.projectsVisible : true);
                    setSkillsVisible(data.skillsVisible !== undefined ? data.skillsVisible : true);
                    setCustomizeVisible(data.customizeVisible !== undefined ? data.customizeVisible : true);
                    setCustomSectionsVisible(data.customSectionsVisible !== undefined ? data.customSectionsVisible : false);
                } else { setError('Portfolio not found!'); }
            } catch (err) { setError(err.message || 'Failed to load portfolio data.');
            } finally { setLoading(false); }
        } else {
            const currentInitialTheme = predefinedBackgroundThemes.find(t => t.id === selectedBackgroundTheme) || predefinedBackgroundThemes[0];
            setHeadingColor(currentInitialTheme.headingColor);
            setBodyTextColor(currentInitialTheme.bodyTextColor);
            setAccentColor(currentInitialTheme.accentColor);
            setSecondaryAccentColor(currentInitialTheme.secondaryAccentColor || predefinedColorPalettes[0].secondaryAccentColor);
            setSkillChipStyleOverride('theme');
            setLoading(false);
        }
    }, [id]);  // Removed selectedBackgroundTheme from dependencies as it's set inside

    useEffect(() => {
        loadPortfolioData();
    }, [loadPortfolioData]);

    const handleAddProject = () => setProjects(prev => [...prev, createNewProject()]);
    const handleProjectChange = (index, field, value) => setProjects(prev => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
    const handleRemoveProject = (projectId) => setProjects(prev => prev.filter(p => p.id !== projectId));
    const handleToggleProjectItemCollapse = (projectId) => setProjects(prev => prev.map(p => p.id === projectId ? { ...p, isCollapsed: !p.isCollapsed } : p));

    const handleAddCustomSection = () => setCustomSections(prev => [...prev, createNewCustomSection()]);
    const handleCustomSectionTitleChange = (sectionIndex, title) => setCustomSections(prev => prev.map((s, i) => i === sectionIndex ? { ...s, sectionTitle: title } : s));
    const handleRemoveCustomSection = (sectionId) => setCustomSections(prev => prev.filter(s => s.id !== sectionId));
    const handleAddCustomSectionItem = (sectionIndex) => setCustomSections(prev => prev.map((s, i) => i === sectionIndex ? { ...s, items: [...s.items, createNewCustomSectionItem()] } : s));
    const handleCustomSectionItemChange = (sectionIndex, itemIndex, field, value) => setCustomSections(prev => prev.map((s, i) => i === sectionIndex ? { ...s, items: s.items.map((item, j) => j === itemIndex ? { ...item, [field]: value } : item) } : s));
    const handleRemoveCustomSectionItem = (sectionIndex, itemId) => setCustomSections(prev => prev.map((s, i) => i === sectionIndex ? { ...s, items: s.items.filter(item => item.id !== itemId) } : s));
    const handleToggleCustomSectionItemCollapse = (sectionIndex, itemId) => setCustomSections(prev => prev.map((s, i) => i === sectionIndex ? { ...s, items: s.items.map(item => item.id === itemId ? { ...item, isCollapsed: !item.isCollapsed } : item) } : s));

    const toggleProjects = () => setProjectsVisible(!projectsVisible);
    const toggleCustomize = () => setCustomizeVisible(!customizeVisible);
    const toggleSkills = () => setSkillsVisible(!skillsVisible);
    const toggleCustomSections = () => setCustomSectionsVisible(!customSectionsVisible);

    const arrowDown = '▼'; const arrowUp = '▲';

    const handleProjectThumbnailChange = async (projectIndex, event) => {
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

    const handleRemoveProjectThumbnail = (projectIndex) => {
        setProjects(prevProjects =>
            prevProjects.map((p, idx) =>
                idx === projectIndex
                ? { ...p, thumbnailUrl: '', thumbnailFile: null, isUploadingThumbnail: false, thumbnailUploadProgress: 0 }
                : p
            )
        );
    };

    const handleRemoveProfilePicture = () => {
        setProfilePicture('');
        setProfilePictureFile(null);
    };

    const handleSavePortfolio = async () => {
        if (!auth.currentUser) { setError("You must be logged in to save."); return; }
        if (isUploadingProfilePic || (profilePictureFile && profilePicture.startsWith('data:'))) {
            setError("Profile picture is still uploading. Please wait."); setLoading(false); return;
        }
        if (backgroundType === 'customImage' && !customBackgroundImageFile && customBackgroundImageUrl && customBackgroundImageUrl.startsWith('data:')) {
            setError("A background image was selected but not uploaded. Please re-select or choose a theme.");
            setLoading(false); return;
        }
        if (projects.some(p => p.isUploadingThumbnail || (p.thumbnailFile && p.thumbnailUrl.startsWith('data:')))) {
            setError("One or more project thumbnails are still uploading or haven't finished. Please wait."); setLoading(false); return;
        }
        setLoading(true); setError(null);
        let finalCustomBgImageUrl = customBackgroundImageUrl;
        let finalProfilePictureUrl = profilePicture;


        if (profilePictureFile) {
            setIsUploadingProfilePic(true);
            try {
                const storagePath = `profilePictures/${auth.currentUser.uid}/${Date.now()}_${profilePictureFile.name}`;
                const storageRefFirebase = ref(storage, storagePath);
                const uploadTask = uploadBytesResumable(storageRefFirebase, profilePictureFile);
                const snapshot = await uploadTask;
                finalProfilePictureUrl = await getDownloadURL(snapshot.ref);
                setProfilePicture(finalProfilePictureUrl);
                setProfilePictureFile(null);
            } catch (uploadError) {
                setError("Profile Picture Upload failed: " + uploadError.message);
                setIsUploadingProfilePic(false); setLoading(false); return;
            }
            setIsUploadingProfilePic(false);
        } else if (!profilePicture) {
            finalProfilePictureUrl = '';
        }


        if (backgroundType === 'customImage' && customBackgroundImageFile) {
            setIsUploadingBackground(true); setBackgroundUploadProgress(0);
            try {
                const bgStorageRef = ref(storage, `portfolioBackgrounds/${auth.currentUser.uid}/${Date.now()}_${customBackgroundImageFile.name}`);
                const bgUploadTask = uploadBytesResumable(bgStorageRef, customBackgroundImageFile);
                const snapshot = await bgUploadTask;
                finalCustomBgImageUrl = await getDownloadURL(snapshot.ref);
            } catch (bgUploadError) {
                setError("Failed to upload custom background image. Please try saving again.");
                setIsUploadingBackground(false); setLoading(false); return;
            }
        }

        const finalProjects = [...projects];
        for (let i = 0; i < finalProjects.length; i++) {
            if (finalProjects[i].thumbnailFile) {
                finalProjects[i].isUploadingThumbnail = true;
                try {
                    const thumbStoragePath = `projectThumbnails/${auth.currentUser.uid}/${finalProjects[i].id || Date.now()}/${finalProjects[i].thumbnailFile.name}`;
                    const thumbStorageRef = ref(storage, thumbStoragePath);
                    const thumbUploadTask = uploadBytesResumable(thumbStorageRef, finalProjects[i].thumbnailFile);
                    const thumbSnapshot = await thumbUploadTask;
                    finalProjects[i].thumbnailUrl = await getDownloadURL(thumbSnapshot.ref);
                    finalProjects[i].thumbnailFile = null;
                } catch (thumbError) {
                     setError(`Failed to upload thumbnail for Project ${i + 1}. Save aborted.`);
                     finalProjects[i].isUploadingThumbnail = false;
                     setProjects(finalProjects);
                     setLoading(false); return;
                }
                finalProjects[i].isUploadingThumbnail = false;
            } else if (!finalProjects[i].thumbnailUrl) {
                finalProjects[i].thumbnailUrl = '';
            }
        }
        setProjects(finalProjects);

        await savePortfolioDataToFirestore(finalCustomBgImageUrl, finalProfilePictureUrl, finalProjects);
    };

    const savePortfolioDataToFirestore = async (bgImageUrlForSave, profilePicUrlForSave, projectsForSave) => {
        const projectsToSave = projectsForSave.map(p => ({
            id: String(p.id),
            title: p.title, description: p.description,
            thumbnailUrl: p.thumbnailUrl && !p.thumbnailUrl.startsWith('data:') ? p.thumbnailUrl : '',
            liveDemoUrl: p.liveDemoUrl || '',
            sourceCodeUrl: p.sourceCodeUrl || '',
            videoUrl: p.videoUrl || '',
            isCollapsed: p.isCollapsed !== undefined ? p.isCollapsed : false
        }));

        const customSectionsToSave = customSections.map(cs => ({
            id: String(cs.id),
            sectionTitle: cs.sectionTitle,
            items: cs.items.map(item => ({
                id: String(item.id),
                itemTitle: item.itemTitle,
                itemDetails: item.itemDetails,
                isCollapsed: item.isCollapsed !== undefined ? item.isCollapsed : false
            }))
        }));

        const portfolioData = {
            userId: auth.currentUser.uid, templateId: BLANK_TEMPLATE_ID,
            name, profilePicture: profilePicUrlForSave,
            linkedinUrl,
            githubUrl,
            aboutMe,
            projects: projectsToSave,
            fontFamily, headingColor, bodyTextColor, accentColor,
            secondaryAccentColor: secondaryAccentColor,
            headerLayout,
            skills, // MODIFIED: skills is now an array of objects
            skillDisplayStyle, sectionSpacing,
            customSections: customSectionsToSave,
            projectsVisible, customizeVisible, skillsVisible,
            customSectionsVisible,
            skillChipStyleOverride: skillChipStyleOverride,
            lastUpdated: serverTimestamp(),
            backgroundType,
            selectedBackgroundTheme: backgroundType === 'theme' ? selectedBackgroundTheme : null,
            customBackgroundImageUrl: (backgroundType === 'customImage' && bgImageUrlForSave && !bgImageUrlForSave.startsWith('data:')) ? bgImageUrlForSave : null,
        };
        console.log("[Save Firestore] Saving data:", portfolioData);
        try {
            let newPortfolioId = id;
            if (id) {
                await updateDoc(doc(db, 'portfolios', id), portfolioData);
            } else {
                const docRef = await addDoc(collection(db, 'portfolios'), { ...portfolioData, createdAt: serverTimestamp() });
                newPortfolioId = docRef.id;
            }

            if (backgroundType === 'customImage' && customBackgroundImageFile && bgImageUrlForSave) {
                setCustomBackgroundImageUrl(bgImageUrlForSave);
                setCustomBackgroundImageFile(null);
            }
            setIsUploadingBackground(false);
            setBackgroundUploadProgress(0);

            if (!id && newPortfolioId) {
                navigate(`/edit-blank/${newPortfolioId}`, { replace: true });
            } else {
                alert('Portfolio saved successfully!');
                if(id) loadPortfolioData();
            }
        } catch (error) {
            setError(error.message || 'Failed to save portfolio data.');
            console.error("[Save Firestore] Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleProfilePictureChange = async (event) => {
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
    };
    const handleCustomBackgroundChange = (event) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > MAX_BACKGROUND_IMAGE_SIZE) {
                alert(`Background image size too large. Max ${MAX_BACKGROUND_IMAGE_SIZE / (1024 * 1024)}MB.`);
                event.target.value = ''; return;
            }
            setCustomBackgroundImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setCustomBackgroundImageUrl(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleBackgroundThemeChange = (themeId) => {
        setSelectedBackgroundTheme(themeId);
        const theme = predefinedBackgroundThemes.find(t => t.id === themeId);
        if (theme) {
            setHeadingColor(theme.headingColor || '#E5E7EB');
            setBodyTextColor(theme.bodyTextColor || '#D1D5DB');
            setAccentColor(theme.accentColor || '#34D399');
            setSecondaryAccentColor(theme.secondaryAccentColor || predefinedColorPalettes.find(p=>p.name === 'Default Dark')?.secondaryAccentColor || '#A78BFA');
        }
    };

    const handleBackgroundTypeChange = (newType) => {
        setBackgroundType(newType);
        if (newType === 'theme') {
            setCustomBackgroundImageFile(null);
            setCustomBackgroundImageUrl('');
            setIsUploadingBackground(false);
            setBackgroundUploadProgress(0);

            const currentSelectedThemeObj = predefinedBackgroundThemes.find(t => t.id === selectedBackgroundTheme) || predefinedBackgroundThemes[0];
            setHeadingColor(currentSelectedThemeObj.headingColor);
            setBodyTextColor(currentSelectedThemeObj.bodyTextColor);
            setAccentColor(currentSelectedThemeObj.accentColor);
            setSecondaryAccentColor(currentSelectedThemeObj.secondaryAccentColor || predefinedColorPalettes[0].secondaryAccentColor);
        }
    };

    const handlePaletteChange = (paletteName) => {
        const selected = predefinedColorPalettes.find(p => p.name === paletteName);
        if (selected) {
            setHeadingColor(selected.headingColor);
            setBodyTextColor(selected.bodyTextColor);
            setAccentColor(selected.accentColor);
            setSecondaryAccentColor(selected.secondaryAccentColor);
        }
    };


    // MODIFIED: handleAddSkill to include proficiency
    const handleAddSkill = () => {
        if (newSkillName.trim()) {
            const skillExists = skills.some(skill => skill.name.toLowerCase() === newSkillName.trim().toLowerCase());
            if (!skillExists) {
                setSkills(prevSkills => [...prevSkills, { name: newSkillName.trim(), level: newSkillLevel }]);
                setNewSkillName('');
                setNewSkillLevel('Beginner'); // Reset to default
            } else {
                alert("This skill has already been added.");
            }
        }
    };
    // MODIFIED: handleRemoveSkill to work with skill objects
    const handleRemoveSkill = (skillNameToRemove) => { // Assuming skillNameToRemove is the name string
        setSkills(prevSkills => prevSkills.filter(skill => skill.name !== skillNameToRemove));
    };
    // END MODIFIED

    const handleViewLivePortfolio = () => {
        if (id) {
            const unsavedChanges = profilePictureFile || customBackgroundImageFile || projects.some(p => p.thumbnailFile);
            if (unsavedChanges) {
                if (window.confirm("You have unsaved changes that will not be reflected in the live view until you save. View anyway?")) {
                    navigate(`/portfolio/${id}`);
                }
            } else {
                 navigate(`/portfolio/${id}`);
            }
        } else {
            setError("Please save the portfolio first to view it live.");
        }
    };

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

    if (loading && !id) return <div className="flex justify-center items-center min-h-screen text-xl text-slate-300">Initializing New Portfolio...</div>;
    if (loading && id) return <div className="flex justify-center items-center min-h-screen text-xl text-slate-300">Loading Portfolio Data...</div>;
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

    const inputClasses = "shadow-inner appearance-none border border-slate-700 rounded w-full py-3 px-4 bg-slate-700 text-slate-100 leading-tight focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-slate-500";
    const labelClasses = "block text-slate-300 text-sm font-semibold mb-2";
    const sectionHeaderClasses = "text-2xl font-semibold text-emerald-400 mb-3 cursor-pointer flex justify-between items-center";
    const buttonClasses = "bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 px-4 rounded-lg text-sm shadow-md transition-colors";
    const secondaryButtonClasses = "bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg text-sm shadow-md transition-colors";
    const smallButtonClasses = "text-xs py-1 px-2 rounded-md";

    let saveButtonText = id ? 'Update Blank Portfolio' : 'Save Blank Portfolio';
    if (isUploadingBackground) saveButtonText = `Uploading BG (${backgroundUploadProgress.toFixed(0)}%)...`;
    else if (isUploadingProfilePic) saveButtonText = 'Uploading Pic...';
    else if (projects.some(p => p.isUploadingThumbnail)) saveButtonText = 'Uploading Thumbs...';
    else if (loading) saveButtonText = 'Processing...';

    let finalSkillChipBg;
    let finalSkillChipText;
    const currentSelectedThemeObject = predefinedBackgroundThemes.find(t => t.id === selectedBackgroundTheme) || predefinedBackgroundThemes[0];

    if (skillChipStyleOverride === 'light') {
        finalSkillChipBg = '#E2E8F0';
        finalSkillChipText = '#2D3748';
    } else if (skillChipStyleOverride === 'dark') {
        finalSkillChipBg = '#2D3748';
        finalSkillChipText = '#E2E8F0';
    } else {
        finalSkillChipBg = currentSelectedThemeObject.skillIconChipBackgroundColor || '#4A5568';
        finalSkillChipText = currentSelectedThemeObject.skillIconChipTextColor || bodyTextColor;
    }

    const portfolioDataForPreview = {
        name, profilePicture, linkedinUrl, githubUrl, aboutMe, projects, skills, // skills is now an array of objects
        fontFamily, headingColor, bodyTextColor, accentColor,
        secondaryAccentColor,
        templateId: BLANK_TEMPLATE_ID,
        backgroundType, selectedBackgroundTheme, customBackgroundImageUrl,
        headerLayout, skillDisplayStyle, sectionSpacing,
        customSections,
        skillIconChipBackgroundColor: finalSkillChipBg,
        skillIconChipTextColor: finalSkillChipText,
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className={`live-portfolio-editor-container container mx-auto p-4 md:p-6 grid ${isMobileView ? 'grid-cols-1' : 'lg:grid-cols-2'} gap-6 items-start`}>
                <div className={`input-area bg-slate-800 p-4 sm:p-6 rounded-xl shadow-2xl space-y-6 ${isMobileView ? 'w-full' : 'max-h-[calc(100vh-100px)] overflow-y-auto custom-scrollbar'}`}>
                     <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                        <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-4 sm:mb-0 text-center sm:text-left">
                            {id ? 'Edit Your Portfolio (Blank)' : 'Create Blank Portfolio'}
                        </h2>
                        {id && ( <button onClick={handleViewLivePortfolio} className={`${secondaryButtonClasses} py-2 px-4 text-xs sm:text-sm whitespace-nowrap mt-2 sm:mt-0`}> View Live Portfolio </button> )}
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
                                {(profilePicture && profilePicture.startsWith('data:')) && !isUploadingProfilePic && <img src={profilePicture} alt="Preview" className="rounded-full h-16 w-16 sm:h-20 sm:w-20 object-cover"/>}
                                {(profilePicture && !profilePicture.startsWith('data:')) && !isUploadingProfilePic && <img src={profilePicture} alt="Current" className="rounded-full h-16 w-16 sm:h-20 sm:w-20 object-cover"/>}
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
                    {/* Skills Section - MODIFIED */}
                    <div className="collapsible-section bg-slate-850 p-4 rounded-lg">
                        <h3 onClick={toggleSkills} className={sectionHeaderClasses}>
                            <span>Skills</span>
                            <span>{skillsVisible ? arrowUp : arrowDown}</span>
                        </h3>
                        {skillsVisible && (
                            <div className="skills-section mt-3 space-y-3">
                                <div className="add-skill-input flex items-start space-x-2"> {/* Changed items-end to items-start */}
                                    <div className="flex-grow">
                                        <label htmlFor="newSkillName" className={labelClasses}>Skill Name</label>
                                        <input
                                            type="text"
                                            id="newSkillName"
                                            value={newSkillName}
                                            onChange={(e) => setNewSkillName(e.target.value)}
                                            onKeyPress={(e) => { if (e.key === 'Enter') handleAddSkill();}}
                                            className={`${inputClasses} md:w-full`}
                                            placeholder="e.g., React"
                                        />
                                    </div>
                                    <div className="flex-grow-0 w-1/3"> {/* Adjust width as needed */}
                                        <label htmlFor="newSkillLevel" className={labelClasses}>Proficiency</label>
                                        <select
                                            id="newSkillLevel"
                                            value={newSkillLevel}
                                            onChange={(e) => setNewSkillLevel(e.target.value)}
                                            className={`${inputClasses} md:w-full`}
                                        >
                                            <option value="Beginner">Beginner</option>
                                            <option value="Intermediate">Intermediate</option>
                                            <option value="Advanced">Advanced</option>
                                            <option value="Expert">Expert</option>
                                        </select>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleAddSkill}
                                        className={`${buttonClasses} ${smallButtonClasses} self-end mb-px`} // Use self-end to align button with bottom of inputs
                                    >
                                        Add
                                    </button>
                                </div>
                                {skills.length > 0 && (
                                    <Droppable droppableId="skillsDroppable" type="SKILLS">
                                        {(provided, snapshot) => (
                                            <ul
                                                ref={provided.innerRef}
                                                {...provided.droppableProps}
                                                className={`skills-list space-y-1 mt-2 ${snapshot.isDraggingOver ? 'bg-slate-700/20 rounded p-1' : ''}`}
                                            >
                                                {skills.map((skillObj, index) => ( // skill is now skillObj
                                                    <Draggable key={`skill-${skillObj.name}-${index}`} draggableId={`skill-${skillObj.name}-${index}`} index={index} isDragDisabled={isMobileView}>
                                                        {(providedDraggable, snapshotDraggable) => (
                                                            <li
                                                                ref={providedDraggable.innerRef}
                                                                {...providedDraggable.draggableProps}
                                                                className={`flex justify-between items-center bg-slate-700 p-2 rounded text-sm text-slate-200 ${snapshotDraggable.isDragging ? 'shadow-lg ring-1 ring-emerald-400' : ''}`}
                                                            >
                                                                <div {...providedDraggable.dragHandleProps} className={`p-1 mr-2 ${isMobileView ? 'cursor-default opacity-50' : 'cursor-grab active:cursor-grabbing'}`}>
                                                                    <DragHandleIcon className="w-4 h-4 text-slate-500" />
                                                                </div>
                                                                <span className="flex-grow">{skillObj.name} ({skillObj.level})</span> {/* Display name and level */}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveSkill(skillObj.name)} // Pass skill name to remove
                                                                    className="text-rose-400 hover:text-rose-300 p-1 rounded-full hover:bg-slate-600 transition-colors"
                                                                    aria-label={`Remove skill ${skillObj.name}`}
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
                    {/* END MODIFIED Skills Section */}
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
                                            <Draggable key={project.id} draggableId={String(project.id)} index={index} isDragDisabled={isMobileView}>
                                                {(providedDraggable, snapshotDraggable) => (
                                                    <div
                                                        ref={providedDraggable.innerRef}
                                                        {...providedDraggable.draggableProps}
                                                        className={`project-item-editor-wrapper bg-slate-700 rounded-md shadow-md ${snapshotDraggable.isDragging ? 'shadow-xl ring-2 ring-emerald-500' : ''}`}
                                                    >
                                                        <div className="flex justify-between items-center p-3 border-b border-slate-600">
                                                            <div className="flex items-center flex-grow">
                                                                <div {...providedDraggable.dragHandleProps} className={`p-1 mr-2 ${isMobileView ? 'cursor-default opacity-50' : 'cursor-grab active:cursor-grabbing'}`}>
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
                                                <Draggable key={section.id} draggableId={String(section.id)} index={sectionIndex} isDragDisabled={isMobileView}>
                                                    {(providedDraggable, snapshotDraggable) => (
                                                        <div
                                                            ref={providedDraggable.innerRef}
                                                            {...providedDraggable.draggableProps}
                                                            className={`custom-section-block-editor bg-slate-750 rounded-lg border border-slate-700 ${snapshotDraggable.isDragging ? 'shadow-xl ring-2 ring-emerald-500' : ''}`}
                                                        >
                                                            <div className="flex justify-between items-center p-3 border-b border-slate-600">
                                                                <div {...providedDraggable.dragHandleProps} className={`p-1 mr-2 ${isMobileView ? 'cursor-default opacity-50' : 'cursor-grab active:cursor-grabbing'}`}>
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
                                <div>
                                    <label htmlFor="colorPalette" className={labelClasses}>Color Palette</label>
                                    <select
                                        id="colorPalette"
                                        onChange={(e) => handlePaletteChange(e.target.value)}
                                        className={inputClasses}
                                    >
                                        <option value="">Select a Palette (Optional)</option>
                                        {predefinedColorPalettes.map(palette => (
                                            <option key={palette.name} value={palette.name}>
                                                {palette.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="headingColor" className={labelClasses}>Heading Color</label>
                                        <input type="color" id="headingColor" value={headingColor} onChange={(e) => setHeadingColor(e.target.value)} className={`${inputClasses} h-12 p-1 w-full`} />
                                    </div>
                                    <div>
                                        <label htmlFor="bodyTextColor" className={labelClasses}>Body Text Color</label>
                                        <input type="color" id="bodyTextColor" value={bodyTextColor} onChange={(e) => setBodyTextColor(e.target.value)} className={`${inputClasses} h-12 p-1 w-full`} />
                                    </div>
                                    <div>
                                        <label htmlFor="accentColor" className={labelClasses}>Primary Accent</label>
                                        <input type="color" id="accentColor" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className={`${inputClasses} h-12 p-1 w-full`} />
                                    </div>
                                    <div>
                                        <label htmlFor="secondaryAccentColor" className={labelClasses}>Secondary Accent</label>
                                        <input type="color" id="secondaryAccentColor" value={secondaryAccentColor} onChange={(e) => setSecondaryAccentColor(e.target.value)} className={`${inputClasses} h-12 p-1 w-full`} />
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
                                    <label htmlFor="skillChipStyleOverride" className={labelClasses}>Skill Chip Background</label>
                                    <select
                                        id="skillChipStyleOverride"
                                        value={skillChipStyleOverride}
                                        onChange={(e) => setSkillChipStyleOverride(e.target.value)}
                                        className={inputClasses}
                                    >
                                        <option value="theme">Follow Main Theme</option>
                                        <option value="light">Light Background Chips</option>
                                        <option value="dark">Dark Background Chips</option>
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
                                {/* Background Style options for Blank Template Editor are here */}
                                <div>
                                    <label className={labelClasses}>Background Style</label>
                                    <div className="flex space-x-4 mb-3">
                                        <label className="flex items-center space-x-2 text-slate-300">
                                            <input type="radio" name="backgroundType" value="theme" checked={backgroundType === 'theme'} onChange={(e) => handleBackgroundTypeChange(e.target.value)} className="form-radio text-emerald-500 focus:ring-emerald-500"/>
                                            <span>Predefined Theme</span>
                                        </label>
                                        <label className="flex items-center space-x-2 text-slate-300">
                                            <input type="radio" name="backgroundType" value="customImage" checked={backgroundType === 'customImage'} onChange={(e) => handleBackgroundTypeChange(e.target.value)} className="form-radio text-emerald-500 focus:ring-emerald-500"/>
                                            <span>Custom Image</span>
                                        </label>
                                    </div>
                                    <>
                                        {backgroundType === 'theme' && (
                                            <div>
                                                <label htmlFor="backgroundTheme" className={labelClasses}>Select Theme</label>
                                                <select id="backgroundTheme" value={selectedBackgroundTheme} onChange={(e) => handleBackgroundThemeChange(e.target.value)} className={inputClasses}>
                                                    {predefinedBackgroundThemes.map(theme => (
                                                        <option key={theme.id} value={theme.id}>{theme.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                        {backgroundType === 'customImage' && (
                                            <div>
                                                <label htmlFor="customBackgroundImage" className={labelClasses}>Upload Background Image</label>
                                                <input type="file" id="customBackgroundImage" accept="image/*" onChange={handleCustomBackgroundChange} className={`${inputClasses} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100`} />
                                                {isUploadingBackground && <p className="text-xs text-slate-400 mt-1">Uploading background ({backgroundUploadProgress.toFixed(0)}%)...</p>}
                                                {customBackgroundImageUrl && !customBackgroundImageUrl.startsWith('data:') && !isUploadingBackground && (
                                                    <p className="text-xs text-emerald-400 mt-1">Background image ready.</p>
                                                )}
                                                {customBackgroundImageUrl && customBackgroundImageUrl.startsWith('data:') && !isUploadingBackground && (
                                                    <img src={customBackgroundImageUrl} alt="Background Preview" className="mt-2 rounded max-h-32 object-contain" />
                                                )}
                                            </div>
                                        )}
                                    </>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="save-button-container mt-8">
                        <button onClick={handleSavePortfolio} disabled={loading || isUploadingProfilePic || isUploadingBackground || projects.some(p => p.isUploadingThumbnail)} className={`${buttonClasses} w-full text-lg py-3 disabled:opacity-70 disabled:cursor-not-allowed`}>
                            {saveButtonText}
                        </button>
                    </div>
                    {error && <p className="text-red-400 text-sm mt-4 text-center">{error}</p>}
                </div>

                {!isMobileView && (
                    <div className="preview-area sticky top-[calc(theme(spacing.4)+env(safe-area-inset-top))] max-h-[calc(100vh-100px)] overflow-y-auto custom-scrollbar bg-slate-900 rounded-xl shadow-2xl">
                         <PortfolioDisplay portfolioData={portfolioDataForPreview} />
                    </div>
                )}
            </div>
        </DragDropContext>
    );
}

export default LiveBlankPortfolioEditor;