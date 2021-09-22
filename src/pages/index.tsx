import { useState } from 'react';
import { GetStaticProps } from 'next';

import Image from 'next/image';
import Link from 'next/link';

import { FiCalendar, FiUser } from 'react-icons/fi';
import { getPrismicClient } from '../services/prismic';
import { formatPostDate } from '../services/formatPostDate';

import styles from './home.module.scss';
import commonStyles from '../styles/common.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const [posts, setPosts] = useState(postsPagination.results);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);

  const loadNextPageHandler: () => void = async () => {
    const response = await fetch(nextPage);
    const data = await response.json();
    setPosts(prevState => [...prevState, ...data.results]);
    setNextPage(data.next_page);
  };

  return (
    <main className={styles.postsContainer}>
      <header className={styles.logoContainer}>
        <Image
          src="/images/Logo.svg"
          alt="logo"
          width="238.62"
          height="25.63"
        />
      </header>
      {posts.map(post => {
        const formattedPostDate = formatPostDate(post.first_publication_date);

        return (
          <section key={post.uid} className={styles.post}>
            <Link href={`/post/${post.uid}`}>
              <h2 className={styles.title}>{post.data.title}</h2>
            </Link>
            <p className={styles.subtitle}>{post.data.subtitle}</p>
            <div className={commonStyles.info}>
              <div className={commonStyles.date}>
                <FiCalendar className={commonStyles.icon} />
                <p>{formattedPostDate}</p>
              </div>
              <div className={commonStyles.author}>
                <FiUser className={commonStyles.icon} />
                <p>{post.data.author}</p>
              </div>
            </div>
          </section>
        );
      })}
      {nextPage && (
        <button
          type="button"
          className={styles.button}
          onClick={loadNextPageHandler}
        >
          Carregar mais posts
        </button>
      )}
    </main>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query('', {
    pageSize: 2,
  });

  const props = {
    postsPagination: {
      next_page: postsResponse.next_page,
      results: postsResponse.results,
    },
  };

  return {
    props,
    revalidate: false,
  };
};
