import React from "react";
import Link from "next/link";
import styles from "@/styles/Footer.module.css";

function Footer() {
  return (
    <footer className={styles.footer}>
      <p>Copyright &copy; Disco Doge 2022</p>
      <p>
        <Link href="/about">About this project</Link>
      </p>
    </footer>
  );
}

export default Footer;
