
class TestInstrument {
    constructor(config={}) {
        // console.log(this.constructor.name, config);
        this.config = config;
    }


    /** Playback **/

    playFrequency(destination, frequency, startTime, duration=null, velocity=null, onended=null) {
        if(!duration)
            console.warn("Invalid Duration: ", duration);
        // console.info('playFrequency(', frequency, startTime, duration, velocity, ')')
    }

    static stopPlayback() {

    }

}

export default TestInstrument;


