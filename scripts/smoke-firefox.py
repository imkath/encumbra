import json
from pathlib import Path

from playwright.sync_api import TimeoutError as PlaywrightTimeoutError, sync_playwright


BASE = "http://127.0.0.1:3000"
SALIDAS = Path("/tmp/encumbra-smoke")
SALIDAS.mkdir(exist_ok=True)


def revisar_pagina(page, ruta: str, captura: str):
    page.goto(f"{BASE}{ruta}", wait_until="networkidle")
    page.screenshot(path=str(SALIDAS / captura), full_page=True)
    return {
        "ruta": ruta,
        "titulo": page.title(),
        "ancho_documento": page.evaluate("document.documentElement.scrollWidth"),
        "ancho_ventana": page.evaluate("window.innerWidth"),
        "h1": page.locator("h1").first.text_content(),
    }


with sync_playwright() as p:
    browser = p.firefox.launch(headless=False)
    errores = []
    resultados = []

    movil = browser.new_context(
        viewport={"width": 390, "height": 844},
        geolocation={"latitude": -33.4648, "longitude": -70.5472},
        permissions=["geolocation"],
        color_scheme="light",
        locale="es-CL",
    )
    pagina = movil.new_page()
    pagina.on("console", lambda mensaje: errores.append(mensaje.text) if mensaje.type == "error" else None)
    pagina.on("pageerror", lambda error: errores.append(str(error)))
    resultados.append(revisar_pagina(pagina, "/app", "app-mobile.png"))
    recursos_js = pagina.evaluate(
        """performance.getEntriesByType('resource')
          .filter((recurso) => recurso.name.includes('/_next/static/chunks/') && recurso.name.endsWith('.js'))
          .map((recurso) => ({ nombre: recurso.name.split('/').pop(), bytes: recurso.transferSize }))"""
    )
    resultados.append({
        "js_first_load_bytes": sum(recurso["bytes"] for recurso in recursos_js),
        "js_recursos": recursos_js,
    })
    pagina.get_by_role("button", name="Ver si anda donde estoy").click()
    try:
        pagina.locator(".donde-estoy__resultado").wait_for(timeout=12_000)
    except PlaywrightTimeoutError:
        pagina.screenshot(path=str(SALIDAS / "app-mobile-ubicacion-error.png"), full_page=True)
        raise AssertionError(
            "La ubicación no respondió. "
            f"Aviso visible: {pagina.locator('.app-feedback').inner_text()}; "
            f"errores: {errores}; "
            f"botón: {pagina.get_by_role('button', name='Ver si anda donde estoy').inner_text()}"
        )
    pagina.screenshot(path=str(SALIDAS / "app-mobile-ubicacion.png"), full_page=True)
    resultados.append({
        "ubicacion": pagina.locator(".donde-estoy__resultado").inner_text(),
        "parques_autorizados": pagina.get_by_text("14 parques", exact=False).first.inner_text(),
    })
    pagina.get_by_role("button", name="Mostrar mapa").click()
    pagina.locator(".mapa-punto").first.wait_for(timeout=15_000)
    pagina.screenshot(path=str(SALIDAS / "app-mobile-mapa.png"), full_page=True)
    movil.close()

    escritorio = browser.new_context(
        viewport={"width": 1440, "height": 1000},
        color_scheme="dark",
        locale="es-CL",
    )
    pagina = escritorio.new_page()
    pagina.on("console", lambda mensaje: errores.append(mensaje.text) if mensaje.type == "error" else None)
    pagina.on("pageerror", lambda error: errores.append(str(error)))
    resultados.append(revisar_pagina(pagina, "/app", "app-desktop-dark.png"))
    pagina.get_by_role("button", name="Mostrar mapa").click()
    pagina.locator(".mapa-punto").first.wait_for(timeout=15_000)
    pagina.screenshot(path=str(SALIDAS / "app-desktop-dark-mapa.png"), full_page=True)
    resultados.append(
        revisar_pagina(
            pagina,
            "/volar?zona=penalolen&perfil=estandar&parque=parque-penalolen",
            "volar-desktop-dark.png",
        )
    )
    escritorio.close()
    browser.close()

    print(json.dumps({"resultados": resultados, "errores_consola": errores}, ensure_ascii=False, indent=2))
