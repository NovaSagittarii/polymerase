// // yjs webrtc tends to desync
// // pnpm add y-webrtc y-indexeddb yjs

// import * as Y from 'yjs'
// import { WebrtcProvider } from "y-webrtc";
// import { IndexeddbPersistence } from "y-indexeddb";

// /*
// setup signaling server

// git clone https://github.com/yjs/y-webrtc.git
// cd y-webrtc
// docker build -t ysig .
// docker run -d -p 8080:8080 ysig
// */

// const config = {
//     roomName: "room-name-tmp",
//     roomPassword: "room-password-tmp",
//     docName: "main-doc",
// }
// // localStorage.log = 'true'

// export async function test() {
//     const ydoc = new Y.Doc();

//     const ymap = ydoc.get('map0', Y.Map) as Y.Map<string>;
//     ymap.observe(() => {
//         console.log("%c" + ymap.get("raw")?.toString().substring(0, 36), 'background: #222; color: #bada55');
//         navigator.storage.estimate().then(x => console.log(`${((x.usage || 0) / 1e6).toFixed(2)}MB`));
//     });

//     await new Promise((res) => setTimeout(res, 5000 * Math.random()));
//     const wrtcProvider = new WebrtcProvider(config.roomName, ydoc, {
//         password: config.roomPassword,
//         signaling: ['ws://localhost:8080'],
//         filterBcConns: false,
//     });
//     await new Promise((res) => {
//         const idb = new IndexeddbPersistence(config.docName, ydoc);
//         idb.on("synced", () => {
//             console.log('idb synced');
//             res(idb);
//         });
//     });
//     await new Promise((res) => {
//         console.log("waiting for webrtc sync");
//         wrtcProvider.on("synced", () => {
//             console.log("webrtc synced");
//             res(wrtcProvider);
//         });
//         // provider.on("peers", console.log);
//     });

//     const yarray = ydoc.get('array', Y.Array) as Y.Array<number>;
//     console.log([...yarray]);
//     if (yarray.length < 10) yarray.insert(0, new Array(10).fill(0));
//     console.log([...yarray]);

//     // await new Promise((res) => setTimeout(res, 5000));
//     console.log("Start");

//     let offset = ~~(Math.random() * 10);
//     ymap.set("raw", "INIT" + offset);
//     let i = 0;
//     const id = setInterval(() => {
//         const payload = new Array(~~(1e5 / 36)).fill(0).map(() => window.crypto.randomUUID()).join('');
//         console.log(`Transact ${offset} ${i % 5} ${payload.length}`);
//         ydoc.transact(() => {
//             ++i;
//             ymap.set("raw", payload);
//             // ymap.set(`raw${~~(Math.random() * 1000)}`, payload.substring(0, 1e4));
//             // for (let z = 0; z < 1e5; ++z) ymap.set(`raw${z}`, `${i}`);
//             console.log("res", ymap.get("raw")?.length);

//             // ydoc.getArray('array').delete(offset); // []
//             // ydoc.getArray('array').insert(offset, [i]); // [1]
//         });
//     }, (Math.random() * 1 + 1) * 1000);

//     yarray.observe(event => {
//         // Log a delta every time the type changes
//         // Learn more about the delta format here: https://quilljs.com/docs/delta/
//         // console.log('delta:', event.changes.delta)
//         // console.log([...yarray]);
//     })

//     return () => {
//         clearInterval(id);
//     }
// }
