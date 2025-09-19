import { t } from '@extension/i18n';
import { ToggleButton } from '@extension/ui';
import { useEffect } from 'react';
// import { sendMessage } from 'webext-bridge/content-script';

export default function App() {
  useEffect(() => {
    console.log('[CEB] Content ui all loaded');
  }, []);

  return (
    <div className="flex items-center justify-between gap-2 rounded bg-blue-100 px-2 py-1">
      <div className="flex gap-1 text-sm text-blue-500">
        Edit <strong className="text-blue-700">pages/content-ui/src/matches/all/App.tsx</strong> and save to reload.
      </div>
      <ToggleButton className={'mt-0'}>{t('toggleTheme')}</ToggleButton>
      {/* <button
        onClick={async () => {
          const message = 'Hello?';
          sendMessage('Handshake', message).then(response => {
            console.log('Sending message ', message);
            console.log('Receiving message ', response);
          });
        }}>
        Hello
      </button> */}
    </div>
  );
}
