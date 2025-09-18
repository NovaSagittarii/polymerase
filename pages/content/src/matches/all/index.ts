import extract from '@src/extract';
import { sendMessage } from 'webext-bridge/content-script';

console.log('[CEB] All content script loaded');

extract().then(x => sendMessage('Submit', x, 'background'));
