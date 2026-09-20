import json
import os
from pathlib import Path

from playwright.sync_api import TimeoutError as PlaywrightTimeoutError, sync_playwright


BASE = os.environ.get("ENCUMBRA_BASE", "http://127.0.0.1:3000").rstrip("/")
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
    movil.grant_permissions(["geolocation"], origin=BASE)
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
    pagina.get_by_role("button", name="Explorar todos los parques", exact=True).click()
    araucano = pagina.locator(".parques-lista li").filter(
        has=pagina.get_by_text("Araucano", exact=True)
    )
    assert araucano.get_by_text("Permiso no confirmado", exact=True).count() == 1
    araucano.get_by_role("button", name="Guardar Araucano", exact=True).click()
    pagina.get_by_role("button", name="Guardados 1", exact=True).click()
    assert araucano.count() == 1
    araucano.locator(".parque-abrir").click()
    pagina.get_by_role("heading", name="Araucano", exact=True).wait_for()
    assert "autorización vigente confirmada" in pagina.locator(".permiso-detalle").inner_text()
    assert "parque=parque-araucano" in pagina.url
    assert "parque=parque-araucano" in pagina.get_by_text("Ya estoy afuera", exact=True).get_attribute("href")
    pagina.screenshot(path=str(SALIDAS / "app-mobile-araucano.png"), full_page=True)
    pagina.reload(wait_until="networkidle")
    pagina.get_by_role("heading", name="Araucano", exact=True).wait_for()
    resultados.append({"seleccion_manual": "Araucano elegible, guardado y persistente; permiso sin confirmar"})
    pagina.get_by_role("button", name="Parques", exact=True).click()
    pagina.get_by_role("button", name="Ver si anda donde estoy").click()
    try:
        pagina.get_by_role("heading", name="Donde estoy").wait_for(timeout=12_000)
    except PlaywrightTimeoutError:
        pagina.screenshot(path=str(SALIDAS / "app-mobile-ubicacion-error.png"), full_page=True)
        raise AssertionError(
            "La ubicación no abrió Mi salida. "
            f"Aviso visible: {pagina.locator('.app-feedback').inner_text()}; "
            f"errores: {errores}"
        )
    pagina.screenshot(path=str(SALIDAS / "app-mobile-ubicacion.png"), full_page=True)
    assert pagina.get_by_text("Cómo llegar", exact=True).count() == 0
    resultados.append({
        "ubicacion": pagina.locator(".salida-screen .app-heading").inner_text(),
        "accion_terreno": pagina.get_by_text("Ya estoy afuera", exact=True).inner_text(),
    })
    pagina.get_by_role("button", name="Parques", exact=True).click()
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
    assert pagina.locator("html").get_attribute("data-theme") == "dark"
    pagina.get_by_role("button", name="Cambiar entre tema claro y oscuro").click()
    assert pagina.locator("html").get_attribute("data-theme") == "light"
    pagina.reload(wait_until="networkidle")
    assert pagina.locator("html").get_attribute("data-theme") == "light"
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

    brujula = browser.new_context(
        viewport={"width": 390, "height": 844},
        color_scheme="light",
        locale="es-CL",
    )
    brujula.add_init_script(
        """
        class OrientacionSimulada extends Event {
          static async requestPermission() { return 'granted'; }
          constructor(tipo, datos = {}) {
            super(tipo);
            this.alpha = datos.alpha ?? null;
            this.absolute = datos.absolute ?? false;
            this.webkitCompassHeading = datos.webkitCompassHeading;
          }
        }
        Object.defineProperty(window, 'DeviceOrientationEvent', {
          configurable: true,
          value: OrientacionSimulada,
        });
        """
    )
    pagina = brujula.new_page()
    pagina.on("console", lambda mensaje: errores.append(mensaje.text) if mensaje.type == "error" else None)
    pagina.on("pageerror", lambda error: errores.append(str(error)))
    resultados.append(
        revisar_pagina(
            pagina,
            "/volar?zona=penalolen&perfil=estandar&parque=parque-penalolen",
            "volar-mobile-brujula-norte-arriba.png",
        )
    )
    assert pagina.locator("#direccion-viento strong").inner_text().startswith("Viene del")
    assert pagina.locator("#direccion-viento span").inner_text().startswith("Va hacia el")
    pagina.get_by_role("button", name="Orientar con mi celular").click()
    pagina.get_by_text("Buscando el norte", exact=False).wait_for()
    pagina.evaluate(
        """window.dispatchEvent(new DeviceOrientationEvent(
          'deviceorientationabsolute',
          { alpha: 90, absolute: true }
        ))"""
    )
    pagina.get_by_text("La rosa sigue el norte de tu celular.", exact=True).wait_for()
    assert pagina.get_by_role("button", name="Dejar norte arriba").is_visible()
    pagina.screenshot(path=str(SALIDAS / "volar-mobile-brujula-activa.png"), full_page=True)
    resultados.append({
        "brujula": pagina.locator(".vivo__brujula").inner_text(),
        "orientada": pagina.locator(".brujula-viento").get_attribute("data-orientada"),
    })
    brujula.close()
    browser.close()

    print(json.dumps({"resultados": resultados, "errores_consola": errores}, ensure_ascii=False, indent=2))
