#!/usr/bin/env python3
"""
Reproduce la evidencia de calibración documentada en docs/ARCHITECTURE.md.
Sin dependencias: solo stdlib. Uso: python3 calibracion/calibrar.py
"""
import json, math, urllib.request, statistics as st
from collections import Counter

LAT, LON = -33.4642, -70.66          # Parque O'Higgins
ARCHIVE = "https://archive-api.open-meteo.com/v1/archive"
FORECAST = "https://api.open-meteo.com/v1/forecast"

# --- el modelo propuesto -----------------------------------------------------
PERFILES = {            # (centro km/h, sigma, techo de racha km/h)
    "liviano":    (12.0, 5.0, 22.0),
    "estandar":   (14.0, 5.5, 28.0),
    "acrobatico": (20.0, 7.0, 38.0),
}
VIENTO_PELIGRO = 45.0
RACHA_PELIGRO = 45.0
CORTES = {"ideal": 65, "marginal": 40}

def score(v, g, perfil="estandar"):
    c, s, techo = PERFILES[perfil]
    base = 100 * math.exp(-((v - c) ** 2) / (2 * s * s))
    pen = min((g - techo) / techo, 1.0) * 100 if g > techo else 0.0
    return max(0, min(100, round(base - pen)))

def banda(v, g, perfil="estandar"):
    if v >= VIENTO_PELIGRO or g >= RACHA_PELIGRO:
        return "NO SALGAS"
    q, c = score(v, g, perfil), PERFILES[perfil][0]
    if q >= CORTES["ideal"]:    return "ANDA"
    if q >= CORTES["marginal"]: return "BRAVO" if v > c else "APENAS"
    return "BRAVO" if v > c else "NO ANDA"

# --- evidencia ---------------------------------------------------------------
def get(url):
    return json.load(urllib.request.urlopen(url))

def historico(y0=2021, y1=2025):
    h = get(f"{ARCHIVE}?latitude={LAT}&longitude={LON}&start_date={y0}-01-01"
            f"&end_date={y1}-12-31&hourly=wind_speed_10m,wind_gusts_10m"
            f"&timezone=America%2FSantiago")["hourly"]
    return [(t, v, g) for t, v, g in
            zip(h["time"], h["wind_speed_10m"], h["wind_gusts_10m"])
            if v is not None and g is not None]

def pct(xs, p):
    return sorted(xs)[min(int(len(xs) * p), len(xs) - 1)]

def clima_septiembre(datos):
    print("\n[1] Viento real de Santiago, septiembre 14-19h, 2021-2025")
    sep = [(v, g) for t, v, g in datos if int(t[5:7]) == 9 and 14 <= int(t[11:13]) <= 19]
    vs = [v for v, _ in sep]
    for p in (0.25, 0.5, 0.75, 0.9, 0.95):
        print(f"    viento p{int(p*100):02} = {pct(vs, p):5.1f} km/h")
    print(f"    media {st.mean(vs):.1f} | maximo en 5 anos {max(vs):.1f}")
    gf = [g / v for v, g in sep if v >= 6]
    print(f"    gust factor mediana = {st.median(gf):.2f}  <-- la v1 penalizaba desde 1.30")
    return sep

def ciclo_diario(datos):
    print("\n[2] Ciclo diario de septiembre: % de horas que dan ANDA")
    porhora = {}
    for t, v, g in datos:
        if int(t[5:7]) != 9: continue
        porhora.setdefault(int(t[11:13]), []).append(banda(v, g) == "ANDA")
    for hh in range(9, 22):
        if hh in porhora:
            p = sum(porhora[hh]) / len(porhora[hh]) * 100
            print(f"    {hh:02}:00  {p:4.0f}%  {'#' * int(p / 2)}")

def reparto(sep):
    print("\n[3] Reparto de veredictos en tardes de septiembre")
    for p in PERFILES:
        cn, tot = Counter(banda(v, g, p) for v, g in sep), len(sep)
        print(f"    {p:11}", "  ".join(f"{k} {cn[k]/tot*100:4.0f}%" for k in
              ("ANDA", "APENAS", "BRAVO", "NO ANDA", "NO SALGAS") if cn[k]))

def consistencia_modelos():
    print("\n[4] Consistencia fisica de las rachas por modelo (racha < viento medio es imposible)")
    for m in ("best_match", "gfs_seamless", "ecmwf_ifs025", "icon_seamless", "gem_seamless"):
        h = get(f"{FORECAST}?latitude={LAT}&longitude={LON}&hourly=wind_speed_10m,wind_gusts_10m"
                f"&forecast_days=5&timezone=America%2FSantiago&models={m}")["hourly"]
        pares = [(v, g) for v, g in zip(h["wind_speed_10m"], h["wind_gusts_10m"])
                 if v is not None and g is not None]
        if not pares:
            print(f"    {m:16} sin datos de racha"); continue
        neg = sum(1 for v, g in pares if g < v) / len(pares) * 100
        marca = "  <-- INSERVIBLE" if neg > 5 else ""
        print(f"    {m:16} rachas imposibles: {neg:5.1f}%{marca}")

def casos():
    print("\n[5] Casos de prueba (perfil estandar)")
    esperado = [
        (8, 22, "APENAS", "tarde tipica de septiembre"),
        (13, 20, "ANDA", "buena tarde"),
        (12, 45, "NO SALGAS", "poco viento, rachas brutales"),
        (12, 40, "APENAS", "poco viento, muy rachado"),
        (18, 26, "ANDA", "el ejemplo de los mockups"),
        (3, 8, "NO ANDA", "plancha"),
        (25, 40, "BRAVO", "ventoso"),
        (14, 15, "ANDA", "perfecto y parejo"),
        (50, 60, "NO SALGAS", "temporal"),
    ]
    ok = True
    for v, g, esp, desc in esperado:
        r = banda(v, g)
        if r != esp: ok = False
        print(f"    {v:2}/{g:2} -> {r:9} esperado {esp:9} {'ok' if r == esp else 'FALLA'}  {desc}")
    print("    TODOS OK" if ok else "    HAY FALLAS")
    return ok

if __name__ == "__main__":
    datos = historico()
    print(f"Datos: {len(datos)} horas de ERA5 en Parque O'Higgins, 2021-2025")
    sep = clima_septiembre(datos)
    ciclo_diario(datos)
    reparto(sep)
    consistencia_modelos()
    raise SystemExit(0 if casos() else 1)
