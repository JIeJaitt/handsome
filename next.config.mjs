/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        turbo: true
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    },
};

export default nextConfig; 