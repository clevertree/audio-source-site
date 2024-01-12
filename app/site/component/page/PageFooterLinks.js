"use client"

import * as React from "react";

import styles from "./assets/PageContainer.module.css";


import {pageList} from "@/app/pageList";

export default function PageFooterLinks({}) {
    const currentPath = null;

    const links = [];
    pageList.forEach(([path, title, headerLink, footerLink], i) => {
        if (footerLink)
            links.push([path, title]);
    });

    return (
        <div className={styles.footerLinks}>
            {links.map(([href, title], i) => {
                const props = {
                    href
                };
                if (currentPath === href)
                    props.className = 'selected';
                return <a key={i} {...props}>{title}</a>
            })}
        </div>
    );

}
