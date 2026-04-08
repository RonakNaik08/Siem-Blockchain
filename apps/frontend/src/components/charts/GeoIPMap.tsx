"use client";
import React, { useEffect, useState, useMemo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";
import { Tooltip } from "react-tooltip";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
const GEOIP_API = "https://ip-api.com/batch?fields=status,country,countryCode,lat,lon,query";

interface IPLocation {
  ip: string;
  country: string;
  countryCode: string;
  lat: number;
  lon: number;
  count: number;
}

interface Props {
  logs: { source_ip?: string; severity?: string }[];
}

// Countries with known high threat activity get extra visual weight
const THREAT_IPS = new Set(["192.168.1.1", "10.0.0.1"]); // example internals

export default function GeoIPMap({ logs }: Props) {
  const [locations, setLocations] = useState<IPLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tooltipContent, setTooltipContent] = useState("");

  // Deduplicate IPs and count occurrences
  const ipCounts = useMemo(() => {
    const map: Record<string, number> = {};
    logs.forEach((l) => {
      const ip = l.source_ip;
      if (!ip || ip === "unknown" || ip.startsWith("127.") || ip.startsWith("::")) return;
      map[ip] = (map[ip] || 0) + 1;
    });
    return map;
  }, [logs]);

  const uniqueIPs = useMemo(() => Object.keys(ipCounts), [ipCounts]);

  // Batch resolve IPs → lat/lon
  useEffect(() => {
    if (uniqueIPs.length === 0) {
      setLocations([]);
      return;
    }

    setLoading(true);
    setError(null);

    // ip-api.com batch: max 100 per call
    const batch = uniqueIPs.slice(0, 100);

    fetch(GEOIP_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(batch),
    })
      .then((r) => r.json())
      .then((results: any[]) => {
        const resolved: IPLocation[] = results
          .filter((r) => r.status === "success")
          .map((r) => ({
            ip: r.query,
            country: r.country,
            countryCode: r.countryCode,
            lat: r.lat,
            lon: r.lon,
            count: ipCounts[r.query] || 1,
          }));
        setLocations(resolved);
      })
      .catch(() => setError("GeoIP resolution failed (offline or rate-limited)"))
      .finally(() => setLoading(false));
  }, [JSON.stringify(uniqueIPs)]);

  const maxCount = Math.max(...locations.map((l) => l.count), 1);

  // Colour: scale from amber to red based on hit count
  const dotColor = (count: number) => {
    const ratio = count / maxCount;
    if (ratio >= 0.8) return "#ef4444"; // red
    if (ratio >= 0.4) return "#f97316"; // orange
    return "#fbbf24"; // amber
  };

  const dotSize = (count: number) => Math.max(4, Math.min(18, 4 + (count / maxCount) * 14));

  return (
    <div
      className="rounded-2xl border border-gray-800 p-5"
      style={{ background: "rgba(10,15,30,0.8)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-200">🌍 GeoIP Threat Map</h2>
          <p className="text-xs text-slate-600 mt-0.5">
            {locations.length} unique source locations
            {loading && " · resolving…"}
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" />Low</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500" />Med</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" />High</span>
        </div>
      </div>

      {error && (
        <p className="text-xs text-amber-400 mb-2">{error}</p>
      )}

      {uniqueIPs.length === 0 ? (
        <div className="flex items-center justify-center h-[200px] text-slate-600 text-sm">
          No external IPs in logs yet
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl bg-gray-900/60" style={{ height: 260 }}>
          <ComposableMap
            projection="geoNaturalEarth1"
            style={{ width: "100%", height: "100%" }}
          >
            <ZoomableGroup zoom={1} center={[0, 20]}>
              <Geographies geography={GEO_URL}>
                {({ geographies }) =>
                  geographies.map((geo) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill="rgba(71,85,105,0.25)"
                      stroke="rgba(71,85,105,0.5)"
                      strokeWidth={0.3}
                      style={{
                        default: { outline: "none" },
                        hover: { outline: "none", fill: "rgba(71,85,105,0.45)" },
                        pressed: { outline: "none" },
                      }}
                    />
                  ))
                }
              </Geographies>

              {locations.map((loc) => (
                <Marker
                  key={`${loc.ip}-${loc.lat}-${loc.lon}`}
                  coordinates={[loc.lon, loc.lat]}
                  data-tooltip-id="geo-tooltip"
                  onMouseEnter={() =>
                    setTooltipContent(`${loc.ip} · ${loc.country} · ${loc.count} event${loc.count > 1 ? "s" : ""}`)
                  }
                  onMouseLeave={() => setTooltipContent("")}
                >
                  {/* Pulse ring */}
                  <circle
                    r={dotSize(loc.count) * 1.6}
                    fill={dotColor(loc.count)}
                    fillOpacity={0.12}
                  />
                  {/* Core dot */}
                  <circle
                    r={dotSize(loc.count) / 2}
                    fill={dotColor(loc.count)}
                    fillOpacity={0.9}
                    style={{ filter: `drop-shadow(0 0 4px ${dotColor(loc.count)})` }}
                  />
                </Marker>
              ))}
            </ZoomableGroup>
          </ComposableMap>
        </div>
      )}

      {/* Country table */}
      {locations.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 max-h-[80px] overflow-y-auto">
          {locations
            .sort((a, b) => b.count - a.count)
            .slice(0, 8)
            .map((loc) => (
              <div key={loc.ip} className="flex justify-between text-xs">
                <span className="text-slate-500 truncate font-mono">{loc.ip}</span>
                <span className="text-slate-400 ml-2 flex-shrink-0">
                  {loc.country} · <span style={{ color: dotColor(loc.count) }}>{loc.count}x</span>
                </span>
              </div>
            ))}
        </div>
      )}

      <Tooltip id="geo-tooltip" content={tooltipContent}
        style={{ background: "#1e293b", border: "1px solid #334155", fontSize: 12, borderRadius: 8 }} />
    </div>
  );
}
