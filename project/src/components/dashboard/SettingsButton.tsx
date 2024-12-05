import React, { useState, useEffect } from 'react';
import { Settings, Moon, Sun, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '@/lib/auth';

interface SettingsButtonProps {
  onThemeChange: () => void;
  isDarkMode: boolean;
}

export function SettingsButton({ onThemeChange, isDarkMode }: SettingsButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      getCurrentUser(userId).then(user => {
        if (user) {
          setUsername(user.name);
        }
      });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  return (
    <div className="fixed bottom-6 right-24">
      <Button
        className="rounded-full w-12 h-12 shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Settings className="w-6 h-6" />
      </Button>

      {isOpen && (
        <div className="absolute bottom-16 right-0 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          <div className="p-4 border-b dark:border-gray-700">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Signed in as</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">{username}</p>
          </div>
          <div className="p-2 space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
              onClick={onThemeChange}
            >
              {isDarkMode ? (
                <>
                  <Sun className="w-4 h-4" />
                  Light Mode
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4" />
                  Dark Mode
                </>
              )}
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
              onClick={() => navigate('/account')}
            >
              <User className="w-4 h-4" />
              Account Settings
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}