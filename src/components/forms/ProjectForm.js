import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { auth, db } from '../firebase';
import { collection, addDoc, updateDoc, doc, getDoc, serverTimestamp } from 'firebase/firestore';

function ProjectForm() {
  const { projectId, templateId } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [liveDemoUrl, setLiveDemoUrl] = useState('');
  const [sourceCodeUrl, setSourceCodeUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchProjectData = async () => {
      console.log('projectId in fetchProjectData:', projectId);
      if (projectId) {
        setLoading(true);
        try {
          const user = auth.currentUser;
          if (user) {
            const projectDocRef = doc(db, 'users', user.uid, 'projects', projectId);
            console.log('projectDocRef:', projectDocRef);
            const projectSnapshot = await getDoc(projectDocRef);
            console.log('projectSnapshot.exists():', projectSnapshot.exists());
            if (projectSnapshot.exists()) {
              const projectData = projectSnapshot.data();
              console.log('projectData:', projectData);
              if (isMounted) {
                setTitle(projectData.title || '');
                setDescription(projectData.description || '');
                setLiveDemoUrl(projectData.liveDemoUrl || '');
                setSourceCodeUrl(projectData.sourceCodeUrl || '');
              }
            } else {
              setError('Project not found.');
            }
          }
        } catch (error) {
          setError('Failed to fetch project data for editing.');
          console.error('Error fetching project:', error);
        } finally {
          if (isMounted) {
            setLoading(false);
          }
        }
      } else {
        setTitle('');
        setDescription('');
        setLiveDemoUrl('');
        setSourceCodeUrl('');
      }
    };

    fetchProjectData();

    return () => {
      isMounted = false;
    };
  }, [projectId]);

  const saveProjectData = async () => {
    setLoading(true);
    setError('');

    try {
      const user = auth.currentUser;
      if (user) {
        const projectData = {
          title,
          description,
          liveDemoUrl,
          sourceCodeUrl,
          templateId: templateId || '', // Store the selected template ID
          timestamp: serverTimestamp(),
        };

        if (projectId) {
          const projectDocRef = doc(db, 'users', user.uid, 'projects', projectId);
          await updateDoc(projectDocRef, projectData);
          console.log('Project updated successfully!');
        } else {
          const projectsCollectionRef = collection(db, 'users', user.uid, 'projects');
          await addDoc(projectsCollectionRef, projectData);
          console.log('Project added successfully!');
        }
        navigate('/dashboard');
      }
    } catch (error) {
      setError('Failed to save project.');
      console.error('Error saving project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    saveProjectData();
  };

  return (
    <div className="bg-gray-100 min-h-screen flex justify-center items-center">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">{projectId ? 'Edit Project' : 'Add New Project'}</h2>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">Title</label>
              <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
            </div>
            <div className="mb-4">
              <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">Description</label>
              <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
            </div>
            <div className="mb-4">
              <label htmlFor="liveDemoUrl" className="block text-gray-700 text-sm font-bold mb-2">Live Demo URL</label>
              <input type="text" id="liveDemoUrl" value={liveDemoUrl} onChange={(e) => setLiveDemoUrl(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            </div>
            <div className="mb-4">
              <label htmlFor="sourceCodeUrl" className="block text-gray-700 text-sm font-bold mb-2">Source Code URL</label>
              <input type="text" id="sourceCodeUrl" value={sourceCodeUrl} onChange={(e) => setSourceCodeUrl(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            </div>
            <div className="flex items-center justify-between">
              <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                {projectId ? 'Update Project' : 'Save Project'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default ProjectForm;