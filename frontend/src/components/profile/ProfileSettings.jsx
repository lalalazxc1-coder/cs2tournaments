import React from 'react';
import { useOutletContext } from 'react-router-dom';
import SettingsTab from './SettingsTab';
import { useAuth } from '../../context/AuthContext';

const ProfileSettings = () => {
    const { profile, setProfile } = useOutletContext();
    const { loginWithSteam } = useAuth(); // Assuming this can be used for linking too, or we need a specific link function.

    // If loginWithSteam triggers the same OAuth flow and backend handles linking if logged in:
    const handleSteamConnect = () => {
        loginWithSteam();
    };

    return <SettingsTab profile={profile} setProfile={setProfile} handleSteamConnect={handleSteamConnect} />;
};

export default ProfileSettings;
