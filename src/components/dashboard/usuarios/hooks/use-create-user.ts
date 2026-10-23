"use client";

import { useMutation } from "@apollo/client";
import { toast } from "sonner";
import {
  CREATE_USER_MUTATION,
  type CreateUserResponse,
  type CreateUserVariables,
} from "registro/graphql/users/mutations";
import { USERS_QUERY } from "registro/graphql/users/queries";
import {
  emailDeUsuario,
  type NuevoUsuarioFormData,
} from "registro/lib/validations/usuario";

/** Traduce los errores conocidos del backend a un mensaje con la solución. */
function getCreateUserErrorMessage(err: unknown): string {
  const message = err instanceof Error ? err.message : "";
  if (/unique constraint/i.test(message) && /username|email/i.test(message)) {
    return "Ese usuario ya existe. Escribe otro en el campo Usuario.";
  }
  if (/teléfono/i.test(message)) {
    return "El teléfono debe tener 10 dígitos.";
  }
  return message || "No se pudo crear el usuario";
}

/**
 * Hook para crear un usuario del sistema (createUser). `input.username` ya
 * viene resuelto (escrito o generado) y de él se deriva el correo
 * `usuario@email.com`. Refresca USERS_QUERY y muestra los toasts; el de éxito
 * incluye el usuario con el que podrá entrar.
 * `createUser` devuelve el usuario creado, o `null` si falló.
 */
export function useCreateUser() {
  const [mutate, { loading }] = useMutation<
    CreateUserResponse,
    CreateUserVariables
  >(CREATE_USER_MUTATION, {
    refetchQueries: [USERS_QUERY],
    awaitRefetchQueries: true,
  });

  const createUser = async (
    input: NuevoUsuarioFormData,
  ): Promise<CreateUserResponse["createUser"]> => {
    try {
      const { data } = await mutate({
        variables: {
          data: {
            name: input.name,
            lastName: input.lastName || undefined,
            username: input.username,
            email: emailDeUsuario(input.username),
            password: input.password,
            phone: input.phone || undefined,
            roles: { connect: [{ name: input.role }] },
          },
        },
      });
      const created = data?.createUser ?? null;
      if (created) {
        toast.success(`Usuario creado. Entra como «${created.username}».`);
      }
      return created;
    } catch (err) {
      toast.error(getCreateUserErrorMessage(err));
      return null;
    }
  };

  return { createUser, loading };
}
