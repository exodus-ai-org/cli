// Overwritten to 'binary' by scripts/build-binaries.sh right before compiling
// each platform target, and restored to 'npm' afterward — see Task 16. Local
// dev and the published npm package both see 'npm'.
export const DIST_CHANNEL: 'npm' | 'binary' = 'npm'
