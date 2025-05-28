// src/templates/LiveBoldInnovatorEditor.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { storage, db, auth } from '../components/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '../components/quill.css';
import { Disclosure, Transition } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';

import PortfolioDisplay from '../components/PortfolioDisplay';

// --- Icons ---
const RemoveIcon = ({ className = "w-4 h-4" }) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}> <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12.56 0c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /> </svg> );
const DragHandleIcon = ({ className = "w-5 h-5 text-slate-400 cursor-grab" }) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}> <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" /> </svg> );
const ChevronDownIcon = ({ className = "w-5 h-5" }) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}> <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /> </svg> );
const TrashIcon = ({ className = "w-5 h-5" }) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}> <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12.56 0c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /> </svg> );
// --- END Icons ---

// --- Definitions for Bold Innovator Template ---
const BOLD_INNOVATOR_DEFAULTS = {
    fontFamily: "'Montserrat', sans-serif",
    headingColor: '#FFFFFF', 
    bodyTextColor: '#E0E0E0',   
    accentColor: '#00F0FF', 
    secondaryAccentColor: '#FF007A',
    headerLayout: 'split-screen-graphic-left', 
    skillDisplayStyle: 'icon-text-chip',
    backgroundColor: '#1A1A2E', 
    skillIconChipBackgroundColor: 'rgba(0, 240, 255, 0.1)', 
    skillIconChipTextColor: '#00F0FF',     
    tagline: 'Innovating the Future | Bold Thinker',
};

const boldFontOptions = [ 
    { name: 'Montserrat', value: "'Montserrat', sans-serif" },
    { name: 'Poppins', value: "'Poppins', sans-serif" },
    { name: 'Nunito Sans', value: "'Nunito Sans', sans-serif" },
    { name: 'Inter', value: "'Inter', sans-serif" },
    { name: 'System Default', value: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"' },
];

const boldHeaderLayoutOptions = [ 
    { id: 'split-screen-graphic-left', name: 'Split Screen (Graphic Left, Text Right)' },
    { id: 'typographic-statement-center', name: 'Typographic Statement (Centered)' },
    { id: 'image-left-text-right', name: 'Standard (Image Left, Text Right)' },
];

const boldSkillDisplayOptions = [
    { id: 'icon-text-chip', name: 'Icon & Text (Chip - Bold Style)' },
    { id: 'icon-only-chip', name: 'Icon Only (Chip - Bold Style)' },
    { id: 'text-only-list', name: 'Text Only (List - Bold Style)' },
];

const boldPredefinedColorPalettes = [
    { name: 'Innovator Default (Neon)', ...BOLD_INNOVATOR_DEFAULTS },
    { name: 'Cyberpunk Night', headingColor: '#FDFDFD', bodyTextColor: '#C0C0C0', accentColor: '#00FFFF', secondaryAccentColor: '#FF00FF', backgroundColor: '#0F0F23', skillIconChipBackgroundColor: 'rgba(0, 255, 255, 0.1)', skillIconChipTextColor: '#00FFFF'},
    { name: 'Electric Gradient', headingColor: '#FFFFFF', bodyTextColor: '#F0F0F0', accentColor: '#FFD700', secondaryAccentColor: '#FF69B4', backgroundColor: 'linear-gradient(45deg, #FF007A, #9F00FF)', skillIconChipBackgroundColor: 'rgba(255,255,255,0.15)', skillIconChipTextColor: '#FFFFFF' },
    { name: 'Dark Teal & Orange', headingColor: '#E0E7FF', bodyTextColor: '#A7B3C3', accentColor: '#FF8C00', secondaryAccentColor: '#008080', backgroundColor: '#0B132B', skillIconChipBackgroundColor: 'rgba(0, 128, 128, 0.2)', skillIconChipTextColor: '#FF8C00' },
];
// --- END Definitions ---

const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{'list': 'ordered'}, {'list': 'bullet'}],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'font': [] }],
    [{ 'align': [] }],
    ['link'],
    ['clean']
  ],
};
const quillFormats = [ 'header', 'bold', 'italic', 'underline', 'strike', 'list', 'bullet', 'link', 'color', 'background', 'font', 'align'];

const generateStableId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
const createNewProject = () => ({ id: generateStableId('project'), title: '', description: '', skillsUsed: [], thumbnailUrl: '', thumbnailFile: null, isUploadingThumbnail: false, thumbnailUploadProgress: 0, liveDemoUrl: '', sourceCodeUrl: '', videoUrl: '', isCollapsed: false });
const createNewCustomSection = () => ({ id: generateStableId('customSection'), sectionTitle: '', items: [] });
const createNewCustomSectionItem = () => ({ id: generateStableId('customItem'), itemTitle: '', itemDetails: '', isCollapsed: false });
const createNewCertification = () => ({ id: generateStableId('certification'), title: '', issuingBody: '', dateIssued: '', credentialId: '', credentialUrl: '', certificateFile: null, certificateUrl: '', isUploadingCertificate: false, certificateUploadProgress: 0, isCollapsed: false });


