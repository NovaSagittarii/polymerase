import wikipedia from './wikipedia';
import type { TabInfoResponse } from 'webext-bridge';

const extractFunctions = [wikipedia];

export default async function extract(info: TabInfoResponse) {
  return (
    await Promise.all(
      extractFunctions.flatMap(async f => {
        if (f.validateUrl(location.href)) {
          return await f.extract(info);
        }
        return [];
      }),
    )
  ).flat();
}
