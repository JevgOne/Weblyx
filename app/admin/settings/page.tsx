'use client';

import { useState } from 'react';
import { KeyRound, Eye, EyeOff, Check, AlertCircle, Shield, User } from 'lucide-react';

export default function SettingsPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Nová hesla se neshodují' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Heslo musí mít alespoň 6 znaků' });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Heslo bylo úspěšně změněno!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setMessage({ type: 'error', text: data.error || 'Chyba při změně hesla' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Chyba při komunikaci se serverem' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Nastavení</h1>
          <p className="text-zinc-400">Správa vašeho admin účtu</p>
        </div>

        {/* Password Change Card */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-purple-500/20 rounded-xl">
              <KeyRound className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Změna hesla</h2>
              <p className="text-sm text-zinc-500">Aktualizujte své přihlašovací heslo</p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Současné heslo
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  placeholder="Zadejte současné heslo"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition"
                >
                  {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Nové heslo
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  placeholder="Zadejte nové heslo (min. 6 znaků)"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition"
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Potvrdit nové heslo
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full bg-zinc-800/50 border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition ${
                  confirmPassword && newPassword !== confirmPassword
                    ? 'border-red-500'
                    : confirmPassword && newPassword === confirmPassword
                    ? 'border-green-500'
                    : 'border-zinc-700'
                }`}
                placeholder="Zopakujte nové heslo"
                required
              />
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-red-400 text-sm mt-1">Hesla se neshodují</p>
              )}
            </div>

            {/* Message */}
            {message && (
              <div
                className={`flex items-center gap-2 p-4 rounded-xl ${
                  message.type === 'success'
                    ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                    : 'bg-red-500/20 border border-red-500/30 text-red-400'
                }`}
              >
                {message.type === 'success' ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                <span>{message.text}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || (confirmPassword !== '' && newPassword !== confirmPassword)}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold py-3 px-6 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Ukládám...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  Změnit heslo
                </>
              )}
            </button>
          </form>
        </div>

        {/* Account Info Card */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <User className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Informace o účtu</h2>
              <p className="text-sm text-zinc-500">Váš admin účet</p>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-zinc-800">
              <span className="text-zinc-400">Role</span>
              <span className="text-white font-medium">Administrator</span>
            </div>
            <div className="flex justify-between py-2 border-b border-zinc-800">
              <span className="text-zinc-400">Přístup</span>
              <span className="text-green-400 font-medium">Plný přístup</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-zinc-400">Session</span>
              <span className="text-white font-medium">7 dní</span>
            </div>
          </div>
        </div>

        {/* Security Tips */}
        <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
          <h3 className="text-amber-400 font-medium mb-2">Bezpečnostní tipy</h3>
          <ul className="text-sm text-zinc-400 space-y-1">
            <li>• Používejte silné heslo s kombinací písmen, čísel a symbolů</li>
            <li>• Nikdy nesdílejte své přihlašovací údaje</li>
            <li>• Pravidelně měňte heslo</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
