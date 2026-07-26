import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import Container from "@/components/layout/Container/Container";
import Section from "@/components/layout/Section/Section";
import Stack from "@/components/layout/Stack/Stack";
import ThemedImage from "@/components/ui/ThemedImage";
import { getAllPostSlugs, getPostBySlug } from "@/lib/blog";
import styles from "./page.module.scss";
import Badge from "@/components/ui/Badge";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {};
  }

  return {
    title: `${post.title} | Blog | Morgan Peck`,
    description: post.description,
  };
}

function formatDate(dateString: string) {
  return new Date(`${dateString}T00:00:00`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <main>
      <Section>
        <Container>
          <Stack>
            <article>
              <header className={styles.header}>
                <div className={styles.meta}>
                  <time className={styles.date} dateTime={post.date}>
                    {formatDate(post.date)}
                  </time>
                  <span className={styles.readingTime}>{post.readingTime}</span>
                </div>
                <h1>{post.title}</h1>
                {post.tags && (
                  <div className={styles.tags}>
                    {post.tags.map((tag) => (
                      <Badge key={tag}>{tag}</Badge>
                    ))}
                  </div>
                )}
                {post.banner && (
                  <div className={styles.banner}>
                    <ThemedImage light={post.banner.light} dark={post.banner.dark} alt="" />
                  </div>
                )}
              </header>
              <div className={styles.body}>
                <MDXRemote source={post.content} />
              </div>
            </article>
          </Stack>
        </Container>
      </Section>
    </main>
  );
}
