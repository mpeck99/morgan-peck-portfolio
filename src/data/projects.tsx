import { Leaf, Accessibility, Palette } from "lucide-react";

export const projects = [
  {
    title: "Accessibility Blog",
    icon: <Accessibility />,
    description:
      "A collection of articles exploring web accessibility, frontend development, and the practices behind building more inclusive digital experiences.",
    link: {
      title: "View my blog",
      url: "/projects/accessibility-blog",
    },
    image: {
      url: "/images/icon-accessibility.svg",
    },
  },
  {
    title: "Plant Hub",
    icon: <Leaf />,
    description: "A plant care dashboard for tracking plants, watering schedules, and care notes.",
    link: {
      title: "Learn more about my plans",
      url: "/projects/plant-hub",
    },
    image: {
      url: "./images/rubber-plant.png",
    },
  },

  {
    title: "Design System",
    icon: <Palette />,
    description: "A reusable component library with tokens, patterns, and documentation.",
    link: {
      title: "View the design system",
      url: "/projects/design-system",
    },
    image: {
      url: "/images/development-icon.svg",
    },
  },
];
