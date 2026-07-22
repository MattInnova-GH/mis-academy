import { useState, useEffect, useMemo, useCallback } from "react";
import { apiUrl } from "../../config/api"

import "./reclamos.css";

type ProcessingStatus = "Pendiente" | "En Proceso" | "Respondido" | "Cerrado";
type ClaimType = "Reclamo" | "Queja";

interface Reclamacion {
    id: number;
    tracking_code: string;
    doc_type: string;
    dni: string;
    apellido_paterno: string;
    apellido_materno: string;
    nombres: string;
    telefono: string;
    email: string;
    department: string;
    province: string;
    district: string;
    domicilio: string;
    is_minor: boolean;
    parent_doc_type?: string | null;
    parent_dni?: string | null;
    parent_apellido_paterno?: string | null;
    parent_nombres?: string | null;
    parent_email?: string | null;
    service_type: string[] | string;
    amount?: string | number | null;
    service_description: string;
    claim_description: string;
    claim_request: string;
    claim_type: ClaimType;
    processing_status: ProcessingStatus;
    admin_response?: string | null;
    responded_at?: string | null;
    createdAt: string;
}

const STATUS_BADGE_MAP: Record<string, string> = {
    Pendiente: "badge-pendiente",
    "En Proceso": "badge-proceso",
    Respondido: "badge-respondido",
    Cerrado: "badge-cerrado",
};

