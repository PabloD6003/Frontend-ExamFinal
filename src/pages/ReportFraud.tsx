import { useState } from "react";
import { Link } from "react-router-dom";
import { ShieldAlert, Send, CheckCircle2, AlertCircle, List } from "lucide-react";

import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { createFraud, type NewFraud } from "@/lib/api";

type Status = "idle" | "loading" | "success" | "error";

const EMPTY_FORM: NewFraud = {
  impostorDetails: "",
  contactInfo: "",
  comments: "",
};

const ReportFraud = () => {
  const [form, setForm] = useState<NewFraud>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof NewFraud, string>>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [serverError, setServerError] = useState<string>("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Limpiamos el error del campo a medida que el usuario escribe.
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  // Validaciones básicas: ningún campo obligatorio puede ir vacío.
  const validate = (): boolean => {
    const next: Partial<Record<keyof NewFraud, string>> = {};
    if (!form.impostorDetails.trim())
      next.impostorDetails = "Indique los detalles del impostor.";
    if (!form.contactInfo.trim())
      next.contactInfo = "Indique desde dónde lo contactaron.";
    if (!form.comments.trim())
      next.comments = "Describa brevemente el caso.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;

    setStatus("loading");
    try {
      await createFraud({
        impostorDetails: form.impostorDetails.trim(),
        contactInfo: form.contactInfo.trim(),
        comments: form.comments.trim(),
      });
      setStatus("success");
      setForm(EMPTY_FORM);
    } catch (err) {
      setStatus("error");
      setServerError(
        err instanceof Error ? err.message : "Ocurrió un error inesperado."
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main id="main-content" className="flex-1 mt-20">
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-2xl mx-auto">
            {/* Encabezado */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-5">
                <ShieldAlert className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
                Reportar un fraude
              </h1>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Complete el formulario con la información del intento de fraude.
                Su reporte ayuda a prevenir que otras personas sean afectadas.
              </p>
            </div>

            {/* Mensaje de éxito */}
            {status === "success" && (
              <div
                role="status"
                className="mb-6 flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800"
              >
                <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">Reporte enviado correctamente.</p>
                  <p className="text-sm">
                    Gracias por su colaboración. Puede{" "}
                    <Link to="/reportes" className="underline font-medium">
                      ver todos los reportes
                    </Link>{" "}
                    o registrar otro caso.
                  </p>
                </div>
              </div>
            )}

            {/* Mensaje de error del servidor */}
            {status === "error" && serverError && (
              <div
                role="alert"
                className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800"
              >
                <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">No se pudo enviar el reporte.</p>
                  <p className="text-sm">{serverError}</p>
                </div>
              </div>
            )}

            {/* Formulario */}
            <form onSubmit={handleSubmit} noValidate className="card p-6 sm:p-8 space-y-6">
              {/* Detalles del impostor */}
              <div>
                <label
                  htmlFor="impostorDetails"
                  className="block text-sm font-medium text-foreground mb-1.5"
                >
                  Detalles del impostor <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="impostorDetails"
                  name="impostorDetails"
                  value={form.impostorDetails}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Nombre, empresa o institución que dijo representar, etc."
                  className="input h-auto py-2.5"
                  aria-invalid={!!errors.impostorDetails}
                />
                {errors.impostorDetails && (
                  <p className="mt-1.5 text-sm text-red-600">
                    {errors.impostorDetails}
                  </p>
                )}
              </div>

              {/* Información de contacto */}
              <div>
                <label
                  htmlFor="contactInfo"
                  className="block text-sm font-medium text-foreground mb-1.5"
                >
                  Número, correo o usuario desde el que contactó{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  id="contactInfo"
                  name="contactInfo"
                  type="text"
                  value={form.contactInfo}
                  onChange={handleChange}
                  placeholder="Ej. +506 8888-8888, estafa@correo.com, @usuario"
                  className="input"
                  aria-invalid={!!errors.contactInfo}
                />
                {errors.contactInfo && (
                  <p className="mt-1.5 text-sm text-red-600">
                    {errors.contactInfo}
                  </p>
                )}
              </div>

              {/* Comentarios */}
              <div>
                <label
                  htmlFor="comments"
                  className="block text-sm font-medium text-foreground mb-1.5"
                >
                  Comentarios del caso <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="comments"
                  name="comments"
                  value={form.comments}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describa qué ocurrió, qué le solicitaron y cualquier detalle relevante."
                  className="input h-auto py-2.5"
                  aria-invalid={!!errors.comments}
                />
                {errors.comments && (
                  <p className="mt-1.5 text-sm text-red-600">{errors.comments}</p>
                )}
              </div>

              {/* Acciones */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="btn btn-primary btn-md flex-1 gap-2"
                >
                  {status === "loading" ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Enviar reporte
                    </>
                  )}
                </button>
                <Link
                  to="/reportes"
                  className="btn btn-secondary btn-md gap-2 justify-center"
                >
                  <List className="w-4 h-4" />
                  Ver reportes
                </Link>
              </div>
            </form>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ReportFraud;
