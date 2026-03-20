"use client";
// components/widget/ConfirmationScreen.tsx

interface ConfirmationScreenProps {
    total: number;
}

export const ConfirmationScreen = ({ total }: ConfirmationScreenProps) => {
    return (
        <div className="animate-in fade-in zoom-in-95 duration-500 bg-white p-12 rounded-2xl shadow-2xl border border-gray-100 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-3xl font-black text-blue-900 mb-2">You're all set!</h2>
            <p className="text-gray-500 text-lg mb-6">
                Your quote request has been received.
            </p>

            <div className="bg-blue-50 border border-blue-100 rounded-xl px-8 py-5 inline-block mb-8">
                <p className="text-sm text-blue-500 font-semibold uppercase tracking-wider mb-1">
                    Your Estimate
                </p>
                <p className="text-5xl font-black text-blue-600">
                    ${total.toLocaleString()}
                </p>
            </div>

            <div className="space-y-2 text-sm text-gray-500 max-w-sm mx-auto">
                <p>📧 Check your email for a copy of this estimate.</p>
                <p>📞 A specialist from Advanced Roofing Team will contact you within <strong className="text-gray-700">24 hours</strong>.</p>
            </div>

            <p className="text-xs text-gray-400 mt-8 italic">
                Advanced Roofing Team · Chicago, IL · advancedteamelite.com
            </p>
        </div>
    );
};