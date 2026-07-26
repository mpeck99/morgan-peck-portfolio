import BlogCard from "@/components/blocks/BlogCard/BlogCard";
import Container from "@/components/layout/Container/Container";
import Grid from "@/components/layout/Grid/Grid";
import Section from "@/components/layout/Section/Section";
import Stack from "@/components/layout/Stack/Stack";
import { getAllPosts } from "@/lib/blog";

export default function Blog() {
  const posts = getAllPosts();

  return (
    <main>
      <Section>
        <Container>
          <Stack>
            <h1>Blog</h1>
            <Grid>
              {posts.map((post) => (
                <BlogCard key={post.slug} {...post} />
              ))}
            </Grid>
          </Stack>
        </Container>
      </Section>
    </main>
  );
}
