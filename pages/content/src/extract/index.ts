import wikipedia from './wikipedia';

const extractFunctions = [wikipedia];

export default async function extract() {
  return (
    await Promise.all(
      extractFunctions.flatMap(async f => {
        if (f.validateUrl(location.href)) {
          return await f.extract();
        }
        return [];
      }),
    )
  ).flat();
}
