import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function AppIndex() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/app/dashboard');
  }, []);
  return null;
}
