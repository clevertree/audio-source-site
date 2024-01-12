"use client"

import * as React from "react";

import styles from "./assets/PageContainer.module.css";

import {pageList} from "@/app/pageList";

export default function PageHeaderLinks({}) {
    const currentPath = null;
    const links = [];
    pageList.forEach(([path, title, headerLink, footerLink], i) => {
        if (headerLink)
            links.push([path, title]);
    });
    return (
        <div className={styles.headerLinks}>
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
