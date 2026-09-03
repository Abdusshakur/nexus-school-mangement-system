import React, { useState } from "react";
import { X } from "lucide-react";
import { Scanner } from "@yudiel/react-qr-scanner";

interface QRScannerModalProps {
  action: "CHECK_IN" | "CHECK_OUT";
  onClose: () => void;
  onScan: (token: string) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  action,
  onClose,
  onScan,
}) => {
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {

    window.history.pushState({ qrModalOpen: true }, "");

    const handlePopState = () => {


      onClose();
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);


      if (window.history.state?.qrModalOpen) {
        window.history.back();
      }
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">
            {action === "CHECK_IN" ? "Scan to Sign In" : "Scan to Sign Out"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scanner Box */}
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden relative aspect-square">
            <Scanner
              onScan={(result) => {
                if (result && result.length > 0) {
                  onScan(result[0].rawValue);
                }
              }}
              onError={(err) => {
                console.error("QR Scan Error:", err);
                setError(
                  err instanceof Error ? err.message : "Failed to read camera",
                );
              }}
              components={{
                finder: true,
              }}
              styles={{
                container: { width: "100%", height: "100%" },
              }}
            />
          </div>
          <p className="text-center text-sm text-slate-500 mt-4">
            Center the {action === "CHECK_IN" ? "Check In" : "Check Out"} QR
            Code in the frame to scan.
          </p>
          {error && (
            <p className="text-center text-sm text-red-500 mt-2 font-medium">
              Error: {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