function LiveBoldInnovatorEditor() {
    const { templateIdFromUrl, portfolioId } = useParams();
    const id = portfolioId;
    const navigate = useNavigate();
    const THIS_TEMPLATE_ID = 'style-bold-asymm';

    // Content States
    const [name, setName] = useState('');
    const [profilePicture, setProfilePicture] = useState(''); 
    const [profilePictureFile, setProfilePictureFile] = useState(null);
    const [tagline, setTagline] = useState(BOLD_INNOVATOR_DEFAULTS.tagline);
    const [linkedinUrl, setLinkedinUrl] = useState('');
    const [githubUrl, setGithubUrl] = useState('');
    const [resumeUrl, setResumeUrl] = useState('');
    const [resumeFile, setResumeFile] = useState(null);
    const [aboutMe, setAboutMe] = useState('');
    const [projects, setProjects] = useState([createNewProject()]);
    const [skills, setSkills] = useState([]);
    const [newSkillName, setNewSkillName] = useState('');
    const [newSkillLevel, setNewSkillLevel] = useState('Advanced');
    const [customSections, setCustomSections] = useState([]);
    const [certifications, setCertifications] = useState([createNewCertification()]);

    // Styling & Layout States for Portfolio Preview
    const [fontFamily, setFontFamily] = useState(BOLD_INNOVATOR_DEFAULTS.fontFamily);
    const [headingColor, setHeadingColor] = useState(BOLD_INNOVATOR_DEFAULTS.headingColor);
    const [bodyTextColor, setBodyTextColor] = useState(BOLD_INNOVATOR_DEFAULTS.bodyTextColor);
    const [accentColor, setAccentColor] = useState(BOLD_INNOVATOR_DEFAULTS.accentColor);
    const [secondaryAccentColor, setSecondaryAccentColor] = useState(BOLD_INNOVATOR_DEFAULTS.secondaryAccentColor);
    const [headerLayout, setHeaderLayout] = useState(BOLD_INNOVATOR_DEFAULTS.headerLayout);
    const [skillDisplayStyle, setSkillDisplayStyle] = useState(BOLD_INNOVATOR_DEFAULTS.skillDisplayStyle);
    const [sectionSpacing, setSectionSpacing] = useState(5);
    const [skillChipStyleOverride, setSkillChipStyleOverride] = useState('theme');
    const [portfolioBackgroundColor, setPortfolioBackgroundColor] = useState(BOLD_INNOVATOR_DEFAULTS.backgroundColor);
    
    // Technical States
    const [activeTemplateIdForPreview, setActiveTemplateIdForPreview] = useState(templateIdFromUrl || THIS_TEMPLATE_ID);
    const [isUploadingProfilePic, setIsUploadingProfilePic] = useState(false);
    const [isUploadingResume, setIsUploadingResume] = useState(false);
    const [resumeUploadProgress, setResumeUploadProgress] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isMobileView, setIsMobileView] = useState(window.innerWidth < 1024);
    const MAX_FILE_SIZE = 8 * 1024 * 1024; 

    useEffect(() => {
        const handleResize = () => setIsMobileView(window.innerWidth < 1024);
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const loadPortfolioData = useCallback(async () => {
        setLoading(true); setError(''); setActiveTemplateIdForPreview(THIS_TEMPLATE_ID);
        
        setFontFamily(BOLD_INNOVATOR_DEFAULTS.fontFamily);
        setHeadingColor(BOLD_INNOVATOR_DEFAULTS.headingColor);
        setBodyTextColor(BOLD_INNOVATOR_DEFAULTS.bodyTextColor);
        setAccentColor(BOLD_INNOVATOR_DEFAULTS.accentColor);
        setSecondaryAccentColor(BOLD_INNOVATOR_DEFAULTS.secondaryAccentColor);
        setHeaderLayout(BOLD_INNOVATOR_DEFAULTS.headerLayout);
        setSkillDisplayStyle(BOLD_INNOVATOR_DEFAULTS.skillDisplayStyle);
        setPortfolioBackgroundColor(BOLD_INNOVATOR_DEFAULTS.backgroundColor);
        setTagline(BOLD_INNOVATOR_DEFAULTS.tagline);
        setSkillChipStyleOverride('theme');
        setSectionSpacing(5);

        if (id) { 
            try {
                const portfolioRef = doc(db, 'portfolios', id);
                const docSnap = await getDoc(portfolioRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setName(data.name || '');
                    setProfilePicture(data.profilePicture || '');
                    setTagline(data.tagline || BOLD_INNOVATOR_DEFAULTS.tagline);
                    setLinkedinUrl(data.linkedinUrl || '');
                    setGithubUrl(data.githubUrl || '');
                    setResumeUrl(data.resumeUrl || '');
                    setAboutMe(data.aboutMe || '');
                    setProjects(Array.isArray(data.projects) && data.projects.length > 0 ? data.projects.map(p => ({ ...createNewProject(), ...p, id: String(p.id || generateStableId('project')), isCollapsed: p.isCollapsed !== undefined ? p.isCollapsed : false, skillsUsed: p.skillsUsed || [] })) : [createNewProject()]);
                    setSkills(Array.isArray(data.skills) ? data.skills.map(s => ({...s, id: s.id || generateStableId('skill') })) : []);
                    setCustomSections(Array.isArray(data.customSections) ? data.customSections.map(cs => ({ ...createNewCustomSection(), ...cs, id: String(cs.id || generateStableId('customSection')), items: Array.isArray(cs.items) ? cs.items.map(item => ({ ...createNewCustomSectionItem(), ...item, id: String(item.id || generateStableId('customItem')), isCollapsed: item.isCollapsed !== undefined ? item.isCollapsed : false })) : [] })) : []);
                    setCertifications(Array.isArray(data.certifications) && data.certifications.length > 0 ? data.certifications.map(cert => ({ ...createNewCertification(), ...cert, id: String(cert.id || generateStableId('certification')), certificateFile: null, isUploadingCertificate: false, certificateUploadProgress: 0 })) : [createNewCertification()]);
                    
                    setFontFamily(data.fontFamily || BOLD_INNOVATOR_DEFAULTS.fontFamily);
                    setHeadingColor(data.headingColor || BOLD_INNOVATOR_DEFAULTS.headingColor);
                    setBodyTextColor(data.bodyTextColor || BOLD_INNOVATOR_DEFAULTS.bodyTextColor);
                    setAccentColor(data.accentColor || BOLD_INNOVATOR_DEFAULTS.accentColor);
                    setSecondaryAccentColor(data.secondaryAccentColor || BOLD_INNOVATOR_DEFAULTS.secondaryAccentColor);
                    setHeaderLayout(data.headerLayout || BOLD_INNOVATOR_DEFAULTS.headerLayout);
                    setSkillDisplayStyle(data.skillDisplayStyle || BOLD_INNOVATOR_DEFAULTS.skillDisplayStyle);
                    setPortfolioBackgroundColor(data.portfolioBackgroundColor || BOLD_INNOVATOR_DEFAULTS.backgroundColor);
                    setSectionSpacing(data.sectionSpacing !== undefined ? data.sectionSpacing : 5);
                    setSkillChipStyleOverride(data.skillChipStyleOverride || 'theme');
                } else { setError('Portfolio not found.'); }
            } catch (err) { console.error("Error loading portfolio data:", err); setError('Failed to load portfolio data. Please try again.'); } 
            finally { setLoading(false); }
        } else { 
            setProjects([createNewProject()]);
            setSkills([]);
            setCustomSections([]);
            setCertifications([createNewCertification()]);
            setLoading(false);
        }
    }, [id]); 

    useEffect(() => { loadPortfolioData(); }, [loadPortfolioData]);

    // --- Content Handler Functions ---
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
                setNewSkillName(''); setNewSkillLevel('Advanced');
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
    
    const handleAddCertification = () => setCertifications(prev => [...prev, createNewCertification()]);
    const handleCertificationChange = (index, field, value) => setCertifications(prev => prev.map((c, i) => (i === index ? { ...c, [field]: value } : c)));
    const handleRemoveCertification = (certId) => setCertifications(prev => prev.filter(c => c.id !== certId));
    const handleToggleCertificationCollapse = (certId) => setCertifications(prev => prev.map(c => c.id === certId ? { ...c, isCollapsed: !c.isCollapsed } : c));

    // --- File Upload Handlers ---
    const handleImageUpload = async (file, pathPrefix, onProgressUpdate) => { 
        if (!file) return '';
        if (!auth.currentUser) { setError("Authentication error."); return ''; }
        const fileName = `${pathPrefix}/${auth.currentUser.uid}/${Date.now()}_${file.name}`;
        const storageRefFirebase = ref(storage, fileName);
        const uploadTask = uploadBytesResumable(storageRefFirebase, file);
        return new Promise((resolve, reject) => {
            uploadTask.on('state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    if (onProgressUpdate) onProgressUpdate(progress);
                },
                (error) => { console.error('File upload error:', error); setError(`Upload failed: ${error.code}`); if (onProgressUpdate) onProgressUpdate(0); reject(error); },
                async () => {
                    try { const downloadURL = await getDownloadURL(uploadTask.snapshot.ref); resolve(downloadURL); }
                    catch (urlError) { console.error('Error getting download URL:', urlError); setError(`Failed to get URL.`); reject(urlError); }
                }
            );
        });
    };
    const handleProfilePictureChange = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (file.size > MAX_FILE_SIZE) { alert(`Profile picture is too large. Max ${MAX_FILE_SIZE / (1024 * 1024)}MB.`); return; }
        setProfilePictureFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setProfilePicture(reader.result);
        reader.readAsDataURL(file);
    };
    const handleRemoveProfilePicture = () => { setProfilePicture(''); setProfilePictureFile(null); };

    const handleProjectThumbnailChange = async (projectIndex, event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (file.size > MAX_FILE_SIZE) { alert(`Project thumbnail is too large. Max ${MAX_FILE_SIZE / (1024 * 1024)}MB.`); return; }
        const updatedProjects = [...projects];
        updatedProjects[projectIndex].thumbnailFile = file;
        const reader = new FileReader();
        reader.onloadend = () => { updatedProjects[projectIndex].thumbnailUrl = reader.result; setProjects(updatedProjects); };
        reader.readAsDataURL(file);
    };
    const handleRemoveProjectThumbnail = (projectIndex) => {
        setProjects(prev => prev.map((p, idx) => idx === projectIndex ? { ...p, thumbnailUrl: '', thumbnailFile: null, isUploadingThumbnail: false, thumbnailUploadProgress: 0 } : p));
    };

    const handleResumeFileChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (file.size > MAX_FILE_SIZE) { alert(`Resume file is too large. Max ${MAX_FILE_SIZE / (1024 * 1024)}MB.`); return; }
        setResumeFile(file);
    };
    const handleRemoveResume = () => { setResumeFile(null); setResumeUrl(''); };
    
    const handleCertificateFileChange = (index, event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (file.size > MAX_FILE_SIZE) { 
            alert(`Certificate file is too large. Max ${MAX_FILE_SIZE / (1024 * 1024)}MB.`);
            return;
        }
        const updatedCerts = [...certifications];
        updatedCerts[index].certificateFile = file;
        updatedCerts[index].certificateUrl = URL.createObjectURL(file); 
        setCertifications(updatedCerts);
    };
    const handleRemoveCertificateFile = (index) => {
        setCertifications(prev => prev.map((c, i) => i === index ? { ...c, certificateFile: null, certificateUrl: '', isUploadingCertificate: false, certificateUploadProgress: 0 } : c));
    };

    const handlePaletteChange = (paletteName) => {
        const selected = boldPredefinedColorPalettes.find(p => p.name === paletteName);
        if (selected) {
            setFontFamily(selected.fontFamily || BOLD_INNOVATOR_DEFAULTS.fontFamily);
            setHeadingColor(selected.headingColor);
            setBodyTextColor(selected.bodyTextColor);
            setAccentColor(selected.accentColor);
            setSecondaryAccentColor(selected.secondaryAccentColor);
            setPortfolioBackgroundColor(selected.backgroundColor || BOLD_INNOVATOR_DEFAULTS.backgroundColor);
            setSkillChipStyleOverride('theme');
        } else { 
            setFontFamily(BOLD_INNOVATOR_DEFAULTS.fontFamily);
            setHeadingColor(BOLD_INNOVATOR_DEFAULTS.headingColor);
            setBodyTextColor(BOLD_INNOVATOR_DEFAULTS.bodyTextColor);
            setAccentColor(BOLD_INNOVATOR_DEFAULTS.accentColor);
            setSecondaryAccentColor(BOLD_INNOVATOR_DEFAULTS.secondaryAccentColor);
            setPortfolioBackgroundColor(BOLD_INNOVATOR_DEFAULTS.backgroundColor);
            setSkillChipStyleOverride('theme');
        }
    };

    const handleSavePortfolio = async () => {
        if (!auth.currentUser) { setError("You must be logged in to save."); return; }
        setLoading(true); setError('');
        let finalProfilePictureUrl = profilePicture;
        let finalResumeUrl = resumeUrl;
        let finalCertifications = [...certifications];
        let finalProjects = [...projects];
        let uploadErrorOccurred = false;

        try {
            if (profilePictureFile) {
                setIsUploadingProfilePic(true);
                finalProfilePictureUrl = await handleImageUpload(profilePictureFile, `profilePictures_${THIS_TEMPLATE_ID}`, () => {});
                setProfilePictureFile(null);
                setIsUploadingProfilePic(false);
            } else if (!profilePicture) {
                finalProfilePictureUrl = '';
            }
            
            if (resumeFile) {
                setIsUploadingResume(true); setResumeUploadProgress(0);
                try {
                    finalResumeUrl = await handleImageUpload(resumeFile, `resumes_${THIS_TEMPLATE_ID}/${auth.currentUser.uid}`, setResumeUploadProgress);
                    setResumeFile(null);
                } catch (err) { setError(`Failed to upload resume. ${err.message}`); uploadErrorOccurred = true; }
                setIsUploadingResume(false);
            } else if (!resumeUrl && !resumeFile) {
                finalResumeUrl = '';
            }

            for (let i = 0; i < finalCertifications.length; i++) {
                let cert = { ...finalCertifications[i] };
                if (cert.certificateFile) {
                    cert.isUploadingCertificate = true;
                    finalCertifications[i] = cert; // Update the array being processed
                    setCertifications(prevCerts => prevCerts.map((c, idx) => idx === i ? {...c, isUploadingCertificate: true} : c)); // Update state for UI
                    try {
                        const newUrl = await handleImageUpload(cert.certificateFile, `certificates_${THIS_TEMPLATE_ID}/${auth.currentUser.uid}/${cert.id || Date.now()}`, (progress) => {
                            setCertifications(prevCerts => prevCerts.map((c, idx) => idx === i ? { ...c, certificateUploadProgress: progress } : c));
                        });
                        cert.certificateUrl = newUrl;
                        cert.certificateFile = null;
                    } catch (certError) { setError(`Failed to upload certificate for "${cert.title || `Cert ${i + 1}`}". ${certError.message}`); uploadErrorOccurred = true; }
                    cert.isUploadingCertificate = false;
                    finalCertifications[i] = cert;
                    setCertifications(prevCerts => prevCerts.map((c, idx) => idx === i ? {...cert, isUploadingCertificate: false} : c));
                } else if (!cert.certificateUrl) { cert.certificateUrl = '';}
            }

            for (let i = 0; i < finalProjects.length; i++) { 
                let project = { ...finalProjects[i] };
                if (project.thumbnailFile) {
                    project.isUploadingThumbnail = true;
                    finalProjects[i] = project;
                    setProjects(prevProjs => prevProjs.map((p, idx) => idx === i ? {...p, isUploadingThumbnail: true} : p));
                    try {
                        const newUrl = await handleImageUpload(project.thumbnailFile, `projectThumbnails_${THIS_TEMPLATE_ID}/${project.id || Date.now()}`, (progress) => {
                             setProjects(prevProjs => prevProjs.map((p, idx) => idx === i ? { ...p, thumbnailUploadProgress: progress } : p));
                        });
                        project.thumbnailUrl = newUrl;
                        project.thumbnailFile = null;
                    } catch (thumbError) { setError(`Failed to upload thumbnail for Project "${project.title || i + 1}".`); uploadErrorOccurred = true; }
                    project.isUploadingThumbnail = false;
                    finalProjects[i] = project;
                    setProjects(prevProjs => prevProjs.map((p, idx) => idx === i ? {...project, isUploadingThumbnail: false} : p));
                } else if (!project.thumbnailUrl) { project.thumbnailUrl = '';}
            }
            
            if(uploadErrorOccurred){ setLoading(false); return; }

            const projectsToSave = finalProjects.map(p => ({ id: String(p.id), title: p.title, description: p.description, skillsUsed: p.skillsUsed || [], thumbnailUrl: p.thumbnailUrl && !p.thumbnailUrl.startsWith('data:') ? p.thumbnailUrl : '', liveDemoUrl: p.liveDemoUrl || '', sourceCodeUrl: p.sourceCodeUrl || '', videoUrl: p.videoUrl || '', isCollapsed: p.isCollapsed !== undefined ? p.isCollapsed : false, }));
            const customSectionsToSave = customSections.map(cs => ({ id: String(cs.id), sectionTitle: cs.sectionTitle, items: cs.items.map(item => ({ id: String(item.id), itemTitle: item.itemTitle, itemDetails: item.itemDetails, isCollapsed: item.isCollapsed !== undefined ? item.isCollapsed : false, })) }));
            const certificationsToSave = finalCertifications.map(cert => ({ id: String(cert.id), title: cert.title, issuingBody: cert.issuingBody, dateIssued: cert.dateIssued, credentialId: cert.credentialId || '', credentialUrl: cert.credentialUrl || '', certificateUrl: cert.certificateUrl && !cert.certificateUrl.startsWith('blob:') ? cert.certificateUrl : '', isCollapsed: cert.isCollapsed !== undefined ? cert.isCollapsed : false, }));

            const portfolioData = {
                userId: auth.currentUser.uid, templateId: THIS_TEMPLATE_ID,
                name, profilePicture: finalProfilePictureUrl, 
                tagline, linkedinUrl, githubUrl, aboutMe, resumeUrl: finalResumeUrl,
                projects: projectsToSave, skills, 
                customSections: customSectionsToSave, 
                certifications: certificationsToSave,
                fontFamily, headingColor, bodyTextColor, accentColor, secondaryAccentColor,
                headerLayout, skillDisplayStyle, portfolioBackgroundColor, sectionSpacing, skillChipStyleOverride,
                lastUpdated: serverTimestamp(),
            };

            if (id) {
                await updateDoc(doc(db, 'portfolios', id), portfolioData);
                alert('Portfolio updated!');
                loadPortfolioData(); 
            } else {
                const docRef = await addDoc(collection(db, 'portfolios'), { ...portfolioData, createdAt: serverTimestamp() });
                alert('Portfolio created!');
                navigate(`/edit-bold-asymm-portfolio/${docRef.id}`, { replace: true }); 
            }
        } catch (err) { 
            console.error('Error saving portfolio:', err);
            if(!error) setError('Failed to save portfolio. Please check console for details.');
        } 
        finally { 
            setLoading(false);
            setIsUploadingProfilePic(false);
            setIsUploadingResume(false);
            setCertifications(prev => prev.map(c => ({...c, isUploadingCertificate: false, certificateUploadProgress: 0})));
            setProjects(prev => prev.map(p => ({...p, isUploadingThumbnail: false, thumbnailUploadProgress: 0})));
        }
    };

    const onDragEnd = (result) => { 
        const { source, destination, type } = result;
        if (!destination || (source.droppableId === destination.droppableId && source.index === destination.index)) return;

        if (type === 'CERTIFICATIONS') {
            const reordered = Array.from(certifications);
            const [removed] = reordered.splice(source.index, 1);
            reordered.splice(destination.index, 0, removed);
            setCertifications(reordered);
        } else if (type === 'PROJECTS') {
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
        }  else if (type.startsWith('CUSTOM_SECTION_ITEMS_')) {
            const sectionId = type.split('_').pop();
            const sectionIndex = customSections.findIndex(s => s.id === sectionId);
            if (sectionIndex === -1) return;

            const reorderedItems = Array.from(customSections[sectionIndex].items);
            const [removed] = reorderedItems.splice(source.index, 1);
            reorderedItems.splice(destination.index, 0, removed);

            const updatedSections = customSections.map((s, i) =>
                i === sectionIndex ? { ...s, items: reorderedItems } : s
            );
            setCustomSections(updatedSections);
        }
    };

    if (loading && !id ) return <div className="text-center p-10 text-slate-100">Initializing Bold Innovator Editor...</div>;
    if (loading && id) return <div className="text-center p-10 text-slate-100">Loading Bold Innovator Portfolio...</div>;
    if (error) return <div className="text-center p-10 text-red-400">Error: {error} <button onClick={loadPortfolioData} className="text-emerald-400 underline">Retry</button></div>;

    // --- Static Editor UI Styles (Not affected by portfolio theme choices) ---
    const EDITOR_UI_ACCENT_TEXT_COLOR = 'text-emerald-400';
    const EDITOR_UI_ACCENT_BG_COLOR = 'bg-emerald-500';
    const EDITOR_UI_ACCENT_HOVER_BG_COLOR = 'hover:bg-emerald-600';
    const EDITOR_UI_ACCENT_FOCUS_RING_COLOR = 'focus:ring-emerald-400';
    const EDITOR_UI_ACCENT_SLIDER_COLOR = 'accent-emerald-500';

    const editorPanelBg = "bg-slate-800"; 
    const editorSectionBg = "bg-slate-850"; 
    const editorInputClasses = `shadow-inner appearance-none border border-slate-700 rounded w-full py-3 px-4 bg-slate-700 text-slate-100 leading-tight focus:outline-none focus:ring-2 ${EDITOR_UI_ACCENT_FOCUS_RING_COLOR} focus:ring-inset placeholder-slate-500`;
    const editorLabelClasses = "block text-slate-300 text-sm font-semibold mb-2";
    const editorSectionHeaderClasses = `text-2xl font-semibold ${EDITOR_UI_ACCENT_TEXT_COLOR} mb-3 cursor-pointer flex justify-between items-center w-full`;
    const editorDraggableItemBg = "bg-slate-700";
    const editorDraggableItemText = "text-slate-200";
    const editorQuillWrapperClasses = "bg-slate-700 text-slate-100 rounded-md";
    const buttonClasses = `${EDITOR_UI_ACCENT_BG_COLOR} ${EDITOR_UI_ACCENT_HOVER_BG_COLOR} text-white font-semibold py-2 px-4 rounded-lg text-sm shadow-md transition-colors`;
    const secondaryButtonClasses = "bg-slate-600 hover:bg-slate-500 text-slate-100 font-semibold py-2 px-4 rounded-lg text-sm shadow-md transition-colors";
    const smallButtonClasses = "text-xs py-1 px-2 rounded-md";
    
    let saveButtonText = id ? `Update Innovator Portfolio` : `Create Innovator Portfolio`;
    if (loading) saveButtonText = 'Processing...';
    else if (isUploadingProfilePic) saveButtonText = 'Uploading Headshot...';
    else if (isUploadingResume) saveButtonText = `Uploading Resume (${resumeUploadProgress.toFixed(0)}%)...`;
    else if (certifications.some(c => c.isUploadingCertificate)) saveButtonText = 'Uploading Certificates...';
    else if (projects.some(p => p.isUploadingThumbnail)) saveButtonText = 'Uploading Thumbs...';

    const portfolioDataForPreview = {
        name, profilePicture, tagline, linkedinUrl, githubUrl, aboutMe, 
        projects, skills, customSections, certifications,
        resumeUrl: resumeUrl || (resumeFile ? URL.createObjectURL(resumeFile) : ''),
        fontFamily, headingColor, bodyTextColor, accentColor, secondaryAccentColor,
        templateId: THIS_TEMPLATE_ID, 
        headerLayout, skillDisplayStyle, sectionSpacing,
        skillIconChipBackgroundColor: skillChipStyleOverride === 'theme' ? BOLD_INNOVATOR_DEFAULTS.skillIconChipBackgroundColor : (skillChipStyleOverride === 'accent' ? accentColor+'33' : (skillChipStyleOverride === 'secondaryAccent' ? secondaryAccentColor+'33' : (skillChipStyleOverride === 'light' ? '#FFFFFFCC' : '#00000099'))),
        skillIconChipTextColor: skillChipStyleOverride === 'theme' ? BOLD_INNOVATOR_DEFAULTS.skillIconChipTextColor : (skillChipStyleOverride === 'light' ? '#1A1A2E' : '#FFFFFF'),
        portfolioBackgroundColor,
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
                            {id ? `Edit Bold Innovator Portfolio` : `Create Bold Innovator Portfolio`}
                        </h2>
                        {id && ( <button onClick={() => navigate(`/portfolio/${id}`)} className={`${secondaryButtonClasses} py-2 px-4 text-xs sm:text-sm whitespace-nowrap mt-2 sm:mt-0`}> View Live Portfolio </button> )}
                    </div>

                    {/* Basic Info Section */}
                    <div className={`${editorSectionBg} p-4 rounded-lg grid grid-cols-1 gap-y-6`}>
                        <h3 className={editorSectionHeaderClasses.replace('cursor-pointer', '')}>Basic Information</h3>
                            <div>
                                <label htmlFor="name-bold" className={editorLabelClasses}>Full Name / Brand</label>
                                <input type="text" id="name-bold" value={name} onChange={(e) => setName(e.target.value)} className={editorInputClasses} placeholder="e.g., Your Name or Studio Name" />
                            </div>
                            <div>
                                <label htmlFor="tagline-bold" className={editorLabelClasses}>Tagline / Striking Statement</label>
                                <input type="text" id="tagline-bold" value={tagline} onChange={(e) => setTagline(e.target.value)} className={editorInputClasses} placeholder={BOLD_INNOVATOR_DEFAULTS.tagline} />
                            </div>
                            <div>
                                <label htmlFor="profilePicture-bold" className={editorLabelClasses}>Profile Picture / Avatar</label>
                                <input type="file" id="profilePicture-bold" accept="image/*" onChange={handleProfilePictureChange} className={`${editorInputClasses} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold ${EDITOR_UI_ACCENT_BG_COLOR} text-white hover:opacity-90`} />
                                {isUploadingProfilePic && <p className="text-xs text-slate-400 mt-1">Uploading...</p>}
                                <div className="mt-2 flex items-center space-x-2">
                                    {(profilePicture && profilePicture.startsWith('data:')) && !isUploadingProfilePic && <img src={profilePicture} alt="Preview" className="rounded-md h-20 w-20 object-cover"/>}
                                    {(profilePicture && !profilePicture.startsWith('data:')) && !isUploadingProfilePic && <img src={profilePicture} alt="Current" className="rounded-md h-20 w-20 object-cover"/>}
                                    {profilePicture && ( <button type="button" onClick={handleRemoveProfilePicture} className="text-rose-500 hover:text-rose-400 p-1.5 rounded-full hover:bg-slate-700 transition-colors" aria-label="Remove profile picture" > <TrashIcon className="w-5 h-5" /> </button> )}
                                </div>
                            </div>
                            <div>
                                <label htmlFor="linkedinUrl-bold" className={editorLabelClasses}>LinkedIn URL (Optional)</label>
                                <input type="url" id="linkedinUrl-bold" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} className={editorInputClasses} placeholder="https://linkedin.com/in/yourprofile"/>
                            </div>
                            <div>
                                <label htmlFor="githubUrl-bold" className={editorLabelClasses}>Primary Link (e.g., GitHub, Website)</label>
                                <input type="url" id="githubUrl-bold" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} className={editorInputClasses} placeholder="https://your-primary-link.com"/>
                            </div>
                            <div>
                                <label htmlFor="resume-upload-bold" className={editorLabelClasses}>Upload Resume (PDF, DOCX - Max 8MB)</label>
                                <input type="file" id="resume-upload-bold" accept=".pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={handleResumeFileChange} className={`${editorInputClasses} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold ${EDITOR_UI_ACCENT_BG_COLOR} text-white hover:opacity-90`} />
                                {isUploadingResume && <p className="text-xs text-slate-400 mt-1">Uploading resume ({resumeUploadProgress.toFixed(0)}%)...</p>}
                                {resumeFile && !isUploadingResume && <p className="text-xs text-slate-300 mt-1">Selected: {resumeFile.name}</p>}
                                {resumeUrl && !resumeFile && !resumeUrl.startsWith('blob:') && (
                                    <div className="mt-2 flex items-center space-x-2">
                                        <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 text-sm underline">View Current Resume</a>
                                        <button type="button" onClick={handleRemoveResume} className="text-rose-500 hover:text-rose-400 p-1 rounded-full hover:bg-slate-700 transition-colors" aria-label="Remove resume"><TrashIcon className="w-4 h-4" /></button>
                                    </div>
                                )}
                                {resumeFile && ( <button type="button" onClick={handleRemoveResume} className="mt-1 text-xs text-rose-400 hover:underline">Clear selection</button> )}
                            </div>
                            <div>
                                <label htmlFor="aboutMe-bold" className={editorLabelClasses}>About / Vision Statement</label>
                                <div className={`quill-editor-override ${editorQuillWrapperClasses}`}>
                                    <ReactQuill theme="snow" value={aboutMe} onChange={setAboutMe} modules={quillModules} formats={quillFormats} placeholder="Craft your compelling narrative..." />
                                </div>
                            </div>
                        </div>

                    {/* Skills Section */}
                    <Disclosure as="div" className={`${editorSectionBg} p-4 rounded-lg`} defaultOpen={true}>
                        {({open}) => (<>
                            <Disclosure.Button className={editorSectionHeaderClasses}>Skills <ChevronDownIcon className={`w-5 h-5 ${EDITOR_UI_ACCENT_TEXT_COLOR} transform transition-transform duration-200 ${open ? 'rotate-180' : ''}`} /></Disclosure.Button>
                            <Transition show={open} enter="transition duration-100 ease-out" enterFrom="transform scale-95 opacity-0 max-h-0" enterTo="transform scale-100 opacity-100 max-h-screen" leave="transition duration-75 ease-out" leaveFrom="transform scale-100 opacity-100 max-h-screen" leaveTo="transform scale-95 opacity-0 max-h-0" >
                                <Disclosure.Panel className="skills-section mt-3 space-y-3 overflow-hidden">
                                    <div className="add-skill-input flex items-start space-x-2">
                                        <div className="flex-grow">
                                            <label htmlFor="newSkillNameBold" className={editorLabelClasses}>Skill Name</label>
                                            <input type="text" id="newSkillNameBold" value={newSkillName} onChange={(e) => setNewSkillName(e.target.value)} onKeyPress={(e) => { if (e.key === 'Enter') handleAddSkill();}} className={`${editorInputClasses} md:w-full`} placeholder="e.g., Innovation, AI, Design Thinking"/>
                                        </div>
                                        <div className="flex-grow-0 w-1/3">
                                            <label htmlFor="newSkillLevelBold" className={editorLabelClasses}>Proficiency</label>
                                            <select id="newSkillLevelBold" value={newSkillLevel} onChange={(e) => setNewSkillLevel(e.target.value)} className={`${editorInputClasses} md:w-full`}>
                                                <option value="Beginner">Beginner</option>
                                                <option value="Intermediate">Intermediate</option>
                                                <option value="Advanced">Advanced</option>
                                                <option value="Expert">Expert</option>
                                            </select>
                                        </div>
                                        <button type="button" onClick={handleAddSkill} className={`${buttonClasses} ${smallButtonClasses} self-end mb-px`}>Add</button>
                                    </div>
                                    {skills.length > 0 && (
                                        <Droppable droppableId="skillsDroppableBold" type="SKILLS">
                                            {(provided) => (
                                                <ul ref={provided.innerRef} {...provided.droppableProps} className={`skills-list space-y-1 mt-2`}>
                                                    <AnimatePresence>
                                                        {skills.map((skillObj, index) => (
                                                            <Draggable key={skillObj.id} draggableId={skillObj.id} index={index} isDragDisabled={isMobileView}>
                                                                {(providedDraggable) => (
                                                                    <motion.li
                                                                        ref={providedDraggable.innerRef}
                                                                        {...providedDraggable.draggableProps}
                                                                        variants={listItemVariants} initial="initial" animate="animate" exit="exit" layout
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
                        </>)}
                    </Disclosure>
                    
                    {/* Certifications Section */}
                    <Disclosure as="div" className={`${editorSectionBg} p-4 rounded-lg`} defaultOpen={false}>
                         {({open}) => (<>
                            <Disclosure.Button className={editorSectionHeaderClasses}>Certifications & Credentials <ChevronDownIcon className={`w-5 h-5 ${EDITOR_UI_ACCENT_TEXT_COLOR} transform transition-transform duration-200 ${open ? 'rotate-180' : ''}`} /></Disclosure.Button>
                            <Transition show={open} enter="transition duration-100 ease-out" enterFrom="transform scale-95 opacity-0 max-h-0" enterTo="transform scale-100 opacity-100 max-h-screen" leave="transition duration-75 ease-out" leaveFrom="transform scale-100 opacity-100 max-h-screen" leaveTo="transform scale-95 opacity-0 max-h-0" >
                                <Disclosure.Panel className="certifications-section mt-3 space-y-2 overflow-hidden">
                                    <Droppable droppableId="certificationsDroppableBold" type="CERTIFICATIONS">
                                        {(provided) => (
                                            <div ref={provided.innerRef} {...provided.droppableProps} className={`space-y-2`}>
                                                <AnimatePresence>
                                                    {certifications.map((cert, index) => (
                                                        <Draggable key={cert.id} draggableId={String(cert.id)} index={index} isDragDisabled={isMobileView}>
                                                            {(providedDraggable) => (
                                                                <motion.div
                                                                    ref={providedDraggable.innerRef}
                                                                    {...providedDraggable.draggableProps}
                                                                    variants={listItemVariants} initial="initial" animate="animate" exit="exit" layout
                                                                    className={`cert-item-editor-wrapper ${editorDraggableItemBg} rounded-md shadow-md`}
                                                                >
                                                                    <div className="flex justify-between items-center p-3 border-b border-slate-600">
                                                                        <div className="flex items-center flex-grow">
                                                                            <div {...providedDraggable.dragHandleProps} className={`p-1 mr-2 ${isMobileView ? 'cursor-default opacity-50' : 'cursor-grab active:cursor-grabbing'}`}> <DragHandleIcon /> </div>
                                                                            <h4 className={`text-md font-semibold ${editorDraggableItemText} flex-grow cursor-pointer`} onClick={() => handleToggleCertificationCollapse(cert.id)}> {cert.title || `Certification ${index + 1}`} </h4>
                                                                        </div>
                                                                        <button type="button" onClick={() => handleToggleCertificationCollapse(cert.id)} className="p-1 text-slate-400 hover:text-slate-200 mr-2"> {cert.isCollapsed ? <ChevronDownIcon /> : <ChevronDownIcon className="transform rotate-180"/>} </button>
                                                                        {certifications.length > 1 && ( <button type="button" onClick={() => handleRemoveCertification(cert.id)} className="text-rose-500 hover:text-rose-400 p-1.5 rounded-full hover:bg-slate-600 transition-colors" aria-label="Remove certification"> <TrashIcon className="w-5 h-5" /> </button> )}
                                                                    </div>
                                                                    <Transition show={!cert.isCollapsed} enter="transition-all duration-300 ease-out" enterFrom="opacity-0 max-h-0" enterTo="opacity-100 max-h-[1000px]" leave="transition-all duration-200 ease-in" leaveFrom="opacity-100 max-h-[1000px]" leaveTo="opacity-0 max-h-0" >
                                                                        <div className="p-3 space-y-4 overflow-hidden">
                                                                            <div><label htmlFor={`cert-title-bold-${cert.id}`} className={editorLabelClasses}>Certification Name/Title</label><input type="text" id={`cert-title-bold-${cert.id}`} value={cert.title} onChange={(e) => handleCertificationChange(index, 'title', e.target.value)} className={editorInputClasses}/></div>
                                                                            <div><label htmlFor={`cert-issuingBody-bold-${cert.id}`} className={editorLabelClasses}>Issuing Body</label><input type="text" id={`cert-issuingBody-bold-${cert.id}`} value={cert.issuingBody} onChange={(e) => handleCertificationChange(index, 'issuingBody', e.target.value)} className={editorInputClasses}/></div>
                                                                            <div><label htmlFor={`cert-dateIssued-bold-${cert.id}`} className={editorLabelClasses}>Date Issued</label><input type="text" id={`cert-dateIssued-bold-${cert.id}`} value={cert.dateIssued} onChange={(e) => handleCertificationChange(index, 'dateIssued', e.target.value)} className={editorInputClasses} placeholder="e.g., Oct 2023 or 2023"/></div>
                                                                            <div><label htmlFor={`cert-credentialId-bold-${cert.id}`} className={editorLabelClasses}>Credential ID (Optional)</label><input type="text" id={`cert-credentialId-bold-${cert.id}`} value={cert.credentialId} onChange={(e) => handleCertificationChange(index, 'credentialId', e.target.value)} className={editorInputClasses}/></div>
                                                                            <div><label htmlFor={`cert-credentialUrl-bold-${cert.id}`} className={editorLabelClasses}>Verification URL (Optional)</label><input type="url" id={`cert-credentialUrl-bold-${cert.id}`} value={cert.credentialUrl} onChange={(e) => handleCertificationChange(index, 'credentialUrl', e.target.value)} className={editorInputClasses} placeholder="https://example.com/verify/id"/></div>
                                                                            <div>
                                                                                <label htmlFor={`cert-file-bold-${cert.id}`} className={editorLabelClasses}>Upload Certificate (PDF - Max 8MB)</label>
                                                                                <input type="file" id={`cert-file-bold-${cert.id}`} accept=".pdf" onChange={(e) => handleCertificateFileChange(index, e)} className={`${editorInputClasses} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold ${EDITOR_UI_ACCENT_BG_COLOR} text-white hover:opacity-90`} />
                                                                                {certifications[index].isUploadingCertificate && <p className="text-xs text-slate-400 mt-1">Uploading ({certifications[index].certificateUploadProgress?.toFixed(0) || 0}%)...</p>}
                                                                                {certifications[index].certificateFile && !certifications[index].isUploadingCertificate && <p className="text-xs text-slate-300 mt-1">Selected: {certifications[index].certificateFile.name}</p>}
                                                                                {certifications[index].certificateUrl && !certifications[index].certificateFile && !certifications[index].certificateUrl.startsWith('blob:') && <a href={certifications[index].certificateUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-400 hover:underline mt-1 inline-block">View Current PDF</a>}
                                                                                {(certifications[index].certificateFile || (certifications[index].certificateUrl && !certifications[index].certificateUrl.startsWith('blob:'))) && (
                                                                                    <button type="button" onClick={() => handleRemoveCertificateFile(index)} className="ml-2 text-rose-500 hover:text-rose-400 p-1 rounded-full hover:bg-slate-700 transition-colors text-xs" aria-label="Remove certificate file">Clear PDF</button>
                                                                                )}
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
                                    <button type="button" onClick={handleAddCertification} className={`${buttonClasses} w-full py-3 text-base mt-4`}>Add Another Certification</button>
                                </Disclosure.Panel>
                            </Transition>
                         </>)}
                    </Disclosure>

                    {/* Projects Section */}
                    <Disclosure as="div" className={`${editorSectionBg} p-4 rounded-lg`} defaultOpen={true}>
                        {({open}) => (<>
                            <Disclosure.Button className={editorSectionHeaderClasses}>Projects / Innovations <ChevronDownIcon className={`w-5 h-5 ${EDITOR_UI_ACCENT_TEXT_COLOR} transform transition-transform duration-200 ${open ? 'rotate-180' : ''}`} /></Disclosure.Button>
                            <Transition show={open} enter="transition duration-100 ease-out" enterFrom="transform scale-95 opacity-0 max-h-0" enterTo="transform scale-100 opacity-100 max-h-screen" leave="transition duration-75 ease-out" leaveFrom="transform scale-100 opacity-100 max-h-screen" leaveTo="transform scale-95 opacity-0 max-h-0" >
                                <Disclosure.Panel className="projects-section mt-3 space-y-2 overflow-hidden">
                                    <Droppable droppableId="projectsDroppableBold" type="PROJECTS">
                                        {(provided) => (
                                            <div ref={provided.innerRef} {...provided.droppableProps} className={`space-y-2`}>
                                                <AnimatePresence>
                                                    {projects.map((project, index) => (
                                                        <Draggable key={project.id} draggableId={String(project.id)} index={index} isDragDisabled={isMobileView}>
                                                            {(providedDraggable) => (
                                                                <motion.div
                                                                    ref={providedDraggable.innerRef}
                                                                    {...providedDraggable.draggableProps}
                                                                    variants={listItemVariants} initial="initial" animate="animate" exit="exit" layout
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
                                                                                <label htmlFor={`project-title-bold-${project.id}`} className={editorLabelClasses}>Title</label>
                                                                                <input type="text" id={`project-title-bold-${project.id}`} value={project.title} onChange={(e) => handleProjectChange(index, 'title', e.target.value)} className={editorInputClasses}/>
                                                                            </div>
                                                                            <div>
                                                                                <label htmlFor={`project-description-bold-${project.id}`} className={editorLabelClasses}>Description</label>
                                                                                <div className={`quill-editor-override ${editorQuillWrapperClasses}`}>
                                                                                    <ReactQuill theme="snow" value={project.description} onChange={(content) => handleProjectChange(index, 'description', content)} modules={quillModules} formats={quillFormats} placeholder="Describe your innovative project or idea..."/>
                                                                                </div>
                                                                            </div>
                                                                            <div>
                                                                                <label htmlFor={`project-thumbnail-bold-${project.id}`} className={editorLabelClasses}>Project Thumbnail/Visual</label>
                                                                                <input type="file" id={`project-thumbnail-bold-${project.id}`} accept="image/*" onChange={(e) => handleProjectThumbnailChange(index, e)} className={`${editorInputClasses} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold ${EDITOR_UI_ACCENT_BG_COLOR} text-white hover:opacity-90`} />
                                                                                {projects[index].isUploadingThumbnail && <p className="text-xs text-slate-400 mt-1">Uploading thumbnail ({projects[index].thumbnailUploadProgress?.toFixed(0) || 0}%)...</p>}
                                                                                <div className="mt-2 flex items-center space-x-2">
                                                                                    {(projects[index].thumbnailUrl && projects[index].thumbnailUrl.startsWith('data:')) && !projects[index].isUploadingThumbnail && <img src={projects[index].thumbnailUrl} alt="Preview" className="rounded max-h-28 object-contain"/>}
                                                                                    {(projects[index].thumbnailUrl && !projects[index].thumbnailUrl.startsWith('data:')) && !projects[index].isUploadingThumbnail && <img src={projects[index].thumbnailUrl} alt="Current" className="rounded max-h-28 object-contain"/>}
                                                                                    {projects[index].thumbnailUrl && ( <button type="button" onClick={() => handleRemoveProjectThumbnail(index)} className="text-rose-500 hover:text-rose-400 p-1.5 rounded-full hover:bg-slate-700 transition-colors"> <TrashIcon className="w-5 h-5" /> </button> )}
                                                                                </div>
                                                                            </div>
                                                                            <div>
                                                                                <label htmlFor={`project-liveDemoUrl-bold-${project.id}`} className={editorLabelClasses}>Live Link (Optional)</label>
                                                                                <input type="url" id={`project-liveDemoUrl-bold-${project.id}`} value={project.liveDemoUrl || ''} onChange={(e) => handleProjectChange(index, 'liveDemoUrl', e.target.value)} className={editorInputClasses} placeholder="https://your-project-link.com"/>
                                                                            </div>
                                                                            <div>
                                                                                <label htmlFor={`project-sourceCodeUrl-bold-${project.id}`} className={editorLabelClasses}>Repository/More Info (Optional)</label>
                                                                                <input type="url" id={`project-sourceCodeUrl-bold-${project.id}`} value={project.sourceCodeUrl || ''} onChange={(e) => handleProjectChange(index, 'sourceCodeUrl', e.target.value)} className={editorInputClasses} placeholder="https://github.com/your/project"/>
                                                                            </div>
                                                                             <div>
                                                                                <label htmlFor={`project-videoUrl-bold-${project.id}`} className={editorLabelClasses}>Video URL (YouTube/Vimeo - Optional)</label>
                                                                                <input type="url" id={`project-videoUrl-bold-${project.id}`} value={project.videoUrl || ''} onChange={(e) => handleProjectChange(index, 'videoUrl', e.target.value)} className={editorInputClasses} placeholder="https://youtube.com/watch?v=..."/>
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
                        </>)}
                    </Disclosure>

                    {/* Custom Sections UI */}
                    <Disclosure as="div" className={`${editorSectionBg} p-4 rounded-lg`} defaultOpen={false}>
                         {({open}) => (<>
                            <Disclosure.Button className={editorSectionHeaderClasses}>Custom Sections <ChevronDownIcon className={`w-5 h-5 ${EDITOR_UI_ACCENT_TEXT_COLOR} transform transition-transform duration-200 ${open ? 'rotate-180' : ''}`} /></Disclosure.Button>
                            <Transition show={open} enter="transition duration-100 ease-out" enterFrom="transform scale-95 opacity-0 max-h-0" enterTo="transform scale-100 opacity-100 max-h-screen" leave="transition duration-75 ease-out" leaveFrom="transform scale-100 opacity-100 max-h-screen" leaveTo="transform scale-95 opacity-0 max-h-0" >
                                <Disclosure.Panel className="custom-sections-list mt-3 space-y-2 overflow-hidden">
                                    <Droppable droppableId="customSectionsDroppableBold" type="CUSTOM_SECTIONS">
                                        {(provided) => (
                                            <div ref={provided.innerRef} {...provided.droppableProps} className={`space-y-2`}>
                                                <AnimatePresence>
                                                    {customSections.map((section, sectionIndex) => (
                                                        <Draggable key={section.id} draggableId={String(section.id)} index={sectionIndex} isDragDisabled={isMobileView}>
                                                            {(providedDraggable) => (
                                                                <motion.div
                                                                    ref={providedDraggable.innerRef}
                                                                    {...providedDraggable.draggableProps}
                                                                    variants={listItemVariants} initial="initial" animate="animate" exit="exit" layout
                                                                    className={`custom-section-block-editor bg-slate-750 rounded-lg border border-slate-700`}
                                                                >
                                                                    <div className="flex justify-between items-center p-3 border-b border-slate-600">
                                                                        <div {...providedDraggable.dragHandleProps} className={`p-1 mr-2 ${isMobileView ? 'cursor-default opacity-50' : 'cursor-grab active:cursor-grabbing'}`}> <DragHandleIcon /> </div>
                                                                        <input type="text" value={section.sectionTitle} onChange={(e) => handleCustomSectionTitleChange(sectionIndex, e.target.value)} placeholder="Custom Section Title" className={`${editorInputClasses} text-lg font-semibold flex-grow !py-2`}/>
                                                                        <button type="button" onClick={() => handleRemoveCustomSection(section.id)} className="text-rose-500 hover:text-rose-400 p-1.5 rounded-full hover:bg-slate-700 transition-colors ml-2" aria-label="Remove section"> <RemoveIcon className="w-5 h-5" /> </button>
                                                                    </div>
                                                                    <Droppable droppableId={`CUSTOM_SECTION_ITEMS_BOLD_${section.id}`} type={`CUSTOM_SECTION_ITEMS_BOLD_${section.id}`}>
                                                                        {(providedItems) => (
                                                                            <div ref={providedItems.innerRef} {...providedItems.droppableProps} className="space-y-3 p-3">
                                                                                <AnimatePresence>
                                                                                    {section.items && section.items.map((item, itemIndex) => (
                                                                                        <Draggable key={item.id} draggableId={String(item.id)} index={itemIndex} isDragDisabled={isMobileView}>
                                                                                            {(providedItemDraggable) => (
                                                                                                <motion.div
                                                                                                    ref={providedItemDraggable.innerRef}
                                                                                                    {...providedItemDraggable.draggableProps}
                                                                                                    variants={listItemVariants} initial="initial" animate="animate" exit="exit" layout
                                                                                                    className={`${editorDraggableItemBg} p-3 rounded-md shadow`}
                                                                                                >
                                                                                                    <div className="flex justify-between items-center mb-2">
                                                                                                        <div {...providedItemDraggable.dragHandleProps} className={`p-1 mr-2 ${isMobileView ? 'cursor-default opacity-50' : 'cursor-grab active:cursor-grabbing'}`}> <DragHandleIcon className="w-4 h-4 text-slate-400"/> </div>
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
                                                                                                                <ReactQuill theme="snow" value={item.itemDetails} onChange={(content) => handleCustomSectionItemChange(sectionIndex, itemIndex, 'itemDetails', content)} modules={quillModules} formats={quillFormats} placeholder="Details for this entry..." />
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </Transition>
                                                                                                </motion.div>
                                                                                            )}
                                                                                        </Draggable>
                                                                                    ))}
                                                                                </AnimatePresence>
                                                                                {providedItems.placeholder}
                                                                            </div>
                                                                        )}
                                                                    </Droppable>
                                                                    <div className="p-3 pt-0">
                                                                        <button type="button" onClick={() => handleAddCustomSectionItem(sectionIndex)} className="bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 px-3 rounded-full text-xs shadow-md transition-colors"> + Add Entry </button>
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
                         </>)}
                    </Disclosure>

                    {/* Customize Styles & Layout Section */}
                    <Disclosure as="div" className={`${editorSectionBg} p-4 rounded-lg`} defaultOpen={false}>
                        {({ open }) => (
                            <>
                                <Disclosure.Button className={editorSectionHeaderClasses}>
                                    <span>Customize Styles & Layout</span>
                                    <ChevronDownIcon className={`w-5 h-5 ${EDITOR_UI_ACCENT_TEXT_COLOR} transform transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
                                </Disclosure.Button>
                                <Transition
                                    show={open}
                                    enter="transition duration-100 ease-out"
                                    enterFrom="transform scale-95 opacity-0 max-h-0"
                                    enterTo="transform scale-100 opacity-100 max-h-screen"
                                    leave="transition duration-75 ease-out"
                                    leaveFrom="transform scale-100 opacity-100 max-h-screen"
                                    leaveTo="transform scale-95 opacity-0 max-h-0"
                                >
                                    <Disclosure.Panel className="customization-section mt-3 space-y-6 overflow-hidden">
                                        <div>
                                            <label htmlFor="fontFamilyBold" className={editorLabelClasses}>Font Family</label>
                                            <select id="fontFamilyBold" value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} className={editorInputClasses}>
                                                {boldFontOptions.map(font => ( <option key={font.value} value={font.value}>{font.name}</option> ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label htmlFor="colorPaletteBold" className={editorLabelClasses}>Color Palette</label>
                                            <select 
                                                id="colorPaletteBold" 
                                                onChange={(e) => handlePaletteChange(e.target.value)} 
                                                className={editorInputClasses}
                                                value={boldPredefinedColorPalettes.find(p => 
                                                    p.headingColor === headingColor &&
                                                    p.bodyTextColor === bodyTextColor &&
                                                    p.accentColor === accentColor &&
                                                    p.secondaryAccentColor === secondaryAccentColor &&
                                                    (p.backgroundColor === portfolioBackgroundColor || (p.backgroundColor && typeof p.backgroundColor === 'string' && p.backgroundColor.startsWith('linear-gradient') && typeof portfolioBackgroundColor === 'string' && portfolioBackgroundColor.startsWith('linear-gradient')))
                                                )?.name || ""}
                                            >
                                                <option value="">Custom Colors</option>
                                                {boldPredefinedColorPalettes.map(palette => ( <option key={palette.name} value={palette.name}> {palette.name} </option> ))}
                                            </select>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label htmlFor="headingColorBold" className={editorLabelClasses}>Heading Color</label>
                                                <input type="color" id="headingColorBold" value={headingColor} onChange={(e) => setHeadingColor(e.target.value)} className={`${editorInputClasses} h-12 p-1 w-full`} />
                                            </div>
                                            <div>
                                                <label htmlFor="bodyTextColorBold" className={editorLabelClasses}>Body Text Color</label>
                                                <input type="color" id="bodyTextColorBold" value={bodyTextColor} onChange={(e) => setBodyTextColor(e.target.value)} className={`${editorInputClasses} h-12 p-1 w-full`} />
                                            </div>
                                            <div>
                                                <label htmlFor="accentColorBold" className={editorLabelClasses}>Primary Accent</label>
                                                <input type="color" id="accentColorBold" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className={`${editorInputClasses} h-12 p-1 w-full`} />
                                            </div>
                                             <div>
                                                <label htmlFor="secondaryAccentColorBold" className={editorLabelClasses}>Secondary Accent</label>
                                                <input type="color" id="secondaryAccentColorBold" value={secondaryAccentColor} onChange={(e) => setSecondaryAccentColor(e.target.value)} className={`${editorInputClasses} h-12 p-1 w-full`} />
                                            </div>
                                        </div>
                                        <div>
                                            <label htmlFor="portfolioBackgroundColorBold" className={editorLabelClasses}>
                                                Portfolio Background (Color or Gradient CSS)
                                            </label>
                                            <input 
                                                type="text" 
                                                id="portfolioBackgroundColorBold" 
                                                value={portfolioBackgroundColor} 
                                                onChange={(e) => setPortfolioBackgroundColor(e.target.value)} 
                                                className={editorInputClasses}
                                                placeholder="e.g., #1A1A2E or linear-gradient(...)"
                                            />
                                            <div className="flex items-center mt-1">
                                                <label htmlFor="portfolioBackgroundColorPickerBold" className="text-xs text-slate-400 mr-2">Color Picker:</label>
                                                <input 
                                                    type="color" 
                                                    id="portfolioBackgroundColorPickerBold" 
                                                    value={typeof portfolioBackgroundColor === 'string' && portfolioBackgroundColor.startsWith('linear-gradient') ? '#000000' : portfolioBackgroundColor} 
                                                    onChange={(e) => setPortfolioBackgroundColor(e.target.value)} 
                                                    className={`${editorInputClasses.replace('w-full','w-16')} h-8 p-0.5`}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label htmlFor="headerLayoutBold" className={editorLabelClasses}>Header Layout</label>
                                            <select id="headerLayoutBold" value={headerLayout} onChange={(e) => setHeaderLayout(e.target.value)} className={editorInputClasses}>
                                                {boldHeaderLayoutOptions.map(layout => ( <option key={layout.id} value={layout.id}>{layout.name}</option> ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label htmlFor="skillDisplayStyleBold" className={editorLabelClasses}>Skill Display Style</label>
                                            <select id="skillDisplayStyleBold" value={skillDisplayStyle} onChange={(e) => setSkillDisplayStyle(e.target.value)} className={editorInputClasses}>
                                                {boldSkillDisplayOptions.map(option => ( <option key={option.id} value={option.id}>{option.name}</option> ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label htmlFor="skillChipStyleOverrideBold" className={editorLabelClasses}>Skill Chip Background</label>
                                            <select id="skillChipStyleOverrideBold" value={skillChipStyleOverride} onChange={(e) => setSkillChipStyleOverride(e.target.value)} className={editorInputClasses} >
                                                <option value="theme">Follow Template Default (Subtle)</option>
                                                <option value="accent">Use Accent Color</option>
                                                <option value="secondaryAccent">Use Secondary Accent</option>
                                                <option value="light">Light Background</option>
                                                <option value="dark">Dark Background</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label htmlFor="sectionSpacingBold" className={editorLabelClasses}> Section Spacing: <span className="font-normal text-slate-400 text-xs">({sectionSpacing * 0.25}rem)</span> </label>
                                            <input type="range" id="sectionSpacingBold" min="0" max="8" step="1" value={sectionSpacing} onChange={(e) => setSectionSpacing(Number(e.target.value))} className={`w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer ${EDITOR_UI_ACCENT_SLIDER_COLOR}`} />
                                            <div className="flex justify-between text-xs text-slate-400 px-1 mt-1"><span>Tight</span><span>Default</span><span>Spacious</span></div>
                                        </div>
                                    </Disclosure.Panel>
                                </Transition>
                            </>
                        )}
                    </Disclosure>

                    <div className="save-button-container mt-8">
                        <button onClick={handleSavePortfolio} disabled={loading || isUploadingProfilePic /* || isUploadingMainVisual */ || isUploadingResume || certifications.some(c => c.isUploadingCertificate) || projects.some(p => p.isUploadingThumbnail)} className={`${buttonClasses} w-full text-lg py-3 disabled:opacity-70 disabled:cursor-not-allowed`}>
                            {saveButtonText}
                        </button>
                    </div>
                    {error && <p className="text-red-400 text-sm mt-4 text-center">{error}</p>}
                </div>

                {!isMobileView && (
                    <div className="preview-area sticky top-[calc(theme(spacing.4)+env(safe-area-inset-top))] max-h-[calc(100vh-100px)] overflow-y-auto custom-scrollbar bg-slate-800 rounded-xl shadow-2xl transition-colors duration-300">
                         <PortfolioDisplay portfolioData={portfolioDataForPreview} />
                    </div>
                )}
            </div>
        </DragDropContext>
    );
}

export default LiveBoldInnovatorEditor;
