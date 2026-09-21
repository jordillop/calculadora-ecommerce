import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const host = "127.0.0.1";
const port = 4173;
const distDirectory = fileURLToPath(new URL("./dist/", import.meta.url));

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
};

function send(response, statusCode, body, headers = {}) {
  response.writeHead(statusCode, {
    "Cache-Control": "no-store",
    "Content-Type": "text/plain; charset=utf-8",
    ...headers,
  });
  response.end(body);
}

const server = createServer(async (request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    send(response, 405, "Método no permitido", { Allow: "GET, HEAD" });
    return;
  }

  try {
    const requestUrl = new URL(request.url ?? "/", `http://${host}:${port}`);
    const pathname = decodeURIComponent(requestUrl.pathname);
    const requestedPath = pathname === "/" ? "/index.html" : pathname;
    let filePath = path.resolve(distDirectory, `.${requestedPath}`);
    const relativePath = path.relative(distDirectory, filePath);

    if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
      send(response, 403, "Acceso denegado");
      return;
    }

    const fileStats = await stat(filePath);
    if (fileStats.isDirectory()) {
      filePath = path.join(filePath, "index.html");
    }

    const body = await readFile(filePath);
    const contentType = contentTypes[path.extname(filePath).toLowerCase()]
      ?? "application/octet-stream";

    response.writeHead(200, {
      "Cache-Control": "no-store",
      "Content-Length": body.length,
      "Content-Type": contentType,
    });
    response.end(request.method === "HEAD" ? undefined : body);
  } catch (error) {
    if (error instanceof URIError) {
      send(response, 400, "Solicitud no válida");
      return;
    }

    if (error?.code === "ENOENT" || error?.code === "ENOTDIR") {
      send(response, 404, "Archivo no encontrado");
      return;
    }

    console.error(error);
    send(response, 500, "Error interno del servidor");
  }
});

server.listen(port, host, () => {
  console.log(`Calculadora disponible en http://${host}:${port}`);
});

