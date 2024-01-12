import PeriodicWaveLoader from "./loader/PeriodicWaveLoader";
import {ProgramLoader, Values} from "../../../song/";
import ArgType from "../../../song/instruction/argument/ArgType";


export default class OscillatorInstrument {
    /** Command Args **/
    static argTypes = {
        playFrequency: [ArgType.destination, ArgType.frequency, ArgType.startTime, ArgType.duration, ArgType.velocity, ArgType.onended],
        pitchBendTo: [ArgType.frequency, ArgType.startTime, ArgType.duration, ArgType.onended],
    };

    /** Command Aliases **/
    static commandAliases = {
        pf: "playFrequency",
        bt: "pitchBendTo",
    }

    static defaultEnvelope = ['envelope', {}];


    constructor(config = {}) {
        // console.log('OscillatorInstrument', config);
        this.config = config;
        this.playingOSCs = [];
        this.loadedPeriodicWave = null;


        // Envelope
        const [voiceClassName, voiceConfig] = this.config.envelope || OscillatorInstrument.defaultEnvelope;
        let {classProgram: envelopeClass} = ProgramLoader.getProgramClassInfo(voiceClassName);
        this.loadedEnvelope = new envelopeClass(voiceConfig);


        // LFOs
        this.loadedLFOs = [];
        const lfos = this.config.lfos || [];
        for (let lfoID = 0; lfoID < lfos.length; lfoID++) {
            const lfo = lfos[lfoID];
            const [voiceClassName, voiceConfig] = lfo;
            let {classProgram: lfoClass} = ProgramLoader.getProgramClassInfo(voiceClassName);
            this.loadedLFOs[lfoID] = new lfoClass(voiceConfig);
        }


        this.activeMIDINotes = []
    }

    setPeriodicWave(oscillator, periodicWave) {
        if (!periodicWave instanceof PeriodicWave)
            throw new Error("Invalid Periodic Wave: " + typeof periodicWave);
        oscillator.setPeriodicWave(periodicWave)
    }

    /** Async loading **/

    async waitForAssetLoad() {
        if (this.config.url) {
            const service = new PeriodicWaveLoader();
            await service.loadPeriodicWaveFromURL(this.config.url);
        }
    }

    /** Playback **/

    addEnvelopeDestination(destination, startTime, velocity) {
        let amplitude = 1;
        if (typeof this.config.mixer !== "undefined")
            amplitude = this.config.mixer / 100;
        if (velocity !== null)
            amplitude *= parseFloat(velocity || 127) / 127;
        return this.loadedEnvelope.createEnvelope(destination, startTime, amplitude);
    }

    // https://developer.mozilla.org/en-US/docs/Web/API/OscillatorNode
    createOscillator(destination, type) {
        const audioContext = destination.context;

        let source;
        switch (type) {
            case 'sine':
            case 'square':
            case 'sawtooth':
            case 'triangle':
                source = audioContext.createOscillator();
                source.type = type;
                // Connect Source
                source.connect(destination);
                return source;

            case 'pulse':
                return this.createPulseWaveShaper(destination)

            // case null:
            case 'custom':
                source = audioContext.createOscillator();

                // Load Sample
                const service = new PeriodicWaveLoader();
                let periodicWave = service.tryCache(this.config.url);
                if (periodicWave) {
                    this.setPeriodicWave(source, periodicWave);
                } else {
                    service.loadPeriodicWaveFromURL(this.config.url)
                        .then(periodicWave => {
                            console.warn("Note playback started without an audio buffer: " + this.config.url);
                            this.setPeriodicWave(source, periodicWave);
                        });
                }
                // Connect Source
                source.connect(destination);
                return source;

            default:
                throw new Error("Unknown oscillator type: " + type);
        }

    }

    createPulseWaveShaper(destination) {
        const audioContext = destination.context;
        // Use a normal oscillator as the basis of our new oscillator.
        const source = audioContext.createOscillator();
        source.type = "sawtooth";

        const {pulseCurve, constantOneCurve} = getPulseCurve();
        //Use a normal oscillator as the basis of our new oscillator.

        //Shape the output into a pulse wave.
        const pulseShaper = audioContext.createWaveShaper();
        pulseShaper.curve = pulseCurve;
        source.connect(pulseShaper);

        //Use a GainNode as our new "width" audio parameter.
        const widthGain = audioContext.createGain();
        widthGain.gain.value = 0.5; //Default width.
        source.width = widthGain.gain; //Add parameter to oscillator node.
        widthGain.connect(pulseShaper);

        //Pass a constant value of 1 into the widthGain – so the "width" setting
        //is duplicated to its output.
        const constantOneShaper = audioContext.createWaveShaper();
        constantOneShaper.curve = constantOneCurve;
        source.connect(constantOneShaper);
        constantOneShaper.connect(widthGain);

        pulseShaper.connect(destination);

        return source;
    }


