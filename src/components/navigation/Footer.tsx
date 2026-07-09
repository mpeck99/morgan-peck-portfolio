import Container from "../layout/Container/Container";
import Logo from "../ui/Logo";

export default function Footer() {
    const currentYear = new Date().getFullYear()
    return (
        <footer className="site-footer">
            <Container>
                <div className="site-footer__inner">
                    <a href="/"><Logo /></a>
                    <nav className="site-footer__navigation">
                        <ul>
                            <li><a href="/projects">Projects</a></li>
                            <li><a href="/blog">Blog</a></li>
                            <li><a href="/design-system">Design System</a></li>
                            <li><a href="/about">About</a></li>
                        </ul>
                    </nav>
                    <nav className="site-footer__contact">
                        <ul>
                            <li><a href="https://www.linkedin.com/in/morganlpeck/">LinkedIn</a></li>
                            <li><a href="https://github.com/mpeck99">Github</a></li>
                        </ul>
                    </nav>
                    <p>&copy; {currentYear}</p>
                </div>
            </Container>
        </footer>
    )
}