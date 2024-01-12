"use client"

import React from "react";
import PropTypes from "prop-types";

import {
    ASUIGlobalContext,
    ASUIInputRange, ASUIMenuAction, ASUIMenuBreak, ASUIMenuDropDown, ASUIMenuItem
} from "../../../../components";
import {PromptManager} from "../../../../common/";
import {ProgramLoader} from "../../../../song";

export default class EnvelopeEffectRendererBase extends React.Component {
    /** Property validation **/
    static propTypes = {
        parentMenu: PropTypes.func,
    };

    /** Formatting Callbacks **/
    static formats = {
        ms: value => `${value}ms`
    }

    /** Program Context **/
    static contextType = ASUIGlobalContext;

    getGlobalContext() {
        return this.context;
    }

    setStatus(message) {
        this.context.addLogEntry(message);
    }

    setError(message) {
        this.context.addLogEntry(message, 'error');
    }

    // getViewMode(viewKey)        { this.context.getViewMode(viewKey); }
    // setViewMode(viewKey, mode)  { this.context.setViewMode(viewKey, mode); }

    constructor(props) {
        super(props);
        this.cb = {
            onClick: e => this.toggleOpen(),
            renderMenuRoot: () => this.renderMenuRoot(),
            renderMenuAddVoice: () => this.renderMenuAddVoice(),
            // renderMenuChange: (paramName) => this.renderMenuChange(paramName),
            parameterMenu: {
                // mixer: () => this.renderMenuChange('mixer'),
                attack: () => this.renderMenuChange('attack'),
                hold: () => this.renderMenuChange('hold'),
                decay: () => this.renderMenuChange('decay'),
                sustain: () => this.renderMenuChange('sustain'),
                release: () => this.renderMenuChange('release'),
            },
            changeParam: {
                // mixer:      (newValue) => this.changeParam('mixer', newValue),
                attack: (newValue) => this.changeParam('attack', newValue),
                // hold:       (newValue) => this.changeParam('hold', newValue),
                decay: (newValue) => this.changeParam('decay', newValue),
                sustain: (newValue) => this.changeParam('sustain', newValue),
                release: (newValue) => this.changeParam('release', newValue),
            },
        };
    }


    /** Parameters **/

    getParameters() {
        // const config = this.props.config;
        return [
            // {
            //     label:      'Mixer',
            //     title:      'Edit Volume Mixer',
            //     children:   this.renderInput('mixer'),
            // },
            {
                label: 'Attack',
                title: 'How quickly the sound reaches full volume after the initial note',
                children: this.renderInput('attack'),
            },
            // {
            //     label:      'Hold',
            //     title:      'Edit Envelope Hold',
            //     children:   this.renderInput('hold'),
            // },
            {
                label: 'Decay',
                title: 'How quickly the sound drops to the sustain level after the initial peak',
                children: this.renderInput('decay'),
            },
            {
                label: 'Sustain',
                title: 'The “constant” volume that the sound takes after decay until the note is released',
                children: this.renderInput('sustain'),
            },
            {
                label: 'Release',
                title: 'How quickly the sound fades when a note ends',
                children: this.renderInput('release'),
            },
        ];
    }


    /** Inputs **/

    renderInput(paramName) {
        const config = this.props.config;
        const value = typeof config[paramName] !== "undefined" ? config[paramName] : null;
        switch (paramName) {
            case 'attack': // How quickly the sound reaches full volume after the sound
            case 'hold':
            case 'decay':   // How quickly the sound drops to the sustain level after the initial peak.
            case 'release': // How quickly the sound fades when a note ends (the key is released). Often, this time is very short. An example where the release is longer might be a percussion instrument like a glockenspiel, or a piano with the sustain pedal pressed.
                const timeValue = value || 0;
                return <ASUIInputRange
                    // className="small"
                    min={0}
                    max={4000}
                    value={timeValue}
                    format={EnvelopeEffectRendererBase.formats.ms}
                    onChange={this.cb.changeParam[paramName]}
                />;

            case 'sustain': // The “constant” volume that the sound takes after decay until the note is released. Note that this parameter specifies a volume level rather than a time period.
            default:
                const mixerValue = value || 100;
                return <ASUIInputRange
                    // className="small"
                    min={0}
                    max={100}
                    value={mixerValue}
                    format={ASUIInputRange.formats.percent}
                    onChange={this.cb.changeParam[paramName]}
                />;

        }
    }


    /** Actions **/

    toggleOpen() {
        const open = !this.props.open;
        this.props.setProps(this.props.programID, {open})
    }

    changeParam(paramName, newValue) {
        this.props.config[paramName] = newValue;
    }


    async addVoicePrompt(instrumentClassName, instrumentConfig) {
        const {title} = ProgramLoader.getProgramClassInfo(instrumentClassName);
        if (await PromptManager.openConfirmDialog(`Add voice class '${title}' to this Instrument?`)) {
            this.addVoice(instrumentClassName, instrumentConfig);

        } else {
            this.setError(`New voice canceled: ${instrumentClassName}`);
        }

    }


    /** Menu **/

    renderMenuRoot() {
        return (<>
            <ASUIMenuAction onAction={() => {
            }} disabled>{`Envelope Effect`}</ASUIMenuAction>
            <ASUIMenuBreak/>
            {/*<ASUIMenuDropDown options={() => this.renderMenuChange('mixer')}>Edit Mixer</ASUIMenuDropDown>*/}
            <ASUIMenuDropDown options={() => this.renderMenuChange('attack')}>Edit Attack</ASUIMenuDropDown>
            <ASUIMenuDropDown options={() => this.renderMenuChange('hold')}>Edit Hold</ASUIMenuDropDown>
            <ASUIMenuDropDown options={() => this.renderMenuChange('decay')}>Edit Decay</ASUIMenuDropDown>
            <ASUIMenuDropDown options={() => this.renderMenuChange('sustain')}>Edit Sustain</ASUIMenuDropDown>
            <ASUIMenuDropDown options={() => this.renderMenuChange('release')}>Edit Release</ASUIMenuDropDown>
            {this.props.parentMenu ? <>
                <ASUIMenuBreak/>
                {this.props.parentMenu(this.props.programID)}
            </> : null}
        </>);
    }

    renderMenuAddVoice() {
        return (<>
            <ASUIMenuItem>Add another Voice</ASUIMenuItem>
            <ASUIMenuBreak/>
            {ProgramLoader.getRegisteredPrograms().map(({className, title}, i) =>
                <ASUIMenuAction key={i} onAction={() => this.addVoicePrompt(className)}>{title}</ASUIMenuAction>
            )}
        </>)
        // return Values.renderMenuSelectAvailableInstrument((instrumentClass) => {
        //     this.addVoice(instrumentClass);
        // }, "Add new program as voice")
    }


    renderMenuChange(paramName) {
        const config = this.props.config;
        const value = config[paramName];
        return <ASUIInputRange
            min={0}
            max={100}
            value={typeof value !== "undefined" ? value : 100}
            onChange={(mixerValue) => this.changeParam(mixerValue)}
        />;
    }

}
