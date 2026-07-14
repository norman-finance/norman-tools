import type { InvoiceFormData } from "./types";
import { API_BASE_URL, API_ENDPOINTS } from "./constants";

class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message);
    this.name = "APIError";
  }
}

export async function generateInvoice(data: InvoiceFormData): Promise<Blob> {
  const processedData = {
    ...data,
    due_date: data.due_date || new Date().toISOString().split("T")[0],
    delivery_date: data.delivery_date || new Date().toISOString().split("T")[0],
    service_start_date: data.service_start_date || new Date().toISOString().split("T")[0],
    service_end_date: data.service_end_date || new Date().toISOString().split("T")[0],
  };

  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.GENERATE_INVOICE}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(processedData),
    });

    if (!response.ok) {
      let errorMessage = "Failed to generate invoice";
      try {
        const errorData = await response.json();
        if (response.status === 400 && typeof errorData === "object") {
          const validationErrors = Object.entries(errorData)
            .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(", ") : errors}`)
            .join(" • ");
          errorMessage = `Validation errors: ${validationErrors}`;
        } else {
          errorMessage = errorData.error || errorData.message || errorMessage;
        }
      } catch {
        errorMessage = response.statusText || errorMessage;
      }
      throw new APIError(errorMessage, response.status);
    }

    const blob = await response.blob();
    if (blob.type !== "application/pdf") {
      throw new APIError("Invalid response format. Expected PDF file.");
    }
    return blob;
  } catch (error) {
    if (error instanceof APIError) throw error;
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new APIError("Network error. Please check your connection and try again.");
    }
    throw new APIError("An unexpected error occurred while generating the invoice.");
  }
}

export function downloadPDF(blob: Blob, filename = "invoice.pdf"): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export function formatAPIError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "An unexpected error occurred. Please try again.";
}
