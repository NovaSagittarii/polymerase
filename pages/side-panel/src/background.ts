import { $localStorage } from './storage';
import { onMessage } from 'webext-bridge/background';
import type { SubmitResponse } from 'webext-bridge';

onMessage('Submit', async (message): Promise<SubmitResponse> => {
  console.info('rcv Submit', message);
  await Promise.all(
    message.data.map(async x => {
      if (!x.type) console.warn('missing type', x);
      else if (!x.id) console.warn('missing id', x);
      else {
        // console.info('attempt put', x);
        await $localStorage.get().setItem(x.type, x.id, x);
      }
    }),
  );
  return 'ok';
});
