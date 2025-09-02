/// <reference types="vite/client" />

import React from 'react';
import QRCode from 'react-qr-code';
// import { SITES } from '../constants';
import { useAuth } from '../hooks/useAuth';



// Use the actual network IP and port for QR code links
const NETWORK_IP = '192.168.1.14';
const NETWORK_PORT = '5173';

function getQRCodeUrl(site: string) {
  // Use hash routing for Vite and ensure correct format
  return `http://${NETWORK_IP}:${NETWORK_PORT}/#/feedback?site=${encodeURIComponent(site)}`;
}


const QRCodePrintPage: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const [sites, setSites] = React.useState<string[]>([]);
  const [modalSite, setModalSite] = React.useState<string | null>(null);
  React.useEffect(() => {
  fetch('http://192.168.1.14:4000/sites')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.sites)) {
          setSites(data.sites.map((s: any) => s.location));
        } else {
          setSites([]);
        }
      })
      .catch(() => setSites([]));
  }, []);
  return (
    <div className="min-h-screen bg-white p-4">
      <div className="bg-gradient-to-r from-primary-600 to-primary-400 rounded-lg py-2 mb-4 shadow flex items-center justify-center px-4">
  <h1 className="text-lg font-semibold text-white">Site QR Codes for Feedback</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sites.map(site => {
          const url = getQRCodeUrl(site);
          const isModalOpen = modalSite === site;
          return (
            <div key={site} className="flex flex-col items-center p-4 border rounded-lg shadow bg-gray-50 min-w-[220px] max-w-xs mx-auto relative">
              <h2 className="text-base font-semibold mb-2 text-primary-700">{site}</h2>
              <div className="relative w-[180px] h-[180px] flex items-center justify-center">
                {isModalOpen ? (
                  <QRCode value={url} size={180} />
                ) : (
                  <div className="blur-sm brightness-90" style={{ transition: 'filter 0.3s' }}>
                    <QRCode value={url} size={180} />
                  </div>
                )}
                {!isModalOpen && (
                  <button
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 text-white font-bold rounded hover:bg-opacity-50 text-xs"
                    style={{ zIndex: 2 }}
                    onClick={() => setModalSite(site)}
                  >
                    View QR Code
                  </button>
                )}
              </div>
              <p className="mt-2 text-gray-600 text-xs break-all text-center">{url}</p>
            </div>
          );
        })}
      </div>

      {/* Modal for viewing QR code styled as per attached image */}
      {modalSite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-sm" style={{ zIndex: 51 }} onClick={() => setModalSite(null)}></div>
          <div
            className="relative flex flex-col items-center justify-center"
            style={{ zIndex: 52 }}
          >
            <button
              className="absolute top-2 right-2 text-white bg-black bg-opacity-60 rounded-full w-8 h-8 flex items-center justify-center text-xl"
              onClick={() => setModalSite(null)}
              aria-label="Close"
              style={{ zIndex: 53 }}
            >
              &times;
            </button>
            <div
              className="flex flex-col items-center justify-center"
              style={{
                background: 'orange',
                borderRadius: '24px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
                padding: '24px 18px 18px 18px',
                minWidth: '280px',
                maxWidth: '90vw',
                position: 'relative',
              }}
            >
              <div className="text-center mb-2">
                <span className="block text-lg font-bold text-white tracking-wide" style={{ letterSpacing: '2px' }}>{modalSite}</span>
              </div>
              {/* Catalyst Logo Design */}
              <div className="text-center mb-2" style={{ marginBottom: '6px' }}>
                <div style={{ fontSize: '1.3em', fontWeight: 'bold', letterSpacing: '2px', lineHeight: 1 }}>
                  <span style={{ color: '#0055aa' }}>C</span>
                  <span style={{ color: '#009933' }}>A</span>
                  <span style={{ color: '#000000' }}>T</span>
                  <span style={{ color: '#000000' }}>A</span>
                  <span style={{ color: '#009933' }}>L</span>
                  <span style={{ color: '#0055aa' }}>Y</span>
                  <span style={{ color: '#994400' }}>S</span>
                  <span style={{ color: '#994400' }}>T</span>
                </div>
                <div style={{
                  fontSize: '0.75em',
                  fontWeight: 'bold',
                  color: '#666666',
                  marginTop: '4px',
                  borderTop: '2px solid #666666',
                  display: 'inline-block',
                  paddingTop: '3px',
                  letterSpacing: '1px',
                }}>
                  PARTNERING FOR SUSTAINABILITY
                </div>
              </div>
              <div className="text-center mb-2">
                <span className="block text-2xl font-extrabold text-white" style={{ letterSpacing: '1px', marginBottom: '4px' }}>SCAN ME!</span>
              </div>
              <div
                id="qr-print-area"
                className="flex items-center justify-center bg-white rounded-xl cursor-pointer"
                style={{ padding: '18px', margin: '0 auto', border: '6px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
                onClick={() => {
                  navigator.clipboard.writeText(getQRCodeUrl(modalSite || ''));
                  alert('QR code link copied!');
                }}
                title="Click to copy QR code link"
              >
                <QRCode value={getQRCodeUrl(modalSite || '')} size={220} bgColor="#fff" fgColor="#000" />
              </div>
              <button
                className="mt-3 px-4 py-1 bg-primary-600 text-white rounded font-semibold text-sm hover:bg-primary-700"
                style={{ marginBottom: '6px' }}
                onClick={() => {
                  // Print only the QR code area
                  const printContents = document.getElementById('qr-print-area')?.innerHTML;
                  const printWindow = window.open('', '', 'height=400,width=400');
                  if (printWindow && printContents) {
                    printWindow.document.write('<html><head><title>Print QR Code</title></head><body style="display:flex;justify-content:center;align-items:center;height:100vh;">');
                    printWindow.document.write(printContents);
                    printWindow.document.write('</body></html>');
                    printWindow.document.close();
                    printWindow.focus();
                    setTimeout(() => printWindow.print(), 300);
                  }
                }}
              >
                Print QR Code
              </button>
              <p className="mt-2 text-white text-xs break-all text-center" style={{ opacity: 0.8 }}>
                <span style={{ cursor: 'pointer', textDecoration: 'underline' }}
                  onClick={() => {
                    navigator.clipboard.writeText(getQRCodeUrl(modalSite || ''));
                    alert('QR code link copied!');
                  }}
                  title="Click to copy QR code link"
                >
                  {getQRCodeUrl(modalSite || '')}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}
      {isAuthenticated && (
        <div className="flex flex-col items-center mt-6">
          <button
            className="bg-red-500 text-white px-4 py-1 rounded mb-2 hover:bg-red-600 text-sm"
            onClick={logout}
          >
            Logout
          </button>
          <a
            href="/#/admin-login"
            className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 text-sm"
          >
            Admin Login
          </a>
        </div>
      )}
    </div>
  );

  // Reset QR blur state when modal closes
  React.useEffect(() => {
    if (!modalSite) {
      // No modal open, so all QR codes should be blurred
      // This is handled by the isModalOpen logic above
    }
  }, [modalSite]);
};

export default QRCodePrintPage;
