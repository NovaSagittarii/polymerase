import 'webextension-polyfill';
import { exampleThemeStorage } from '@extension/storage';
import { onMessage } from 'webext-bridge/background';
import type { HandshakeResponse } from 'webext-bridge';

exampleThemeStorage.get().then(theme => {
  console.log('theme', theme);
});

console.log('Background loaded');
console.log("Edit 'chrome-extension/src/background/index.ts' and save to reload.");

// removing this seems to break webext-bridge for whatever reason... :c
// (specifically, the "client message gets to server but never
// acknowledges response" bug)
onMessage('Handshake', async (message): Promise<HandshakeResponse> => {
  console.log('Received message', message);
  return Math.random() > 0.5 ? 'No' : 'Yes';
});
