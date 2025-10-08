"use client"

import { MapPin, Clock } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useEffect, useRef, useState } from "react"

const routes = [
  { id: 1, name: "Route A", status: "Active", nextArrival: "5 min" },
  { id: 2, name: "Route B", status: "Active", nextArrival: "12 min" },
  { id: 3, name: "Route C", status: "Inactive", nextArrival: "-" },
]

function parseBusesFromXml(xmlString: string) {
  const rootTag = '<ArrayOfUltimoAvlViewModel'
  const idx = xmlString.indexOf(rootTag)
  if (idx > -1) {
    xmlString = xmlString.slice(idx)
  }

  const parser = new DOMParser()
  const doc = parser.parseFromString(xmlString, "application/xml")

  let items = Array.from(doc.getElementsByTagName("UltimoAvlViewModel"))
  if (items.length === 0) {
    items = Array.from(doc.getElementsByTagNameNS("*", "UltimoAvlViewModel"))
  }

  return items
    .map((item) => {
      const getText = (tag: string) => {
        const el =
          item.getElementsByTagName(tag)[0] ||
          item.getElementsByTagNameNS("*", tag)[0]
        return el?.textContent ?? ""
      }
      const lat = parseFloat(getText("Lat"))
      const lng = parseFloat(getText("Lng"))
      const placa = getText("Placa")
      const tipo = getText("TipoVehiculo")
      const evento = getText("NombreEvento")
      const fhEvento = getText("FhEvento")
      return { lat, lng, placa, tipo, evento, fhEvento }
    })
    .filter((b) => Number.isFinite(b.lat) && Number.isFinite(b.lng))
}

type RouteSummary = { placa: string; etaText: string; routeName?: string }

export default function BusPage() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const [routesSummary, setRoutesSummary] = useState<RouteSummary[]>([])

  const getRouteName = (placa?: string) => {
    const p = (placa || "").toUpperCase()
    if (p.includes("RUTA02")) return "Route A"
    if (p.includes("RUTA1")) return "Route B"
    if (p.includes("RUTA2")) return "Route C"
    return "Route C"
  }

  useEffect(() => {
    const initMap = async () => {
      try {
        if (mapRef.current) return

        const mapboxModule = await import("mapbox-gl")
        const mapboxgl = (mapboxModule as any).default || mapboxModule

        const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN as string
        if (!token) {
          console.error("Falta NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN en .env")
          return
        }
        mapboxgl.accessToken = token

        const cssHref = "https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css"
        if (typeof document !== "undefined" && !document.querySelector(`link[href="${cssHref}"]`)) {
          const link = document.createElement("link")
          link.rel = "stylesheet"
          link.href = cssHref
          document.head.appendChild(link)
        }

        if (!mapContainerRef.current) {
          console.error("Contenedor del mapa no encontrado")
          return
        }

        mapContainerRef.current.style.width = "100%"
        mapContainerRef.current.style.height = "100%"

        const center = { lat: 7.113555, lng: -73.1053116 }
        const styleUrl = process.env.NEXT_PUBLIC_MAPBOX_STYLE_URL || "mapbox://styles/mapbox/outdoors-v11"

        mapRef.current = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: styleUrl,
          center: [center.lng, center.lat],
          zoom: 13,
        })

        mapRef.current.on("error", (e: any) => {
          console.error("Mapbox error:", e?.error || e)
        })

        mapRef.current.on("load", async () => {
          try {
            mapRef.current.resize()
            setTimeout(() => mapRef.current.resize(), 300)
            await updateMarkers()
          } catch (err) {
            console.error("Error en carga inicial de marcadores:", err)
          }
        })

        const updateMarkers = async () => {
          try {
            const resp = await fetch("/api/bus-locations", { cache: "no-store" })
            if (!resp.ok) {
              console.error("API /api/bus-locations respondió con error:", resp.status, resp.statusText)
              return
            }
            const xml = await resp.text()
            const buses = parseBusesFromXml(xml)

            markersRef.current.forEach((m) => m.remove?.())
            markersRef.current = []

            buses.forEach((bus) => {
              const popupHtml =
                `<div style="font-size:12px;line-height:1.4">` +
                `<div><strong>${bus.placa || "Bus"}</strong></div>` +
                `<div>Tipo: ${bus.tipo || ""}</div>` +
                `<div>Evento: ${bus.evento || ""}</div>` +
                `<div>Fecha: ${bus.fhEvento || ""}</div>` +
                `</div>`
              const popup = new mapboxgl.Popup({ offset: 16 }).setHTML(popupHtml)
              const marker = new mapboxgl.Marker()
                .setLngLat([bus.lng, bus.lat])
                .setPopup(popup)
                .addTo(mapRef.current)
              markersRef.current.push(marker)
            })

            const now = Date.now()
            const byPlaca: Record<string, RouteSummary> = {}
            buses.forEach((bus) => {
              const placa = (bus.placa || "").toUpperCase()
              if (!placa) return
              let etaText = "N/A"
              if (bus.fhEvento) {
                const diffMin = Math.max(0, Math.round((now - new Date(bus.fhEvento).getTime()) / 60000))
                etaText = `${diffMin} min`
              }
              const routeName = getRouteName(placa)
              byPlaca[placa] = { placa, etaText, routeName }
            })
            const ordered: RouteSummary[] = Object.values(byPlaca)
              .sort((a, b) => a.placa.localeCompare(b.placa))
              .slice(0, 3)
            setRoutesSummary(ordered)

            if (buses.length > 0) {
              mapRef.current.flyTo({
                center: [buses[0].lng, buses[0].lat],
                essential: true,
              })
            }
          } catch (err) {
            console.error("Failed to update bus markers", err)
          }
        }

        const interval = setInterval(updateMarkers, 15000)
        return () => clearInterval(interval)
      } catch (e) {
        console.error("Failed to initialize Mapbox", e)
      }
    }

    const cleanupPromise = initMap()
    return () => {
      ;(async () => {
        try {
          const cleanup = await cleanupPromise
          if (typeof cleanup === "function") cleanup()
        } catch {}
      })()
      markersRef.current.forEach((m) => m.remove?.())
      markersRef.current = []
      mapRef.current?.remove?.()
    }
  }, [])

  return (
          <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-2xl text-foreground mb-6">Campus Bus Tracking</h1>

        <div className="grid grid-cols-1 gap-6">
          {/* Área del Mapa (único contenido) */}
          <div>
            <Card className="h-[600px]">
              <CardContent className="p-0 h-full">
                <div
                  ref={mapContainerRef}
                  className="w-full h-full rounded-lg"
                  aria-label="Bus Map"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
  )
}
