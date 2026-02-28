import { gql } from "@apollo/client";

/**
 * Mutación transaccional para crear un encontrado.
 */
export const CREATE_ENCONTRADO_MUTATION = gql`
  mutation CreateEncontradoTransactional($data: EncontradoCreateInput!) {
    createEncontradoTransactional(data: $data) {
      id
      apellido_m
      apellido_p
      bautizo
      clave
      create_at
      enfermedad
      estado_c
      religion
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

/**
 * Mutación para actualizar un encontrado por id.
 */
export const UPDATE_ENCONTRADO_MUTATION = gql`
  mutation UpdateEncontrado(
    $where: EncontradoWhereUniqueInput!
    $data: EncontradoUpdateInput!
  ) {
    updateEncontrado(where: $where, data: $data) {
      id
      apellido_m
      apellido_p
      clave
      create_at
      edad
      enfermedad
      estado_c
      religion
      fecha_n
      nom_ref
      nombre
      sexo
      tel_ref
      telefono
      update_at
      celular
      medicamento
      bautizo
      user {
        id
        name
      }
      checkins {
        id
        checkinAt
      }
    }
  }
`;
