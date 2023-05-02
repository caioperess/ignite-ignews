import Head from "next/head";
import { GetStaticProps } from "next/types";
import { RichText } from "prismic-dom";
import { getPrismicClient } from "../../../prismicio";

import styles from "./styles.module.scss";
import Link from "next/link";

type Post = {
  slug: string;
  title: string;
  excerpt: string;
  updatedAt: string;
};

interface PostsProps {
  posts: Post[];
}

export default function Posts({ posts }: PostsProps) {
  return (
    <>
      <Head>
        <title>Posts | Ignews</title>
      </Head>

      <main className={styles.container}>
        <div className={styles.posts}>
          {posts.map((post) => (
            <Link key={post.slug} href={`/posts/${post.slug}`} legacyBehavior>
              <a key={post.slug}>
                <time>{post.updatedAt}</time>
                <strong>{post.title}</strong>
                <p>{post.excerpt}</p>
              </a>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const response = await prismic.getByType("publication", {
    fetch: ["publication.title", "publication.content"],
    pageSize: 100,
  });

  const posts = response.results.map((post) => {
    const firstParagraph = post.data.content.find(
      (content) => content.type === "paragraph"
    );
    let firstParagraphText = "";
    if (firstParagraph && "text" in firstParagraph) {
      firstParagraphText = firstParagraph.text;
    }

    return {
      slug: post.uid,
      title: RichText.asText(post.data.title),
      excerpt: firstParagraphText,
      updatedAt: new Date(post.last_publication_date).toLocaleDateString(
        "pt-BR",
        {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }
      ),
    };
  });

  return {
    props: { posts },
  };
};
