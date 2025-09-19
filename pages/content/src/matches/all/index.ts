import extract from '@src/extract';
import { sendMessage } from 'webext-bridge/content-script';
import type { TabInfoResponse } from 'webext-bridge';

console.log('[CEB] All content script loaded');

(async function () {
  let ok = false;
  for (let i = 0; i < 100 && !ok; ++i) {
    console.log(`#${i}`);
    await sendMessage('TabInfo', null, 'options')
      .then(async (info: TabInfoResponse) => {
        ok = true;
        console.info('tabinfo', info);
        sendMessage('Submit', await extract(info));
        sendMessage('TabComplete', null, 'options');
        window.close();
      })
      .catch(console.warn);
    await new Promise(res => setTimeout(res, 1000));
  }
})();

setInterval(() => console.log('keepalive'), 1000);
