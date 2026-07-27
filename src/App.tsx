import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Order, OrderItem, PageType } from './types';
import { SAMPLE_ORDERS } from './data/initialData';
import { Navbar } from './components/Navbar';
import { PageHeader } from './components/PageHeader';
import { Hero } from './components/Hero';
import { ServicesSection } from './components/ServicesSection';
import { PriceCalculator } from './components/PriceCalculator';
import { OrderTracker } from './components/OrderTracker';
import TrackOrder from './components/TrackOrder';
import { BookingModal } from './components/BookingModal';
import { GoldPassMemberships } from './components/GoldPassMemberships';
import { BranchesSection } from './components/BranchesSection';
import { GarmentCareFAQ } from './components/GarmentCareFAQ';
import { Testimonials } from './components/Testimonials';
import { Footer } from './components/Footer';
import { Toast, ToastMessage } from './components/Toast';
import { 
  Truck, Shirt, Calculator, Search, Crown, MapPin, HelpCircle, 
  ArrowRight, Sparkles, LayoutGrid, CheckCircle2 
} from 'lucide-react';
import { supabase } from './lib/supabase';
import { getOrders, mapDbOrderToOrder } from './lib/orders';

const pathToPage = (pathname: string): PageType => {
  const normalized = pathname.replace(/\/+$|\/$/, '') || '/';
  const map: Record<string, PageType> = {
    '/': 'home',
    '/home': 'home',
    '/services': 'services',
    '/calculator': 'calculator',
    '/track': 'track',
    '/memberships': 'memberships',
    '/branches': 'branches',
    '/locations': 'branches',
    '/faq': 'faq',
    '/all': 'all',
  };
  return map[normalized.toLowerCase()] || 'home';
};

const pageToPath = (page: PageType) => {
  const map: Record<PageType, string> = {
    home: '/',
    services: '/services',
    calculator: '/calculator',
    track: '/track',
    memberships: '/memberships',
    branches: '/branches',
    faq: '/faq',
    all: '/all',
  };
  return map[page];
};


