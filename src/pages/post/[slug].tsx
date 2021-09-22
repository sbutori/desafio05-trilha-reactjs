import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';

import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import Image from 'next/image';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';
import { formatPostDate } from '../../services/formatPostDate';
import { calcPostReadTime } from '../../services/calcPostReadTime';

import styles from './post.module.scss';
import commonStyles from '../../styles/common.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter();
  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  const formattedPostDate = formatPostDate(post.first_publication_date);
  const postReadTime = calcPostReadTime(post.data.content);

  return (
    <>
      <Header />
      <Image
        src={`${post.data.banner.url}`}
        alt={post.data.title}
        width={1440}
        height={400}
      />
      <article className={styles.article}>
        <h1 className={styles.mainTitle}>{post.data.title}</h1>
        <div className={commonStyles.info}>
          <div className={commonStyles.date}>
            <FiCalendar className={commonStyles.icon} />
            <p>{formattedPostDate}</p>
          </div>
          <div className={commonStyles.author}>
            <FiUser className={commonStyles.icon} />
            <p>{post.data.author}</p>
          </div>
          <div className={commonStyles.readTime}>
            <FiClock className={commonStyles.icon} />
            <p>{postReadTime} min</p>
          </div>
        </div>
        <div className={styles.content}>
          {post.data.content.map(section => {
            return (
              <section key={section.heading}>
                <h2 className={styles.sectionTitle}>{section.heading}</h2>
                {section.body.map(paragraph => {
                  return (
                    <p
                      key={Math.random().toString()}
                      className={styles.sectionParagraph}
                    >
                      {paragraph.text}
                    </p>
                  );
                })}
              </section>
            );
          })}
        </div>
      </article>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query('');

  return {
    paths: posts.results.map(post => {
      return {
        params: {
          slug: post.uid,
        },
      };
    }),
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async context => {
  const prismic = getPrismicClient();

  const response = await prismic.getByUID(
    'posts',
    context.params.slug as string,
    {}
  );

  return {
    props: {
      post: response,
    },
  };
};
