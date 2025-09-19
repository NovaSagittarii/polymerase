import { onMessage } from 'webext-bridge/options';
import type { QueueEntry } from './storageAdapter';
import type { TabInfoResponse } from 'webext-bridge';

const tabInfo: Record<number, TabInfoResponse> = {};
const tabCallback: Record<number, () => void> = {};

// for whatever reason, this is buggy and the client sendMessage
// fails (never acknowledges response). the server always gets it though.
// see https://github.com/serversideup/webext-bridge/issues/69
onMessage('TabInfo', async (message): Promise<TabInfoResponse> => {
  console.log('rcv TabInfo', message);
  const { tabId } = message.sender;
  console.log('return', tabInfo[tabId]);
  return tabInfo[tabId];
});

onMessage('TabComplete', async (message): Promise<undefined> => {
  const { tabId } = message.sender;
  if (tabCallback[tabId]) tabCallback[tabId]();
});

export const processRequest = async (r: QueueEntry | undefined) => {
  if (r) {
    const tab = await chrome.tabs.create({ url: r.id, active: false });
    if (tab.id) {
      tabInfo[tab.id] = r;
      console.log('create tab', tab.id);
      await new Promise<void>(res => {
        tabCallback[tab.id!] = res;
      });
      console.log('COMPLETE!');
    }
  }
};

export { tabInfo };
