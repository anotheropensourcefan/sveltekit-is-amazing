import adapter from '@sveltejs/adapter-cloudflare';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter(),
		paths: {
      base: process.env.NODE_ENV === "production" ? "/sveltekit-is-amazing" : "",
    }
	}
};

export default config;
