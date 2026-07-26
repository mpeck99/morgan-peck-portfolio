import BlogCard from "@/components/blocks/BlogCard/BlogCard";
import ProjectCard from "@/components/blocks/ProjectCard/ProjectCard";
import Container from "@/components/layout/Container/Container";
import Grid from "@/components/layout/Grid/Grid";
import Section from "@/components/layout/Section/Section";
import Stack from "@/components/layout/Stack/Stack";
import HeroBanner from "@/components/sections/HeroBanner";
import { projects } from "@/data/projects";
import { getRecentPosts } from "@/lib/blog";

export default function Home() {
  const recentPosts = getRecentPosts(3);
  return (
    <main>
      <HeroBanner
        eyebrow="Welcome"
        title={
          <>
            Hi, I'm <span className="highlight">Morgan</span>
          </>
        }
        tagline="Building accessible digital experiences."
        description="I’m a UX Engineer who builds user-focused interfaces through thoughtful frontend development, accessibility, and a passion for creating better experiences on the web."
        primaryAction={{ label: "View Projects", href: "/projects" }}
        secondaryAction={{ label: "About me", href: "/about" }}
        image="/images/hero-banner-coding.svg"
      />
      <Section>
        <Container>
          <Stack>
            <h2>Featured Projects</h2>
            <Grid>
              {projects.map((project, index) => (
                <ProjectCard key={project.title} index={index} {...project} />
              ))}
            </Grid>
          </Stack>
        </Container>
      </Section>
      <Section>
        <Container>
          <Stack>
            <h2>Recent posts</h2>
            <Grid>
              {recentPosts.map((post) => (
                <BlogCard key={post.slug} {...post} />
              ))}
            </Grid>
          </Stack>
        </Container>
      </Section>
    </main>
  );
}
