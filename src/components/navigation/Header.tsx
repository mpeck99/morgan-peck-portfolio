import Container from "../layout/Container/Container";
import Logo from "../ui/Logo";
import ThemeToggle from "../ui/ThemeToggle";

export default function Header() {
    return (
        <header className="site-header">
            <Container>
                <div className="site-header__inner">
                    <a href="/"><Logo /></a>
                    <nav className="site-header__navigation">
                        <ul>
                            <li><a href="/projects">Projects</a></li>
                            <li><a href="/blog">Blog</a></li>
                            <li><a href="/design-system">Design System</a></li>
                            <li><a href="/about">About</a></li>
                        </ul>
                    </nav>
                    <ThemeToggle />
                </div>
            </Container>
        </header>
    )
}