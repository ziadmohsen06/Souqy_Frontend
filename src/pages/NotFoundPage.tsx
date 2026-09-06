import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
  const { pathname } = useLocation();
  const isCheckout = pathname.startsWith('/checkout');
  return (
    <div className="py-24 text-center space-y-4">
      <p className="text-6xl font-black text-muted-foreground/30">{isCheckout ? '🚧' : '404'}</p>
      <h1 className="text-2xl font-extrabold">{isCheckout ? 'Checkout is coming soon' : 'Page not found'}</h1>
      <p className="text-sm text-muted-foreground max-w-md mx-auto">
        {isCheckout
          ? 'The checkout flow is being built in a separate work stream. Your bag is saved on this device.'
          : `We couldn't find "${pathname}".`}
      </p>
      <div className="flex items-center justify-center gap-3 pt-2">
        <Link to={isCheckout ? '/cart' : '/'} className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm">
          {isCheckout ? 'Back to bag' : 'Go home'}
        </Link>
        <Link to="/products" className="px-5 py-2.5 rounded-xl border border-border font-semibold text-sm hover:bg-muted">
          Browse catalog
        </Link>
      </div>
    </div>
  );
};
