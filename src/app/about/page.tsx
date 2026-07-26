import Container from "@/components/layout/Container/Container";
import Section from "@/components/layout/Section/Section";
import Stack from "@/components/layout/Stack/Stack";

export default function About() {
  return (
    <main>
      <Section>
        <Container>
          <Stack>
            <h1>About</h1>
            <h2>Credits</h2>
            <ul>
              <li>
                <a href="https://storyset.com/work">Work illustrations by Storyset</a>
                <li>
                  <a href="https://storyset.com/data">Data illustrations by Storyset</a>
                </li>
              </li>
            </ul>
          </Stack>
        </Container>
      </Section>
    </main>
  );
}
