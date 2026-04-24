/**
 * ble-bridge.js
 *
 * Drop this file into your web app and load it before any controller code.
 *
 * It normalises the BLE API so your controller code doesn't need to know
 * whether it's running inside the Android app or a regular browser.
 *
 * The single object `BLE` is what your controller code should use:
 *
 *   BLE.connect()
 *   BLE.write("UP")
 *   BLE.disconnect()
 *   BLE.onConnected    = (deviceId) => { ... }
 *   BLE.onDisconnected = (deviceId) => { ... }
 *   BLE.onError        = (message)  => { ... }
 *   BLE.isAvailable    → true if BLE is usable in this environment
 */

type ConnectedHandler = (deviceId: string) => void;
type ErrorHandler = (message: string) => void;

interface AndroidBleBridge {
  connect: () => void;
  write: (data: string) => void;
  disconnect: () => void;
}

interface BleApi {
  readonly isAvailable: boolean;
  connect: () => void;
  write: (data: string) => void;
  disconnect: () => void;
  onConnected: ConnectedHandler;
  onDisconnected: ConnectedHandler;
  onError: ErrorHandler;
}

declare global {
  interface Window {
    __bleOnConnected?: (id: string) => void;
    __bleOnDisconnected?: (id: string) => void;
    __bleOnError?: (msg: string) => void;
  }
}

const BLE: BleApi = (() => {

  const androidBle = (window as Window & { AndroidBle?: AndroidBleBridge }).AndroidBle;
  const isAndroid = typeof androidBle !== 'undefined';

  // ── Callbacks (set these before calling connect) ──────────────────────────
  let onConnected: ConnectedHandler = () => {};
  let onDisconnected: ConnectedHandler = () => {};
  let onError: ErrorHandler = () => {};

  // ── Android path ──────────────────────────────────────────────────────────
  if (isAndroid && androidBle) {
    // These are called by the native Kotlin code via evaluateJavascript
    window.__bleOnConnected = (id: string) => onConnected(id);
    window.__bleOnDisconnected = (id: string) => onDisconnected(id);
    window.__bleOnError = (msg: string) => onError(msg);

    return {
      isAvailable: true,
      connect: () => androidBle.connect(),
      write: (data: string) => androidBle.write(data),
      disconnect: () => androidBle.disconnect(),
      get onConnected() { return onConnected; },
      set onConnected(fn: ConnectedHandler) { onConnected = fn; },
      get onDisconnected() { return onDisconnected; },
      set onDisconnected(fn: ConnectedHandler) { onDisconnected = fn; },
      get onError() { return onError; },
      set onError(fn: ErrorHandler) { onError = fn; },
    };
  }

  // ── Browser / Web Bluetooth path (optional fallback) ─────────────────────
  // Per your requirement, this is retired. If someone opens the page in a
  // browser they'll see isAvailable = false and you can show a message.
  return {
    isAvailable: false,
    connect: () => onError('Open this page in the BLE Controller app.'),
    write: (_data: string) => {},
    disconnect: () => {},
    get onConnected() { return onConnected; },
    set onConnected(fn: ConnectedHandler) { onConnected = fn; },
    get onDisconnected() { return onDisconnected; },
    set onDisconnected(fn: ConnectedHandler) { onDisconnected = fn; },
    get onError() { return onError; },
    set onError(fn: ErrorHandler) { onError = fn; },
  };

})();

export default BLE;