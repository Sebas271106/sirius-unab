"use client"

import type mapboxgl from "mapbox-gl"
import { Card, CardContent } from "@/components/ui/card"
import { useEffect, useRef, useState } from "react"


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
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])
  const [, setRoutesSummary] = useState<RouteSummary[]>([])

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
        const mapboxgl = (mapboxModule as typeof import("mapbox-gl")).default || (mapboxModule as typeof import("mapbox-gl"))

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

        const map = mapRef.current
        if (!map) return

        map.on("error", (e: { error?: unknown }) => {
          console.error("Mapbox error:", (e && (e as { error?: unknown }).error) || e)
        })

        map.on("load", async () => {
          try {
            map.resize()
            setTimeout(() => map.resize(), 300)
            await updateMarkers(map)
          } catch (err) {
            console.error("Error en carga inicial de marcadores:", err)
          }
        })

        const updateMarkers = async (map: mapboxgl.Map) => {
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
                .addTo(map)
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
              map.flyTo({
                center: [buses[0].lng, buses[0].lat],
                essential: true,
              })
            }
          } catch (err) {
            console.error("Failed to update bus markers", err)
          }
        }

        const interval = setInterval(() => updateMarkers(map), 15000)
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
