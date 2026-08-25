import { processHtml } from "./postprocess.ts";

const HUGO_URL = "http://127.0.0.1:1313"

let hugoProcess: Deno.ChildProcess | null = null
let server: Deno.HttpServer | null = null

function getMimeType(contentType: string): string {
  if (contentType.includes(";")) {
    return contentType.substring(0, contentType.indexOf(";"))
  }
  return contentType
}

async function handleRequest(req: Request): Promise<Response> {
  const url: URL = new URL(req.url)
  const targetUrl: URL = new URL(`${HUGO_URL}${url.pathname}${url.search}`)

  const res: Response = await fetch(targetUrl)
  const cType: string = res.headers.get("Content-Type") ?? ""

  if (!res.ok || !cType.startsWith("text/html")) {
    return res
  }

  console.log(`Request from ${req.url} status=${res.status} Content-Type=${cType}`)

  const htmlString: string = await res.text()
  const processed: string = processHtml(htmlString, getMimeType(cType))

  return new Response(processed, {
    headers: res.headers,
    status: res.status
  })
}

async function shutdown(sig: Deno.Signal) {
  if (hugoProcess != null) {
    hugoProcess.kill(sig)
    hugoProcess = null
  }

  if (server != null) {
    await server.shutdown()
  }
}

interface ShutdownHandler {
  sig: Deno.Signal
  handler: () => void
}

function main() {
  const cmd = new Deno.Command("hugo", {
    args: ["server"],
    cwd: Deno.realPathSync("..")
  })

  hugoProcess = cmd.spawn()

  server = Deno.serve(handleRequest)

  const shutdownHandlers: ShutdownHandler[] = []

  shutdownHandlers.push({
    sig: "SIGTERM",
    handler: () => {}
  })
  shutdownHandlers.push({
    sig: "SIGINT",
    handler: () => {}
  })

  for (const h of shutdownHandlers) {
    h.handler = () => {
      shutdown(h.sig)
      Deno.removeSignalListener(h.sig, h.handler)
    }
    Deno.addSignalListener(h.sig, h.handler)
  }
}

main()