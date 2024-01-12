"use client"

import React from "react";

export default class ProgramLoader {
    constructor(song) {
        this.song = song;
        // this.audioContext = audioContext;
        // this.destinations = new WeakMap();
    }


    // loadInstanceFromDestination(programID, destination) {
    //     return this.loadInstanceFromID(programID);
    //     // let programs = this.destinations.get(destination);
    //     // if(!programs) {
    //     //     programs = {};
    //     //     this.destinations.set(destination, programs);
    //     // }
    //     // if(typeof programs[programID] === "undefined")
    //     //     programs[programID] = this.programLoadInstance(programID);
    //
    //     // return programs[programID];
    // }

    getData(programID, proxiedData = true) {
        let songData = proxiedData
            ? this.song.getProxiedData()
            : this.song.data;
        return songData.programs[programID];
    }


    getClassName(programID) {
        const [className] = this.getData(programID);
        return className;
    }

    getConfig(programID, proxiedData = true) {
        const [, config] = this.getData(programID, proxiedData);
        return config;
    }

    getClass(programID) {
        const className = this.getClassName(programID);
        const {classProgram} = ProgramLoader.getProgramClassInfo(className);
        return classProgram;
    }

    loadInstanceFromID(programID) {
        const program = this.getData(programID, false);
        if (!program)
            throw new Error("Invalid Program ID: " + programID + ` (${typeof programID})`)
        const [className, config] = program;
        return ProgramLoader.loadInstance(className, config);
    }


    /** @deprecated **/
    programLoadRenderer(programID, props = {}) {
        const program = this.getData(programID);
        const [className, config] = program;
        const {classRenderer: Renderer} = ProgramLoader.getProgramClassInfo(className);
        return <Renderer
            programID={programID}
            program={program}
            config={config}
            {...props}
        />;
    }


    /** Actions **/

    static stopProgramPlayback(programID) {
        const classes = ProgramLoader.registeredProgramClasses;
        const {classProgram} = classes[programID];
        if (!classProgram.stopPlayback) {
            console.warn(classProgram.name + " has no static stopPlayback method");
        } else {
            classProgram.stopPlayback();
        }
    }

    static stopAllPlayback() {
        const classes = ProgramLoader.registeredProgramClasses;
        for (let i = 0; i < classes.length; i++) {
            this.stopProgramPlayback(i);
        }
    }

    static unloadAllPrograms() {
        const classes = ProgramLoader.registeredProgramClasses;
        for (let i = 0; i < classes.length; i++) {
            const {classProgram} = classes[i];
            if (!classProgram.unloadAll) {
                // TODO: use instance, not static
                // console.warn(classProgram.name + " has no static unloadAll method");
                continue;
            }
            classProgram.unloadAll();
        }

    }

    /** Menu **/


    /** Static **/

    static loadInstance(className, config = {}) {
        const {classProgram} = this.getProgramClassInfo(className);
        return new classProgram(config);
    }

    static getProgramClassInfo(className) {
        if (typeof className !== "string")
            throw new Error("Invalid class name: " + typeof className);
        const classNameLC = className.toLowerCase();
        const classes = ProgramLoader.registeredProgramClasses;
        for (let i = 0; i < classes.length; i++) {
            const classInfo = classes[i];
            if (classInfo.className.toLowerCase() === classNameLC)
                return classInfo;
        }
        throw new Error(`Program class '${className}' was not found`);
    }


    static addProgramClass(className, classProgram, classRenderer = null, title = null) {
        // const className = classProgram.name;
        const classes = ProgramLoader.registeredProgramClasses;
        title = title || classProgram.name;
        classes.push({classProgram, classRenderer, className, title})
    }

    static getRegisteredPrograms() {
        // console.log('programs', programs)
        return ProgramLoader.registeredProgramClasses;
    }

    // const classes = ProgramLoader.registeredProgramClasses;
    // const results = [];
    // for(let i=0; i<classes.length; i++) {
    //     const classInfo = classes[i];
    //     const {classObject, name, config} = classInfo;
    //     const result = callback(classObject, name, config);
    //     if(result !== null) results.push(result);
    //     if(result === false) break;
    // }
    // return results;
    // }
    static registeredProgramClasses = []
}


