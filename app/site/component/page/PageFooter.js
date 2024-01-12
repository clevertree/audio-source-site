"use client"

import * as React from "react";

import styles from "./assets/PageContainer.module.css";

export default function PageFooter({}) {
    return (
        <div className={styles.footer}>
            <div className={styles.footerText}>
                Created by <a href="https://github.com/clevertree/" target="_blank" rel="noopener noreferrer">Ari
                Asulin</a>
            </div>
        </div>
    );
}
