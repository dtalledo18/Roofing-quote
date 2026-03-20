"use client";
// components/widget/ConfirmationScreen.tsx

interface ConfirmationScreenProps {
    total: number;
}

export const ConfirmationScreen = ({ total }: ConfirmationScreenProps) => {
    return (
        <div className="animate-in fade-in zoom-in-95 duration-500 bg-white p-12 rounded-2xl shadow-2xl border border-gray-100 text-center">

            {/* Check icon */}
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mx-auto mb-5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
            </div>

            <h2 className="text-3xl font-black text-blue-900 mb-2">You're all set!</h2>
            <p className="text-gray-500 text-lg mb-6">Your quote request has been received.</p>

            <div className="bg-blue-50 border border-blue-100 rounded-xl px-8 py-5 inline-block mb-8">
                <p className="text-sm text-blue-500 font-semibold uppercase tracking-wider mb-1">
                    Your Estimate
                </p>
                <p className="text-5xl font-black text-blue-600">
                    ${total.toLocaleString()}
                </p>
            </div>

            <div className="space-y-3 text-sm text-gray-500 max-w-sm mx-auto">
                {/* Email icon */}
                <div className="flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>Check your email for a copy of this estimate.</span>
                </div>
                {/* Phone icon */}
                <div className="flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>A specialist will contact you within <strong className="text-gray-700">24 hours</strong>.</span>
                </div>
            </div>

            <p className="text-xs text-gray-400 mt-8 italic">
                Advanced Roofing Team · Chicago, IL · advancedteamelite.com
            </p>
        </div>
    );
};