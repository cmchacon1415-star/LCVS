import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { CLIENTES, CURRENT_USER, getCliente, getMandatario } from '../data/clientes';
import { buildDocumentModel } from '../utils/documentModel';
import { pdfBase64FromModel } from '../utils/pdf';
import { uid } from '../utils/text';

const STORE_KEY = 'gd_poderes_sii_v2';
const LOG_KEY = 'gd_internal_log_v2';

// Cada "track" es una línea de poder independiente por cliente: la de la
// empresa (persona jurídica) y una por cada persona natural mandante.
// Un cliente puede tener a la vez un poder jurídico vigente Y uno o más
// poderes de persona natural vigentes, sin que se pisen entre sí.
export function trackKey(tipoMandante, naturalPersonId) {
  return tipoMandante === 'natural' ? `natural:${naturalPersonId}` : 'juridica';
}
export function trackLabel(tipoMandante, naturalPersonNombre) {
  return tipoMandante === 'natural' ? `Persona natural: ${naturalPersonNombre}` : 'Persona jurídica (empresa)';
}

function seedStore() {
  const linos = getCliente('linos');
  const v1Model = buildDocumentModel({
    ciudadFirma: 'Santiago', fecha: '2026-03-26', tipoMandante: 'juridica', cliente: linos,
    firmantes: [linos.representantes[0]], mandatarios: [getMandatario('m1'), getMandatario('m2')],
  });
  const v2Model = buildDocumentModel({
    ciudadFirma: 'Santiago', fecha: '2026-07-08', tipoMandante: 'juridica', cliente: linos,
    firmantes: [linos.representantes[0]], mandatarios: [getMandatario('m1'), getMandatario('m2'), getMandatario('m4')],
  });
  return {
    linos: [
      {
        id: uid(), version: 1, fechaISO: '2026-03-26', usuario: 'Usuario X', estado: 'archivado',
        tipoMandante: 'juridica', naturalPersonId: null, naturalPersonNombre: null,
        mandatarios: [
          { nombre: 'Nicolás Antonio Martínez Alvear', rut: '16.662.054-6' },
          { nombre: 'Víctor Contreras Antil', rut: '16.718.579-7' },
        ],
        observaciones: '', eliminado: false, eliminadoInfo: null,
        pdfBase64: pdfBase64FromModel(v1Model),
        fileName: 'Poder_SII_COMERCIALIZADORA_DE_LINOS_SpA_Juridica_v1.pdf',
      },
      {
        id: uid(), version: 2, fechaISO: '2026-07-08', usuario: 'Camila Montoya', estado: 'vigente',
        tipoMandante: 'juridica', naturalPersonId: null, naturalPersonNombre: null,
        mandatarios: [
          { nombre: 'Nicolás Antonio Martínez Alvear', rut: '16.662.054-6' },
          { nombre: 'Víctor Contreras Antil', rut: '16.718.579-7' },
          { nombre: 'Brenda Scarlet Álvarez', rut: '20.379.630-7' },
        ],
        observaciones: '', eliminado: false, eliminadoInfo: null,
        pdfBase64: pdfBase64FromModel(v2Model),
        fileName: 'Poder_SII_COMERCIALIZADORA_DE_LINOS_SpA_Juridica_v2.pdf',
      },
    ],
  };
}

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

const PoderesStoreContext = createContext(null);

