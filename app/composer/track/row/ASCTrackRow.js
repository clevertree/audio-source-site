"use client"

import * as React from "react";
import ASCTrackPosition from "../position/ASCTrackPosition";
import ASCTrackInstructionAdd from "../instruction/ASCTrackInstructionAdd";
import ASCTrackDelta from "../delta/ASCTrackDelta";
import ASCTrackRowBase from "./ASCTrackRowBase";

import "./ASCTrackRow.css";

class ASCTrackRow extends ASCTrackRowBase {
    constructor(props) {
        super(props);
        this.cb.onMouseDown = (e) => this.onMouseDown(e);

    }

    render() {
        let className = "asct-row";
        if (this.props.highlight)
            className += ' ' + (this.props.highlight || []).join(' '); // ' highlight';
        const composer = this.getComposer();
        const track = this.getTrack();
        const rowDeltaDuration = composer.state.showTrackRowDurationInTicks ? this.props.deltaDuration : track.formatTrackDuration(this.props.deltaDuration);
        const rowPosition = composer.state.showTrackRowPositionInTicks ? this.props.positionTicks : track.formatDurationAsDecimal(this.props.positionTicks);
        return (
            <div
                // tabIndex={0}
                className={className}
                // onClick={this.cb.onMouseInput}
                onMouseDown={this.cb.onMouseDown}
                onContextMenu={track.cb.onContextMenu}
                // onKeyDown={this.cb.onKeyDown}
            >
                <ASCTrackPosition position={rowPosition}/>
                {this.props.children}
                {this.props.cursor ? <ASCTrackInstructionAdd // TODO: render on hover
                    cursorPosition={this.props.cursorPosition}
                /> : null}
                <ASCTrackDelta duration={rowDeltaDuration}/>
            </div>
        )
    }


}

export default ASCTrackRow;
