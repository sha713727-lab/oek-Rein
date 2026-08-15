/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "no-circular",
      severity: "error",
      from: {},
      to: { circular: true },
    },
    {
      name: "no-feature-to-feature",
      comment: "Features must not import other features directly.",
      severity: "error",
      from: { path: "^src/features/([^/]+)/.+" },
      to: { path: "^src/features/(?!$1/)" },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: "tsconfig.json" },
  },
};
