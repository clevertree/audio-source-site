"use client"

import * as React from "react";
import {ASUIMarkdown, ASUIPageContainer} from "../app/components";
import {ASComposer} from "../app/composer";

export default class Demo2 extends React.Component {
    render() {
        return (
            <ASUIPageContainer {...this.props}>
                <ASUIMarkdown source={`
                    # Audio Source Composer Demo
                `}/>

                <ASComposer/>
                <ASUIMarkdown source={`
                    Menu->View->Enable Fullscreen to render in landscape mode.
                    
                    [or load the Composer by itself](/composer)
               
                    More instructions coming soon...
                `}/>
            </ASUIPageContainer>
        );
    }
}


