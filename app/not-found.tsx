import type { Metadata } from "next";
import Link from "next/link";
import { Marca } from "@/components/Marca.tsx";
import { VolantinPerdido } from "@/components/VolantinPerdido.tsx";
import styles from "./not-found.module.css";

export const metadata: Metadata = {
  title: "Página no encontrada · Encumbra",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand} aria-label="Encumbra, inicio">
          <Marca />
        </Link>
      </header>
      <main className={styles.main}>
        <div className={styles.illustration} aria-hidden="true">
          <VolantinPerdido />
          <span className={styles.number}>404</span>
        </div>
        <div className={styles.message}>
          <h1>Se nos fue<br />el hilo.</h1>
          <p>Esta página no existe o cambió de lugar. Volvamos a buscar un buen parque para encumbrar.</p>
          <nav className={styles.actions} aria-label="Volver a Encumbra">
            <Link href="/app" className={styles.primary}>Ver los parques</Link>
            <Link href="/" className={styles.secondary}>Volver al inicio</Link>
          </nav>
        </div>
      </main>
      <footer className={styles.footer}>Error 404 · Página no encontrada</footer>
    </div>
  );
}
