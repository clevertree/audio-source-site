// "use client"

import React from "react";
// import { render } from '@testing-library/react';
// import Instruction from "./instruction/Instruction";
// import Storage from "./Storage";
import {InstructionIterator, Song} from "./";
import Values from "../common/values/Values";
import TrackInstructionRowIterator from "../composer/track/instruction/TrackInstructionRowIterator";


// (async () => {
// const { getByText } = render(<App />);
// const linkElement = getByText(/learn react/i);
// expect(linkElement).toBeInTheDocument();
// })();

const startTime = getSeconds();

function getSeconds() {
    var hrTime = process.hrtime();
    const timeMS = hrTime[0] + hrTime[1] / 1000000000;
    return timeMS;
}

class SongTest {
    constructor() {
        this.audioContext = new class {
            get currentTime() {
                return getSeconds() - startTime;
            }
        };
        this.destination = {
            context: this.audioContext
        }
    }

    test() {
        // console.info("Test Started: ", this.constructor.name, __filename);
        // this.testStorage();
        this.testValues();
        const song = this.testSongClass();
        this.testSongPlayback(song);

        // await this.testValues();
        // console.info("Test Complete: ", this.constructor.name);
    }


    testValues() {
        const values = [
            ['A3', 216],
            ['B3', 242],
            ['C4', 257],
            ['D4', 288],
            ['E4', 324],
            ['F4', 343],
            ['G4', 385],
            ['A4', 432],
            ['B4', 485],
        ];
        for (let i = 0; i < values.length; i++) {
            const [note, expFreq] = values[i];
            const freq = (new Values()).parseFrequencyString(note);
            expect((expFreq)).toBe(Math.round(freq));
        }

    }

    // testStorage() {
    //   const s = new Storage();
    //   const songData = s.generateDefaultSong();
    //
    // }

    // async testValues() {
    //     const s = new Song();
    //
    //     const v = new SongValues(s);
    //     v.valueTypes.forEach(valueType => {
    //         v.getValues(valueType, (value, title) => {
    //             // console.info(value, title);
    //         })
    //     })
    //
    // }

