import { prisma } from "@/lib/prisma";

interface ThemeSetting {
  primary?: string;
  secondary?: string;
  gold?: string;
}

export async function ThemeStyleInjector() {
  let theme: ThemeSetting = {};
  try {
    const setting = await prisma.setting.findUnique({ where: { key: "theme" } });
    if (setting) theme = JSON.parse(setting.value);
  } catch {
    theme = {};
  }

  if (!theme.primary && !theme.secondary && !theme.gold) return null;

  const css = `:root {
    ${theme.primary ? `--color-primary: ${theme.primary};` : ""}
    ${theme.secondary ? `--color-secondary: ${theme.secondary};` : ""}
    ${theme.gold ? `--color-gold: ${theme.gold};` : ""}
  }`;

  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
