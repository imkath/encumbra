import json
import os
import re
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
    caja_busqueda = pagina.locator(".buscar-ubicacion").bounding_box()
    caja_ubicacion = pagina.locator(".donde-estoy__accion").bounding_box()
    assert caja_busqueda and caja_ubicacion
    separacion_ubicacion = caja_ubicacion["y"] - (
        caja_busqueda["y"] + caja_busqueda["height"]
    )
    assert separacion_ubicacion >= 8, separacion_ubicacion
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
    resultados.append(revisar_pagina(pagina, "/", "portada-mobile.png"))
    selector_portada_movil = pagina.get_by_role("switch", name="Tema oscuro")
    assert selector_portada_movil.get_attribute("aria-checked") == "false"
    selector_portada_movil.focus()
    pagina.keyboard.press("Space")
    pagina.wait_for_function("document.documentElement.dataset.theme === 'dark'")
    assert selector_portada_movil.get_attribute("aria-checked") == "true"
    pagina.wait_for_function(
        "getComputedStyle(document.querySelector('.selector-tema__luna')).opacity === '1'"
    )
    pagina.wait_for_timeout(500)
    pagina.screenshot(path=str(SALIDAS / "portada-mobile-dark.png"), full_page=True)
    pagina.keyboard.press("Space")
    pagina.wait_for_function("document.documentElement.dataset.theme === 'light'")
    movil.close()

    escritorio = browser.new_context(
        viewport={"width": 1440, "height": 1000},
        color_scheme="dark",
        locale="es-CL",
    )
    pagina = escritorio.new_page()
    pagina.on("console", lambda mensaje: errores.append(mensaje.text) if mensaje.type == "error" else None)
    pagina.on("pageerror", lambda error: errores.append(str(error)))
    resultados.append(revisar_pagina(pagina, "/", "portada-desktop-dark.png"))
    selector_portada = pagina.get_by_role("switch", name="Tema oscuro")
    assert selector_portada.get_attribute("aria-checked") == "true"
    assert selector_portada.get_by_text("Oscuro", exact=True).is_visible()
    resultados.append(revisar_pagina(pagina, "/app", "app-desktop-dark.png"))
    assert pagina.locator("html").get_attribute("data-theme") == "dark"
    selector_tema = pagina.get_by_role("switch", name="Tema oscuro")
    assert selector_tema.get_attribute("aria-checked") == "true"
    assert pagina.locator(".selector-tema__luna").evaluate(
        "elemento => getComputedStyle(elemento).opacity"
    ) == "1"
    selector_tema.click()
    assert pagina.locator("html").get_attribute("data-theme") == "light"
    assert selector_tema.get_attribute("aria-checked") == "false"
    pagina.wait_for_function(
        "getComputedStyle(document.querySelector('.selector-tema__sol')).opacity === '1'"
    )
    assert pagina.locator(".selector-tema__sol").evaluate(
        "elemento => getComputedStyle(elemento).opacity"
    ) == "1"
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
            this.webkitCompassAccuracy = datos.webkitCompassAccuracy;
          }
        }
        Object.defineProperty(
          OrientacionSimulada.prototype,
          'webkitCompassHeading',
          { configurable: true, writable: true, value: undefined }
        );
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
    transformacion_flecha = pagina.locator(".brujula-viento__flecha").get_attribute("style") or ""
    coincidencia_angulo = re.search(r"rotate\(([-\d.]+)deg\)", transformacion_flecha)
    assert coincidencia_angulo, transformacion_flecha
    rumbo_objetivo = float(coincidencia_angulo.group(1))
    alpha_objetivo = (360 - rumbo_objetivo) % 360
    pagina.get_by_role("button", name="Orientarme para despegar").click()
    pagina.get_by_text("Buscando el norte", exact=False).wait_for()
    pagina.evaluate(
        """window.dispatchEvent(new DeviceOrientationEvent(
          'deviceorientation',
          {
            absolute: false,
            webkitCompassHeading: -1,
            webkitCompassAccuracy: -1
          }
        ))"""
    )
    pagina.get_by_text("La brújula pide calibración", exact=False).wait_for()
    pagina.evaluate(
        """rumbo => window.dispatchEvent(new DeviceOrientationEvent(
          'deviceorientation',
          {
            absolute: false,
            webkitCompassHeading: rumbo,
            webkitCompassAccuracy: 10
          }
        ))""",
        rumbo_objetivo,
    )
    pagina.get_by_text("Listo: el volantín va frente a ti", exact=True).wait_for()
    assert pagina.get_by_role("button", name="Seguir sin brújula").is_visible()
    resultado_ios = pagina.locator(".vivo__brujula-giro").inner_text()

    pagina.get_by_role("button", name="Seguir sin brújula").click()
    pagina.get_by_role("button", name="Orientarme para despegar").click()
    pagina.get_by_text("Buscando el norte", exact=False).wait_for()
    pagina.evaluate(
        """alpha => window.dispatchEvent(new DeviceOrientationEvent(
          'deviceorientationabsolute',
          { alpha, absolute: true }
        ))""",
        alpha_objetivo,
    )
    pagina.get_by_text("Listo: el volantín va frente a ti", exact=True).wait_for()
    assert pagina.get_by_role("button", name="Seguir sin brújula").is_visible()
    pagina.screenshot(path=str(SALIDAS / "volar-mobile-brujula-activa.png"), full_page=True)
    resultados.append({
        "brujula": pagina.locator(".vivo__brujula").inner_text(),
        "orientada": pagina.locator(".brujula-viento").get_attribute("data-orientada"),
        "guia_despegue": pagina.locator(".vivo__brujula-giro").inner_text(),
        "ios_webkit": resultado_ios,
        "android_absoluto": pagina.locator(".vivo__brujula-giro").inner_text(),
    })
    brujula.close()

    compacto = browser.new_context(
        viewport={"width": 320, "height": 700},
        color_scheme="light",
        locale="es-CL",
    )
    pagina = compacto.new_page()
    resultados.append(
        revisar_pagina(
            pagina,
            "/volar?zona=penalolen&perfil=estandar&parque=parque-penalolen",
            "volar-320-guia-despegue.png",
        )
    )
    assert pagina.evaluate("document.documentElement.scrollWidth <= window.innerWidth")
    assert pagina.get_by_text("Tú", exact=True).is_visible()
    assert pagina.get_by_text("Volantín", exact=True).is_visible()
    assert pagina.get_by_text("Confirma la dirección con pasto.", exact=True).is_visible()
    assert pagina.get_by_text("Sola/o o con ayuda", exact=False).count() == 0
    assert pagina.get_by_text("Desde tu mano", exact=False).count() == 0
    assert pagina.get_by_text("Ayudante + volantín", exact=True).count() == 0
    compacto.close()

    for ancho, alto, captura in (
        (768, 1024, "volar-tablet-vertical.png"),
        (1024, 768, "volar-tablet-horizontal.png"),
    ):
        tablet = browser.new_context(
            viewport={"width": ancho, "height": alto},
            color_scheme="light",
            locale="es-CL",
        )
        pagina = tablet.new_page()
        pagina.on("console", lambda mensaje: errores.append(mensaje.text) if mensaje.type == "error" else None)
        pagina.on("pageerror", lambda error: errores.append(str(error)))
        resultado_tablet = revisar_pagina(
            pagina,
            "/volar?zona=penalolen&perfil=estandar&parque=parque-penalolen",
            captura,
        )
        assert resultado_tablet["ancho_documento"] <= resultado_tablet["ancho_ventana"]
        assert pagina.get_by_text("Encuentra dónde debe ir el volantín", exact=True).is_visible()
        assert pagina.get_by_text("Confirma la dirección con pasto.", exact=True).is_visible()
        assert pagina.get_by_text("Sola/o o con ayuda", exact=False).count() == 0
        resultados.append({**resultado_tablet, "dispositivo": f"tablet {ancho}x{alto}"})
        tablet.close()
    browser.close()

    print(json.dumps({"resultados": resultados, "errores_consola": errores}, ensure_ascii=False, indent=2))
