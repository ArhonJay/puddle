'use client';

import React, { useState, useEffect } from 'react';
import { PuddleLayout } from '@/components/layout/puddleLayout';
import { Moon, Sun, Bell, BellOff, Grid3x3, List, RefreshCw, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

type Theme = 'light' | 'dark' | 'system';
type ViewMode = 'grid' | 'list';

interface Settings {
  theme: Theme;
  notifications: boolean;
  defaultView: ViewMode;
  autoRefresh: boolean;
  refreshInterval: number; // in seconds
}

const defaultSettings: Settings = {
  theme: 'light',
  notifications: true,
  defaultView: 'grid',
  autoRefresh: true,
  refreshInterval: 30,
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('puddle-settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error('Failed to load settings:', e);
      }
    }
  }, []);

  const handleSettingChange = <K extends keyof Settings>(
    key: K,
    value: Settings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
    setSaveSuccess(false);
  };

  const handleSave = () => {
    localStorage.setItem('puddle-settings', JSON.stringify(settings));
    setHasChanges(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    setHasChanges(true);
    setSaveSuccess(false);
  };

  return (
    <PuddleLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Customize your Puddle experience
          </p>
        </div>

        {/* Settings Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Appearance Section */}
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              {settings.theme === 'dark' ? (
                <Moon className="w-5 h-5 text-blue-600" />
              ) : (
                <Sun className="w-5 h-5 text-blue-600" />
              )}
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Appearance</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Theme
                </label>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {(['light', 'dark', 'system'] as Theme[]).map((theme) => (
                    <button
                      key={theme}
                      onClick={() => handleSettingChange('theme', theme)}
                      className={cn(
                        'px-3 sm:px-4 py-2 sm:py-3 rounded-lg border-2 transition-all text-sm sm:text-base',
                        settings.theme === theme
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      )}
                    >
                      {theme.charAt(0).toUpperCase() + theme.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Default View
                </label>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <button
                    onClick={() => handleSettingChange('defaultView', 'grid')}
                    className={cn(
                      'px-3 sm:px-4 py-2 sm:py-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2',
                      settings.defaultView === 'grid'
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    )}
                  >
                    <Grid3x3 className="w-4 h-4" />
                    <span className="text-sm sm:text-base">Grid</span>
                  </button>
                  <button
                    onClick={() => handleSettingChange('defaultView', 'list')}
                    className={cn(
                      'px-3 sm:px-4 py-2 sm:py-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2',
                      settings.defaultView === 'list'
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    )}
                  >
                    <List className="w-4 h-4" />
                    <span className="text-sm sm:text-base">List</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              {settings.notifications ? (
                <Bell className="w-5 h-5 text-blue-600" />
              ) : (
                <BellOff className="w-5 h-5 text-gray-400" />
              )}
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Notifications</h2>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm sm:text-base font-medium text-gray-700">Enable Notifications</p>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Get notified about task updates and rewards
                </p>
              </div>
              <button
                onClick={() => handleSettingChange('notifications', !settings.notifications)}
                className={cn(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  settings.notifications ? 'bg-blue-600' : 'bg-gray-200'
                )}
              >
                <span
                  className={cn(
                    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                    settings.notifications ? 'translate-x-6' : 'translate-x-1'
                  )}
                />
              </button>
            </div>
          </div>

          {/* Auto Refresh Section */}
          <div className="p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <RefreshCw className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Auto Refresh</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm sm:text-base font-medium text-gray-700">Enable Auto Refresh</p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    Automatically refresh task data
                  </p>
                </div>
                <button
                  onClick={() => handleSettingChange('autoRefresh', !settings.autoRefresh)}
                  className={cn(
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                    settings.autoRefresh ? 'bg-blue-600' : 'bg-gray-200'
                  )}
                >
                  <span
                    className={cn(
                      'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                      settings.autoRefresh ? 'translate-x-6' : 'translate-x-1'
                    )}
                  />
                </button>
              </div>

              {settings.autoRefresh && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Refresh Interval (seconds)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="300"
                    value={settings.refreshInterval}
                    onChange={(e) =>
                      handleSettingChange('refreshInterval', parseInt(e.target.value) || 30)
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Min: 10s, Max: 300s</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:justify-end">
          <button
            onClick={handleReset}
            className="px-6 py-2.5 rounded-lg border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Reset to Default
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className={cn(
              'px-6 py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2',
              hasChanges
                ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white hover:from-blue-700 hover:to-sky-600 shadow-sm hover:shadow-md'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            )}
          >
            <Save className="w-4 h-4" />
            {saveSuccess ? 'Saved!' : 'Save Changes'}
          </button>
        </div>

        {/* Success Message */}
        {saveSuccess && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700 text-center">
              ✓ Settings saved successfully!
            </p>
          </div>
        )}
      </div>
    </PuddleLayout>
  );
}
