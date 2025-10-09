import { NextResponse } from "next/server"
import fs from "node:fs/promises"
import path from "node:path"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const UPSTREAM_URL = "https://api2.gpsmobile.net/api/rep-actual/ultimo-avl/d6871041=="

export async function GET() {
  try {
    const res = await fetch(UPSTREAM_URL, {
      // Avoid caching to always get latest positions
      cache: "no-store",
      headers: {
        Accept: "application/xml,text/xml,*/*",
      },
    })

    if (res.ok) {
      const text = await res.text()
      return new NextResponse(text, {
        status: 200,
        headers: {
          "content-type": "application/xml; charset=utf-8",
        },
      })
    }

    throw new Error(`Upstream responded with status ${res.status}`)
  } catch {
    // Fallback to local sample file if upstream fails
    try {
      const filePath = path.join(process.cwd(), "log.txt")
      const xml = await fs.readFile(filePath, "utf-8")
      return new NextResponse(xml, {
        status: 200,
        headers: {
          "content-type": "application/xml; charset=utf-8",
        },
      })
    } catch {
      // Last-resort minimal XML so client code can handle gracefully
      const minimal = "<ArrayOfUltimoAvlViewModel></ArrayOfUltimoAvlViewModel>"
      return new NextResponse(minimal, {
        status: 200,
        headers: {
          "content-type": "application/xml; charset=utf-8",
        },
      })
    }
  }
}