import styles from './Header.module.scss'
import Container from "../layout/Container/Container";
import Logo from "../ui/Logo";
import ThemeToggle from "../ui/ThemeToggle";
import Link from 'next/link';

export default function Header() {
    return (
        <header className={styles["site-header"]}>
            <Container>
                <div className={styles["site-header__inner"]}>
                    <Link href="/"><Logo /></Link>
                    <nav className={styles["site-header__navigation"]}>
                        <ul>
                            <li><Link href="/projects">Projects</Link></li>
                            <li><Link href="/blog">Blog</Link></li>
                            <li><Link href="/design-system">Design System</Link></li>
                            <li><Link href="/about">About</Link></li>
                        </ul>
                    </nav>
                    <ThemeToggle />
                </div>
            </Container>
        </header>
    )
}