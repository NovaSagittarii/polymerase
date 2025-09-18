import { ExtractFunction } from './util';

class E extends ExtractFunction {
  constructor() {
    super(/wikipedia\.org/);
  }
  async extract() {
    const { url } = await this.utils();
    return [
      {
        type: 'wiki',
        id: url,
        head: document.querySelector('.mw-page-title-main')?.textContent,
      },
    ];
  }
}

export default new E();
