import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export default function TrustGovPopup() {
    const location = useLocation();
    const [show, setShow] = useState(false);
    const [txId, setTxId] = useState('');

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const tx = searchParams.get('tg_tx');
        if (tx) {
            setTxId(tx);
            setShow(true);
            const timer = setTimeout(() => {
                setShow(false);
            }, 3500);
            return () => clearTimeout(timer);
        }
    }, [location]);

    if (!show) return null;

    return (
        <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor: '#052e16',
            color: '#4ade80',
            padding: '16px 24px',
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            animation: 'slideIn 0.3s ease-out forwards',
            border: '1px solid #166534'
        }}>
            <style>{`
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #14532d', paddingBottom: '8px' }}>
                <span style={{ fontSize: '18px' }}>🛡️</span>
                <strong style={{ fontSize: '14px', letterSpacing: '0.05em', color: '#fff' }}>TRUSTGOV SECURE LOGIN</strong>
            </div>
            <div style={{ fontSize: '12px', color: '#86efac' }}>
                <div style={{ marginBottom: '4px' }}>✓ Blockchain Session Verified</div>
                <div style={{ fontFamily: 'monospace', opacity: 0.8, wordBreak: 'break-all' }}>TX: {txId}</div>
            </div>
        </div>
    );
}
