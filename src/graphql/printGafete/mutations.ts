import { gql } from "@apollo/client";

/**
 * Mutación custom para realizar el check-in de un encontrado.
 * Backend: performCheckin(encontradoId: ID!, userId: ID!, responsejson: JSON): CheckinResult
 */
export const PERFORM_PRINT_GAFETE_MUTATION = gql`
  mutation Mutation($nombre: String, $clave: String, $copies: Int) {
  makePrintGafete(nombre: $nombre, clave: $clave, copies: $copies) {
    success
  }
}

`;

export interface PrintGafeteResponse {
  makePrintGafete: {
    success: boolean | null;
  };
}

export interface PrintGafeteVariables {
  nombre: string;
  clave: string;
  copies: number;
}
