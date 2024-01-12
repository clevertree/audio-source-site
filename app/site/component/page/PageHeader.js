"use client"

import * as React from "react";

import styles from "./assets/PageContainer.module.css";

export default function PageHeader() {
    return (
        <div className={styles.header}>
            <a href="/">
                <img src={require("./assets/img/header.png").default.src} className="aspage-header-image" alt="Header"/>
            </a>
        </div>
    );
}
