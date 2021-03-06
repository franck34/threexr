module.exports = {
	env: {
		browser: true,
		es6: true,
		node: true,
	},
	extends: "eslint:recommended",
	parserOptions: {
		sourceType: "module",
	},
	rules: {
		indent: ["error", "tab"],
		"linebreak-style": ["error", "unix"],
		quotes: ["error", "single"],
		semi: ["error", "always"],
		"no-unused-vars": ["warn", "all"],
		"no-var": ["warn"],
		"no-console": "off",
	},
	exclude: [
		"node_modules",
		"src/dist"
	]
};

