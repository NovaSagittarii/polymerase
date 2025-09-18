import { $localStorage, $peer, $peerConnect, $peerId, $status } from './storage';
import { PeerDexieStorage, PeerStorage, UnsetLocalStorage } from './storageAdapter';
import { Indicator } from '@extension/ui';
import { useStore } from '@nanostores/react';
import { Peer } from 'peerjs';
import { useEffect, useState } from 'react';

export default function StorageManager() {
  const peerConnect = useStore($peerConnect);
  const peerId = useStore($peerId);
  const peer = useStore($peer);
  const status = useStore($status);
  const storage = useStore($localStorage);
  const [attempts, setAttempts] = useState(0);
  const [issue, setIssue] = useState('');

  useEffect(() => {
    const cleanup: (() => void)[] = [];
    const peer = new Peer(peerId, {
      host: '1.peerjs.com',
      port: 443,
    });
    $status.set('Connecting to signaling server...');
    peer.on('open', () => {
      setIssue('');
      $peer.set(peer);
    });
    // peer.on('disconnected', () => {
    //   for (let i = 0; i <= 5; ++i) {
    //     const x = i;
    //     const timeout = setTimeout(() => {
    //       setIssue(`Disconnected, retry in ${5 - x}s.`);
    //       if (x === 5) {
    //         if (peer.open) peer.reconnect();
    //         else setAttempts(x => x + 1);
    //       }
    //     }, i * 1000);
    //     cleanup.push(() => clearTimeout(timeout));
    //   }
    // });
    peer.on('error', e => {
      if (e.type === 'unavailable-id') setIssue('ID taken.');
      if (e.type === 'network') setIssue('Cannot connect to signaling server.');
      if (e.type === 'peer-unavailable') setIssue('Primary unavailable');
      if (e.type === 'unavailable-id' || e.type === 'network' || e.type === 'peer-unavailable') {
        const timeout = setTimeout(() => setAttempts(x => x + 1), 15000);
        cleanup.push(() => clearTimeout(timeout));
      } else {
        console.warn('unhandled peer error', e.type, e);
        setIssue('PeerJS Error: ' + e.type);
      }
    });
    return () => {
      peer.destroy();
      cleanup.forEach(f => f());
    };
  }, [peerId, attempts]);

  useEffect(() => {
    const cleanup: (() => void)[] = [];
    if (peer) {
      console.log('Connect', peerConnect);
      setIssue('');
      if (peerConnect === 'leader') {
        // primary
        $status.set('OK');
        $localStorage.set(new PeerDexieStorage(peer));
        peer.on('connection', conn => {
          conn.on('open', () => {
            console.log('open', conn.connectionId);
          });
          conn.on('data', data => {
            console.log('rcv', conn.connectionId, data);
          });
          conn.on('close', () => {
            console.log('close', conn.connectionId);
          });
        });
      } else if (peerConnect) {
        // client
        $status.set('Connecting to primary...');
        const conn = peer.connect(peerConnect, { reliable: true });
        const timeout = setTimeout(() => {
          setAttempts(x => x + 1);
          setIssue('Unable to connect to primary.');
        }, 20000);
        cleanup.push(() => clearTimeout(timeout));
        conn.on('open', () => {
          clearTimeout(timeout);
          $status.set('OK');
          $localStorage.set(new PeerStorage(conn));
          // setTimeout(() => {
          //   conn.send('hi!');
          //   console.log('sent');
          // }, 1000);
        });
        conn.on('close', () => {
          $status.set('disconnected');
          setAttempts(x => x + 1);
        });
      } else {
        $status.set('Connected to signaling server.');
        setIssue('No connect config set.');
      }
    }
    return () => {
      $localStorage.set(new UnsetLocalStorage());
      cleanup.forEach(f => f());
    };
  }, [peer, peerConnect]);

  return (
    <div className="flex flex-col items-start text-sm">
      <Indicator label="Status: " ok={status === 'OK'} description={status} />
      {issue && <Indicator critical label="Issue: " ok={!issue} description={issue || 'OK'} />}
      <div>
        {'ID: '}
        <code>{peerId}</code>
      </div>
      <button
        onClick={() => {
          let res = prompt('leader id');
          if (res) {
            if (res === peerId) res = 'leader';
            $peerConnect.set(res);
          }
        }}>
        Connect
      </button>
      {!peerConnect ? (
        'Not connected'
      ) : peerConnect === 'leader' ? (
        'Is primary.'
      ) : (
        <div>
          {'To: '}
          <code>{peerConnect}</code>
        </div>
      )}
      <button
        onClick={async () => {
          const id = prompt('id?') || 'A';
          console.log('get', id, await storage.getItem('test', id));
        }}>
        Get
      </button>
      <button
        onClick={async () => {
          const id = prompt('id?') || 'A';
          const val = prompt('val?') || 'A';
          console.log('set', id, val, await storage.setItem('test', id, { val }));
        }}>
        Set
      </button>
      <button
        onClick={async () => {
          const id = prompt('id?') || 'A';
          console.log('del', id, await storage.removeItem('test', id));
        }}>
        Del
      </button>
    </div>
  );
}
