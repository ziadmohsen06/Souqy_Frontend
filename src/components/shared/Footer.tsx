import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, Globe, MessageSquare, Share2 } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="w-full border-t border-border bg-card/50 text-muted-foreground text-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-black text-xl text-foreground">
              <span>{t('app_name')}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your premiere modern destination for  fashion and lifestyle essentials.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider mb-3">Shop</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="/products" className="hover:text-primary transition-colors">All Products</a></li>
              <li><a href="/products?cat=Fashion" className="hover:text-primary transition-colors">Fashion</a></li>
              <li><a href="/products?cat=Beauty" className="hover:text-primary transition-colors">Beauty & Care</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider mb-3">Company</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider mb-3">Connect With Us</h4>
            <div className="flex items-center gap-3">
              <a href="#" className="p-2 rounded-full bg-muted text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors" aria-label="Website">
                <Globe className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-full bg-muted text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors" aria-label="Share">
                <Share2 className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-full bg-muted text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors" aria-label="Contact">
                <MessageSquare className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border/50 mt-8 pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} {t('app_name')}. Built with React 19, Vite & Tailwind CSS v4.
        </div>
      </div>
    </footer>
  );
};
