'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PipelineRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to data pipeline (start of sequential flow)
    router.replace('/pipeline/data');
  }, [router]);

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Redirecting to Pipeline Demo...</h1>
        <p>Taking you to the Data Ingestion Pipeline.</p>
      </div>
    </div>
  );
}
