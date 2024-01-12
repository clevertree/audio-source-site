"use client"

import * as React from "react";

import styles from "./assets/PageContainer.module.css";

export default function PageFooterLinks({children}) {
    return (
        <div className={styles.content}>
            {children}
        </div>
    );
}
