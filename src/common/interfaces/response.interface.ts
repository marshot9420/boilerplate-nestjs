export interface IResponseEntity {
  success: boolean;
  statusCode: number;
  data?: any;
}

export interface IErrorResponse {
  error: string;
  statusCode: number;
  message: string | string[];
}
