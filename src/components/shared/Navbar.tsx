import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, Heart, User as UserIcon, LogOut, Menu, X, PackagePlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { isAdminToken } from '@/services/auth.service';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSwitcher } from './LanguageSwitcher';
import { SearchModal } from './SearchModal';
import { CartDrawer } from './CartDrawer';
import { AuthModal } from '../auth/AuthModal';
import { AddProductModal } from '../products/AddProductModal';

export const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, token, isAuthenticated, logout } = useAuthStore();
  const { getTotalItems, openCart } = useCartStore();
  const wishlistItems = useWishlistStore((s) => s.items);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const totalCartCount = getTotalItems();
  // Admin-only "Add product". Fall back to decoding the token so sessions that
  // were persisted before `user.role` existed still work.
  const isAdmin = isAuthenticated && (user?.role === 'admin' || isAdminToken(token));

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2 font-black text-xl sm:text-2xl tracking-tight text-foreground whitespace-nowrap shrink-0">
            <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text ">
              {t('app_name')}
            </span>
          </Link>

          {/* Navigation Links (Desktop) */}
          <nav className=" md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link to="/" className="hover:text-primary transition-colors">
              {t('nav.home')}
            </Link>
            <Link to="/products" className="hover:text-primary transition-colors">
              {t('nav.products')}
            </Link>
            <Link to="/wishlist" className="hover:text-primary transition-colors">
              {t('nav.wishlist')}
            </Link>
            <Link to="/cart" className="hover:text-primary transition-colors">
              {t('nav.cart')}
            </Link>
          </nav>

          {/* Actions & Utilities */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist Button */}
            <Link
              to="/wishlist"
              className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors hidden sm:flex"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistItems.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Cart Trigger Drawer */}
            <button
              onClick={openCart}
              className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
              aria-label="Cart"
            >
              <ShoppingBag className="w-5 h-5 text-primary" />
              {totalCartCount > 0 && (
                <span className="absolute top-1 right-1 w-4.5 h-4.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center shadow-md">
                  {totalCartCount}
                </span>
              )}
            </button>

            {/* Admin: Add product */}
            {isAdmin && (
              <button
                onClick={() => setIsAddProductOpen(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border border-primary/40 text-primary hover:bg-primary/10 transition-colors"
              >
                <PackagePlus className="w-3.5 h-3.5" />
                <span>Add Product</span>
              </button>
            )}

            <div className="h-4 w-px bg-border mx-1 hidden sm:block" />

            {/* Language & Theme Switchers */}
            <LanguageSwitcher />
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>

            {/* Auth / Profile */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2 pl-2">
                <button
                  onClick={() => navigate('/profile')}
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-muted"
                >
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border border-border"
                  />
                </button>
                <button
                  onClick={logout}
                  className="p-2 text-muted-foreground hover:text-destructive hover:bg-muted rounded-full transition-colors hidden sm:flex"
                  title={t('nav.logout')}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity shadow-sm"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>{t('nav.login')}</span>
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-muted-foreground hover:text-foreground md:hidden rounded-full hover:bg-muted"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-b border-border bg-card px-4 pt-2 pb-4 space-y-2">
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted text-foreground"
            >
              {t('nav.home')}
            </Link>
            <Link
              to="/products"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted text-foreground"
            >
              {t('nav.products')}
            </Link>
            <Link
              to="/wishlist"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted text-foreground"
            >
              {t('nav.wishlist')} ({wishlistItems.length})
            </Link>
            <Link
              to="/cart"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted text-foreground"
            >
              {t('nav.cart')} ({totalCartCount})
            </Link>
            {isAdmin && (
              <button
                onClick={() => { setIsMobileMenuOpen(false); setIsAddProductOpen(true); }}
                className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-primary hover:bg-muted"
              >
                <PackagePlus className="w-4 h-4" />
                Add Product
              </button>
            )}
          </div>
        )}
      </header>

      {/* Global Modals & Drawers */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <CartDrawer />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <AddProductModal isOpen={isAddProductOpen} onClose={() => setIsAddProductOpen(false)} />
    </>
  );
};
