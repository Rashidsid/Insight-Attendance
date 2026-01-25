import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { AlertCircle, Upload, RotateCcw, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '../../contexts/ThemeContext';
import {
  ThemeConfig,
  defaultTheme,
  getThemePresets,
  applyTheme,
  getThemeFromStorage,
  saveThemeToFirebase,
  uploadLogo,
  getLogoFromStorage,
  getThemeFromFirebase,
} from '../../services/themeService';

export default function AdminSettings() {
  const navigate = useNavigate();
  const { theme: globalTheme, setTheme: setGlobalTheme } = useTheme();
  const [theme, setTheme] = useState<ThemeConfig>(globalTheme);
  const [customColors, setCustomColors] = useState({
    sidebarBg: globalTheme.sidebarBg,
    sidebarAccent: globalTheme.sidebarAccent,
    primaryColor: globalTheme.primaryColor,
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const presets = getThemePresets();

  // Load theme on mount
  useEffect(() => {
    try {
      const adminEmail = localStorage.getItem('adminEmail');
      let savedTheme = getThemeFromStorage();

      // Try to fetch from Firebase if available
      if (adminEmail) {
        getThemeFromFirebase(adminEmail).then((firebaseTheme) => {
          if (firebaseTheme) {
            savedTheme = firebaseTheme;
            setTheme(savedTheme);
            setCustomColors({
              sidebarBg: savedTheme.sidebarBg,
              sidebarAccent: savedTheme.sidebarAccent,
              primaryColor: savedTheme.primaryColor,
            });
          }
        });
      }

      setTheme(savedTheme);
      setCustomColors({
        sidebarBg: savedTheme.sidebarBg,
        sidebarAccent: savedTheme.sidebarAccent,
        primaryColor: savedTheme.primaryColor,
      });

      // Load logo if exists
      if (adminEmail) {
        const storedLogo = getLogoFromStorage(adminEmail);
        if (storedLogo) {
          setLogoPreview(storedLogo);
        }
      }
    } catch (error) {
      console.error('Error loading theme:', error);
      toast.error('Failed to load settings');
    }
  }, []);

  const handlePresetSelect = (presetKey: string) => {
    const preset = presets[presetKey as keyof typeof presets];
    if (preset) {
      const newTheme: ThemeConfig = {
        ...theme,
        sidebarBg: preset.sidebarBg,
        sidebarAccent: preset.sidebarAccent,
        buttonHoverBg: preset.buttonHoverBg,
        primaryColor: preset.primaryColor,
      };
      setTheme(newTheme);
      setGlobalTheme(newTheme); // Update global theme
      setCustomColors({
        sidebarBg: preset.sidebarBg,
        sidebarAccent: preset.sidebarAccent,
        primaryColor: preset.primaryColor,
      });
      applyTheme(newTheme);
      toast.success(`Theme changed to ${preset.label}`);
    }
  };

  const handleColorChange = (key: keyof typeof customColors, value: string) => {
    const updated = { ...customColors, [key]: value };
    setCustomColors(updated);

    const newTheme: ThemeConfig = {
      ...theme,
      sidebarBg: updated.sidebarBg,
      sidebarAccent: updated.sidebarAccent,
      primaryColor: updated.primaryColor,
    };
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }

      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const adminEmail = localStorage.getItem('adminEmail');

      // Save logo if changed
      if (logoFile && adminEmail) {
        const logoUrl = await uploadLogo(adminEmail, logoFile);
        if (logoUrl) {
          const updatedTheme: ThemeConfig = {
            ...theme,
            logo: logoUrl,
          };
          setTheme(updatedTheme);
          setGlobalTheme(updatedTheme); // Update global theme

          // Save to Firebase
          await saveThemeToFirebase(adminEmail, updatedTheme);
        }
      } else if (adminEmail && theme.logo && theme.logo.startsWith('data:')) {
        // Save current theme with logo to Firebase
        await saveThemeToFirebase(adminEmail, theme);
        setGlobalTheme(theme); // Update global theme
      } else if (adminEmail) {
        // Save just the colors without logo changes
        await saveThemeToFirebase(adminEmail, theme);
        setGlobalTheme(theme); // Update global theme
      }

      toast.success('Settings saved successfully!');
      setLogoFile(null);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setTheme(defaultTheme);
    setGlobalTheme(defaultTheme); // Update global theme
    setCustomColors({
      sidebarBg: defaultTheme.sidebarBg,
      sidebarAccent: defaultTheme.sidebarAccent,
      primaryColor: defaultTheme.primaryColor,
    });
    setLogoPreview(null);
    setLogoFile(null);
    applyTheme(defaultTheme);
    toast.success('Settings reset to default');
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Settings</h1>
        <p className="text-gray-600">Customize your admin panel appearance and theme</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Logo & Preview */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Logo</h2>

            {/* Logo Preview */}
            <div className="mb-6 p-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center min-h-[200px]">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo Preview" className="max-w-full max-h-[180px] object-contain" />
              ) : (
                <div className="text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No logo selected</p>
                </div>
              )}
            </div>

            {/* Upload Input */}
            <div className="relative mb-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
                id="logo-upload"
              />
              <label htmlFor="logo-upload">
                <Button
                  asChild
                  variant="outline"
                  className="w-full cursor-pointer border-2 border-[#A982D9] text-[#A982D9] hover:bg-[#E7D7F6]"
                >
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    Choose Logo
                  </span>
                </Button>
              </label>
            </div>

            {logoFile && (
              <p className="text-sm text-green-600 flex items-center gap-2">
                <Check className="w-4 h-4" />
                {logoFile.name}
              </p>
            )}
          </div>

          {/* Current Theme Preview */}
          <div className="bg-white rounded-2xl shadow-md p-6 mt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Preview</h2>
            <div
              className="rounded-xl p-6 text-white"
              style={{ backgroundColor: customColors.sidebarAccent }}
            >
              <p className="font-semibold mb-3">Sidebar Preview</p>
              <div className="space-y-2 text-sm">
                <div
                  className="px-3 py-2 rounded-lg font-medium"
                  style={{ backgroundColor: customColors.primaryColor }}
                >
                  Active Item
                </div>
                <div className="px-3 py-2 rounded-lg hover:bg-white/20 cursor-pointer">
                  Inactive Item
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Theme Colors */}
        <div className="lg:col-span-2">
          {/* Theme Presets */}
          <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Theme Presets</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {Object.entries(presets).map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => handlePresetSelect(key)}
                  className="p-4 rounded-xl border-2 border-gray-200 hover:border-[#A982D9] transition-colors group"
                >
                  <div
                    className="w-full h-16 rounded-lg mb-2 border-2 border-gray-100 shadow-sm group-hover:shadow-md transition-shadow"
                    style={{ backgroundColor: preset.primaryColor }}
                  ></div>
                  <p className="text-sm font-medium text-gray-700 text-center">{preset.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Colors */}
          <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Custom Colors</h2>

            <div className="space-y-6">
              {/* Sidebar Background */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Sidebar Background Color
                </label>
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={customColors.sidebarBg}
                        onChange={(e) => handleColorChange('sidebarBg', e.target.value)}
                        className="w-20 h-12 rounded-lg cursor-pointer border-2 border-gray-200"
                      />
                      <Input
                        type="text"
                        value={customColors.sidebarBg}
                        onChange={(e) => handleColorChange('sidebarBg', e.target.value)}
                        className="flex-1"
                        placeholder="#E7D7F6"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar Accent */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Sidebar Accent Color (Buttons, Active Items)
                </label>
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={customColors.sidebarAccent}
                        onChange={(e) => handleColorChange('sidebarAccent', e.target.value)}
                        className="w-20 h-12 rounded-lg cursor-pointer border-2 border-gray-200"
                      />
                      <Input
                        type="text"
                        value={customColors.sidebarAccent}
                        onChange={(e) => handleColorChange('sidebarAccent', e.target.value)}
                        className="flex-1"
                        placeholder="#A982D9"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Primary Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Primary Theme Color
                </label>
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={customColors.primaryColor}
                        onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                        className="w-20 h-12 rounded-lg cursor-pointer border-2 border-gray-200"
                      />
                      <Input
                        type="text"
                        value={customColors.primaryColor}
                        onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                        className="flex-1"
                        placeholder="#A982D9"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Email Configuration Section */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
            <h3 className="text-lg font-semibold mb-4">Email Configuration</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Admin Email Address</label>
                <Input 
                  type="email" 
                  value={localStorage.getItem('adminEmail') || ''} 
                  disabled 
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-2">This is the email where student/teacher notifications will be sent from</p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm font-medium text-yellow-900 mb-2">📧 Email System Status</p>
                <ul className="text-xs text-yellow-800 space-y-1">
                  <li>✓ Student welcome emails configured</li>
                  <li>✓ Teacher welcome emails configured</li>
                  <li>✓ Email templates with all details included</li>
                  <li>⚠️ Gmail app password required for sending</li>
                </ul>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 mb-2">💡 How it works:</p>
                <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside">
                  <li>When you add a student/teacher, an email is sent to their email address</li>
                  <li>Email includes their name, ID, class/subject, and institution name</li>
                  <li>Check Firebase Cloud Functions logs for email delivery status</li>
                  <li>Pending emails are stored locally and will retry automatically</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">Tip</p>
              <p className="text-sm text-blue-800">
                Changes are applied instantly. Click "Save" to store your preferences.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-[#A982D9] hover:bg-[#9370C5] text-white font-semibold py-2 h-12 rounded-xl"
            >
              <Check className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              className="flex-1 border-2 border-gray-300 text-gray-700 font-semibold py-2 h-12 rounded-xl hover:bg-gray-50"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset to Default
            </Button>
            <Button
              onClick={() => navigate('/admin/students')}
              variant="outline"
              className="flex-1 border-2 border-gray-300 text-gray-700 font-semibold py-2 h-12 rounded-xl hover:bg-gray-50"
            >
              Back
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
