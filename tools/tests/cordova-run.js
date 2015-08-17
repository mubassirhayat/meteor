import selftest from '../selftest.js';
import utils from '../utils.js';
import { parseServerOptionsForRunCommand } from '../commands.js';

selftest.define('get mobile server argument for meteor run', ['cordova'], function () {
  // on emulator

  // meteor run -p 3000
  // => mobile server should be localhost:3000
  selftest.expectEqual(parseServerOptionsForRunCommand({
    port: "3000"
  }).mobileServerUrl, { host: "localhost", port: "3000", protocol: "http://" });

  // meteor run -p example.com:3000
  // => mobile server should be localhost:3000
  selftest.expectEqual(parseServerOptionsForRunCommand({
    port: "example.com:3000"
  }).mobileServerUrl, { host: "localhost", port: "3000", protocol: "http://" });

  // on device

  // meteor run -p 3000 on device
  // => mobile server should be <detected ip>:3000
  selftest.expectEqual(parseServerOptionsForRunCommand({
    port: "3000",
    args: ["ios-device"]
  }).mobileServerUrl, { host: utils.ipAddress(), port: "3000", protocol: "http://" });

  // meteor run -p example.com:3000 on device
  // => mobile server should be <detected ip>:3000
  selftest.expectEqual(parseServerOptionsForRunCommand({
    port: "example.com:3000",
    args: ["android-device"]
  }).mobileServerUrl, { host: utils.ipAddress(), port: "3000", protocol: "http://" });

  // meteor run -p example.com:3000 --mobile-server 4000 => error, mobile
  // server must specify a hostname
  selftest.expectThrows(() => {
    parseServerOptionsForRunCommand({
      port: "example.com:3000",
      "mobile-server": "4000"
    });
  });

  // meteor run -p example.com:3000 --mobile-server example.com =>
  // mobile server should be example.com
  selftest.expectEqual(parseServerOptionsForRunCommand({
    port: "example.com:3000",
    "mobile-server": "example.com"
  }).mobileServerUrl, { protocol: "http://", host: "example.com", port: undefined });

  // meteor run -p example.com:3000 --mobile-server https://example.com =>
  // mobile server should be https://example.com
  selftest.expectEqual(parseServerOptionsForRunCommand({
    port: "example.com:3000",
    "mobile-server": "https://example.com"
  }).mobileServerUrl, { host: "example.com", protocol: "https://", port: undefined });

  // meteor run -p example.com:3000 --mobile-server http://example.com:4000 =>
  // mobile server should be http://example.com:4000
  selftest.expectEqual(parseServerOptionsForRunCommand({
    port: "example.com:3000",
    "mobile-server": "http://example.com:4000"
  }).mobileServerUrl, { host: "example.com", port: "4000", protocol: "http://" });
});
