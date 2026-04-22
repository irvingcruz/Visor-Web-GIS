export class ApiResponse {
  static success(data: any = null, message = "OK", statusCode = 200) {
    return { statusCode, message, data };
  }

  static error(message: string, statusCode = 400, data: any = null) {
    return { statusCode, message, data };
  }
}
