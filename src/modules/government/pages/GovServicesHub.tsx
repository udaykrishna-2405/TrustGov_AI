import React, { useState } from 'react';
import { Plane, Car, FileText, Landmark, Map, ShieldPlus, Lightbulb, HeartPulse, GraduationCap, Building, FileSignature, Receipt, Sprout, Subscript as Subway, ShieldAlert, Vote, HandCoins } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BlockchainVerificationOverlay } from '../components/BlockchainVerificationOverlay';

const activePortals = [
  { id: 'tax', name: 'Income Tax', description: 'File e-Returns, Link Aadhaar, Check Refund', icon: FileText, url: 'http://localhost:3001', color: 'bg-green-500' },
  { id: 'passport', name: 'Passport Seva', description: 'Apply, Renew, Track Application', icon: Plane, url: 'http://localhost:3012', color: 'bg-blue-600' },
  { id: 'parivahan', name: 'Parivahan', description: 'Driving Licence, Vehicle Registration', icon: Car, url: 'http://localhost:3013', color: 'bg-orange-500' },
];

const upcomingPortals = [
  { id: 'prop_tax', name: 'Property Tax', description: 'Pay Municipal Tax, Download Receipt', icon: Receipt },
  { id: 'health', name: 'Ayushman Bharat', description: 'Health Cards, Hospital Search', icon: HeartPulse },
  { id: 'edu', name: 'DigiLocker Education', description: 'Mark Sheets, Certificates', icon: GraduationCap },
  { id: 'land', name: 'Bhulekh Land Records', description: 'Verify Land Registry Documents', icon: Map },
  { id: 'police', name: 'Police Verification', description: 'PCC, FIR Copy, Tenant Verification', icon: ShieldAlert },
  { id: 'elec', name: 'Electricity Board', description: 'Bill Payment, New Connection', icon: Lightbulb },
  { id: 'water', name: 'Jal Board', description: 'Water Bill, Tanker Booking', icon: Sprout },
  { id: 'mcd', name: 'Birth & Death Certs', description: 'Municipal Corporation Services', icon: FileSignature },
  { id: 'pension', name: 'Jeevan Pramaan', description: 'Digital Life Certificate', icon: HandCoins },
  { id: 'voter', name: 'NVSP Voter ID', description: 'Apply, Shift, Download EPIC', icon: Vote },
  { id: 'rail', name: 'IRCTC Booking', description: 'Train Tickets, PNR Status', icon: Subway },
];

export function GovServicesHub() {
  const [verifyingPortal, setVerifyingPortal] = useState<{name: string, url: string} | null>(null);

  const handlePortalClick = (portal: {name: string, url: string}, e: React.MouseEvent) => {
    e.preventDefault();
    setVerifyingPortal(portal);
  };

  const handleVerificationComplete = () => {
    if (verifyingPortal) {
      window.open(verifyingPortal.url, '_blank');
      setVerifyingPortal(null);
    }
  };

  return (
    <>
      <AnimatePresence>
        {verifyingPortal && (
          <BlockchainVerificationOverlay 
            portalName={verifyingPortal.name} 
            portalUrl={verifyingPortal.url}
            onComplete={handleVerificationComplete} 
          />
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto space-y-10">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Public Services Hub</h2>
          <p className="text-slate-500 text-lg">Access integrated digital services securely verified by TrustOS.</p>
        </div>

        <section>
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Landmark className="w-5 h-5 text-blue-600" />
            Active Integrated Portals
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activePortals.map((portal) => (
              <motion.a
                key={portal.id}
                href={portal.url}
                onClick={(e) => handlePortalClick(portal, e)}
                whileHover={{ y: -5, scale: 1.02 }}
                className="group block bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all overflow-hidden cursor-pointer"
              >
                <div className="p-6">
                  <div className={`w-14 h-14 rounded-xl ${portal.color} flex items-center justify-center mb-6 shadow-lg text-white group-hover:scale-110 transition-transform duration-300`}>
                    <portal.icon className="w-7 h-7" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">{portal.name}</h4>
                  <p className="text-sm text-slate-500 font-medium">{portal.description}</p>
                </div>
                <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <ShieldPlus className="w-4 h-4" /> Secure Portal
                  </span>
                  <span className="text-sm font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
                    Access &rarr;
                  </span>
                </div>
              </motion.a>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-lg font-bold text-slate-700 mb-6 flex items-center gap-2 pt-6 border-t border-slate-200">
            <Building className="w-5 h-5 text-slate-400" />
            Upcoming Integrations
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {upcomingPortals.map((portal) => (
              <div
                key={portal.id}
                className="bg-white rounded-xl border border-slate-200 p-5 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-not-allowed"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                    <portal.icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm leading-tight">{portal.name}</h4>
                </div>
                <p className="text-xs text-slate-500">{portal.description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
