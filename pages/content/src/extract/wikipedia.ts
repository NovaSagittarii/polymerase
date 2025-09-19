import { ExtractFunction } from './util';
import type { TabInfoResponse } from 'webext-bridge';

class E extends ExtractFunction {
  constructor() {
    super(/wikipedia\.org/);
  }
  async extract(info: TabInfoResponse) {
    const { url } = await this.utils();
    return [
      {
        type: 'wiki',
        id: document.querySelector('.mw-page-title-main')?.textContent || document.title,
        url: url,
        size: document.querySelector('#bodyContent')?.textContent.length,
        qtype: info?.type,
        qid: info?.id,
      },
      // @ts-expect-error typescript querySelectorAll seems to be missing type info but this works
      ...[...document.querySelectorAll('a.mw-redirect')]
        .map(x => ({
          type: 'wiki',
          id: x.href.split('#')[0],
          _queue: true,
        }))
        .filter(x => !x.id.includes('&')),
    ];
  }
}

export default new E();
