import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase'; // Ensure this path is correct
import { doc, getDoc, updateDoc } from 'firebase/firestore';

function ProfileForm() {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState(''); // Email is usually not editable by the user directly once set
  const [bio, setBio] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState(''); // Example: a personal website or portfolio link
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Common Tailwind classes for reuse
  const labelClasses = "block text-slate-300 text-sm font-semibold mb-2";
  const inputBaseClasses = "shadow-inner appearance-none border border-slate-700 rounded w-full py-3 px-4 bg-slate-700 text-slate-100 leading-tight focus:outline-none focus:ring-2 placeholder-slate-500";
  const enabledInputClasses = `${inputBaseClasses} focus:ring-emerald-500`;
  const disabledInputClasses = `${inputBaseClasses} bg-slate-600 cursor-not-allowed text-slate-400`;
  const primaryButtonClasses = "bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-opacity-75 transform hover:scale-105";
  const secondaryButtonClasses = "bg-slate-600 hover:bg-slate-500 text-slate-100 font-semibold py-2 px-6 rounded-lg shadow-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-opacity-75 transform hover:scale-105";


  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      const user = auth.currentUser;
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            const profileData = docSnap.data();
            setDisplayName(profileData.displayName || user.displayName || '');
            setEmail(profileData.email || user.email || ''); // Prioritize Firestore email, fallback to auth
            setBio(profileData.bio || '');
            setPortfolioUrl(profileData.portfolioUrl || '');
          } else {
            // If no profile doc, initialize with auth data if available
            setEmail(user.email || '');
            setDisplayName(user.displayName || '');
            console.log('No profile document found in Firestore, creating one might be an option here or on first save.');
            // setError('Profile data not found. You can create it by saving your information.');
          }
        } catch (error) {
          setError('Failed to load profile.');
          console.error('Error fetching profile:', error);
        }
      } else {
        setError("User not authenticated.");
        // navigate('/login'); // Optionally redirect
      }
      setLoading(false);
    };

    fetchProfile();
  }, []);

  const handleEditToggle = () => {
    setIsEditing(true);
    setSuccessMessage(''); // Clear success message when entering edit mode
  };

  const handleCancelEdit = async () => {
    setIsEditing(false);
    setError('');
    setSuccessMessage('');
    // Refetch data to revert any unsaved changes
    setLoading(true);
    const user = auth.currentUser;
    if (user) {
        try {
            const userDocRef = doc(db, 'users', user.uid);
            const docSnap = await getDoc(userDocRef);
            if (docSnap.exists()) {
                const profileData = docSnap.data();
                setDisplayName(profileData.displayName || '');
                setBio(profileData.bio || '');
                setPortfolioUrl(profileData.portfolioUrl || '');
            }
        } catch (fetchError) {
            console.error("Error refetching profile on cancel:", fetchError);
            setError("Could not revert changes, please refresh.");
        }
    }
    setLoading(false);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    const user = auth.currentUser;
    if (user) {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, {
          displayName: displayName.trim(),
          email: email, // Email is generally not updated by users this way, ensure it's correct
          bio: bio.trim(),
          portfolioUrl: portfolioUrl.trim(),
          // lastUpdated: serverTimestamp(), // Optional: add a timestamp
        }, { merge: true }); // Use merge: true to create the doc if it doesn't exist or update existing fields

        setSuccessMessage('Profile updated successfully!');
        setIsEditing(false); 
      } catch (error) {
        setError('Failed to update profile. Please try again.');
        console.error('Error updating profile:', error);
      }
    } else {
      setError("User not authenticated. Cannot save profile.");
    }
    setLoading(false);
  };

  // This component assumes it's rendered within MainLayout, which provides the page background
  // So, this top div is for centering the form card.
  return (
    <div className="flex justify-center items-start py-10 px-4 min-h-[calc(100vh-theme.headerHeight)]"> {/* Adjust min-h based on your header height */}
      <div className="bg-slate-800 shadow-2xl rounded-xl p-8 sm:p-10 w-full max-w-2xl"> {/* Increased max-w for more space */}
        <h2 className="text-3xl font-bold text-center text-emerald-400 mb-8">
          Your Profile
        </h2>

        {loading ? (
          <p className="text-center text-slate-300">Loading profile...</p>
        ) : (
          <>
            {error && (
              <p className="bg-red-500/20 text-red-300 text-sm p-3 rounded-md mb-6 text-center">
                {error}
              </p>
            )}
            {successMessage && !isEditing && (
              <p className="bg-emerald-500/20 text-emerald-300 text-sm p-3 rounded-md mb-6 text-center">
                {successMessage}
              </p>
            )}
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div>
                <label htmlFor="displayName" className={labelClasses}>Display Name</label>
                <input 
                  type="text" 
                  id="displayName" 
                  value={displayName} 
                  onChange={(e) => setDisplayName(e.target.value)} 
                  className={isEditing ? enabledInputClasses : disabledInputClasses} 
                  disabled={!isEditing} 
                  required 
                  placeholder="Your Name or Nickname"
                />
              </div>

              <div>
                <label htmlFor="email" className={labelClasses}>Email</label>
                <input 
                  type="email" 
                  id="email" 
                  value={email} 
                  className={disabledInputClasses} // Email is typically not user-editable here
                  disabled 
                  readOnly 
                />
              </div>

              <div>
                <label htmlFor="bio" className={labelClasses}>Bio / About Me</label>
                <textarea 
                  id="bio" 
                  value={bio} 
                  onChange={(e) => setBio(e.target.value)} 
                  className={`${isEditing ? enabledInputClasses : disabledInputClasses} min-h-[120px]`} 
                  disabled={!isEditing} 
                  placeholder="Tell everyone a little about yourself, your skills, or what you do."
                />
              </div>

              <div>
                <label htmlFor="portfolioUrl" className={labelClasses}>Portfolio URL (Optional)</label>
                <input 
                  type="url" 
                  id="portfolioUrl" 
                  value={portfolioUrl} 
                  onChange={(e) => setPortfolioUrl(e.target.value)} 
                  className={isEditing ? enabledInputClasses : disabledInputClasses} 
                  disabled={!isEditing} 
                  placeholder="https://your-amazing-portfolio.com"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between pt-4 space-y-4 sm:space-y-0 sm:space-x-4">
                {!isEditing ? (
                  <button 
                    type="button" 
                    onClick={handleEditToggle} 
                    className={`${primaryButtonClasses} w-full sm:w-auto`}
                  >
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex flex-col sm:flex-row w-full space-y-4 sm:space-y-0 sm:space-x-3">
                    <button 
                      type="submit" 
                      className={`${primaryButtonClasses} w-full sm:flex-1`}
                      disabled={loading}
                    >
                      {loading ? 'Saving...' : 'Save Profile'}
                    </button>
                    <button 
                      type="button" 
                      onClick={handleCancelEdit} 
                      className={`${secondaryButtonClasses} w-full sm:w-auto`}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </div>
                )}
                <button 
                  type="button" 
                  onClick={() => navigate('/dashboard')} 
                  className={`${secondaryButtonClasses} w-full sm:w-auto ${isEditing ? 'sm:ml-auto' : ''}`} // Push to right if edit buttons are present
                >
                  Back to Dashboard
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default ProfileForm;
