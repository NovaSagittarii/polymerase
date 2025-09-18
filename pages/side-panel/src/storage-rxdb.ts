// // pnpm add rxdb rxjs

// import {
//     createRxDatabase,
//     defaultConflictHandler,
//     RxConflictHandler
// } from 'rxdb/plugins/core';
// import {
//     replicateWebRTC,
//     getConnectionHandlerSimplePeer
// } from 'rxdb/plugins/replication-webrtc';
// import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
// import { getRxStorageMemory } from 'rxdb/plugins/storage-memory';

// import { wrappedValidateZSchemaStorage } from 'rxdb/plugins/validate-z-schema';

// // import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
// // import { addRxPlugin } from 'rxdb/plugins/core';
// // addRxPlugin(RxDBDevModePlugin);

// export const customConflictHandler: RxConflictHandler<any> = {
//     isEqual(a, b, _ctx) {
//         return defaultConflictHandler.isEqual(a, b, _ctx);
//     },
//     resolve(i) {
//         const { realMasterState, newDocumentState } = i;

//         if (!realMasterState.timestamp || !newDocumentState.timestamp) {
//             console.warn(realMasterState, newDocumentState);
//             console.warn('Conflict handler requires "timestamp" field in schema.');
//             return realMasterState;
//         }

//         const masterTime = new Date(realMasterState.timestamp).getTime();
//         const newTime = new Date(newDocumentState.timestamp).getTime();

//         // If the new document is more recent, it wins.
//         if (newTime > masterTime) {
//             return newDocumentState;
//         }

//         return realMasterState;
//     }
// };

// export async function test() {
//     // create a database
//     const db = await createRxDatabase({
//         name: 'heroesdb', // the name of the database
//         storage: wrappedValidateZSchemaStorage({ storage: getRxStorageMemory() }),
//     });
//     console.log("DB", db);

//     if (!db.todos) {
//         console.log("CREATE DB");
//         await db.addCollections({
//             // name of the collection
//             todos: {
//                 // we use the JSON-schema standard
//                 schema: {
//                     version: 0,
//                     primaryKey: 'id',
//                     type: 'object',
//                     properties: {
//                         id: {
//                             type: 'string',
//                             maxLength: 100 // <- the primary key must have maxLength
//                         },
//                         name: {
//                             type: 'string'
//                         },
//                         done: {
//                             type: 'boolean'
//                         },
//                         timestamp: {
//                             type: 'string',
//                             format: 'date-time'
//                         }
//                     },
//                     required: ['id', 'name', 'done', 'timestamp']
//                 },
//                 conflictHandler: customConflictHandler,
//             }
//         });
//     }
//     db.todos.update$.subscribe(x => console.log("UPD", x));
//     db.todos.insert$.subscribe(x => console.log("INS", x));

//     const replicationPool = await replicateWebRTC({
//         collection: db.todos,
//         topic: 'my-p2p-room-8592033h4hks',
//         isPeerValid: async (peer) => {
//             console.log("peer", peer);
//             return peer.writable && peer.readable;
//         },
//         connectionHandlerCreator: getConnectionHandlerSimplePeer({
//             // signalingServerUrl: 'ws://localhost:8080',
//             signalingServerUrl: 'wss://signaling.rxdb.info/',

//             // Node.js requires a polyfill for WebRTC & WebSocket
//             // wrtc: require('node-datachannel/polyfill'),
//             // webSocketConstructor: require('ws').WebSocket
//         }),
//         pull: {}, // optional pull config
//         push: {}, // optional push config
//     });
//     let lastWrtcError = Date.now();
//     replicationPool.error$.subscribe(err => {
//         // console.error('WebRTC Error:', err);
//         lastWrtcError = Date.now();
//     });
//     replicationPool.peerStates$.subscribe(x => console.log("WebRTC Peers:", x));
//     await replicationPool.awaitFirstPeer();

//     await new Promise((res) => setTimeout(res, 5000));
//     // const myDocument = await db.todos.upsert({
//     //     id: 'todo' + ~~(Math.random() * 100),
//     //     name: 'Learn RxDB',
//     //     done: false,
//     //     timestamp: new Date().toISOString()
//     // });
//     await new Promise((res) => setTimeout(res, 5000));

//     // const foundDocuments = await db.todos.find({
//     //     selector: {
//     //         done: {
//     //             $eq: false
//     //         }
//     //     }
//     // }).exec();
//     // console.log("found", foundDocuments.map(x => x._data.id));

//     const id = setInterval(async () => {
//         if (Date.now() - lastWrtcError <= 10000) return;
//         if (replicationPool.peerStates$.value.size === 0) return;
//         const payload = new Array(~~(1e5 / 36)).fill(0).map(() => window.crypto.randomUUID()).join('');
//         await db.todos.upsert({
//             id: 'todo' + ~~(Math.random() * 1000),
//             name: payload,
//             done: false,
//             timestamp: new Date().toISOString()
//         });
//         console.log("docs", (await db.todos.find({}).exec()).length);
//     }, (1 + Math.random()) * 1000);
//     return async () => {
//         clearInterval(id);
//         await replicationPool.cancel();
//         await db.close();
//     }
// }
