import { InvoiceFormData, InvoiceStats } from '@/types/invoice';
import { API_ENDPOINTS } from './constants';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export const generateInvoice = async (data: InvoiceFormData): Promise<Blob> => {
  try {
    // Transform empty date strings to null for the API
    const processedData = {
      ...data,
      due_date: data.due_date || null,
      delivery_date: data.delivery_date || null,
      service_start_date: data.service_start_date || null,
      service_end_date: data.service_end_date || null,
    };
    
    // Debug: log the data being sent
    console.log('Sending invoice data:', JSON.stringify(processedData, null, 2));
    
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.GENERATE_INVOICE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(processedData),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to generate invoice';
      let errorDetails = null;

      try {
        const errorData = await response.json();
        console.log('API Error Response:', errorData);
        
        // If it's a validation error, format it nicely
        if (response.status === 400 && errorData) {
          if (typeof errorData === 'object') {
            const validationErrors = Object.entries(errorData)
              .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
              .join('\n');
            errorMessage = `Validation errors:\n${validationErrors}`;
          } else {
            errorMessage = errorData.error || errorData.message || errorMessage;
          }
        } else {
          errorMessage = errorData.error || errorData.message || errorMessage;
        }
        errorDetails = errorData;
      } catch {
        // If we can't parse the error response, use the status text
        errorMessage = response.statusText || errorMessage;
      }

      throw new APIError(errorMessage, response.status, errorDetails);
    }

    const blob = await response.blob();
    
    // Verify that we received a PDF
    if (blob.type !== 'application/pdf') {
      throw new APIError('Invalid response format. Expected PDF file.');
    }

    return blob;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }

    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new APIError('Network error. Please check your connection and try again.');
    }

    throw new APIError('An unexpected error occurred while generating the invoice.');
  }
};

export const getInvoiceStats = async (): Promise<InvoiceStats> => {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.GET_STATS}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new APIError('Failed to fetch statistics', response.status);
    }

    const stats = await response.json();
    return stats;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }

    // Return default stats if the API is unavailable
    return {
      total_invoices: 0,
      invoices_today: 0,
      invoices_this_month: 0,
      popular_currencies: ['EUR', 'USD', 'GBP'],
      popular_countries: ['DE', 'US', 'GB'],
    };
  }
};

export const downloadPDF = (blob: Blob, filename: string = 'invoice.pdf'): void => {
  try {
    // Create a URL for the blob
    const url = window.URL.createObjectURL(blob);
    
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    
    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to download PDF:', error);
    throw new APIError('Failed to download the invoice PDF.');
  }
};

export const previewPDF = (blob: Blob): void => {
  try {
    const url = window.URL.createObjectURL(blob);
    window.open(url, '_blank');
    
    // Clean up after a delay to allow the browser to load the PDF
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 1000);
  } catch (error) {
    console.error('Failed to preview PDF:', error);
    throw new APIError('Failed to preview the invoice PDF.');
  }
};

// Analytics tracking
export const trackInvoiceGeneration = (data: Partial<InvoiceFormData>): void => {
  try {
    // Track with Google Analytics if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'invoice_generated', {
        currency: data.currency,
        language: data.language,
        company_country: data.company_country,
        client_country: data.client_country,
        items_count: data.invoiced_items?.length || 0,
      });
    }

    // Track with other analytics services
    if (typeof window !== 'undefined' && (window as any).plausible) {
      (window as any).plausible('Invoice Generated', {
        props: {
          currency: data.currency,
          language: data.language,
          country: data.company_country,
        },
      });
    }
  } catch (error) {
    // Silently fail analytics tracking
    console.warn('Analytics tracking failed:', error);
  }
};

export const trackFormInteraction = (action: string, field?: string): void => {
  try {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'form_interaction', {
        action,
        field,
      });
    }
  } catch (error) {
    console.warn('Form interaction tracking failed:', error);
  }
};

// Health check for the API
export const checkAPIHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/health/`, {
      method: 'GET',
      timeout: 5000,
    } as RequestInit);
    
    return response.ok;
  } catch {
    return false;
  }
};

// Utility to format API errors for display
export const formatAPIError = (error: unknown): string => {
  if (error instanceof APIError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
}; 