import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client only when needed to avoid build-time errors
const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }
  return new OpenAI({ apiKey });
};



// Function to sanitize personal information from extracted text
function sanitizePersonalInfo(text: string): string {
  // Common German personal information patterns to remove or mask
  const patterns = [
    // Names (common German name patterns)
    /\b[A-ZÄÖÜ][a-zäöüß]+\s+[A-ZÄÖÜ][a-zäöüß]+\b/g,
    // Addresses (Street + Number)
    /\b[A-ZÄÖÜ][a-zäöüß]+(?:straße|str\.|platz|weg|gasse|allee)\s*\d+[a-z]?\b/gi,
    // Phone numbers
    /(?:\+49|0049|0)\s*(?:\d{2,5})\s*[\d\s\-\/]{4,}/g,
    // Email addresses
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    // German tax ID (Steuer-ID)
    /\b\d{11}\b/g,
    // German tax number patterns
    /\b\d{2,3}\/\d{3,4}\/\d{4,5}\b/g,
    // Postal codes with city names
    /\b\d{5}\s+[A-ZÄÖÜ][a-zäöüß\s]+\b/g,
    // Bank account numbers (IBAN)
    /\bDE\d{2}\s*[\d\s]{18,22}\b/gi,
    // Social security numbers
    /\b\d{2}\s*\d{6}\s*[A-Z]\s*\d{3}\b/g,
    // Dates in various formats that might be birthdates
    /\b(?:0[1-9]|[12][0-9]|3[01])\.(?:0[1-9]|1[012])\.(?:19|20)\d{2}\b/g,
  ];

  let sanitizedText = text;
  
  patterns.forEach(pattern => {
    sanitizedText = sanitizedText.replace(pattern, '[REDACTED]');
  });

  // Remove common salutations that might contain names
  sanitizedText = sanitizedText.replace(/(?:Sehr geehrte[rs]?|Liebe[rs]?)\s+(?:Herr|Frau|Damen und Herren)\s*[A-ZÄÖÜ][a-zäöüß]*(?:\s+[A-ZÄÖÜ][a-zäöüß]*)*[,.]?/gi, 'Sehr geehrte Damen und Herren,');
  
  return sanitizedText;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const type = formData.get('type') as string; // 'analyze', 'analyze-text', or 'followup'
    const extractedText = formData.get('extractedText') as string;
    const question = formData.get('question') as string;
    const previousAnalysis = formData.get('previousAnalysis') as string;
    const uiLang = formData.get('uiLang') as string || 'en';

    if (!file && type !== 'followup' && type !== 'analyze-text') {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (type === 'analyze-text' && !extractedText) {
      return NextResponse.json(
        { error: 'No extracted text provided' },
        { status: 400 }
      );
    }

    if (type === 'followup') {
      // Handle follow-up questions
      if (!question || !previousAnalysis) {
        return NextResponse.json(
          { error: 'Question and previous analysis required for follow-up' },
          { status: 400 }
        );
      }

      const languageInstruction = uiLang === 'de' 
        ? 'Antworte auf Deutsch.' 
        : 'Respond in English.';

      const openai = getOpenAIClient();
      const completion = await openai.chat.completions.create({
        model: "gpt-4.1",
        messages: [
          {
            role: "system",
            content: `You are Norman Finance's AI tax assistant. You help people understand German tax office (Finanzamt) letters and documents. 

Previously, you analyzed a document with this summary:
${previousAnalysis}

Now the user has a follow-up question. ${languageInstruction} 

IMPORTANT: Keep your response concise and well-structured. Use short paragraphs (1-2 sentences each). If listing steps or points, use numbered lists. Be direct and helpful without being verbose.

When suggesting professional help, recommend Norman Finance's services for tax related matters. Provide a clear, helpful answer that addresses their specific question. Be professional but accessible, and explain any German tax terms they might not understand.`
          },
          {
            role: "user",
            content: question
          }
        ],
        max_tokens: 500,
        temperature: 0.3,
      });

      const answer = completion.choices[0]?.message?.content || "I couldn't generate an answer to your question.";

      return NextResponse.json({ answer });
    }

    if (type === 'analyze-text') {
      // Handle extracted text analysis
      const languageInstruction = uiLang === 'de' 
        ? 'Antworte auf Deutsch und erkläre deutsche Steuerbegriffe verständlich.' 
        : 'Respond in English and explain German tax terms in plain English.';

      // Sanitize personal information from extracted text
      const sanitizedText = sanitizePersonalInfo(extractedText);

      const openai = getOpenAIClient();
      const completion = await openai.chat.completions.create({
        model: "gpt-4.1",
        messages: [
          {
            role: "system",
            content: `You are Norman Finance's AI tax assistant specializing in analyzing Finanzamt (German tax office) letters and documents.

IMPORTANT: You are analyzing text extracted from a PDF document where personal information has been automatically redacted for privacy protection. You will see [REDACTED] in place of names, addresses, tax numbers, and other personal details. This is normal and expected.

${languageInstruction}

Your task is to analyze the extracted document text and provide:
1. A clear, well-formatted summary of what the document is about - make it professional and easy to understand
2. Specific key points that are actually mentioned in the document (not generic advice)
3. Concrete actions the person needs to take based on this specific document
4. The urgency level (low, medium, high) based on deadlines and consequences
5. Any important deadlines found in the document

Be thorough but accessible. Focus on what the person needs to know and do based on THIS SPECIFIC document. When you see [REDACTED], simply refer to it as "the taxpayer" or "your information" as appropriate.

For keyPoints: Extract specific information from the document, not generic advice.
For actionRequired: Provide concrete steps based on what the document requires, not general recommendations.

IMPORTANT: Respond ONLY with valid JSON. Do not include any markdown formatting, code blocks, or explanatory text. Just the JSON object.

Respond in this exact JSON format:
{
  "summary": "Well-formatted overview of what this specific document is about",
  "keyPoints": ["Specific point 1 from document", "Specific point 2 from document", "Specific point 3 from document"],
  "actionRequired": ["Concrete action 1 required by this document", "Concrete action 2 required by this document"],
  "urgency": "low|medium|high",
  "deadline": "YYYY-MM-DD or null if no deadline"
}`
          },
          {
            role: "user",
            content: `Please analyze this German tax office document and provide a summary in the requested JSON format. For privacy protection, personal information has been redacted and will appear as [REDACTED]. Focus on specific content from this document, not generic advice. IMPORTANT: Return ONLY the JSON object, no markdown formatting or code blocks.

Document text:
${sanitizedText}`
          }
        ],
        max_tokens: 1000,
        temperature: 0.2,
      });
      
      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      try {
        // Extract JSON from markdown code blocks if present
        let jsonContent = content;
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          jsonContent = jsonMatch[1];
        }
        
        const analysis = JSON.parse(jsonContent);
        
        // Validate the parsed response has required fields
        if (!analysis.summary || !analysis.keyPoints || !analysis.actionRequired) {
          throw new Error('Invalid response structure - missing required fields');
        }
        
        // Ensure arrays are properly formatted
        if (!Array.isArray(analysis.keyPoints)) {
          analysis.keyPoints = [analysis.keyPoints];
        }
        if (!Array.isArray(analysis.actionRequired)) {
          analysis.actionRequired = [analysis.actionRequired];
        }

        return NextResponse.json(analysis);
      } catch (parseError) {
        console.error('JSON parsing error:', parseError);
        console.error('Content received:', content);
        
        // If JSON parsing fails, create a structured response from the text
        const fallbackAnalysis = {
          summary: content.replace(/```(?:json)?\s*/g, '').replace(/\s*```/g, ''),
          keyPoints: ["Analysis completed - see summary for details"],
          actionRequired: ["Review the document carefully", "Consider consulting a tax professional if needed"],
          urgency: "medium",
          deadline: null
        };

        return NextResponse.json(fallbackAnalysis);
      }
    }

    // Handle document analysis
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided for analysis' },
        { status: 400 }
      );
    }

    // Convert file to base64 for OpenAI Vision API
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');

    // Check file type
    const isImage = file.type.startsWith('image/');
    const isPDF = file.type === 'application/pdf';

    if (!isImage && !isPDF) {
      return NextResponse.json(
        { error: 'Only PDF and image files are supported' },
        { status: 400 }
      );
    }

    const languageInstruction = uiLang === 'de' 
      ? 'Antworte auf Deutsch und erkläre deutsche Steuerbegriffe verständlich.' 
      : 'Respond in English and explain German tax terms in plain English.';

    let analysis;

    if (isImage) {
      // Use Vision API for images
      const openai = getOpenAIClient();
      const completion = await openai.chat.completions.create({
        model: "gpt-4.1",
        messages: [
          {
            role: "system",
            content: `You are Norman Finance's AI tax assistant specializing in analyzing Finanzamt (German tax office) letters and documents. 

IMPORTANT: You are analyzing a document where personal information has been automatically redacted for privacy protection. You will see [REDACTED] in place of names, addresses, tax numbers, and other personal details. This is normal and expected.

${languageInstruction}

Your task is to analyze the uploaded document and provide:
1. A clear, well-formatted summary of what the document is about - make it professional and easy to understand
2. Specific key points that are actually mentioned in the document (not generic advice)
3. Concrete actions the person needs to take based on this specific document
4. The urgency level (low, medium, high) based on deadlines and consequences
5. Any important deadlines found in the document

Be thorough but accessible. Focus on what the person needs to know and do based on THIS SPECIFIC document. When you see [REDACTED], simply refer to it as "the taxpayer" or "your information" as appropriate.

For keyPoints: Extract specific information from the document, not generic advice.
For actionRequired: Provide concrete steps based on what the document requires, not general recommendations.

IMPORTANT: Respond ONLY with valid JSON. Do not include any markdown formatting, code blocks, or explanatory text. Just the JSON object.

Respond in this exact JSON format:
{
  "summary": "Well-formatted overview of what this specific document is about",
  "keyPoints": ["Specific point 1 from document", "Specific point 2 from document", "Specific point 3 from document"],
  "actionRequired": ["Concrete action 1 required by this document", "Concrete action 2 required by this document"],
  "urgency": "low|medium|high",
  "deadline": "YYYY-MM-DD or null if no deadline"
}`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Please analyze this German tax office document and provide a summary in the requested JSON format. For privacy protection, do not include any personal information (names, addresses, tax IDs, etc.) in your analysis - refer to them generically as 'the taxpayer' or 'your information'. Focus on specific content from this document, not generic advice. IMPORTANT: Return ONLY the JSON object, no markdown formatting or code blocks.`
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${file.type};base64,${base64}`
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.2,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      try {
        // Extract JSON from markdown code blocks if present
        let jsonContent = content;
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          jsonContent = jsonMatch[1];
        }
        
        analysis = JSON.parse(jsonContent);
        
        // Validate the parsed response has required fields
        if (!analysis.summary || !analysis.keyPoints || !analysis.actionRequired) {
          throw new Error('Invalid response structure - missing required fields');
        }
        
        // Ensure arrays are properly formatted
        if (!Array.isArray(analysis.keyPoints)) {
          analysis.keyPoints = [analysis.keyPoints];
        }
        if (!Array.isArray(analysis.actionRequired)) {
          analysis.actionRequired = [analysis.actionRequired];
        }
      } catch (parseError) {
        console.error('JSON parsing error:', parseError);
        console.error('Content received:', content);
        
        // If JSON parsing fails, create a structured response from the text
        analysis = {
          summary: content.replace(/```(?:json)?\s*/g, '').replace(/\s*```/g, ''),
          keyPoints: ["Analysis completed - see summary for details"],
          actionRequired: ["Review the document carefully", "Consider consulting a tax professional if needed"],
          urgency: "medium",
          deadline: null
        };
      }
    } else {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload a PDF, JPG, or PNG file.' },
        { status: 400 }
      );
    }

    return NextResponse.json(analysis);

  } catch (error) {
    console.error('Error analyzing document:', error);
    
    // Return a more specific error message
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    if (errorMessage.includes('rate limit')) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable due to high demand. Please try again in a few minutes.' },
        { status: 429 }
      );
    }
    
    if (errorMessage.includes('API key')) {
      return NextResponse.json(
        { error: 'Service configuration error. Please contact support.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to analyze document. Please try again.' },
      { status: 500 }
    );
  }
}

// Handle preflight requests for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
} 