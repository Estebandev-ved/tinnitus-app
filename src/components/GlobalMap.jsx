import React from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { Users, Zap, Globe } from "lucide-react";
import './GlobalMap.css';
import geoData from "../assets/countries-110m.json";

const mockActiveUsers = [
    { name: "Maria", days: 23, flag: "🇨🇴", coordinates: [-74.07, 4.71] },
    { name: "John", days: 5, flag: "🇺🇸", coordinates: [-100.0, 40.0] },
    { name: "Luis", days: 45, flag: "🇪🇸", coordinates: [-3.70, 40.42] },
    { name: "Akemi", days: 12, flag: "🇯🇵", coordinates: [139.69, 35.69] },
    { name: "Diego", days: 8, flag: "🇦🇷", coordinates: [-58.38, -34.60] },
    { name: "Sara", days: 1, flag: "🇲🇽", coordinates: [-99.13, 19.43] },
    { name: "Alex", days: 100, flag: "🇬🇧", coordinates: [-0.13, 51.51] },
    { name: "Emma", days: 14, flag: "🇦🇺", coordinates: [151.21, -33.87] },
    { name: "Yuki", days: 30, flag: "🇰🇷", coordinates: [126.98, 37.57] },
    { name: "Hans", days: 67, flag: "🇩🇪", coordinates: [13.41, 52.52] },
    { name: "Ana", days: 19, flag: "🇧🇷", coordinates: [-43.17, -22.91] },
    { name: "Omar", days: 3, flag: "🇪🇬", coordinates: [31.24, 30.04] },
];

const GlobalMap = () => {
    return (
        <div className="global-map-container animate-fade">
            {/* Header Stats */}
            <div className="map-stats">
                <div className="stat-pill glow">
                    <Users size={16} color="#0A84FF" />
                    <span>+1,204 <strong>activos ahora</strong></span>
                </div>
                <div className="stat-pill">
                    <Zap size={16} color="#FFD60A" />
                    <span>Habituando juntos</span>
                </div>
            </div>

            {/* Map */}
            <div className="map-wrapper">
                <div className="map-glow-overlay" />
                <ComposableMap
                    projection="geoNaturalEarth1"
                    projectionConfig={{
                        scale: 160,
                        center: [0, 10]
                    }}
                    width={800}
                    height={420}
                    style={{ width: "100%", height: "auto" }}
                >
                    <defs>
                        <radialGradient id="markerGlow" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#0A84FF" stopOpacity="0.6" />
                            <stop offset="100%" stopColor="#0A84FF" stopOpacity="0" />
                        </radialGradient>
                        <linearGradient id="landGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#1A2D4A" />
                            <stop offset="100%" stopColor="#152240" />
                        </linearGradient>
                    </defs>

                    <Geographies geography={geoData}>
                        {({ geographies }) =>
                            geographies.map((geo) => (
                                <Geography
                                    key={geo.rsmKey}
                                    geography={geo}
                                    fill="url(#landGrad)"
                                    stroke="#233A5C"
                                    strokeWidth={0.6}
                                    style={{
                                        default: { outline: "none" },
                                        hover: { fill: "#1E3454", outline: "none" },
                                        pressed: { fill: "#1E3454", outline: "none" },
                                    }}
                                />
                            ))
                        }
                    </Geographies>

                    {mockActiveUsers.map(({ name, days, flag, coordinates }) => (
                        <Marker key={name} coordinates={coordinates}>
                            {/* Outer glow */}
                            <circle r={14} fill="url(#markerGlow)" />
                            {/* Ping animation */}
                            <circle r={8} fill="#0A84FF" opacity={0.2} className="ping-anim" />
                            {/* Core dot */}
                            <circle r={4} fill="#0A84FF" />
                            <circle r={2} fill="#FFFFFF" opacity={0.8} />
                            {/* Label */}
                            <text
                                textAnchor="middle"
                                y={-16}
                                className="marker-label"
                            >
                                {flag} {name} ({days}d)
                            </text>
                        </Marker>
                    ))}
                </ComposableMap>
            </div>

            {/* Legend */}
            <div className="map-legend">
                <div className="legend-item">
                    <span className="legend-dot active" />
                    <span>Usuario activo</span>
                </div>
                <div className="legend-item">
                    <Globe size={14} color="#5A6D85" />
                    <span>12 países conectados</span>
                </div>
            </div>

            {/* Footer */}
            <div className="map-footer">
                <p>🌍 No estás solo en esto. Miles de personas en todo el mundo están entrenando sus cerebros en este mismo momento.</p>
            </div>
        </div>
    );
};

export default GlobalMap;