    testSongClass() {
        const song = new Song({
            programs: [
                ['polyphony', {
                    voices: [
                        ['empty'],
                    ]
                }],
                ['empty'],
            ]
        });
        const proxiedData = song.getProxiedData();
        proxiedData.title = 'test';
        proxiedData.timeDivision = 30;
        // await song.loadSongData({});


        const testTrackName = 'testTrack';
        song.trackAdd(testTrackName);
        const testTrack = song.data.tracks[testTrackName];

        song.instructionInsertAtIndex(song.getStartTrackName(), 0, '@' + testTrackName);
        song.instructionInsertAtIndex(testTrackName, 0, [0, '!p', 0]);

        // const rootTrack = song.data.tracks.root;
        const TD = song.data.timeDivision;

        // Insert Instructions
        const textNotes = {
            insert: [
                [0, 0, 'Cq4'],
                [10, 10, 'Dq4'],
                [30, 20, 'Dbq4'],
                [60, 30, 'E#4'],
                [100, 40, 'Gbq4'],
                [150, 50, 'Gq4'],
            ],
            position: [
                [0, 0, 'C4'],
                [5, 5, 'D4'],
                [10, 10, 'E#4'],
                [15, 15, 'F4'],
                [20, 20, 'A4'],
                [25, 25, 'B4'],
                [30, 30, 'A3'],
                [TD / 2, '0.5B', 'A4'],
                [TD, '1B', 'A5'],
                [TD * 8, '8B', 'A6'],
            ]
        };
        test(`Insert at index`, () => {
            for (let i = 0; i < textNotes.insert.length; i++) {
                const [expPos, delta, insertNote] = textNotes.insert[i];
                const index = song.instructionInsertAtIndex(testTrackName, testTrack.length, [delta, insertNote]);
                let iterator = InstructionIterator.getIteratorFromSong(song, testTrackName);
                iterator.seekToIndex(index);
                expect(iterator.getPositionInTicks()).toBe(expPos);
            }
        });
        test(`Insert at position`, () => {
            for (let i = 0; i < textNotes.position.length; i++) {
                const [expPos, insPos, insertNote] = textNotes.position[i];
                const index = song.instructionInsertAtPosition(testTrackName, insPos, insertNote);
                let iterator = InstructionIterator.getIteratorFromSong(song, testTrackName);
                iterator.seekToIndex(index);
                expect(iterator.getPositionInTicks()).toBe(expPos);
            }
        });


        // Test Get Instructions

        test(`Song.instructionGetByIndex`, () => {
            [1, 2].forEach(i => {
                const testInstruction = song.instructionDataGetByIndex(testTrackName, i);
                console.assert(song.instructionIndexOf(testTrackName, testInstruction) === i, 'instructionFindIndex');
            });
        });

        // Test Iterator
        // let currentIndex = 0;
        test(`Iterator.nextInstruction`, () => {
            Object.keys(song.data.tracks).forEach(trackName => {
                let iterator = InstructionIterator.getIteratorFromSong(song, trackName);
                let positionInTicks = 0;
                let currentIndex = -1;

                for (const instructionData of iterator) {
                    positionInTicks += instructionData[0];
                    currentIndex++;
                    expect(iterator.getPositionInTicks()).toBe(positionInTicks);
                    expect(iterator.getIndex()).toBe(currentIndex);
                }
            });
        });


        // Test TrackInstructionRowIterator
        // let currentIndex = 0;
        test(`TrackInstructionRowIterator.nextCursorPosition`, () => {
            const quantizedTicks = 5;
            Object.keys(song.data.tracks).forEach(trackName => {
                let rowIterator = TrackInstructionRowIterator.getIteratorFromSong(song, trackName, {
                    quantizedTicks
                });
                let rowCount = 0, cursorPosition = 0;
                let positionInTicks = 0;

                // eslint-disable-next-line no-loop-func
                for (const instruction of rowIterator) {
                    expect(rowIterator.getCursorPosition()).toBe(cursorPosition);
                    expect(rowIterator.getRowCount()).toBe(rowCount);
                    expect(rowIterator.getPositionInTicks()).toBe(positionInTicks);
                    if (!Array.isArray(instruction)) {
                        rowCount++;
                        positionInTicks += instruction;
                        expect(instruction).not.toBeLessThanOrEqual(0);
                    } else {
                        // positionInTicks += instruction.deltaDurationTicks;
                    }
                    cursorPosition++;
                    if (rowCount > 100)
                        break;
                    // console.log(instruction, rowIterator.getPositionInTicks(), rowIterator.nextQuantizationBreakInTicks);
                }
            });
        });


        //
        //
        // // Test Row Iterator
        // // let currentIndex = 0;
        // test(`Row Iterator`, () => {
        //   let row;
        //   let positionInTicks = 0;
        //   const iterator = song.instructionGetIterator(testTrackName);
        //   while(row = iterator.nextInstructionRow()) {
        //     positionInTicks += row[0].deltaDurationTicks;
        //     expect(iterator.getPositionInTicks()).toBe(positionInTicks);
        //   }
        // });
        //
        //
        // test(`Quantized Row Iterator`, () => {
        //   // Test Row Iterator
        //   // let currentIndex = 0;
        //   // let rowIterator = song.instructionGetRowIterator(testTrackName);
        //   const iterator = song.instructionGetQuantizedIterator(testTrackName, 5);
        //   let row;
        //   while(iterator.getPositionInTicks() < 65
        //     && (row = iterator.nextQuantizedInstructionRow())) {
        //     switch(true) {
        //       case iterator.getPositionInTicks() <= 30:
        //       case iterator.getPositionInTicks() === 60:
        //         expect(row.length).toBeGreaterThanOrEqual(1);
        //         break;
        //       default:
        //         expect(row.length).toBe(0);
        //     }
        //     // console.log(row);
        //   }
        // });


        // Tracks
        test(`Add Track`, () => {
            const newRootTrack = song.generateInstructionTrackName('rootTrack');
            song.trackAdd(newRootTrack, ['A', 'B', 'C', 10, 'D']);
            song.trackRemove(newRootTrack);
        });

        test(`Song Length test`, () => {
            const songLength = song.getSongLengthInSeconds();
            expect(songLength).toBeGreaterThan(0);
            // console.info("Test song: ", Math.round(songLength * 10000) / 10000 + 's');

            // TODO: set position

            song.setPlaybackPosition(0.01);
            song.setPlaybackPosition(0.1);
            song.setPlaybackPosition(1);
            song.setPlaybackPositionInTicks(10);
            song.setPlaybackPositionInTicks(100);
            song.setPlaybackPositionInTicks(1000);

            // Get Song Info
            if (song.getSongPlaybackPosition() === 0) throw new Error("songPlaybackPosition");
            if (song.getSongLengthInSeconds() === 0) throw new Error("getSongLengthInSeconds()");
            // console.assert(r.getSongPositionInTicks() > 0, "getSongPositionInTicks");

            song.setPlaybackPosition(0);
        });

        // const playback = song.play(this.destination);
        // await playback.awaitPlaybackReachedEnd();

        // Delete Instructions
        // while(rootTrack.length > 5)
        //   song.instructionDeleteAtIndex(testTrackName, 0);


        // console.assert(r.getSongPositionFromTicks() === 0, "getSongPositionInSeconds");
        // console.assert(r.getSongPositionInTicks() === 0, "getSongPositionInTicks");
        return song;
    }

    testSongPlayback(song) {
        song.play(this.destination);
        // playback.awaitPlaybackReachedEnd();
    }
}

new SongTest().test();
