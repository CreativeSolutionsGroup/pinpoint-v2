'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to diagram editor
    router.push('/diagrams/demo');
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p>Redirecting to diagram editor...</p>
    </div>
  );
}
