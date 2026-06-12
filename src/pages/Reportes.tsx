import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  AlertCircle,
  Inbox,
  Phone,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";

import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { getFraudes, type Fraud } from "@/lib/api";

type Status = "loading" | "success" | "error";

// Formatea la fecha que devuelve el Backend (ISO) a algo legible.
const formatDate = (iso: string): string => {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return iso;
  return date.toLocaleString("es-CR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const Reportes = () => {
  const [fraudes, setFraudes] = useState<Fraud[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [errorMsg, setErrorMsg] = useState<string>("");

  const load = async () => {
    setStatus("loading");
    setErrorMsg("");
    try {
      const data = await getFraudes();
      // Mostramos primero los reportes más recientes.
      data.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setFraudes(data);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg(
        err instanceof Error ? err.message : "Ocurrió un error inesperado."
      );
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main id="main-content" className="flex-1 mt-20">
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-3xl mx-auto">
            {/* Encabezado */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
                  <FileText className="w-8 h-8 text-primary" />
                  Reportes de fraude
                </h1>
                <p className="text-muted-foreground">
                  Listado público de los reportes registrados.
                </p>
              </div>
              <button
                onClick={load}
                disabled={status === "loading"}
                className="btn btn-secondary btn-sm gap-2 self-start"
              >
                <RefreshCw
                  className={`w-4 h-4 ${
                    status === "loading" ? "animate-spin" : ""
                  }`}
                />
                Actualizar
              </button>
            </div>

            {/* Estado de carga */}
            {status === "loading" && (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <span className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-primary mb-4" />
                <p>Cargando reportes...</p>
              </div>
            )}

            {/* Estado de error */}
            {status === "error" && (
              <div
                role="alert"
                className="flex flex-col items-center text-center gap-3 rounded-lg border border-red-200 bg-red-50 p-8 text-red-800"
              >
                <AlertCircle className="w-8 h-8" />
                <p className="font-semibold">No se pudieron cargar los reportes.</p>
                <p className="text-sm">{errorMsg}</p>
                <button onClick={load} className="btn btn-secondary btn-sm mt-2">
                  Reintentar
                </button>
              </div>
            )}

            {/* Sin datos */}
            {status === "success" && fraudes.length === 0 && (
              <div className="flex flex-col items-center text-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-12 text-muted-foreground">
                <Inbox className="w-10 h-10" />
                <p className="font-semibold text-foreground">
                  Aún no hay reportes registrados.
                </p>
                <Link to="/reportar-estafa" className="btn btn-primary btn-sm mt-2">
                  Registrar el primer reporte
                </Link>
              </div>
            )}

            {/* Listado */}
            {status === "success" && fraudes.length > 0 && (
              <div className="space-y-4">
                {fraudes.map((fraude) => (
                  <article key={fraude.id} className="card p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <h2 className="font-semibold text-foreground">
                        {fraude.impostorDetails}
                      </h2>
                      <time className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                        {formatDate(fraude.createdAt)}
                      </time>
                    </div>

                    <p className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <Phone className="w-4 h-4 shrink-0" />
                      <span className="break-all">{fraude.contactInfo}</span>
                    </p>

                    <p className="text-sm text-foreground/90 whitespace-pre-line">
                      {fraude.comments}
                    </p>
                  </article>
                ))}
              </div>
            )}

            {/* Volver al formulario */}
            <div className="mt-10 text-center">
              <Link
                to="/reportar-estafa"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver al formulario de reporte
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Reportes;
