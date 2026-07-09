import Container from "@/components/layout/Container/Container";
import Grid from "@/components/layout/Grid/Grid";
import Section from "@/components/layout/Section/Section";
import Stack from "@/components/layout/Stack/Stack";

export default function Home() {
  return (
    <main>
      <Section>
        <Container>
          <Stack>
            <h1>UX Engineer</h1>
            <p>I build accessible, user-focused digital experiences</p>
          </Stack>
        </Container>
      </Section>
      <Section>
        <Container>
          <Stack>
            <h2>Featured Projects</h2>
            <Grid>
               <p>Stay tuned for my featured projects</p>
            </Grid>
          </Stack>
        </Container>
      </Section>
      <Section>
        <Container>
          <Stack>
            <h2>About me</h2>
            <p>Stay tuned for more about me</p>
          </Stack>
        </Container>
      </Section>
    </main>
  );
}
