import React from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { User, Mail, Shield, LogOut, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const ProfilePage: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Please sign in to view your profile.</p>
        <button onClick={() => navigate('/')} className="mt-4 text-primary font-bold">
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      <div className="p-8 rounded-3xl bg-card border border-border flex flex-col sm:flex-row items-center gap-6">
        <img
          src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'}
          alt={user.name}
          className="w-24 h-24 rounded-full object-cover border-2 border-primary/20 shadow-md"
        />
        <div className="space-y-1 text-center sm:text-left">
          <h2 className="text-2xl font-bold text-foreground">{user.name}</h2>
          <p className="text-xs text-muted-foreground flex items-center justify-center sm:justify-start gap-1.5">
            <Mail className="w-3.5 h-3.5" />
            <span>{user.email}</span>
          </p>
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-bold mt-2">
            <Shield className="w-3 h-3" />
            <span>Verified Customer</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-foreground">Recent Orders</h3>
        <div className="p-6 rounded-2xl bg-card border border-border text-center text-muted-foreground text-xs space-y-2">
          <Package className="w-8 h-8 opacity-40 mx-auto" />
          <p>No past orders found.</p>
        </div>
      </div>

      <div className="pt-4">
        <button
          onClick={() => {
            logout();
            toast.info('Logged out successfully');
            navigate('/');
          }}
          className="px-6 py-2.5 bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground font-semibold rounded-xl text-xs transition-colors flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};