export function PoderesStoreProvider({ children }) {
  const [store, setStore] = useState(() => {
    const existing = loadJSON(STORE_KEY, null);
    return existing || seedStore();
  });
  const [internalLog, setInternalLog] = useState(() => loadJSON(LOG_KEY, []));

  useEffect(() => {
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
  }, [store]);
  useEffect(() => {
    localStorage.setItem(LOG_KEY, JSON.stringify(internalLog));
  }, [internalLog]);

  const logInternal = useCallback((entry) => {
    setInternalLog((prev) => [{ id: uid(), ts: new Date().toISOString(), ...entry }, ...prev]);
  }, []);

  const vigenteFor = useCallback(
    (clienteId, track) => {
      const records = store[clienteId] || [];
      return records.find((r) => !r.eliminado && r.estado === 'vigente' && trackKey(r.tipoMandante, r.naturalPersonId) === track) || null;
    },
    [store]
  );

  const archivedFor = useCallback(
    (clienteId, track) => {
      const records = store[clienteId] || [];
      return records
        .filter((r) => !r.eliminado && r.estado !== 'vigente' && trackKey(r.tipoMandante, r.naturalPersonId) === track)
        .sort((a, b) => b.version - a.version);
    },
    [store]
  );

  const tracksForCliente = useCallback(
    (clienteId) => {
      const records = (store[clienteId] || []).filter((r) => !r.eliminado);
      const map = new Map();
      records.forEach((r) => {
        const key = trackKey(r.tipoMandante, r.naturalPersonId);
        if (!map.has(key)) {
          map.set(key, { key, tipoMandante: r.tipoMandante, naturalPersonId: r.naturalPersonId, naturalPersonNombre: r.naturalPersonNombre });
        }
      });
      return Array.from(map.values());
    },
    [store]
  );

  const clientesConPoder = useMemo(
    () => CLIENTES.filter((c) => (store[c.id] || []).some((r) => !r.eliminado)),
    [store]
  );

  const addVersion = useCallback((clienteId, payload) => {
    let created = null;
    setStore((prev) => {
      const cliente = getCliente(clienteId);
      const track = trackKey(payload.tipoMandante, payload.naturalPersonId);
      const records = prev[clienteId] || [];
      const sameTrack = records.filter((r) => trackKey(r.tipoMandante, r.naturalPersonId) === track);
      const nextVersion = sameTrack.length ? Math.max(...sameTrack.map((r) => r.version)) + 1 : 1;
      const archivedRecords = records.map((r) =>
        trackKey(r.tipoMandante, r.naturalPersonId) === track ? { ...r, estado: 'archivado' } : r
      );
      const suffix = payload.tipoMandante === 'natural'
        ? `PersonaNatural_${(payload.naturalPersonNombre || '').split(' ')[0]}`
        : 'Juridica';
      const fileName = `Poder_SII_${cliente.razonSocial.replace(/[^a-zA-Z0-9]+/g, '_')}_${suffix}_v${nextVersion}.pdf`;
      created = {
        id: uid(),
        version: nextVersion,
        fechaISO: payload.fechaISO,
        usuario: payload.usuario,
        estado: 'vigente',
        tipoMandante: payload.tipoMandante,
        naturalPersonId: payload.naturalPersonId || null,
        naturalPersonNombre: payload.naturalPersonNombre || null,
        mandatarios: payload.mandatarios,
        observaciones: payload.observaciones || '',
        eliminado: false,
        eliminadoInfo: null,
        pdfBase64: payload.pdfBase64,
        fileName,
      };
      return { ...prev, [clienteId]: [...archivedRecords, created] };
    });
    return created;
  }, []);

  const softDelete = useCallback(
    (clienteId, recordId, { usuario, motivo }) => {
      setStore((prev) => {
        const records = prev[clienteId] || [];
        const target = records.find((r) => r.id === recordId);
        if (!target) return prev;
        const updated = records.map((r) =>
          r.id === recordId
            ? { ...r, eliminado: true, eliminadoInfo: { usuario, fechaISO: new Date().toISOString().slice(0, 10), motivo: motivo || '' } }
            : r
        );
        logInternal({
          usuario,
          cliente: getCliente(clienteId)?.razonSocial,
          tipo: 'eliminacion',
          mensaje: `Eliminación (lógica) de Poder SII v${target.version} · ${trackLabel(target.tipoMandante, target.naturalPersonNombre)}.`,
          detalle: motivo || '',
        });
        return { ...prev, [clienteId]: updated };
      });
    },
    [logInternal]
  );

  const findRecord = useCallback(
    (clienteId, recordId) => (store[clienteId] || []).find((r) => r.id === recordId) || null,
    [store]
  );

  const resetDemo = useCallback(() => {
    setStore(seedStore());
    setInternalLog([]);
  }, []);

  const value = useMemo(
    () => ({
      store, internalLog, logInternal, vigenteFor, archivedFor, tracksForCliente,
      clientesConPoder, addVersion, softDelete, findRecord, resetDemo,
    }),
    [store, internalLog, logInternal, vigenteFor, archivedFor, tracksForCliente, clientesConPoder, addVersion, softDelete, findRecord, resetDemo]
  );

  return <PoderesStoreContext.Provider value={value}>{children}</PoderesStoreContext.Provider>;
}

export function usePoderesStore() {
  const ctx = useContext(PoderesStoreContext);
  if (!ctx) throw new Error('usePoderesStore debe usarse dentro de PoderesStoreProvider');
  return ctx;
}

export { CURRENT_USER };