export default function App() {
  // Page Routing State
  const [activePage, setActivePage] = useState<PageType>(pathToPage(window.location.pathname));

  // Saved Orders in LocalStorage
 const [orders, setOrders] = useState<Order[]>(SAMPLE_ORDERS);

  const loadOrders = useCallback(async () => {
    try {
      const data = await getOrders();
      setOrders(data.map((row) => mapDbOrderToOrder(row)));
    } catch (error) {
      console.error('Supabase Load Error:', error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('goldtribe_orders', JSON.stringify(orders));
    } catch (e) {
      console.error('Error saving orders', e);
    }
  }, [orders]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    const channel = supabase
      .channel('orders-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'Orders' },
        () => {
          loadOrders();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [loadOrders]);

  // Booking Modal state
  const [bookingOpen, setBookingOpen] = useState(false);
  const [preselectedService, setPreselectedService] = useState<string | undefined>();
  const [prefilledItems, setPrefilledItems] = useState<OrderItem[] | undefined>();
  const [prefilledTotal, setPrefilledTotal] = useState<number | undefined>();

  // Toast State
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Active Order Search Target for tracking
  const [activeTrackingId, setActiveTrackingId] = useState<string>('GL-1234');

  const updateOrderStatus = useCallback(async (orderId: string, newStatus: Order['status']) => {
    try {
      const { error } = await supabase
        .from('Orders')
        .update({ status: newStatus })
        .eq('tracking_id', orderId);
      if (error) throw error;
      await loadOrders();
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  }, [loadOrders]);

  const showToast = (title: string, message?: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ id: `${Date.now()}`, title, message, type });
  };

  const handleSelectPage = (page: PageType) => {
    setActivePage(page);
    window.history.pushState({ page }, '', pageToPath(page));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenBooking = (serviceName?: string) => {
    setPreselectedService(serviceName);
    setPrefilledItems(undefined);
    setPrefilledTotal(undefined);
    setBookingOpen(true);
  };

  const handleProceedWithQuote = (items: OrderItem[], total: number) => {
    setPrefilledItems(items);
    setPrefilledTotal(total);
    setPreselectedService(undefined);
    setBookingOpen(true);
  };

  const handleOrderCreated = async (newOrder: Order) => {
  await loadOrders();

  setBookingOpen(false);
  setActiveTrackingId(newOrder.id);

  showToast(
    'Order Booked Successfully!',
    `Order #${newOrder.id} generated! Goldtribe rider scheduled for ${newOrder.address}.`
  );

  setTimeout(() => {
    handleSelectPage('track');
  }, 400);
};

  const handleNavigateToSection = (sectionId: string) => {
    const pageMap: Record<string, PageType> = {
      hero: 'home',
      home: 'home',
      services: 'services',
      calculator: 'calculator',
      track: 'track',
      memberships: 'memberships',
      locations: 'branches',
      branches: 'branches',
      faq: 'faq',
      all: 'all',
    };
    handleSelectPage(pageMap[sectionId] || 'home');
  };

  useEffect(() => {
    const initialPage = pathToPage(window.location.pathname);
    window.history.replaceState({ page: initialPage }, '', window.location.pathname);

    const onPopState = (event: PopStateEvent) => {
      const page = event.state?.page || pathToPage(window.location.pathname);
      setActivePage(page);
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  return (
    <div className="min-h-screen bg-[#fcf9f8] text-[#1c1b1b] font-worksans selection:bg-[#fed65b] selection:text-[#745c00] relative">
      {/* Navbar */}
      <Navbar
        onOpenBooking={() => handleOpenBooking()}
        onNavigateToSection={handleNavigateToSection}
        activeOrdersCount={orders.length}
        orders={orders}
        onSelectOrderToTrack={(orderId) => {
          setActiveTrackingId(orderId);
          handleSelectPage('track');
        }}
        activePage={activePage}
        onSelectPage={handleSelectPage}
      />

      {/* Dynamic Multi-Page Screen Views */}
      <main className="min-h-[80vh] pt-16 sm:pt-20">
        <AnimatePresence mode="wait">
          {activePage === 'home' && (
            <motion.div
              key="page-home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="space-y-12 pb-16"
            >
              {/* Hero Banner */}
              <Hero
                onOpenBooking={() => handleOpenBooking()}
                onNavigateToTrack={() => handleSelectPage('track')}
                onNavigateToCalculator={() => handleSelectPage('calculator')}
              />

              {/* Interactive Quick Hub Section */}
              <section className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="bg-gradient-to-br from-[#4A3078] via-[#5B3F8C] to-[#39225E] rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-[#D8A620]/30 space-y-6 relative overflow-hidden">
                  {/* Subtle Background Glows */}
                  <div className="absolute top-0 right-0 w-80 h-80 bg-[#D8A620]/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#D8A620] text-[#2F2F2F] text-[11px] font-black font-manrope uppercase tracking-wider shadow-xs">
                        <Sparkles className="w-3.5 h-3.5 text-[#2F2F2F]" />
                        <span>Goldtribe Quick Hub</span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-extrabold font-manrope text-white tracking-tight">
                        Instant Navigation Hub
                      </h2>
                      <p className="text-xs sm:text-sm text-white/80 font-worksans">
                        Select a dedicated screen to jump directly to specialized services, estimator, or live tracking
                      </p>
                    </div>

                    <button
                      onClick={() => handleSelectPage('all')}
                      className="px-4 py-2 rounded-full bg-white/10 hover:bg-[#D8A620] hover:text-[#2F2F2F] text-[#D8A620] text-xs font-bold font-manrope transition-all border border-[#D8A620]/30 flex items-center gap-2 self-start md:self-auto cursor-pointer shadow-xs"
                    >
                      <LayoutGrid className="w-4 h-4" />
                      <span>Switch to Full Continuous View</span>
                    </button>
                  </div>

                  {/* Eye-Catching Screen Cards Grid */}
                  <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      {
                        page: 'services',
                        title: 'Garment Services',
                        desc: 'Wash, Dry Clean & Duvets',
                        icon: Shirt,
                        badge: '7 Categories',
                        accent: 'from-purple-500 to-indigo-600',
                      },
                      {
                        page: 'calculator',
                        title: 'Price Estimator',
                        desc: 'Instant Ksh Quote Calculator',
                        icon: Calculator,
                        badge: 'Live Calculator',
                        accent: 'from-amber-500 to-yellow-600',
                      },
                      {
                        page: 'track',
                        title: 'Order Tracker',
                        desc: 'Real-Time Status & Receipts',
                        icon: Search,
                        badge: `${orders.length} Orders Saved`,
                        accent: 'from-emerald-500 to-teal-600',
                      },
                      {
                        page: 'memberships',
                        title: 'VIP Gold Pass',
                        desc: 'Monthly Subscription Savings',
                        icon: Crown,
                        badge: 'VIP Passes',
                        accent: 'from-yellow-500 to-amber-600',
                      },
                      {
                        page: 'branches',
                        title: 'Branch Hubs',
                        desc: 'Rongai & Ngong Locations',
                        icon: MapPin,
                        badge: 'Rongai & Ngong',
                        accent: 'from-blue-500 to-indigo-600',
                      },
                      {
                        page: 'faq',
                        title: 'FAQ & Care Guide',
                        desc: 'Garment Care & Reviews',
                        icon: HelpCircle,
                        badge: 'Care Guide',
                        accent: 'from-teal-500 to-emerald-600',
                      },
                    ].map((card) => {
                      const IconComp = card.icon;
                      return (
                        <div
                          key={card.page}
                          onClick={() => handleSelectPage(card.page as PageType)}
                          className="bg-white/10 hover:bg-white/20 border border-white/15 hover:border-[#D8A620] rounded-2xl p-4 transition-all duration-200 cursor-pointer flex items-center justify-between group shadow-sm hover:shadow-lg hover:-translate-y-0.5"
                        >
                          <div className="flex items-center gap-3.5">
                            <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${card.accent} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform`}>
                              <IconComp className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-sm font-bold font-manrope text-white group-hover:text-[#D8A620] transition-colors">
                                  {card.title}
                                </h3>
                                <span className="text-[9px] font-extrabold px-2 py-0.2 rounded-full bg-[#D8A620] text-[#2F2F2F] uppercase font-manrope">
                                  {card.badge}
                                </span>
                              </div>
                              <p className="text-xs text-white/70 font-worksans mt-0.5">
                                {card.desc}
                              </p>
                            </div>
                          </div>

                          <div className="w-8 h-8 rounded-full bg-white/10 group-hover:bg-[#D8A620] group-hover:text-[#2F2F2F] text-white flex items-center justify-center transition-all shrink-0">
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* Featured Services Preview */}
              <ServicesSection
                onSelectServiceForBooking={(name) => handleOpenBooking(name)}
                onOpenBooking={() => handleOpenBooking()}
              />

              {/* Branch Hub Preview */}
              <BranchesSection
                onOpenBooking={() => handleOpenBooking()}
              />
            </motion.div>
          )}

          {activePage === 'services' && (
            <motion.div
              key="page-services"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="space-y-8 pb-16"
            >
              <PageHeader
                title="Garment Care Services & Rates"
                subtitle="Explore complete washing, dry cleaning, duvet revitalizing, carpet washing & janitorial services for Rongai & Ngong"
                icon={Shirt}
                badge="Goldtribe Garment Care"
                onBackToHome={() => handleSelectPage('home')}
                onOpenBooking={() => handleOpenBooking()}
                activePage={activePage}
                onSelectPage={handleSelectPage}
              />
              <ServicesSection
                onSelectServiceForBooking={(name) => handleOpenBooking(name)}
                onOpenBooking={() => handleOpenBooking()}
              />
            </motion.div>
          )}

          {activePage === 'calculator' && (
            <motion.div
              key="page-calculator"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="space-y-8 pb-16"
            >
              <PageHeader
                title="Instant Price Quote Estimator"
                subtitle="Select your clothes, duvets, suits or carpets to calculate exact Ksh pricing with transparent rates"
                icon={Calculator}
                badge="Rate Calculator"
                onBackToHome={() => handleSelectPage('home')}
                onOpenBooking={() => handleOpenBooking()}
                activePage={activePage}
                onSelectPage={handleSelectPage}
              />
              <PriceCalculator
                onProceedToBookingWithItems={handleProceedWithQuote}
              />
            </motion.div>
          )}

          {activePage === 'track' && (
            <motion.div
              key="page-track"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="space-y-8 pb-16"
            >
              <PageHeader
                title="Live Garment Order Tracker"
                subtitle="Track real-time washing status steps, view customer order history & generate official digital receipts"
                icon={Search}
                badge="Live Status & History"
                onBackToHome={() => handleSelectPage('home')}
                onOpenBooking={() => handleOpenBooking()}
                activePage={activePage}
                onSelectPage={handleSelectPage}
              />
              <TrackOrder initialTrackingId={activeTrackingId} orders={orders} />
            </motion.div>
          )}

          {activePage === 'memberships' && (
            <motion.div
              key="page-memberships"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="space-y-8 pb-16"
            >
              <PageHeader
                title="Gold Pass VIP Subscriptions"
                subtitle="Monthly laundry passes tailored for individuals, families, and high-frequency washing in Rongai & Ngong"
                icon={Crown}
                badge="VIP Laundry Passes"
                onBackToHome={() => handleSelectPage('home')}
                onOpenBooking={() => handleOpenBooking()}
                activePage={activePage}
                onSelectPage={handleSelectPage}
              />
              <GoldPassMemberships
                onShowToast={showToast}
              />
            </motion.div>
          )}

          {activePage === 'branches' && (
            <motion.div
              key="page-branches"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="space-y-8 pb-16"
            >
              <PageHeader
                title="Operating Branches & Service Hubs"
                subtitle="Rongai (Magadi Rd) & Ngong (Country Arcade) - Visit us or request doorstep rider pickup"
                icon={MapPin}
                badge="Rongai & Ngong Branches"
                onBackToHome={() => handleSelectPage('home')}
                onOpenBooking={() => handleOpenBooking()}
                activePage={activePage}
                onSelectPage={handleSelectPage}
              />
              <BranchesSection
                onOpenBooking={() => handleOpenBooking()}
              />
            </motion.div>
          )}

          {activePage === 'faq' && (
            <motion.div
              key="page-faq"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="space-y-8 pb-16"
            >
              <PageHeader
                title="Garment Care Guide & Customer Reviews"
                subtitle="Answers to common washing questions, fabric care advice, and verified customer testimonials"
                icon={HelpCircle}
                badge="Care Guide & FAQ"
                onBackToHome={() => handleSelectPage('home')}
                onOpenBooking={() => handleOpenBooking()}
                activePage={activePage}
                onSelectPage={handleSelectPage}
              />
              <Testimonials
                onShowToast={showToast}
              />
              <GarmentCareFAQ />
            </motion.div>
          )}

          {activePage === 'all' && (
            <motion.div
              key="page-all"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="space-y-0"
            >
              <Hero
                onOpenBooking={() => handleOpenBooking()}
                onNavigateToTrack={() => handleNavigateToSection('track')}
                onNavigateToCalculator={() => handleNavigateToSection('calculator')}
              />
              <ServicesSection
                onSelectServiceForBooking={(name) => handleOpenBooking(name)}
                onOpenBooking={() => handleOpenBooking()}
              />
              <PriceCalculator
                onProceedToBookingWithItems={handleProceedWithQuote}
              />
              <OrderTracker
                orders={orders}
                initialSearchId={activeTrackingId}
                onRefreshOrders={loadOrders}
                onUpdateOrderStatus={updateOrderStatus}
              />
              <GoldPassMemberships
                onShowToast={showToast}
              />
              <BranchesSection
                onOpenBooking={() => handleOpenBooking()}
              />
              <Testimonials
                onShowToast={showToast}
              />
              <GarmentCareFAQ />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <Footer
        onOpenBooking={() => handleOpenBooking()}
        onNavigateToSection={handleNavigateToSection}
      />

      {/* Floating Mobile Action Button (FAB) */}
      <button
        onClick={() => handleOpenBooking()}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-[#fed65b] text-[#341168] rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all md:hidden border-2 border-[#341168]"
        title="Book Collection"
      >
        <Truck className="w-6 h-6" />
      </button>

      
      <BookingModal
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
        preselectedServiceName={preselectedService}
        prefilledItems={prefilledItems}
        prefilledTotal={prefilledTotal}
        onOrderCreated={handleOrderCreated}
      />

      {/* Toast Notification */}
      <Toast
        toast={toast}
        onClose={() => setToast(null)}
      />
    </div>
  );
}

