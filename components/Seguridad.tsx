export function Seguridad() {
  return (
    <section className="seguridad" aria-labelledby="titulo-seguridad">
      <div className="bloque__contenido">
        <h2 id="titulo-seguridad">Antes de soltar hilo</h2>

        <div className="seguridad__bloque">
          <h3>Tendidos eléctricos</h3>
          <p>
            Elige un espacio sin postes ni cables. Si el volantín se enreda, no
            lo rescates de árboles, techos o infraestructura eléctrica.
          </p>
          <a href="https://energia.gob.cl/node/25222">
            Ver recomendaciones de Energía
          </a>
        </div>

        <div className="seguridad__bloque">
          <h3>Hilo curado</h3>
          <p>
            Está prohibido por la Ley 20.700. Fabricarlo, almacenarlo o venderlo
            arriesga presidio de 61 a 540 días y multa de 100 a 500 UTM; usarlo
            o facilitarlo, multa de 2 a 50 UTM.
          </p>
          <a href="https://www.bcn.cl/leychile/navegar?idNorma=1054358">
            Leer la ley en la BCN
          </a>
        </div>
      </div>
    </section>
  );
}
