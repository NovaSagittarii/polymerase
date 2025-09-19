import { $localStorage } from './storage';
import { onMessage } from 'webext-bridge/background';
import type { SubmitResponse } from 'webext-bridge';

onMessage('Submit', async (message): Promise<SubmitResponse> => {
  console.info('rcv Submit', message);
  await Promise.all(
    message.data.map(async x => {
      if (!x) console.warn('empty submit');
      else if (!x.type) console.warn('missing type', x);
      else if (!x.id) console.warn('missing id', x);
      else {
        // console.info('attempt put', x);
        // @ts-expect-error bugged type (x/SubmitResponse too loose), need to fix at some point
        await $localStorage.get().setItem(x.type, x.id, x);
      }
    }),
  );
  return 'ok';
});
