module.exports = {
  plugins: ["prettier-plugin-solidity"],
  overrides: [
    {
      files: "*.sol",
      options: {
        tabWidth: 4,
        printWidth: 90,
        bracketSpacing: true,
        compiler: "0.8.22",
      },
    },
  ],
};
