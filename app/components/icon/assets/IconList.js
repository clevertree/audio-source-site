export default class IconList {
    getSource(sourceName) {
        if (icons[sourceName])
            return icons[sourceName];
        throw new Error("Unknown icon: " + sourceName + "\n Icon list: " + Object.keys(icons).join(', '));
    }
}

const icons = {
    'close': require('./img/close.icon.png').default,

    'menu': require('./img/menu.icon.png').default,
    'play': require('./img/play.icon.png').default,
    'pause': require('./img/pause.icon.png').default,
    'stop': require('./img/stop.icon.png').default,
    'next': require('./img/next.icon.png').default,
    'file-save': require('./img/file-save.icon.png').default,
    'file-load': require('./img/file-load.icon.png').default,


    'insert': require('./img/insert.icon.png').default,
    'remove': require('./img/remove.icon.png').default,

    'config': require('./img/config.icon.png').default,
    'source': require('./img/source.icon.png').default,

    'lfo-parameter': require('./img/effect-envelope.icon.png').default,

    'effect-envelope': require('./img/effect-envelope.icon.png').default,

    'instrument-oscillator': require('./img/instrument-oscillator.icon.png').default,
    'instrument-audiobuffer': require('./img/instrument-audiobuffer.icon.png').default,

    'file-song': require('./img/file-song.icon.png').default,

}
