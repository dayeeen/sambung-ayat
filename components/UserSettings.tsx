'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Edit, Trash2, X, Check, AlertTriangle } from 'lucide-react';

interface UserSettingsProps {
  user: { email?: string } | null;
  onClose: () => void;
}

export default function UserSettings({ user, onClose }: UserSettingsProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [originalName, setOriginalName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const run = async () => {
      try {
        const response = await fetch('/api/user/current');
        if (response.ok) {
          const data = await response.json();
          const currentName = data.displayName || data.email?.split('@')[0] || 'Hamba Allah';
          setDisplayName(currentName);
          setOriginalName(currentName);
        }
      } catch {
        const fallbackName = user?.email?.split('@')[0] || 'Hamba Allah';
        setDisplayName(fallbackName);
        setOriginalName(fallbackName);
      }
    };
    run();
  }, []);

  const handleSaveDisplayName = async () => {
    if (!displayName.trim()) {
      alert('Nama tidak boleh kosong');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/user/display-name', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ displayName: displayName.trim() }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Gagal menyimpan nama');
      }

      setOriginalName(displayName.trim());
      setIsEditingName(false);
      router.refresh();
    } catch (error) {
      console.error('Error saving display name:', error);
      alert(error instanceof Error ? error.message : 'Gagal menyimpan nama');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setDisplayName(originalName);
    setIsEditingName(false);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'HAPUS') {
      alert('Silakan ketik "HAPUS" untuk konfirmasi');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/user/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Gagal menghapus akun');
      }

      // Ensure client-side logout too (clears localStorage/session)
      await supabase.auth.signOut();
      // Redirect to home page after successful deletion
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Error deleting account:', error);
      alert(error instanceof Error ? error.message : 'Gagal menghapus akun');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 pointer-events-auto">
      <div className="bg-background border border-border rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto pointer-events-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Pengaturan Akun</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Display Name Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">Nama Tampilan</h3>
            {!isEditingName ? (
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="font-medium">{originalName}</span>
                <button
                  onClick={() => setIsEditingName(true)}
                  className="p-1 rounded hover:bg-muted transition-colors"
                  title="Edit nama"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Masukkan nama tampilan"
                  maxLength={50}
                  disabled={isLoading}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveDisplayName}
                    disabled={isLoading || !displayName.trim()}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    Simpan
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={isLoading}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Batal
                  </button>
                </div>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Nama ini akan ditampilkan di leaderboard. Gunakan nama yang sopan dan tidak mengandung unsur negatif.
            </p>
          </div>

          {/* Divider */}
          <div className="border-t border-border"></div>

          {/* Delete Account Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-red-500">Zona Berbahaya</h3>
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Hapus Akun
              </button>
            ) : (
            <div className="space-y-4 p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
                <div className="flex items-center gap-2 text-red-500">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-medium">Konfirmasi Penghapusan</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Tindakan ini tidak dapat dibatalkan. Semua data Anda akan dihapus secara permanen.
                </p>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                  Ketik &quot;HAPUS&quot; untuk konfirmasi:
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-red-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="HAPUS"
                    disabled={isLoading}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={isLoading || deleteConfirmText !== 'HAPUS'}
                    className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? 'Menghapus...' : 'Hapus Akun'}
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeleteConfirmText('');
                    }}
                    disabled={isLoading}
                    className="flex-1 px-3 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
