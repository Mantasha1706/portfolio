'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';

export default function SubmissionSuccessPage() {
    const router = useRouter();

    useEffect(() => {
        const timer = setTimeout(async () => {
            // Log out
            await fetch('/api/auth/logout', { method: 'POST' });
            // Redirect to login
            router.push('/login');
        }, 3000); // 3 seconds delay

        return () => clearTimeout(timer);
    }, [router]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
            <div className="text-center">
                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle className="h-16 w-16 text-green-600" />
                </div>
                <h1 className="mb-2 text-3xl font-bold text-gray-900">Sent to Teacher!</h1>
                <p className="text-lg text-gray-600">Great job! Your poster has been submitted successfully.</p>
                <p className="mt-8 text-sm text-gray-500">Logging out in a few seconds...</p>
            </div>
        </div>
    );
}
