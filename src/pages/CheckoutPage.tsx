import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCartStore } from '@/store/useCartStore';
import { HelpCircle, Tag, Check, CreditCard, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { items, getTotalPrice, clearCart } = useCartStore();

  const [step, setStep] = useState<'shipping' | 'payment' | 'confirmation'>('shipping');

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('EGY');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [description, setDescription] = useState('');
  const [shippingMethod, setShippingMethod] = useState<'free' | 'express'>('free');

  // Discount code state
  const [discountCode, setDiscountCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cod'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  // Sample items fallback if cart is empty for demonstration
  const displayItems = items.length > 0 ? items : [
    {
      product: {
        id: 'sample-1',
        name: 'Pure Mulberry Silk Pleated Midi Dress',
        price: 165.00,
        category: "Women's Fashion",
        description: '',
        image: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=80&w=300',
        rating: 4.8,
        reviewsCount: 12,
        stock: 5
      },
      quantity: 2
    }
  ];

  const subtotal = items.length > 0 ? getTotalPrice() : 330.00;
  const shippingCost = shippingMethod === 'express' ? 9.00 : 0.00;
  const estimatedTaxes = 5.00;
  const total = subtotal + shippingCost + estimatedTaxes - discountAmount;

  const handleApplyDiscount = (e: React.FormEvent) => {
    e.preventDefault();
    if (discountCode.trim().toLowerCase() === 'save10') {
      setDiscountAmount(subtotal * 0.1);
      toast.success('Discount code applied (10% OFF)');
    } else if (discountCode.trim() !== '') {
      toast.error('Invalid discount code. Try "SAVE10"');
    }
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !phone || !city || !state || !zipCode) {
      toast.error('Please fill in all required shipping details.');
      return;
    }
    setStep('payment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCompleteOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethod === 'card' && (!cardNumber || !cardExpiry || !cardCvc)) {
      toast.error('Please fill in card details.');
      return;
    }
    clearCart();
    setStep('confirmation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="py-6 px-2 sm:px-4 text-foreground transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Content Area: Shipping & Address or Payment Form */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Steps / Breadcrumbs */}
            <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm font-medium text-muted-foreground">
              <span className={step === 'shipping' ? 'text-primary font-semibold' : 'hover:text-foreground cursor-pointer'} onClick={() => setStep('shipping')}>
                {t('checkout.cart')}
              </span>
              <span>&gt;</span>
              <span className={step === 'shipping' ? 'text-foreground font-semibold' : step === 'payment' ? 'text-primary font-semibold' : ''}>
                {t('checkout.shipping')}
              </span>
              <span>&gt;</span>
              <span className={step === 'payment' ? 'text-foreground font-semibold' : step === 'confirmation' ? 'text-primary font-semibold' : ''}>
                {t('checkout.payment')}
              </span>
            </div>

            {step === 'shipping' && (
              <div className="bg-card text-card-foreground rounded-2xl p-6 sm:p-8 shadow-sm border border-border space-y-8">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-foreground mb-6">
                    {t('checkout.shipping_address')}
                  </h2>

                  <form onSubmit={handleProceedToPayment} className="space-y-5">
                    {/* First Name & Last Name */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                          {t('checkout.first_name')}*
                        </label>
                        <input
                          type="text"
                          required
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:outline-none text-sm transition-all"
                          placeholder="Divyansh"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                          {t('checkout.last_name')}*
                        </label>
                        <input
                          type="text"
                          required
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:outline-none text-sm transition-all"
                          placeholder="Agarwal"
                        />
                      </div>
                    </div>

                    {/* Email & Phone Number */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                          {t('checkout.email')}*
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:outline-none text-sm transition-all"
                          placeholder="divyansh@webyansh.com"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                          {t('checkout.phone')}*
                        </label>
                        <div className="flex rounded-xl border border-input overflow-hidden focus-within:ring-2 focus-within:ring-primary">
                          <select
                            value={countryCode}
                            onChange={(e) => setCountryCode(e.target.value)}
                            className="bg-muted border-r rtl:border-r-0 rtl:border-l border-border px-3 py-2.5 text-xs font-medium text-foreground focus:outline-none cursor-pointer"
                          >
                            <option value="EGY">EGY ∨</option>
                            <option value="IND">IND ∨</option>
                            <option value="USA">USA ∨</option>
                            <option value="UAE">UAE ∨</option>
                          </select>
                          <input
                            type="text"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full px-3 py-2.5 bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none"
                            placeholder="+20 01000000000"
                          />
                        </div>
                      </div>
                    </div>

                    {/* City, State, Zip Code */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                          {t('checkout.city')}*
                        </label>
                        <input
                          type="text"
                          required
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:outline-none text-sm transition-all"
                          placeholder="Cairo"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                          {t('checkout.state')}*
                        </label>
                        <input
                          type="text"
                          required
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:outline-none text-sm transition-all"
                          placeholder="Cairo"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                          {t('checkout.zip_code')}*
                        </label>
                        <input
                          type="text"
                          required
                          value={zipCode}
                          onChange={(e) => setZipCode(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:outline-none text-sm transition-all"
                          placeholder="11511"
                        />
                      </div>
                    </div>

                    {/* Description / Instructions */}
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                        {t('checkout.description')}
                      </label>
                      <textarea
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder={t('checkout.enter_description')}
                        className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:outline-none text-sm transition-all resize-none"
                      />
                    </div>
                  </form>
                </div>

                {/* Shipping Method Section */}
                <div className="pt-4 border-t border-border">
                  <h3 className="text-lg font-bold text-foreground mb-4">
                    {t('checkout.shipping_method')}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Free Shipping Option */}
                    <div
                      onClick={() => setShippingMethod('free')}
                      className={`cursor-pointer rounded-2xl p-4 border transition-all flex items-center justify-between ${
                        shippingMethod === 'free'
                          ? 'border-primary bg-primary/10 dark:bg-primary/20 shadow-sm'
                          : 'border-border bg-card hover:border-muted-foreground/30'
                      }`}
                    >
                      <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          shippingMethod === 'free' ? 'border-primary bg-primary' : 'border-muted-foreground/40 bg-transparent'
                        }`}>
                          {shippingMethod === 'free' && (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{t('checkout.free_shipping')}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{t('checkout.free_days')}</p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-foreground">$0</span>
                    </div>

                    {/* Express Shipping Option */}
                    <div
                      onClick={() => setShippingMethod('express')}
                      className={`cursor-pointer rounded-2xl p-4 border transition-all flex items-center justify-between ${
                        shippingMethod === 'express'
                          ? 'border-primary bg-primary/10 dark:bg-primary/20 shadow-sm'
                          : 'border-border bg-card hover:border-muted-foreground/30'
                      }`}
                    >
                      <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          shippingMethod === 'express' ? 'border-primary bg-primary' : 'border-muted-foreground/40 bg-transparent'
                        }`}>
                          {shippingMethod === 'express' && (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{t('checkout.express_shipping')}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{t('checkout.express_days')}</p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-foreground">$9</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 'payment' && (
              <div className="bg-card text-card-foreground rounded-2xl p-6 sm:p-8 shadow-sm border border-border space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <h2 className="text-2xl font-bold tracking-tight text-foreground">
                    {t('checkout.payment_method')}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setStep('shipping')}
                    className="text-xs text-primary font-semibold hover:underline"
                  >
                    {t('checkout.edit_shipping')}
                  </button>
                </div>

                <form onSubmit={handleCompleteOrder} className="space-y-6">
                  {/* Payment Selection Options */}
                  <div className="space-y-3">
                    <div
                      onClick={() => setPaymentMethod('card')}
                      className={`cursor-pointer rounded-xl p-4 border flex items-center justify-between ${
                        paymentMethod === 'card'
                          ? 'border-primary bg-primary/10 dark:bg-primary/20 shadow-sm'
                          : 'border-border bg-card hover:border-muted-foreground/30'
                      }`}
                    >
                      <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        <CreditCard className="w-5 h-5 text-muted-foreground" />
                        <span className="text-sm font-semibold text-foreground">{t('checkout.card_option')}</span>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${paymentMethod === 'card' ? 'border-primary bg-primary' : 'border-muted-foreground/40 bg-transparent'}`}>
                        {paymentMethod === 'card' && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                    </div>

                    <div
                      onClick={() => setPaymentMethod('cod')}
                      className={`cursor-pointer rounded-xl p-4 border flex items-center justify-between ${
                        paymentMethod === 'cod'
                          ? 'border-primary bg-primary/10 dark:bg-primary/20 shadow-sm'
                          : 'border-border bg-card hover:border-muted-foreground/30'
                      }`}
                    >
                      <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        <ShieldCheck className="w-5 h-5 text-muted-foreground" />
                        <span className="text-sm font-semibold text-foreground">{t('checkout.cod_option')}</span>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${paymentMethod === 'cod' ? 'border-primary bg-primary' : 'border-muted-foreground/40 bg-transparent'}`}>
                        {paymentMethod === 'cod' && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                    </div>
                  </div>

                  {paymentMethod === 'card' && (
                    <div className="space-y-4 pt-2">
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                          {t('checkout.card_number')}
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="4532 •••• •••• 8892"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:outline-none text-sm transition-all"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                            {t('checkout.expiry_date')}
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="MM/YY"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:outline-none text-sm transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                            {t('checkout.cvc')}
                          </label>
                          <input
                            type="password"
                            required
                            maxLength={4}
                            placeholder="123"
                            value={cardCvc}
                            onChange={(e) => setCardCvc(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:outline-none text-sm transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl shadow-md hover:opacity-90 transition-all text-center text-sm"
                  >
                    {t('checkout.place_order')} (${total.toFixed(2)})
                  </button>
                </form>
              </div>
            )}

            {step === 'confirmation' && (
              <div className="bg-card text-card-foreground rounded-2xl p-8 shadow-sm border border-border text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">
                  {t('checkout.order_confirmed')}
                </h2>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  {t('checkout.thank_you', { name: firstName || 'Valued Customer' })}
                </p>
                <div className="pt-4">
                  <Link
                    to="/products"
                    className="inline-block px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl text-sm transition-all"
                  >
                    {t('checkout.continue_shopping')}
                  </Link>
                </div>
              </div>
            )}

          </div>

          {/* Right Sidebar: Your Cart Summary */}
          <div className="lg:col-span-5">
            <div className="bg-card text-card-foreground rounded-2xl p-6 shadow-sm border border-border sticky top-6 space-y-6">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                {t('checkout.your_cart')}
              </h2>

              {/* Cart Items List */}
              <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1 rtl:pr-0 rtl:pl-1">
                {displayItems.map((item, idx) => (
                  <div key={item.product.id || idx} className="flex items-center justify-between space-x-4 rtl:space-x-reverse">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-0 right-0 rtl:right-auto rtl:left-0 bg-primary text-primary-foreground text-[10px] font-bold w-4 h-4 rounded-bl-lg rtl:rounded-bl-none rtl:rounded-br-lg flex items-center justify-center">
                          {item.quantity}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-foreground line-clamp-1">
                          {item.product.name}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {item.product.category}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-foreground">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Discount Code Input */}
              <form onSubmit={handleApplyDiscount} className="flex space-x-2 rtl:space-x-reverse">
                <div className="relative flex-grow">
                  <Tag className="w-4 h-4 absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder={t('checkout.discount_code')}
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    className="w-full pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-2.5 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold rounded-xl transition-all"
                >
                  {t('checkout.apply')}
                </button>
              </form>

              {/* Price Calculation Breakdown */}
              <div className="space-y-2.5 text-sm pt-2 border-t border-border">
                <div className="flex justify-between text-muted-foreground">
                  <span>{t('checkout.subtotal')}</span>
                  <span className="font-semibold text-foreground">${subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-muted-foreground">
                  <span>{t('checkout.shipping_label')}</span>
                  <span className="font-semibold text-foreground">
                    {shippingCost === 0 ? '$0' : `$${shippingCost.toFixed(2)}`}
                  </span>
                </div>

                <div className="flex justify-between text-muted-foreground items-center">
                  <div className="flex items-center space-x-1 rtl:space-x-reverse">
                    <span>{t('checkout.estimated_taxes')}</span>
                    <HelpCircle className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <span className="font-semibold text-foreground">${estimatedTaxes.toFixed(2)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                    <span>{t('checkout.discount')}</span>
                    <span className="font-semibold">-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* Total Price */}
              <div className="flex justify-between items-baseline pt-4 border-t border-border">
                <span className="text-base font-bold text-foreground">{t('checkout.total')}</span>
                <span className="text-xl font-extrabold text-foreground">
                  ${total.toFixed(2)}
                </span>
              </div>

              {/* Primary Action Button */}
              {step === 'shipping' ? (
                <button
                  type="button"
                  onClick={handleProceedToPayment}
                  className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl shadow-md hover:opacity-90 transition-all text-sm text-center"
                >
                  {t('checkout.continue_to_payment')}
                </button>
              ) : step === 'payment' ? (
                <p className="text-xs text-center text-muted-foreground">
                  {t('checkout.complete_details')}
                </p>
              ) : null}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
