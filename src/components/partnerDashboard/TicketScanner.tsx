import { QrCode, Check, X, Clock, Calendar, User, Ticket, Loader2, Camera, CameraOff } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { API_BASE_URL } from '../../config/api';
import { getPartnerToken } from '../../services/partnerService';

interface ScanHistoryItem {
  id: number;
  ticketId: string;
  attendeeName: string;
  eventName: string;
  ticketType: string;
  scanTime: string;
  status: string;
}

export default function TicketScanner() {
  const [scanResult, setScanResult] = useState<{
    status: 'success' | 'error' | 'used' | null;
    message?: string;
    ticket?: {
      ticketId: string;
      eventName: string;
      attendeeName: string;
      ticketType: string;
      purchaseDate: string;
    };
  }>({ status: null });

  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [manualTicketNumber, setManualTicketNumber] = useState('');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const qrCodeScannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Load scan history from localStorage or API
    const savedHistory = localStorage.getItem('ticketScanHistory');
    if (savedHistory) {
      try {
        setScanHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Error loading scan history:', e);
      }
    }

    // Cleanup camera on unmount
    return () => {
      if (qrCodeScannerRef.current && isCameraOpen) {
        qrCodeScannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const saveScanHistory = (newScan: ScanHistoryItem) => {
    const updated = [newScan, ...scanHistory].slice(0, 50); // Keep last 50 scans
    setScanHistory(updated);
    localStorage.setItem('ticketScanHistory', JSON.stringify(updated));
  };

  const scanTicket = async (ticketNumber: string) => {
    if (!ticketNumber.trim()) {
      setScanResult({
        status: 'error',
        message: 'Please enter a ticket number'
      });
      return;
    }

    setIsScanning(true);
    setScanResult({ status: null });

    try {
      const token = getPartnerToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}/api/tickets/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          qr_data: ticketNumber.trim()
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle different error cases
        if (data.error?.includes('already scanned') || data.error?.includes('Already scanned')) {
          setScanResult({
            status: 'used',
            message: 'Ticket already scanned',
            ticket: data.ticket ? {
              ticketId: data.ticket.ticket_number || ticketNumber,
              eventName: data.ticket.booking?.event?.title || 'Unknown Event',
              attendeeName: data.attendee ? `${data.attendee.first_name} ${data.attendee.last_name}` : 'Unknown',
              ticketType: data.ticket.ticket_type?.name || 'General',
              purchaseDate: data.ticket.booking?.created_at || ''
            } : undefined
          });
        } else {
          setScanResult({
            status: 'error',
            message: data.error || 'Failed to scan ticket'
          });
        }
        return;
      }

      // Success
      if (data.success) {
        const ticket = data.ticket;
        const attendee = data.attendee;
        const booking = ticket.booking || {};

    setScanResult({
      status: 'success',
          message: 'Ticket confirmed successfully! ✅',
          ticket: {
            ticketId: ticket.ticket_number || ticketNumber,
            eventName: booking.event?.title || 'Unknown Event',
            attendeeName: attendee ? `${attendee.first_name} ${attendee.last_name}` : 'Unknown',
            ticketType: ticket.ticket_type?.name || 'General',
            purchaseDate: booking.created_at || ''
          }
    });

    // Add to scan history
        const newScan: ScanHistoryItem = {
          id: Date.now(),
          ticketId: ticket.ticket_number || ticketNumber,
          attendeeName: attendee ? `${attendee.first_name} ${attendee.last_name}` : 'Unknown',
          eventName: booking.event?.title || 'Unknown Event',
          ticketType: ticket.ticket_type?.name || 'General',
      scanTime: new Date().toLocaleString(),
      status: 'Valid'
        };
        saveScanHistory(newScan);
      } else {
        setScanResult({
          status: 'error',
          message: data.error || 'Ticket validation failed'
        });
      }
    } catch (err: any) {
      console.error('Error scanning ticket:', err);
      setScanResult({
        status: 'error',
        message: err.message || 'Failed to scan ticket. Please try again.'
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleManualScan = () => {
    if (manualTicketNumber.trim()) {
      scanTicket(manualTicketNumber.trim());
    }
  };

  const handleQRScan = (qrData: string) => {
    scanTicket(qrData);
  };

  // Start QR code scanner
  const startQRScanner = async () => {
    try {
      setCameraError(null);
      const scannerId = 'qr-reader';
      
      // Create scanner container if it doesn't exist
      if (!document.getElementById(scannerId) && scannerContainerRef.current) {
        const div = document.createElement('div');
        div.id = scannerId;
        scannerContainerRef.current.appendChild(div);
      }

      const html5QrCode = new Html5Qrcode(scannerId);
      qrCodeScannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' }, // Use back camera
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          // Successfully scanned QR code
          handleQRScan(decodedText);
          stopQRScanner();
        },
        (errorMessage) => {
          // Ignore scanning errors (just keep trying)
        }
      );

      setIsCameraOpen(true);
    } catch (err: any) {
      console.error('Error starting QR scanner:', err);
      setCameraError(err.message || 'Unable to start camera. Please check permissions.');
      setIsCameraOpen(false);
    }
  };

  // Stop QR code scanner
  const stopQRScanner = async () => {
    try {
      if (qrCodeScannerRef.current) {
        await qrCodeScannerRef.current.stop();
        await qrCodeScannerRef.current.clear();
        qrCodeScannerRef.current = null;
      }
      
      // Remove scanner container
      const scannerElement = document.getElementById('qr-reader');
      if (scannerElement && scannerContainerRef.current) {
        scannerContainerRef.current.removeChild(scannerElement);
      }
      
      setIsCameraOpen(false);
      setCameraError(null);
    } catch (err) {
      console.error('Error stopping QR scanner:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Ticket Scanner</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Scan and validate event tickets
        </p>
      </div>

      {/* Scanner Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-32 h-32 bg-[#27aae2]/10 rounded-full mb-4">
              <QrCode className="w-16 h-16 text-[#27aae2]" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Ready to Scan
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Scan QR code or enter ticket number manually
            </p>
          </div>

          {/* Manual Ticket Number Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Enter Ticket Number
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={manualTicketNumber}
                onChange={(e) => setManualTicketNumber(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleManualScan()}
                placeholder="TKT-20241201-ABC123"
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#27aae2]"
                disabled={isScanning}
              />
              <button
                onClick={handleManualScan}
                disabled={isScanning || !manualTicketNumber.trim()}
                className="px-6 py-3 bg-[#27aae2] text-white rounded-lg font-semibold hover:bg-[#1e8bc3] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isScanning ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Scan'}
              </button>
            </div>
          </div>

          {/* QR Scanner Section */}
          <div className="mb-6">
            {!isCameraOpen ? (
              <button
                onClick={startQRScanner}
                disabled={isScanning}
                className="w-full bg-[#27aae2] text-white py-4 rounded-xl font-semibold hover:bg-[#1e8bc3] transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <Camera className="w-5 h-5" />
                <span>Open QR Scanner</span>
              </button>
            ) : (
              <div className="space-y-4">
                <div 
                  ref={scannerContainerRef}
                  className="relative bg-black rounded-xl overflow-hidden"
                  style={{ minHeight: '300px' }}
                >
                  <div id="qr-reader" className="w-full"></div>
                </div>
                {cameraError && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
                    {cameraError}
                  </div>
                )}
                <button
                  onClick={stopQRScanner}
                  className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition-all flex items-center justify-center space-x-2"
                >
                  <CameraOff className="w-5 h-5" />
                  <span>Stop Scanner</span>
                </button>
              </div>
            )}
          </div>

          {/* Scan Result */}
          {scanResult.status && (
            <div className={`mt-6 p-6 rounded-xl animate-in fade-in duration-300 ${
              scanResult.status === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-500'
                : scanResult.status === 'used'
                ? 'bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-500'
                : 'bg-red-50 dark:bg-red-900/20 border-2 border-red-500'
            }`}>
              <div className="flex items-center space-x-3 mb-4">
                {scanResult.status === 'success' ? (
                  <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
                ) : scanResult.status === 'used' ? (
                  <Clock className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                ) : (
                  <X className="w-8 h-8 text-red-600 dark:text-red-400" />
                )}
                <div className="flex-1">
                <h4 className={`text-xl font-bold ${
                  scanResult.status === 'success'
                    ? 'text-green-900 dark:text-green-100'
                    : scanResult.status === 'used'
                    ? 'text-orange-900 dark:text-orange-100'
                    : 'text-red-900 dark:text-red-100'
                }`}>
                  {scanResult.status === 'success'
                      ? '✅ Ticket Confirmed!'
                    : scanResult.status === 'used'
                    ? 'Already Used'
                    : 'Invalid Ticket'
                  }
                </h4>
                  {scanResult.message && (
                    <p className={`text-sm mt-1 ${
                      scanResult.status === 'success'
                        ? 'text-green-700 dark:text-green-300'
                        : scanResult.status === 'used'
                        ? 'text-orange-700 dark:text-orange-300'
                        : 'text-red-700 dark:text-red-300'
                    }`}>
                      {scanResult.message}
                    </p>
                  )}
                </div>
              </div>

              {scanResult.ticket && (
                <div className="space-y-2 text-sm mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                    <Ticket className="w-4 h-4" />
                    <span className="font-semibold">{scanResult.ticket.ticketId}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                    <Calendar className="w-4 h-4" />
                    <span>{scanResult.ticket.eventName}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                    <User className="w-4 h-4" />
                    <span>{scanResult.ticket.attendeeName} - {scanResult.ticket.ticketType}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Scan History */}
      {scanHistory.length > 0 && (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Scans
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Ticket ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Attendee
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Event
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Scan Time
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {scanHistory.map((scan) => (
                <tr key={scan.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                    {scan.ticketId}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {scan.attendeeName}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {scan.eventName}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      scan.ticketType === 'VIP'
                        ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
                        : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                    }`}>
                      {scan.ticketType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {scan.scanTime}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      scan.status === 'Valid'
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        : 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200'
                    }`}>
                      {scan.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
          Important Note
        </h4>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Each ticket can only be scanned once. Already scanned tickets will be flagged automatically.
          Make sure to check the attendee's ID matches the ticket information.
        </p>
      </div>
    </div>
  );
}
