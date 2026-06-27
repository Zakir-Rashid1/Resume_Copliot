// Type shim for the internal pdf-parse lib path import.
// Required because pdf-parse v1's main entry triggers a test file read
// (./test/data/05-versions-space.pdf) on Next.js server which throws ENOENT.
// We import the internal lib path directly to avoid this — this shim re-exports
// the same types from @types/pdf-parse.
declare module "pdf-parse/lib/pdf-parse.js" {
  import pdfParse from "pdf-parse";
  export default pdfParse;
}
