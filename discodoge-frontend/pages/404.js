import React from "react";
import Layout from "@/components/Layout";
import styles from "@/styles/404.module.css";
import Link from "next/link";
import { FaExclamationTriangle } from "react-icons/fa";

function NotFound() {
  return (
    <Layout title="Page Not Found">
      <div className={styles.error}>
        <h1>
          <FaExclamationTriangle /> 404
        </h1>
        <h4>Sorry, there are no Doges here</h4>
        <Link href="/">Go Back Home</Link>
      </div>
    </Layout>
  );
}

export default NotFound;
