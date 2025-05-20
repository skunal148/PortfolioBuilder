import React, { useState, useEffect } from 'react';
import { auth, db } from '../components/firebase';
import { doc, getDoc, collection, query, getDocs } from 'firebase/firestore';

function PortfolioTemplate() {
  const [profileData, setProfileData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPortfolioData = async () => {
      setLoading(true);
      setError('');
      try {
        const user = auth.currentUser;
        if (user) {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            setProfileData(userDocSnap.data());
          } else {
            setError('Could not find user profile.');
          }

          const projectsCollectionRef = collection(db, 'users', user.uid, 'projects');
          const projectsQuery = query(projectsCollectionRef);
          const projectsSnapshot = await getDocs(projectsQuery);
          const projectsList = projectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setProjects(projectsList);

        } else {
          setError('User not authenticated.');
        }
      } catch (err) {
        setError('Failed to fetch portfolio data.');
        console.error('Error fetching portfolio:', err);
      } finally {
        setLoading(false);
        console.log('Profile Data in Template (after fetch):', profileData);
        console.log('Projects in Template (after fetch):', projects);
      }
    };

    fetchPortfolioData();

  }, []);

  if (loading) {
    return <div>Loading portfolio...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!profileData) {
    return <div>No profile data available. Please edit your profile.</div>;
  }

  const renderProject = (project) => {
    switch (project.templateId) {
      case 'style-1':
        return (
          <div key={project.id} className="template-style-1">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{project.title}</h3>
            <p className="text-gray-600 mb-2">{project.description}</p>
            <div className="flex space-x-4">
              {project.liveDemoUrl && (
                <a href={project.liveDemoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Live Demo</a>
              )}
              {project.sourceCodeUrl && (
                <a href={project.sourceCodeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Source Code</a>
              )}
            </div>
            <p className="text-sm text-gray-400 mt-2">Template: Minimalist</p>
          </div>
        );
      case 'style-2':
        return (
          <div key={project.id} className="template-style-2">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-purple-700 mb-2">{project.title}</h3>
              <p className="text-gray-700 mb-4">{project.description}</p>
            </div>
            <div className="flex justify-center space-x-4">
              {project.liveDemoUrl && (
                <a href={project.liveDemoUrl} target="_blank" rel="noopener noreferrer" className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">Live Demo</a>
              )}
              {project.sourceCodeUrl && (
                <a href={project.sourceCodeUrl} target="_blank" rel="noopener noreferrer" className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded">Source Code</a>
              )}
            </div>
            <p className="text-sm text-gray-400 mt-2 text-center">Template: Creative Grid</p>
          </div>
        );
      default:
        return (
          <div key={project.id} className="template-default">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{project.title} (Default)</h3>
            <p className="text-gray-600 mb-2">{project.description}</p>
            <div className="flex space-x-4">
              {project.liveDemoUrl && (
                <a href={project.liveDemoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Live Demo</a>
              )}
              {project.sourceCodeUrl && (
                <a href={project.sourceCodeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Source Code</a>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="bg-gray-100 py-10">
      <div className="container mx-auto max-w-3xl bg-white shadow-md rounded-lg p-8">
        <section>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Projects</h2>
          {projects.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {projects.map(project => (
                renderProject(project)
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No projects added yet.</p>
          )}
        </section>
        {/* You can add other sections here for profile data, etc. */}
      </div>
    </div>
  );
}

export default PortfolioTemplate;