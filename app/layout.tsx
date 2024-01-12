import type {Metadata} from 'next'
import './globals.css'
import PageHeader from "./site/component/page/PageHeader";
import PageHeaderLinks from "./site/component/page/PageHeaderLinks";
import PageContent from "./site/component/page/PageContent";
import PageFooterLinks from "./site/component/page/PageFooterLinks";
import PageFooter from "./site/component/page/PageFooter";
import styles from "./site/component/page/assets/PageContainer.module.css";


import * as React from "react";

export const metadata: Metadata = {
    title: 'Audio Source MVP',
    description: 'Created by Ari Asulin',
}

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
        <body>
        <div className={styles.container}>
            <PageHeader/>
            <PageHeaderLinks/>
            <PageContent>
                {children}
            </PageContent>
            <PageFooterLinks/>
            <PageFooter/>
        </div>
        </body>
        </html>
    )
}
