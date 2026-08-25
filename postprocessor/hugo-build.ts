import { processHtml } from "./postprocess.ts";

async function gatherDirectoryPaths(dir: string, out: string[]) {
  for await (const entry of Deno.readDir(dir)) {
    const path = `${dir}/${entry.name}`

    if (entry.isDirectory) {
      await gatherDirectoryPaths(path, out)
    } else if (path.endsWith(".html")) {
      out.push(path)
    }
  }
}

async function main() {
  const outputDir = await Deno.realPath("../public/")
  const filePaths: string[] = []

  await gatherDirectoryPaths(outputDir, filePaths)

  console.log(`Postprocessor found ${filePaths.length} HTML files to process`)

  for (const path of filePaths) {
    console.log(`Processing ${path}`)

    const text = await Deno.readTextFile(path)
    const processed = processHtml(text, "text/html")
    await Deno.writeTextFile(path, processed)
  }
}

await main()