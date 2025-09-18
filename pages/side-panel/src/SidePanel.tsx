import '@src/SidePanel.css';
// import { t } from '@extension/i18n';
import StorageManager from './StorageManager';
import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';
import { cn, ErrorDisplay, LoadingSpinner } from '@extension/ui';
import { useEffect } from 'react';
// import { test } from "./storage";

const SidePanel = () => {
  const { isLight } = useStorage(exampleThemeStorage);
  // const logo = isLight ? 'side-panel/logo_vertical.svg' : 'side-panel/logo_vertical_dark.svg';
  // const goGithubSite = () => chrome.tabs.create(PROJECT_URL_OBJECT);
  useEffect(() => {
    // console.log("run test6");
    // const cleanup = test();
    // return () => {
    //   cleanup.then(x => x());
    // }
  }, []);

  return (
    <div className={cn('App', isLight ? 'bg-slate-50' : 'bg-gray-800')}>
      <header className={cn('App-header', isLight ? 'text-gray-900' : 'text-gray-100')}>
        {/* <button onClick={goGithubSite}>
          <img src={chrome.runtime.getURL(logo)} className="App-logo" alt="logo" />
        </button>
        <p>
          Edit <code>pages/side-panel/src/SidePanel.tsx</code>
        </p>
        <ToggleButton onClick={exampleThemeStorage.toggle}>{t('toggleTheme')}</ToggleButton> */}
        <StorageManager />
      </header>
    </div>
  );
};

export default withErrorBoundary(withSuspense(SidePanel, <LoadingSpinner />), ErrorDisplay);
