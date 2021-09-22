import PrismicDOM from 'prismic-dom';

interface Content {
  heading: string;
  body: {
    text: string;
  }[];
}
export function calcPostReadTime(postContent: Content[]): number {
  const avgWordsPerMinuteReadingSpeed = 200;

  return Math.ceil(
    postContent
      .reduce((acc: string, el: Content) => {
        return `${acc} ${el.heading} ${PrismicDOM.RichText.asText(el.body)}`;
      }, '')
      .trim()
      .split(/[\s]+/g).length / avgWordsPerMinuteReadingSpeed
  );
}
