"use client";

import { useEffect, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon,
  ViewIcon,
  ViewOffSlashIcon,
} from "@hugeicons/core-free-icons";
import { GlassModal } from "registro/components/shared/GlassModal";
import {
  ROLES_USUARIO,
  nuevoUsuarioSchema,
  type NuevoUsuarioFormData,
} from "registro/lib/validations/usuario";
import { useCreateUser } from "./hooks";

const defaultForm: NuevoUsuarioFormData = {
  name: "",
  lastName: "",
  username: "",
  password: "",
  phone: "",
  role: "user",
};

/** Orden de los campos para enfocar el primero con error. */
const FIELD_ORDER: (keyof NuevoUsuarioFormData)[] = [
  "name",
  "lastName",
  "username",
  "phone",
  "password",
  "role",
];

const labelClass =
  "mb-1 block text-sm font-medium text-app-text-primary dark:text-gray-300";

const inputBaseClass =
  "w-full rounded-lg border bg-white px-3 py-2 text-sm text-app-text-primary shadow-sm outline-none transition-colors placeholder:text-app-text-secondary focus:ring-2 dark:bg-[#202124] dark:text-gray-100 dark:placeholder:text-gray-500";

function inputClass(hasError: boolean) {
  return `${inputBaseClass} ${
    hasError
      ? "border-red-400 focus:border-red-500 focus:ring-red-300 dark:border-red-500 dark:focus:ring-red-500/30"
      : "border-gray-300 focus:border-app-primary focus:ring-app-primary/40 dark:border-gray-700 dark:focus:border-app-primary-muted"
  }`;
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1 text-xs text-red-600 dark:text-red-400">
      {message}
    </p>
  );
}

export interface NuevoUsuarioModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Modal para dar de alta a un usuario del sistema (staff): nombre, usuario de
 * acceso (opcional; lo genera el backend), contraseña, teléfono y rol.
 */