export default function AdminReclamaciones() {
    const [reclamaciones, setReclamaciones] = useState<Reclamacion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadError, setLoadError] = useState("");

    const [filterText, setFilterText] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [filterType, setFilterType] = useState("");

    const [selectedItem, setSelectedItem] = useState<Reclamacion | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showRespondModal, setShowRespondModal] = useState(false);

    const [respondForm, setRespondForm] = useState({ admin_response: "", processing_status: "" });
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState("");
    const [saveSuccess, setSaveSuccess] = useState("");

    // -------------------------------------------------------------------------
    // Carga del listado — GET /api/reclamaciones (panel admin, protegido)
    // -------------------------------------------------------------------------
    const cargar = useCallback(async () => {
        setIsLoading(true);
        setLoadError("");

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);

        try {
            const token = localStorage.getItem("token");

            const response = await fetch(apiUrl("/reclamaciones"), {
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error("Error al cargar");

            const list: Reclamacion[] = await response.json();
            setReclamaciones(list);
        } catch {
            setLoadError("Error al cargar las reclamaciones.");
        } finally {
            clearTimeout(timeoutId);
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        cargar();
    }, [cargar]);

    // -------------------------------------------------------------------------
    // Filtros (equivalente a applyFilters())
    // -------------------------------------------------------------------------
    const filtered = useMemo(() => {
        const text = filterText.toLowerCase();
        return reclamaciones.filter((r) => {
            const matchText =
                !text ||
                `${r.nombres} ${r.apellido_paterno} ${r.apellido_materno}`.toLowerCase().includes(text) ||
                r.dni?.includes(text) ||
                r.tracking_code?.toLowerCase().includes(text);
            const matchStatus = !filterStatus || r.processing_status === filterStatus;
            const matchType = !filterType || r.claim_type === filterType;
            return matchText && matchStatus && matchType;
        });
    }, [reclamaciones, filterText, filterStatus, filterType]);

    const counts = useMemo(
        () => ({
            total: reclamaciones.length,
            pendiente: reclamaciones.filter((r) => r.processing_status === "Pendiente").length,
            proceso: reclamaciones.filter((r) => r.processing_status === "En Proceso").length,
            respondido: reclamaciones.filter((r) => r.processing_status === "Respondido").length,
        }),
        [reclamaciones]
    );

    // -------------------------------------------------------------------------
    // Modales
    // -------------------------------------------------------------------------
    const openDetail = (item: Reclamacion) => {
        setSelectedItem(item);
        setShowDetailModal(true);
    };

    const openRespond = (item: Reclamacion) => {
        setSelectedItem(item);
        setRespondForm({
            admin_response: item.admin_response || "",
            processing_status: item.processing_status || "En Proceso",
        });
        setSaveError("");
        setSaveSuccess("");
        setShowRespondModal(true);
    };

    const closeModals = () => {
        setShowDetailModal(false);
        setShowRespondModal(false);
        setSelectedItem(null);
    };

    // -------------------------------------------------------------------------
    // Responder reclamo — PUT /api/reclamaciones/{id}/responder
    // -------------------------------------------------------------------------
    const guardarRespuesta = async () => {
        if (!selectedItem) return;
        if (!respondForm.admin_response.trim() || !respondForm.processing_status) {
            setSaveError("Completa la respuesta y el estado.");
            return;
        }
        setIsSaving(true);
        setSaveError("");
        setSaveSuccess("");

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        try {
            const token = localStorage.getItem("token");

            const response = await fetch(apiUrl(`/reclamaciones/${selectedItem.id}/responder`),
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(respondForm),
                }
            );

            const updated = await response.json();

            if (!response.ok) {
                throw new Error(updated.error || "Error al guardar. Intente nuevamente.");
            }

            setReclamaciones((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
            setSaveSuccess("Respuesta guardada correctamente.");
            setTimeout(() => closeModals(), 1200);
        } catch {
            setSaveError("Error al guardar. Intente nuevamente.");
        } finally {
            clearTimeout(timeoutId);
            setIsSaving(false);
        }
    };

    // -------------------------------------------------------------------------
    // Helpers de presentación
    // -------------------------------------------------------------------------
    const getStatusClass = (status: string) => STATUS_BADGE_MAP[status] || "badge-pendiente";

    const formatDate = (dateStr?: string | null, long = false) => {
        if (!dateStr) return "—";
        return new Date(dateStr).toLocaleDateString("es-PE", {
            day: "2-digit",
            month: long ? "long" : "short",
            year: "numeric",
        });
    };

    const formatId = (id: number) => String(id).padStart(8, "0");

    const fullName = (item: Reclamacion | null) =>
        item ? `${item.nombres} ${item.apellido_paterno} ${item.apellido_materno}` : "";

    const serviceList = (item: Reclamacion | null): string[] => {
        if (!item?.service_type) return [];
        try {
            return Array.isArray(item.service_type) ? item.service_type : JSON.parse(item.service_type);
        } catch {
            return [];
        }
    };

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------
    return (
        <div className="px-8 py-6 text-black flex flex-col gap-6">
            {/* Header */}
            <div className="page-header">
                <button className="btn-reload" onClick={cargar} disabled={isLoading}>
                    <i className={`fas fa-sync-alt ${isLoading ? "fa-spin" : ""}`}></i> Actualizar
                </button>
            </div>
            <br />
            {/* Stats */}
            <div className="stats-row">
                <div className="stat-card">
                    <span className="stat-num">{counts.total}</span>
                    <span className="stat-label">Total</span>
                </div>
                <div className="stat-card pendiente">
                    <span className="stat-num">{counts.pendiente}</span>
                    <span className="stat-label">Pendientes</span>
                </div>
                <div className="stat-card proceso">
                    <span className="stat-num">{counts.proceso}</span>
                    <span className="stat-label">En Proceso</span>
                </div>
                <div className="stat-card respondido">
                    <span className="stat-num">{counts.respondido}</span>
                    <span className="stat-label">Respondidos</span>
                </div>
            </div>

            {/* Filtros */}
            <div className="filters-bar">
                <input
                    type="text"
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    placeholder="Buscar por nombre, DNI o código..."
                    className="filter-input"
                />
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="filter-select">
                    <option value="">Todos los estados</option>
                    <option value="Pendiente">Pendiente</option>
                    <option value="En Proceso">En Proceso</option>
                    <option value="Respondido">Respondido</option>
                    <option value="Cerrado">Cerrado</option>
                </select>
                <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="filter-select">
                    <option value="">Todos los tipos</option>
                    <option value="Reclamo">Reclamo</option>
                    <option value="Queja">Queja</option>
                </select>
            </div>

            {/* Error */}
            {loadError && (
                <div className="ar-error">
                    <i className="fas fa-exclamation-circle"></i> {loadError}
                </div>
            )}

            {/* Loading */}
            {isLoading && (
                <div className="ar-loading">
                    <i className="fas fa-spinner fa-spin"></i> Cargando...
                </div>
            )}

            {/* Tabla */}
            {!isLoading && (
                <div className="table-wrap">
                    <table className="ar-table">
                        <thead>
                            <tr>
                                <th>Nº</th>
                                <th>Fecha</th>
                                <th>Reclamante</th>
                                <th>DNI</th>
                                <th>Tipo</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="td-empty">
                                        No hay reclamos que coincidan con los filtros.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((r) => (
                                    <tr key={r.id}>
                                        <td className="td-id">{formatId(r.id)}</td>
                                        <td>{formatDate(r.createdAt)}</td>
                                        <td className="td-name">
                                            {r.nombres} {r.apellido_paterno}
                                        </td>
                                        <td>{r.dni}</td>
                                        <td>
                                            <span
                                                className={`type-badge ${r.claim_type === "Reclamo" ? "type-reclamo" : ""
                                                    } ${r.claim_type === "Queja" ? "type-queja" : ""}`}
                                            >
                                                {r.claim_type}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${getStatusClass(r.processing_status)}`}>
                                                {r.processing_status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-btns">
                                                <button className="btn-ver" onClick={() => openDetail(r)} title="Ver detalle">
                                                    <i className="fas fa-eye"></i>
                                                </button>
                                                <button
                                                    className="btn-responder"
                                                    onClick={() => openRespond(r)}
                                                    title="Responder"
                                                >
                                                    <i className="fas fa-reply"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* MODAL: Detalle */}
            {showDetailModal && selectedItem && (
                <div className="ar-modal-backdrop" onClick={closeModals}>
                    <div className="ar-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="ar-modal-header">
                            <h2>
                                <i className="fas fa-file-alt"></i> Detalle del Reclamo Nº {formatId(selectedItem.id)}
                            </h2>
                            <button className="btn-close-modal" onClick={closeModals}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="ar-modal-body">
                            <div className="detail-section">
                                <h4>Estado</h4>
                                <span className={`status-badge ${getStatusClass(selectedItem.processing_status)}`}>
                                    {selectedItem.processing_status}
                                </span>{" "}
                                <span
                                    className={`type-badge ${selectedItem.claim_type === "Reclamo" ? "type-reclamo" : ""
                                        } ${selectedItem.claim_type === "Queja" ? "type-queja" : ""}`}
                                >
                                    {selectedItem.claim_type}
                                </span>
                            </div>

                            <div className="detail-section">
                                <h4>Consumidor</h4>
                                <div className="detail-grid">
                                    <div>
                                        <span>Nombre completo</span>
                                        <strong>{fullName(selectedItem)}</strong>
                                    </div>
                                    <div>
                                        <span>Documento</span>
                                        <strong>
                                            {selectedItem.doc_type}: {selectedItem.dni}
                                        </strong>
                                    </div>
                                    <div>
                                        <span>Teléfono</span>
                                        <strong>{selectedItem.telefono}</strong>
                                    </div>
                                    <div>
                                        <span>Email</span>
                                        <strong>{selectedItem.email}</strong>
                                    </div>
                                    <div>
                                        <span>Ubicación</span>
                                        <strong>
                                            {selectedItem.district}, {selectedItem.province}, {selectedItem.department}
                                        </strong>
                                    </div>
                                    <div>
                                        <span>Domicilio</span>
                                        <strong>{selectedItem.domicilio}</strong>
                                    </div>
                                    <div>
                                        <span>Código de Seguimiento</span>
                                        <strong>{selectedItem.tracking_code}</strong>
                                    </div>
                                </div>
                            </div>

                            {selectedItem.is_minor && selectedItem.parent_nombres && (
                                <div className="detail-section">
                                    <h4>Representante (Menor de edad)</h4>
                                    <div className="detail-grid">
                                        <div>
                                            <span>Nombre</span>
                                            <strong>
                                                {selectedItem.parent_nombres} {selectedItem.parent_apellido_paterno}
                                            </strong>
                                        </div>
                                        <div>
                                            <span>Documento</span>
                                            <strong>
                                                {selectedItem.parent_doc_type}: {selectedItem.parent_dni}
                                            </strong>
                                        </div>
                                        <div>
                                            <span>Email</span>
                                            <strong>{selectedItem.parent_email}</strong>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="detail-section">
                                <h4>Servicios Reclamados</h4>
                                <div className="tag-list">
                                    {serviceList(selectedItem).map((srv) => (
                                        <span className="srv-tag" key={srv}>
                                            {srv}
                                        </span>
                                    ))}
                                </div>
                                {selectedItem.amount && (
                                    <p className="detail-amount">
                                        Monto reclamado: <strong>S/. {selectedItem.amount}</strong>
                                    </p>
                                )}
                                <p className="detail-text">{selectedItem.service_description}</p>
                            </div>

                            <div className="detail-section">
                                <h4>Descripción del Reclamo</h4>
                                <p className="detail-text">{selectedItem.claim_description}</p>
                                <h4 style={{ marginTop: 12 }}>Pedido del Consumidor</h4>
                                <p className="detail-text">{selectedItem.claim_request}</p>
                            </div>

                            {selectedItem.admin_response && (
                                <div className="detail-section response-section">
                                    <h4>
                                        <i className="fas fa-reply"></i> Respuesta de la Empresa
                                    </h4>
                                    <p className="detail-text">{selectedItem.admin_response}</p>
                                    <small>Respondido el {formatDate(selectedItem.responded_at)}</small>
                                </div>
                            )}
                        </div>
                        <div className="ar-modal-footer">
                            <button className="btn-responder-full" onClick={() => openRespond(selectedItem)}>
                                <i className="fas fa-reply"></i> Responder
                            </button>
                            <button className="btn-cancelar" onClick={closeModals}>
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: Responder */}
            {showRespondModal && selectedItem && (
                <div className="ar-modal-backdrop" onClick={closeModals}>
                    <div className="ar-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="ar-modal-header">
                            <h2>
                                <i className="fas fa-reply"></i> Responder Reclamo Nº {formatId(selectedItem.id)}
                            </h2>
                            <button className="btn-close-modal" onClick={closeModals}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="ar-modal-body">
                            <p className="respond-info">
                                <strong>{fullName(selectedItem)}</strong> — {selectedItem.claim_type} —{" "}
                                {formatDate(selectedItem.createdAt)}
                            </p>

                            {saveError && (
                                <div className="ar-save-error">
                                    <i className="fas fa-exclamation-circle"></i> {saveError}
                                </div>
                            )}
                            {saveSuccess && (
                                <div className="ar-save-success">
                                    <i className="fas fa-check-circle"></i> {saveSuccess}
                                </div>
                            )}

                            <div className="rec-group" style={{ marginBottom: 16 }}>
                                <label>Estado del Reclamo</label>
                                <select
                                    value={respondForm.processing_status}
                                    onChange={(e) =>
                                        setRespondForm((prev) => ({ ...prev, processing_status: e.target.value }))
                                    }
                                >
                                    <option value="En Proceso">En Proceso</option>
                                    <option value="Respondido">Respondido</option>
                                    <option value="Cerrado">Cerrado</option>
                                </select>
                            </div>

                            <div className="rec-group">
                                <label>Respuesta al Reclamante</label>
                                <textarea
                                    value={respondForm.admin_response}
                                    onChange={(e) =>
                                        setRespondForm((prev) => ({ ...prev, admin_response: e.target.value }))
                                    }
                                    placeholder="Redacta la respuesta oficial de la institución..."
                                    rows={6}
                                />
                            </div>
                        </div>
                        <div className="ar-modal-footer">
                            <button className="btn-responder-full" onClick={guardarRespuesta} disabled={isSaving}>
                                {!isSaving ? (
                                    <>
                                        <i className="fas fa-save"></i> Guardar Respuesta
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-spinner fa-spin"></i> Guardando...
                                    </>
                                )}
                            </button>
                            <button className="btn-cancelar" onClick={closeModals}>
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}