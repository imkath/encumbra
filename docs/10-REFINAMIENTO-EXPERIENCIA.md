# Refinamiento de la experiencia

Pedido: excelencia visual y de uso, manteniendo mobile first y parques como tarea principal.

Problema observado: explicación y controles dispersos antes del primer resultado; perfil seleccionado después de las sugerencias; identidad del volantín escondida en un segundo bloque.

Cambio: entrada de cielo y papel con perfil, ubicación y búsqueda reunidos. Sugerencias actualizadas por callback explícito al cambiar radio, sin listener global. Viento y rachas visibles, detalle desplegable con acciones claras. Explicación del ranking bajo details; avisos de datos ausentes o antiguos siempre visibles. Solo un h1 y veredicto posterior como h2. Animación del papel breve y respetuosa de reduced-motion.

Verificación: TypeScript completo, lint sin avisos, 46 tests de dominio y build. Navegador a 320/390/1440, geolocalización simulada, perfil, cercanía, detalle y parámetros, 17 parques, búsqueda y reduced-motion. Capturas con fixture, no clima real, en .impeccable/reviews/excellence-*.png. El problema de validación del proveedor permanece fuera de esta intervención visual.
