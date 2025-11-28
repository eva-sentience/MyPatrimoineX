import React, { useState, useEffect } from 'react';
import { Auth } from './components/Auth';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { CategoryView } from './components/CategoryView';
import { GeminiChat } from './components/GeminiChat';
import { UserProfile, Asset, AssetType } from './types';
import { storageService } from './services/storageService';

const App: React.FC = () => {
  // Initialize with a default user to bypass Auth screen immediately
  const [user, setUser] = useState<UserProfile | null>(() => {
    const stored = storageService.getUser();
    return stored || {
      id: 'demo_user',
      email: 'bnjm.elias@gmail.com',
      isAuthenticated: true,
      hasSetup2FA: true,
      subscriptionTier: 'premium'
    };
  });

  const [activeCategory, setActiveCategory] = useState<AssetType | 'dashboard'>('dashboard');
  const [assets, setAssets] = useState<Asset[]>([]);

  useEffect(() => {
    // Load assets from local storage
    setAssets(storageService.getAssets());
  }, []);

  const handleLogin = (loggedInUser: UserProfile) => {
    setUser(loggedInUser);
    setAssets(storageService.getAssets());
  };

  const handleAssetUpdate = () => {
    setAssets(storageService.getAssets());
  };

  // Authentication check is bypassed by default initialization above.
  // If we wanted to strictly support logout, we would handle user === null here.
  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-obsidian text-gray-100 font-sans overflow-hidden selection:bg-purple-500/30">
      
      <Sidebar 
        activeCategory={activeCategory} 
        onSelect={setActiveCategory} 
      />

      <main className="flex-1 relative flex flex-col min-w-0 overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gray-900 via-obsidian to-obsidian">
        
        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative">
          {activeCategory === 'dashboard' ? (
            <Dashboard assets={assets} />
          ) : (
            <CategoryView 
              categoryType={activeCategory} 
              assets={assets} 
              onAssetUpdate={handleAssetUpdate} 
            />
          )}
        </div>

      </main>

      {/* AI Assistant Overlay */}
      <GeminiChat assets={assets} />

    </div>
  );
};

export default App;