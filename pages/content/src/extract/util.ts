export class ExtractFunction {
  protected querySelector;
  protected querySelectorAll;
  private pattern: RegExp;
  constructor(pattern: RegExp) {
    this.pattern = pattern;
    const iframe = document.createElement('iframe');
    document.documentElement.appendChild(iframe);
    const iframeDocument = iframe.contentDocument;
    if (iframeDocument) {
      this.querySelector = iframeDocument.querySelector.bind(document);
      this.querySelectorAll = iframeDocument.querySelectorAll.bind(document);
    }
    iframe.remove();
  }
  validateUrl(url: string) {
    return this.pattern.test(url);
  }
  async extract(): Promise<Record<string, string | number | boolean | undefined | null>[]> {
    return [];
  }
  async utils() {
    return {
      url: location.href,
    };
  }
}
