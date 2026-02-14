import { gql } from "@apollo/client";

/**
 * Mutación transaccional para crear un encontrado.
 */
export const CREATE_ENCONTRADO_MUTATION = gql`
  mutation CreateEncontradoTransactional($data: EncontradoCreateInput!) {
    createEncontradoTransactional(data: $data) {
      apellido_m
      apellido_p
      bautizo
      clave
      create_at
      enfermedad
      estado_c
      fecha_n
      nom_ref
      nombre
      sexo
      tel_ref
      telefono
      update_at
      user {
        id
      }
    }
  }
`;
