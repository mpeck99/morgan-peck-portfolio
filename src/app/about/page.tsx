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
              </li>
              <li>
                <a href="https://storyset.com/data">Data illustrations by Storyset</a>
              </li>
              <li>
                <a href="https://www.flaticon.com/free-icons/splash" title="Splash icons">
                  Splash icons created by Smashicons - Flaticon
                </a>
              </li>
              <li>
                <a href="https://www.flaticon.com/free-icons/tomato" title="tomato icons">
                  Tomato icons created by Flat Icons Design - Flaticon
                </a>
              </li>
              <li>
                <a href="https://www.flaticon.com/free-icons/star" title="star icons">
                  Star icons created by Pixel perfect - Flaticon
                </a>
              </li>
            </ul>
          </Stack>
        </Container>
      </Section>
    </main>
  );
}
