"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import styles from './Header.module.scss'
import Container from "../layout/Container/Container";
import Logo from "../ui/Logo";
import ThemeToggle from "../ui/ThemeToggle";
import Link from 'next/link';

const NAV_LINKS = [
    { href: "/projects", label: "Projects" },
    { href: "/blog", label: "Blog" },
    { href: "/design-system", label: "Design System" },
    { href: "/about", label: "About" },
];

export default function Header() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <header className={styles["site-header"]}>
            <Container>
                <div className={styles["site-header__inner"]}>
                    <Link href="/" onClick={() => setIsOpen(false)}><Logo /></Link>

                    <nav className={styles["site-header__navigation"]}>
                        <ul>
                            {NAV_LINKS.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href}>{link.label}</Link>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <div className={styles["site-header__actions"]}>
                        
                        <button
                            type="button"
                            className={styles["site-header__toggle"]}
                            onClick={() => setIsOpen((open) => !open)}
                            aria-expanded={isOpen}
                            aria-controls="mobile-nav"
                            aria-label={isOpen ? "Close menu" : "Open menu"}
                        >
                            {isOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                        <ThemeToggle />
                    </div>
                </div>
            </Container>

            {isOpen && (
                <nav id="mobile-nav" className={styles["site-header__mobile-nav"]}>
                    <ul>
                        {NAV_LINKS.map((link) => (
                            <li key={link.href}>
                                <Link href={link.href} onClick={() => setIsOpen(false)}>
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            )}
        </header>
    )
}
