import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";

const BLOG_DIR = path.join(process.cwd(), "src/data/blog");

export type BlogPostFrontmatter = {
  title: string;
  slug: string;
  date: string;
  description: string;
};

export type BlogPostSummary = BlogPostFrontmatter & {
  readingTime: string;
};

export type BlogPost = BlogPostSummary & {
  content: string;
};

function getPostSlugs(): string[] {
  return fs
    .readdirSync(BLOG_DIR)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(/\.mdx$/, ""));
}

function readPostFile(slug: string): { frontmatter: BlogPostFrontmatter; content: string } {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`);
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);

  return {
    frontmatter: {
      title: data.title,
      slug: data.slug ?? slug,
      date: data.date,
      description: data.description,
    },
    content,
  };
}

/** Returns metadata for all posts, sorted newest first. */
export function getAllPosts(): BlogPostSummary[] {
  return getPostSlugs()
    .map((slug) => {
      const { frontmatter, content } = readPostFile(slug);
      return {
        ...frontmatter,
        readingTime: readingTime(content).text,
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

/** Returns full frontmatter + MDX content for a single post. */
export function getPostBySlug(slug: string): BlogPost | null {
  try {
    const { frontmatter, content } = readPostFile(slug);
    return {
      ...frontmatter,
      readingTime: readingTime(content).text,
      content,
    };
  } catch {
    return null;
  }
}

export function getAllPostSlugs(): string[] {
  return getPostSlugs();
}
