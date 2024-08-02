import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: 'crypto-browserify',
        stream: 'stream-browserify',
        url: 'url',
        zlib: 'browserify-zlib',
        http: 'stream-http',
        https: 'https-browserify',
        assert: 'assert',
        os: 'os-browserify',
        path: 'path-browserify',
      };
    }

    config.resolve.alias = {
      ...config.resolve.alias,
      '@solana/web3.js': path.join(__dirname, 'node_modules', '@solana', 'web3.js'),
    };

    return config;
  },
};

export default nextConfig;