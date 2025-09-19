import { processRequest } from './backgroundTab';
import { Indicator } from '@extension/ui';
import { useEffect, useState } from 'react';
import type { IObjectStorage } from './storageAdapter';

interface WorkerProps {
  name?: string;
  storage: IObjectStorage;
}
export default function BackgroundWorker({ name = 'Worker', storage }: WorkerProps) {
  const [status, setStatus] = useState('idle');
  const [_attempts, setAttempts] = useState(0);

  useEffect(() => {
    const cleanup: (() => void)[] = [];
    if (status === 'idle') {
      storage.request().then(r => {
        if (r) {
          console.log('ACQUIRE JOB', r);
          setStatus('busy');
          processRequest(r).then(() => setStatus('complete'));
        } else {
          const timeout = setTimeout(() => setAttempts(x => x + 1), 5000);
          cleanup.push(() => clearTimeout(timeout));
        }
      });
    } else if (status === 'complete') {
      const timeout = setTimeout(() => setStatus('idle'), 1000);
      cleanup.push(() => clearTimeout(timeout));
    }
    return () => cleanup.forEach(f => f());
  }, [status, storage]);

  return (
    <div>
      <Indicator label={name + ' Status: '} ok={status === 'idle'} description={status} />
    </div>
  );
}
