import React from 'react';
import { motion } from 'motion/react';
import { Shield, Lock, Key, Eye, Activity, Database, CheckCircle, ShieldAlert } from 'lucide-react';
import { SecuritySimulatorPanel } from '../components/SecuritySimulatorPanel';

const SecuritySection = ({ icon: Icon, title, description, features }: { icon: any, title: string, description: string, features: string[] }) => (
  <div className="glass p-8 rounded-2xl border border-white/10">
    <div className="flex items-center space-x-4 mb-6">
      <div className="p-3 bg-brand/10 rounded-xl">
        <Icon className="w-8 h-8 text-brand" />
      </div>
      <h3 className="text-2xl font-bold text-text-main">{title}</h3>
    </div>
    <p className="text-text-muted mb-8 leading-relaxed">{description}</p>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {features.map((f, i) => (
        <div key={i} className="flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-success" />
          <span className="text-sm text-text-main">{f}</span>
        </div>
      ))}
    </div>
  </div>
);

export function SecurityPage() {
  return (
    <div className="min-h-screen pt-24 pb-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-text-main mb-4">Security Model</h1>
        <p className="text-text-muted max-w-2xl mx-auto">
          TrustGov is built on the principle of "Never Trust, Always Verify." Our security architecture exceeds international government standards.
        </p>
      </div>

      <div className="space-y-12">
        <SecuritySection
          icon={ShieldAlert}
          title="Zero Trust Architecture"
          description="Every API call is authenticated independently. No implicit trust is granted to any session, network, or internal service."
          features={[
            "JWT-based stateless auth (15-min access tokens)",
            "Refresh token rotation with revocation",
            "Least-privilege route protection",
            "Signed tokens verified on every request"
          ]}
        />

        <SecuritySection
          icon={Lock}
          title="Encryption & Integrity"
          description="Citizen data is protected in transit and at rest, with cryptographic proofs recorded on a distributed ledger."
          features={[
            "bcrypt password hashing (cost 10)",
            "SHA-256 blockchain record fingerprinting",
            "HTTPS / TLS for all API traffic",
            "Hyperledger Fabric blockchain audit logs"
          ]}
        />

        <SecuritySection
          icon={Key}
          title="Multi-Factor Authentication"
          description="Identity is verified through phone-based one-time passwords, with real-time safeguards against brute-force attacks."
          features={[
            "Phone OTP via Firebase Auth",
            "Demo fallback OTP for non-Blaze accounts",
            "5-minute OTP expiry window",
            "Max 3 OTP requests per 10 minutes"
          ]}
        />

        <SecuritySection
          icon={Database}
          title="Blockchain Integrity"
          description="To prevent administrative corruption or unauthorised record changes, cryptographic proofs of all government records are anchored to an immutable blockchain ledger."
          features={[
            "Tamper-proof audit logs",
            "Distributed consensus via Hyperledger Fabric",
            "Immutable record history",
            "Transparent on-chain verification"
          ]}
        />
      </div>

      <div className="mt-24 p-12 rounded-3xl bg-gradient-to-br from-brand/10 to-brand/5 border border-brand/10 text-center">
        <Shield className="w-16 h-16 text-brand mx-auto mb-6" />
        <h2 className="text-3xl font-bold text-text-main mb-4">Active Threat Mitigation</h2>
        <p className="text-lg text-text-muted max-w-3xl mx-auto mb-8">
          TrustGov enforces real-time protections against brute-force and credential-stuffing attacks, with every security event persisted to a tamper-evident log.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto text-left mb-8">
          {[
            { label: "OTP Rate Limiting", detail: "Max 3 requests / 10 min per account" },
            { label: "Brute-force Lockout", detail: "Account locked for 15 min after 5 wrong OTPs" },
            { label: "IP Blocking", detail: "IP blocked for 30 min after 10 failures" },
            { label: "New Device Alerts", detail: "Flagged when login IP or browser changes" },
          ].map(({ label, detail }) => (
            <div key={label} className="glass p-4 rounded-xl border border-white/10">
              <div className="flex items-center space-x-2 mb-1">
                <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                <span className="text-sm font-semibold text-text-main">{label}</span>
              </div>
              <p className="text-xs text-text-muted pl-6">{detail}</p>
            </div>
          ))}
        </div>
        <div className="inline-flex items-center space-x-2 text-brand font-bold uppercase tracking-widest text-sm">
          <Activity className="w-4 h-4 animate-pulse" />
          <span>Active Protection Enabled</span>
        </div>
      </div>

      <SecuritySimulatorPanel />
    </div>
  );
}