export function NuevoUsuarioModal({ open, onClose }: NuevoUsuarioModalProps) {
  const [form, setForm] = useState<NuevoUsuarioFormData>(defaultForm);
  const [errors, setErrors] = useState<
    Partial<Record<keyof NuevoUsuarioFormData, string>>
  >({});
  const [showPassword, setShowPassword] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const { createUser, loading } = useCreateUser();

  useEffect(() => {
    if (!open) return;
    setForm(defaultForm);
    setErrors({});
    setShowPassword(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, loading, onClose]);

  const setField =
    (key: keyof NuevoUsuarioFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      let value = e.target.value;
      if (key === "username") value = value.toLowerCase().replace(/\s+/g, "");
      if (key === "phone") value = value.replace(/\D/g, "").slice(0, 10);
      setForm((prev) => ({ ...prev, [key]: value }));
      if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = nuevoUsuarioSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof NuevoUsuarioFormData, string>> =
        {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof NuevoUsuarioFormData;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      const first = FIELD_ORDER.find((key) => fieldErrors[key]);
      if (first) {
        formRef.current
          ?.querySelector<HTMLElement>(`#nuevo-usuario-${first}`)
          ?.focus();
      }
      return;
    }
    const created = await createUser(parsed.data);
    if (created) onClose();
  };

  const rol = ROLES_USUARIO.find((r) => r.value === form.role);

  return (
    <GlassModal
      open={open}
      onClose={onClose}
      ariaLabelledBy="nuevo-usuario-title"
      panelClassName="max-w-lg overflow-hidden"
      disableBackdropClose={loading}
    >
      <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-5 py-4 dark:border-gray-700">
        <div>
          <h2
            id="nuevo-usuario-title"
            className="text-lg font-semibold text-app-text-primary dark:text-white"
          >
            Nuevo usuario
          </h2>
          <p className="mt-0.5 text-sm text-app-text-secondary dark:text-gray-400">
            Podrá entrar al sistema con su usuario y contraseña.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          aria-label="Cerrar"
          className="-mr-1 shrink-0 rounded-full p-2 text-app-text-secondary transition-colors hover:bg-gray-100 hover:text-app-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-app-primary/50 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={18} />
        </button>
      </div>

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        noValidate
        className="space-y-4 px-5 py-4"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="nuevo-usuario-name" className={labelClass}>
              Nombre *
            </label>
            <input
              id="nuevo-usuario-name"
              type="text"
              value={form.name}
              onChange={setField("name")}
              autoComplete="off"
              autoFocus
              disabled={loading}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "nuevo-usuario-name-error" : undefined}
              className={inputClass(Boolean(errors.name))}
            />
            <FieldError id="nuevo-usuario-name-error" message={errors.name} />
          </div>
          <div>
            <label htmlFor="nuevo-usuario-lastName" className={labelClass}>
              Apellido
            </label>
            <input
              id="nuevo-usuario-lastName"
              type="text"
              value={form.lastName}
              onChange={setField("lastName")}
              autoComplete="off"
              disabled={loading}
              className={inputClass(Boolean(errors.lastName))}
            />
          </div>
          <div>
            <label htmlFor="nuevo-usuario-username" className={labelClass}>
              Usuario
            </label>
            <input
              id="nuevo-usuario-username"
              type="text"
              value={form.username}
              onChange={setField("username")}
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="Se genera si lo dejas vacío"
              disabled={loading}
              aria-invalid={Boolean(errors.username)}
              aria-describedby={
                errors.username ? "nuevo-usuario-username-error" : undefined
              }
              className={inputClass(Boolean(errors.username))}
            />
            <FieldError
              id="nuevo-usuario-username-error"
              message={errors.username}
            />
          </div>
          <div>
            <label htmlFor="nuevo-usuario-phone" className={labelClass}>
              Teléfono
            </label>
            <input
              id="nuevo-usuario-phone"
              type="tel"
              inputMode="numeric"
              value={form.phone}
              onChange={setField("phone")}
              autoComplete="off"
              placeholder="10 dígitos"
              disabled={loading}
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={errors.phone ? "nuevo-usuario-phone-error" : undefined}
              className={`${inputClass(Boolean(errors.phone))} tabular-nums`}
            />
            <FieldError id="nuevo-usuario-phone-error" message={errors.phone} />
          </div>
        </div>

        <div>
          <label htmlFor="nuevo-usuario-password" className={labelClass}>
            Contraseña *
          </label>
          <div className="relative">
            <input
              id="nuevo-usuario-password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={setField("password")}
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres"
              disabled={loading}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={
                errors.password ? "nuevo-usuario-password-error" : undefined
              }
              className={`${inputClass(Boolean(errors.password))} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              aria-pressed={showPassword}
              className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-app-text-secondary transition-colors hover:bg-gray-100 hover:text-app-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-app-primary/50 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
            >
              <HugeiconsIcon
                icon={showPassword ? ViewOffSlashIcon : ViewIcon}
                size={16}
              />
            </button>
          </div>
          <FieldError
            id="nuevo-usuario-password-error"
            message={errors.password}
          />
        </div>

        <div>
          <label htmlFor="nuevo-usuario-role" className={labelClass}>
            Rol
          </label>
          <select
            id="nuevo-usuario-role"
            value={form.role}
            onChange={setField("role")}
            disabled={loading}
            aria-describedby="nuevo-usuario-role-help"
            className={inputClass(Boolean(errors.role))}
          >
            {ROLES_USUARIO.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          <p
            id="nuevo-usuario-role-help"
            className="mt-1 text-xs text-app-text-secondary dark:text-gray-400"
          >
            {rol?.description}
          </p>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-gray-200 pt-4 dark:border-gray-700 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-app-text-primary transition-colors hover:bg-app-selected disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-app-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-app-primary/90 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-app-primary-muted dark:text-gray-900 dark:hover:bg-app-primary-muted/90"
          >
            {loading ? "Creando…" : "Crear usuario"}
          </button>
        </div>
      </form>
    </GlassModal>
  );
}
