import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-gray-50 text-gray-800 antialiased">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <svg
                className="h-8 w-8 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <span className="text-xl font-bold text-gray-800">
                HMS<span className="text-indigo-600">.</span>
              </span>
            </div>
            <div className="hidden space-x-8 text-sm font-medium md:flex">
              <button
                onClick={() => scrollToSection('features')}
                className="text-gray-700 transition hover:text-indigo-600"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('tech')}
                className="text-gray-700 transition hover:text-indigo-600"
              >
                Technology
              </button>
              <button
                onClick={() => scrollToSection('testimonials')}
                className="text-gray-700 transition hover:text-indigo-600"
              >
                Testimonials
              </button>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="text-sm font-medium text-indigo-600 transition hover:text-indigo-800"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => navigate('/rooms')}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-md transition hover:bg-indigo-700"
                  >
                    Room Management
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/login')}
                    className="text-sm font-medium text-indigo-600 transition hover:text-indigo-800"
                  >
                    Sign in
                  </button>
                  <button
                    onClick={() => navigate('/signup')}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-md transition hover:bg-indigo-700"
                  >
                    Get started
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pb-28 pt-20 sm:px-6 lg:px-8">
        {/* Animated Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50 opacity-70"></div>
          <div className="absolute left-0 top-0 h-80 w-80 animate-pulse rounded-full bg-purple-300 opacity-20 mix-blend-multiply blur-3xl filter"></div>
          <div className="absolute bottom-0 right-0 h-80 w-80 animate-pulse rounded-full bg-indigo-300 opacity-20 mix-blend-multiply blur-3xl filter"></div>
        </div>

        <div className="relative z-10 mx-auto max-w-7xl lg:flex lg:items-center lg:justify-between">
          <div
            className={`space-y-8 lg:w-1/2 ${
              mounted ? 'animate-fadeIn' : 'opacity-0'
            }`}
          >
            <h1 className="text-5xl font-extrabold tracking-tight md:text-6xl">
              <span className="bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent">
                Modern hotel management,
              </span>
              <br />
              <span className="text-gray-900">reimagined for the cloud.</span>
            </h1>
            <p className="mx-auto max-w-2xl text-xl text-gray-600 lg:mx-0">
              Streamline reservations, rooms, and billing with our real-time, secure
              platform. Built with React, Supabase, and TypeScript — ready for tomorrow's
              hospitality.
            </p>
            <div className="flex flex-wrap justify-center gap-4 lg:justify-start">
              <button
                onClick={() => (user ? navigate('/rooms') : navigate('/signup'))}
                className="group relative rounded-xl bg-indigo-600 px-8 py-4 text-lg font-semibold text-white shadow-xl transition-all duration-300 hover:bg-indigo-700 hover:shadow-2xl hover:scale-105 active:scale-95"
              >
                <span className="relative z-10">
                  {user ? 'Go to Rooms' : 'Start free trial'}
                </span>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-400 to-purple-600 opacity-0 transition-opacity duration-300 group-hover:opacity-20"></div>
              </button>
              <button
                onClick={() => scrollToSection('features')}
                className="group rounded-xl border-2 border-indigo-200 bg-white px-8 py-4 text-lg font-semibold text-indigo-600 shadow-lg transition-all duration-300 hover:bg-indigo-50 hover:border-indigo-300 hover:scale-105 active:scale-95"
              >
                Learn more 
                <svg className="inline-block ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>
            <p className="flex items-center justify-center gap-2 text-sm text-gray-500 lg:justify-start">
              <svg
                className="h-5 w-5 text-indigo-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              No credit card required · Free 14-day trial
            </p>
          </div>

          <div
            className={`mt-16 lg:mt-0 lg:w-1/2 ${
              mounted ? 'animate-fadeIn' : 'opacity-0'
            }`}
            style={{ animationDelay: '0.2s' }}
          >
            <div className="relative mx-auto max-w-md">
              <div className="absolute inset-0 scale-105 transform rounded-3xl bg-gradient-to-r from-indigo-400 to-purple-400 opacity-30 blur-xl"></div>
              <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
                <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-8 text-white">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="h-3 w-3 rounded-full bg-red-400"></div>
                      <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
                      <div className="h-3 w-3 rounded-full bg-green-400"></div>
                    </div>
                  </div>
                  <h3 className="mb-2 text-2xl font-bold">Dashboard Overview</h3>
                  <p className="text-indigo-100">Real-time room management</p>
                </div>
                <div className="space-y-3 p-6">
                  <div className="flex items-center justify-between rounded-lg bg-green-50 p-3">
                    <span className="text-sm font-medium">Available Rooms</span>
                    <span className="text-lg font-bold text-green-600">24</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-red-50 p-3">
                    <span className="text-sm font-medium">Occupied</span>
                    <span className="text-lg font-bold text-red-600">18</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-blue-50 p-3">
                    <span className="text-sm font-medium">Occupancy Rate</span>
                    <span className="text-lg font-bold text-blue-600">75%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats / Social Proof Section */}
      <section className="bg-white py-16 border-t border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
            <div className="space-y-2">
              <div className="text-4xl font-bold  text-indigo-600">5K+</div>
              <div className="text-sm font-medium text-gray-600">Rooms Managed</div>
              <div className="text-xs text-gray-500">Across all properties</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-indigo-600">99.9%</div>
              <div className="text-sm font-medium text-gray-600">Uptime</div>
              <div className="text-xs text-gray-500">Last 12 months</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-indigo-600">24/7</div>
              <div className="text-sm font-medium text-gray-600">Support</div>
              <div className="text-xs text-gray-500">Always available</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-indigo-600">4.9/5</div>
              <div className="text-sm font-medium text-gray-600">User Rating</div>
              <div className="text-xs text-gray-500">From 200+ reviews</div>
            </div>
          </div>
          
          {/* Trust Badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-gray-400">
            <div className="flex items-center space-x-2">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">SSL Secured</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">GDPR Compliant</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
              </svg>
              <span className="text-sm font-medium">Video Tutorials</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
              <span className="text-sm font-medium">Dedicated Support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="text-4xl font-bold text-gray-900">
              Everything you need to run your hotel
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-xl text-gray-600">
              From check-in to checkout, from reservations to reports — all in one beautiful
              interface.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon="🚪"
              title="Real-time room status"
              description="Live updates with Supabase Realtime. Color-coded availability, instant synchronization."
            />
            <FeatureCard
              icon="🔒"
              title="Secure authentication"
              description="Powered by Supabase Auth. Enterprise-grade security and role-based access for staff."
            />
            <FeatureCard
              icon="💳"
              title="Automated billing"
              description="Generate invoices, split payments, track outstanding balances with one click."
            />
            <FeatureCard
              icon="📅"
              title="Smart reservations"
              description="Prevent double bookings, waitlist management, availability calendar with dynamic pricing."
            />
            <FeatureCard
              icon="📊"
              title="Analytics dashboard"
              description="Real-time KPIs: occupancy, ADR, RevPAR. Export reports to PDF or CSV."
            />
            <FeatureCard
              icon="👥"
              title="Guest profiles"
              description="Store preferences, stay history, ID scans. Merge duplicate records."
            />
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section id="tech" className="bg-gray-50 py-24">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900">
            Built with a modern, scalable stack
          </h2>
          <p className="mx-auto mb-16 mt-4 max-w-3xl text-xl text-gray-600">
            We chose the best tools for developer experience, security, and performance.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-12 md:gap-16">
            <TechIcon
              icon={
                <svg className="h-16 w-16 text-[#61DBFB]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 10.11c1.03 0 1.87.84 1.87 1.89 0 1-.84 1.85-1.87 1.85S10.13 13 10.13 12c0-1.05.84-1.89 1.87-1.89M7.37 20c.63.38 2.01-.2 3.6-1.7-.52-.59-1.03-1.23-1.51-1.9a22.7 22.7 0 0 1-2.4-.36c-.51 2.14-.32 3.61.31 3.96m.71-5.74-.29-.51c-.11.29-.22.58-.29.86.27.06.57.11.88.16l-.3-.51m6.54-.76.81-1.5-.81-1.5c-.3-.53-.62-1-.91-1.47C13.17 9 12.6 9 12 9c-.6 0-1.17 0-1.71.03-.29.47-.61.94-.91 1.47L8.57 12l.81 1.5c.3.53.62 1 .91 1.47.54.03 1.11.03 1.71.03.6 0 1.17 0 1.71-.03.29-.47.61-.94.91-1.47M12 6.78c-.19.22-.39.45-.59.72h1.18c-.2-.27-.4-.5-.59-.72m0 10.44c.19-.22.39-.45.59-.72h-1.18c.2.27.4.5.59.72M16.62 4c-.62-.38-2 .2-3.59 1.7.52.59 1.03 1.23 1.51 1.9.82.08 1.63.2 2.4.36.51-2.14.32-3.61-.31-3.96m-.7 5.74.29.51c.11-.29.22-.58.29-.86-.27-.06-.57-.11-.88-.16l.3.51m1.45-7.05c1.47.84 1.63 3.05 1.01 5.63 2.54.75 4.37 1.99 4.37 3.68s-1.83 2.93-4.37 3.68c.62 2.58.46 4.79-1.01 5.63-1.46.84-3.45-.12-5.37-1.95-1.92 1.83-3.91 2.79-5.38 1.95-1.46-.84-1.62-3.05-1-5.63-2.54-.75-4.37-1.99-4.37-3.68s1.83-2.93 4.37-3.68c-.62-2.58-.46-4.79 1-5.63 1.47-.84 3.46.12 5.38 1.95 1.92-1.83 3.91-2.79 5.37-1.95M17.08 12c.34.75.64 1.5.89 2.26 2.1-.63 3.28-1.53 3.28-2.26s-1.18-1.63-3.28-2.26c-.25.76-.55 1.51-.89 2.26M6.92 12c-.34-.75-.64-1.5-.89-2.26-2.1.63-3.28 1.53-3.28 2.26s1.18 1.63 3.28 2.26c.25-.76.55-1.51.89-2.26m9 2.26-.3.51c.31-.05.61-.1.88-.16-.07-.28-.18-.57-.29-.86l-.29.51m-2.89 4.04c1.59 1.5 2.97 2.08 3.59 1.7.64-.35.82-1.82.32-3.96-.77.16-1.58.28-2.4.36-.48.67-.99 1.31-1.51 1.9M8.08 9.74l.3-.51c-.31.05-.61.1-.88.16.07.28.18.57.29.86l.29-.51m2.89-4.04C9.38 4.2 8 3.62 7.37 4c-.63.35-.82 1.82-.31 3.96a22.7 22.7 0 0 1 2.4-.36c.48-.67.99-1.31 1.51-1.9z"/>
                </svg>
              }
              label="React 18"
            />
            <TechIcon
              icon={
                <svg className="h-16 w-16 text-[#3178C6]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z"/>
                </svg>
              }
              label="TypeScript"
            />
            <TechIcon
              icon={
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-400 text-2xl font-bold text-white">
                  S
                </div>
              }
              label="Supabase"
            />
            <TechIcon
              icon={
                <svg className="h-16 w-16 text-[#06B6D4]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 14.976 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C7.666 17.818 9.027 19.2 12.001 19.2c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.337 13.382 8.976 12 6.001 12z"/>
                </svg>
              }
              label="Tailwind CSS"
            />
            <TechIcon
              icon={
                <svg className="h-16 w-16 text-purple-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2.149 0L.537 4.119v14.142h4.283V21.4h2.325l3.144-3.139h4.814L22.463 11V0H2.149zm1.535 1.535h17.243v8.84l-3.142 3.142h-4.814l-3.139 3.139v-3.139H3.684V1.535zM17.243 4.283v6.305h-1.535V4.283h1.535zm-4.814 0v6.305h-1.535V4.283H12.43z"/>
                </svg>
              }
              label="Live Demo"
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-4xl font-bold text-gray-900">
            Trusted by hoteliers like you
          </h2>
          <p className="mb-16 mt-4 text-center text-xl text-gray-600">
            See what early users say about HMS.
          </p>
          <div className="grid gap-8 md:grid-cols-3">
            <TestimonialCard
              rating={5}
              quote="Cut our check-in time by half. The real-time room grid is a game changer."
              name="Jane Doe"
              role="Sunset Boutique Hotel"
              avatar="JD"
              color="indigo"
            />
            <TestimonialCard
              rating={5}
              quote="Finally a system that feels modern. Our staff adapted in a day."
              name="Mike Smith"
              role="Harbor Inn"
              avatar="MS"
              color="purple"
            />
            <TestimonialCard
              rating={5}
              quote="The reporting alone saved us hours every week. Highly recommend."
              name="Alex Rivera"
              role="Mountain Peak Lodge"
              avatar="AR"
              color="pink"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-700 py-24 text-white">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold">Start your 14-day free trial</h2>
          <p className="mx-auto mt-4 max-w-2xl text-xl text-indigo-100">
            No credit card required. Full access to all features. Cancel anytime.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => (user ? navigate('/rooms') : navigate('/signup'))}
              className="group relative overflow-hidden rounded-xl bg-white px-8 py-4 text-lg font-semibold text-indigo-700 shadow-2xl transition-all duration-300 hover:bg-gray-100 hover:scale-105 active:scale-95"
            >
              <span className="relative z-10">Get started now</span>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-purple-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
            </button>
            <button
              onClick={() => navigate('/login')}
              className="rounded-xl border-2 border-white px-8 py-4 text-lg font-semibold text-white transition-all duration-300 hover:bg-white/10 hover:scale-105 active:scale-95"
            >
              {user ? 'Go to Dashboard' : 'Sign in'}
            </button>
          </div>
          <p className="mt-8 text-sm text-indigo-200">
            <svg
              className="mr-2 inline h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            Your data is encrypted and secure.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-16 text-gray-300">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 md:grid-cols-4 lg:px-8">
          <div>
            <div className="mb-4 flex items-center space-x-2 text-white">
              <svg
                className="h-8 w-8 text-indigo-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <span className="text-xl font-bold">
                HMS<span className="text-indigo-400">.</span>
              </span>
            </div>
            <p className="text-sm">
              Modern hotel management for the cloud era. Streamline operations, delight
              guests.
            </p>
          </div>
          <div>
            <h4 className="mb-4 font-semibold text-white">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => scrollToSection('features')}
                  className="hover:text-indigo-400"
                >
                  Features
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/rooms')} className="hover:text-indigo-400">
                  Room Management
                </button>
              </li>
              <li>
                <a href="#" className="hover:text-indigo-400">
                  Changelog
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-semibold text-white">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-indigo-400">
                  About
                </a>
              </li>
              <li>
                <a href="https://github.com" className="hover:text-indigo-400">
                  GitHub
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-indigo-400">
                  Contact
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-semibold text-white">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-indigo-400">
                  Privacy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-indigo-400">
                  Terms
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-indigo-400">
                  Security
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
          © 2026 HMS. All rights reserved. Built with{' '}
          <span className="text-red-500">♥</span> by Grace Kamami for modern hotels.
        </div>
      </footer>

      {/* Add animations CSS */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 1s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

// Feature Card Component
function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-8 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-2xl">
        {icon}
      </div>
      <h3 className="mb-2 text-xl font-semibold">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

// Tech Icon Component
function TechIcon({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="transition-all duration-300 hover:scale-110">
      {icon}
      <p className="mt-2 text-sm font-medium text-gray-600">{label}</p>
    </div>
  );
}

// Testimonial Card Component
function TestimonialCard({
  rating,
  quote,
  name,
  role,
  avatar,
  color,
}: {
  rating: number;
  quote: string;
  name: string;
  role: string;
  avatar: string;
  color: 'indigo' | 'purple' | 'pink';
}) {
  const colorClasses = {
    indigo: 'bg-indigo-200 text-indigo-700',
    purple: 'bg-purple-200 text-purple-700',
    pink: 'bg-pink-200 text-pink-700',
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-8 shadow-sm">
      <div className="mb-4 flex text-yellow-400">
        {Array.from({ length: rating }).map((_, i) => (
          <span key={i}>★</span>
        ))}
      </div>
      <p className="italic text-gray-700">"{quote}"</p>
      <div className="mt-6 flex items-center">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full font-bold ${colorClasses[color]}`}
        >
          {avatar}
        </div>
        <div className="ml-3">
          <p className="font-semibold">{name}</p>
          <p className="text-sm text-gray-500">{role}</p>
        </div>
      </div>
    </div>
  );
}