    playFrequency(destination, frequency, startTime, duration = null, velocity = null, onended = null) {
        let endTime;
        const config = this.config;
        const audioContext = destination.context;

        // Start Time
        if (startTime === null)
            startTime = audioContext.currentTime;
        else if (startTime < 0)
            startTime = 0; // TODO: adjust buffer offset.

        // Duration
        if (typeof duration === "number") {
            endTime = startTime + duration;
            if (endTime < audioContext.currentTime) {
                console.info("Skipping note: ", startTime, endTime, audioContext.currentTime)
                return false;
            }
        }
        console.log('playFrequency', frequency, startTime, duration, velocity, config);


        // Filter voice playback
        if (this.config.keyLow && Values.instance.parseFrequencyString(this.config.keyLow) > frequency)
            return false;
        if (this.config.keyHigh && Values.instance.parseFrequencyString(this.config.keyHigh) < frequency)
            return false;

        // Envelope

        const gainNode = this.addEnvelopeDestination(destination, startTime, velocity);
        destination = gainNode;


        // Oscillator
        const source = this.createOscillator(destination, this.config.type);
        source.frequency.value = frequency;    // set Frequency (hz)
        if (typeof config.detune !== "undefined")
            source.detune.value = config.detune;


        // LFOs

        const activeLFOs = [];
        for (const LFO of this.loadedLFOs) {
            activeLFOs.push(LFO.createLFO(source, frequency, startTime, null, velocity));
        }


        // Start Source
        source.start(startTime);
        // console.log("Note Start: ", config.url, frequency);

        // Set up Note-Off
        source.noteOff = (endTime = audioContext.currentTime) => {
            gainNode.noteOff(endTime); // End Envelope on the note end time

            // Get the source end time, when the note actually stops rendering
            const sourceEndTime = this.loadedEnvelope.increaseDurationByRelease(endTime);
            for (const lfo of activeLFOs) {
                lfo.noteOff(sourceEndTime); // End LFOs on the source end time.
            }
            // console.log('noteOff', {frequency, endTime, sourceEndTime});

            // Stop the source at the source end time
            source.stop(sourceEndTime);
        };

        // Set up on end.
        source.onended = () => {
            if (hasActiveNote(source)) {
                removeActiveNote(source);
                activeLFOs.forEach(lfo => lfo.stop());
                onended && onended();
            }
            // console.log("Note Ended: ", config.url, frequency);
        }

        // Add Active Note
        activeNotes.push(source);

        // If Duration, queue note end
        if (duration !== null) {
            if (duration instanceof Promise) {
                // Support for duration promises
                duration.then(() => source.noteOff())
            } else {
                source.noteOff(startTime + duration);
            }
        }

        // Return source
        return source;
    }


    /** MIDI Events **/

    playMIDIEvent(destination, eventData, onended = null) {
        let newMIDICommand;
        // console.log('playMIDIEvent', eventData);
        switch (eventData[0]) {
            case 144:   // Note On
                newMIDICommand = Values.instance.getCommandFromMIDINote(eventData[1]);
                const newMIDIFrequency = Values.instance.parseFrequencyString(newMIDICommand);
                let newMIDIVelocity = Math.round((eventData[2] / 128) * 100);
                const source = this.playFrequency(destination, newMIDIFrequency, null, null, newMIDIVelocity);
                if (source) {
                    if (this.activeMIDINotes[newMIDICommand])
                        this.activeMIDINotes[newMIDICommand].noteOff();
                    this.activeMIDINotes[newMIDICommand] = source;
                }
                return source;

            case 128:   // Note Off
                newMIDICommand = Values.instance.getCommandFromMIDINote(eventData[1]);
                if (this.activeMIDINotes[newMIDICommand]) {
                    this.activeMIDINotes[newMIDICommand].noteOff();
                    delete this.activeMIDINotes[newMIDICommand];
                    return true;
                } else {
                    console.warn("active note missing: ", newMIDICommand, eventData);
                    return false;
                }

            default:
                break;
        }
    }

    /** Pitch Bend **/

    pitchBendTo(frequency, startTime, duration) {
        // if(typeof frequency === "string")
        //     frequency = Values.instance.parseFrequencyString(frequency);
        const values = [frequency, frequency * 2]

        for (let i = 0; i < this.playingOSCs.length; i++) {
            this.playingOSCs[i].frequency.setValueCurveAtTime(values, startTime, duration)
        }
    }

    /** Static **/

    static stopPlayback() {
        for (const activeNote of activeNotes)
            activeNote.stop();
        activeNotes = [];
    }

    static unloadAll() {
        // this.waveURLCache = {}
        // Unload all cached samples from this program type
    }
}


let activeNotes = [];

function removeActiveNote(source) {
    const i = activeNotes.indexOf(source);
    if (i !== -1)
        activeNotes.splice(i, 1);
}

function hasActiveNote(source) {
    return activeNotes.indexOf(source) !== -1;
}


// Calculate the WaveShaper curves so that we can reuse them.
let pulseCurve = null, constantOneCurve = null;

function getPulseCurve() {
    if (!pulseCurve) {
        pulseCurve = new Float32Array(256);
        for (let i = 0; i < 128; i++) {
            pulseCurve[i] = -1;
            pulseCurve[i + 128] = 1;
        }
        constantOneCurve = new Float32Array(2);
        constantOneCurve[0] = 1;
        constantOneCurve[1] = 1;
    }
    return {pulseCurve, constantOneCurve};
}
