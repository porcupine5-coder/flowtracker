import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function PartnerSettings() {
  const userSettings = useQuery(api.cycles.getUserSettings);
  const updateUserSettings = useMutation(api.cycles.updateUserSettings);
  const loggedInUser = useQuery(api.auth.loggedInUser);
  
  const [partnerEmail, setPartnerEmail] = useState("");
  const [enableSharing, setEnableSharing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const isShreeya = loggedInUser?.email === "metheotakj@gmail.com";

  // Don't show partner settings for Shreeya
  if (isShreeya) return null;

  const handleSave = async () => {
    try {
      await updateUserSettings({
        averageCycleLength: userSettings?.averageCycleLength || 28,
        averagePeriodLength: userSettings?.averagePeriodLength || 5,
        partnerEmail: enableSharing ? partnerEmail : undefined,
        enablePartnerSharing: enableSharing,
      });
      
      toast.success("Partner settings updated successfully!");
      setIsOpen(false);
    } catch (error) {
      toast.error("Failed to update partner settings");
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-110 z-50 flex items-center justify-center"
      >
        <span className="text-xl">💕</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-pink-200">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  Partner Sharing
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="enableSharing"
                    checked={enableSharing}
                    onChange={(e) => setEnableSharing(e.target.checked)}
                    className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
                  />
                  <label htmlFor="enableSharing" className="text-sm font-medium text-gray-700">
                    Share my logs with my partner
                  </label>
                </div>

                {enableSharing && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Partner's Email
                    </label>
                    <input
                      type="email"
                      value={partnerEmail}
                      onChange={(e) => setPartnerEmail(e.target.value)}
                      placeholder="partner@example.com"
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
                    />
                  </div>
                )}

                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                  <p className="text-sm text-blue-700">
                    💡 When enabled, your daily logs will be automatically sent to your partner's email address.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-medium hover:from-pink-600 hover:to-purple-600 transition-all shadow-lg hover:shadow-xl"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
