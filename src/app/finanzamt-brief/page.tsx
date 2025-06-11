'use client';

import React, { useState, useRef } from 'react';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { UILanguageProvider, useUILanguage } from '@/contexts/UILanguageContext';

interface AnalysisResult {
  summary: string;
  keyPoints: string[];
  actionRequired: string[];
  urgency: 'low' | 'medium' | 'high';
  deadline?: string;
}

function FinanzamtBriefPageContent() {
  const { t, uiLanguage } = useUILanguage();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [followUpHistory, setFollowUpHistory] = useState<Array<{question: string, answer: string}>>([]);
  const [isAsking, setIsAsking] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const extractTextFromPdf = async (file: File): Promise<string> => {
    try {
      // Import pdfjs-dist dynamically for client-side use
      const pdfjsLib = await import('pdfjs-dist');
      
      // Use local worker to avoid CORS issues
      pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.js`;
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const strings = content.items.map((item: any) => item.str).join(' ');
        fullText += strings + '\n';
      }
      
      return fullText.trim();
    } catch (error) {
      console.error('PDF text extraction error:', error);
      throw new Error('Failed to extract text from PDF. Please try converting it to an image.');
    }
  };

  const handleFileSelect = async (file: File) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      setError(t('finanzamtBrief.errors.invalidType'));
      return;
    }

    if (file.size > maxSize) {
      setError(t('finanzamtBrief.errors.fileSize'));
      return;
    }

    setUploadedFile(file);
    setError(null);
    
    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else if (file.type === 'application/pdf') {
      // For PDFs, show file info and extract text
      setFilePreview(null);
      try {
        setIsAnalyzing(true);
        const extractedText = await extractTextFromPdf(file);
        if (!extractedText || extractedText.trim().length === 0) {
          setError('Could not extract text from PDF. The PDF might be image-based or corrupted. Please convert it to an image (JPG/PNG) for analysis.');
          setUploadedFile(null);
          setIsAnalyzing(false);
          return;
        }
        // Store extracted text for later use
        (file as any).extractedText = extractedText;
        setIsAnalyzing(false);
      } catch (error) {
        setError('Failed to process PDF. Please convert it to an image (JPG/PNG) for analysis.');
        setUploadedFile(null);
        setIsAnalyzing(false);
        return;
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const analyzeDocument = async () => {
    if (!uploadedFile) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      
      // Check if this is a PDF with extracted text
      if (uploadedFile.type === 'application/pdf' && (uploadedFile as any).extractedText) {
        // Send extracted text instead of file
        formData.append('type', 'analyze-text');
        formData.append('extractedText', (uploadedFile as any).extractedText);
        formData.append('uiLang', uiLanguage);
      } else {
        // Send image file as before
        formData.append('file', uploadedFile);
        formData.append('type', 'analyze');
        formData.append('uiLang', uiLanguage);
      }

      const response = await fetch('/api/finanzamt-analysis', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze document');
      }

      const result = await response.json();
      setAnalysis(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('finanzamtBrief.errors.analysisFailed');
      setError(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const askFollowUp = async () => {
    if (!followUpQuestion.trim() || !analysis) return;

    setIsAsking(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('type', 'followup');
      formData.append('question', followUpQuestion);
      formData.append('previousAnalysis', JSON.stringify(analysis));
      formData.append('uiLang', uiLanguage);

      const response = await fetch('/api/finanzamt-analysis', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get answer');
      }

      const result = await response.json();
      setFollowUpHistory(prev => [...prev, { question: followUpQuestion, answer: result.answer }]);
      setFollowUpQuestion(''); // Clear the question after successful response
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('finanzamtBrief.errors.followUpFailed');
      setError(errorMessage);
    } finally {
      setIsAsking(false);
    }
  };

  const resetAnalysis = () => {
    setUploadedFile(null);
    setFilePreview(null);
    setAnalysis(null);
    setFollowUpQuestion('');
    setFollowUpHistory([]);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqData = [
    {
      question: t('finanzamtBrief.faq.q1.question'),
      answer: t('finanzamtBrief.faq.q1.answer')
    },
    {
      question: t('finanzamtBrief.faq.q2.question'),
      answer: t('finanzamtBrief.faq.q2.answer')
    },
    {
      question: t('finanzamtBrief.faq.q3.question'),
      answer: t('finanzamtBrief.faq.q3.answer')
    },
    {
      question: t('finanzamtBrief.faq.q4.question'),
      answer: t('finanzamtBrief.faq.q4.answer')
    },
    {
      question: t('finanzamtBrief.faq.q5.question'),
      answer: t('finanzamtBrief.faq.q5.answer')
    }
  ];

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return '#6b7280';
      case 'medium': return '#6b7280';
      case 'low': return '#6b7280';
      default: return '#6b7280';
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff' }}>
      <Header />
      
      <main className="container">
        {/* Breadcrumb */}
        <div style={{ 
          marginTop: '2rem',
          marginBottom: '1rem'
        }}>
          <a 
            href="/" 
            style={{ 
              color: '#6b7280',
              textDecoration: 'none',
              fontSize: '0.875rem'
            }}
          >
{t('finanzamtBrief.breadcrumb')}
          </a>
        </div>

        {/* Hero Section */}
        <div className="text-center" style={{ 
          paddingTop: '2rem', 
          paddingBottom: '3rem' 
        }}>
          {/* <span style={{ 
            background: '#000000',
            color: 'white',
            padding: '0.25rem 0.75rem',
            borderRadius: '12px',
            fontSize: '0.75rem',
            fontWeight: '500',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
{t('finanzamtBrief.freeLabel')}
          </span> */}
          
          <h1 className="text-4xl font-bold leading-tight" style={{ 
            maxWidth: '600px',
            margin: '1.5rem auto 1rem',
            color: '#1f2937'
          }}>
            {t('finanzamtBrief.title')}
          </h1>
          
          <p className="text-lg text-gray-500 leading-relaxed" style={{ 
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            {t('finanzamtBrief.description')}
          </p>

          <div style={{ marginTop: '2rem' }}>
            <ul style={{ 
              listStyle: 'none',
              padding: '0',
              margin: '0',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '1rem',
              fontSize: '0.875rem',
              color: '#6b7280'
            }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#10b981' }}>✓</span>
                {t('finanzamtBrief.features.feature1')}
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#10b981' }}>✓</span>
                {t('finanzamtBrief.features.feature2')}
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#10b981' }}>✓</span>
                {t('finanzamtBrief.features.feature3')}
              </li>
            </ul>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ 
          maxWidth: '800px',
          margin: '0 auto',
          paddingBottom: '4rem'
        }}>
          {!analysis ? (
            // Upload Section
            <div style={{ 
              background: '#ffffff',
              border: '2px dashed #d1d5db',
              borderRadius: '8px',
              padding: '3rem 2rem',
              textAlign: 'center',
              transition: 'border-color 0.2s ease'
            }}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            >
              <div style={{ 
                fontSize: '3rem',
                marginBottom: '1rem',
                opacity: 0.6
              }}>
                ✉️
              </div>
              
              <h3 style={{ 
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '0.5rem'
              }}>
{uploadedFile ? uploadedFile.name : t('finanzamtBrief.upload.title')}
              </h3>
              
              <p style={{ 
                color: '#6b7280',
                marginBottom: '1.5rem',
                fontSize: '0.875rem'
              }}>
                {uploadedFile ? t('finanzamtBrief.upload.fileReady') : t('finanzamtBrief.upload.subtitle')}
              </p>

              {!uploadedFile && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileInput}
                    style={{ display: 'none' }}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    style={{ 
                      background: '#000000',
                      color: 'white',
                      border: 'none',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '4px',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      marginRight: '1rem'
                    }}
                  >
{t('finanzamtBrief.upload.selectFile')}
                  </button>
                  <span style={{ 
                    color: '#6b7280',
                    fontSize: '0.875rem'
                  }}>
                    {t('finanzamtBrief.upload.dragDrop')}
                  </span>
                </>
              )}

              {uploadedFile && (
                <div>
                  {/* File Preview */}
                  <div style={{ 
                    marginBottom: '1.5rem',
                    textAlign: 'center'
                  }}>
                    {filePreview ? (
                      <img 
                        src={filePreview} 
                        alt={t('finanzamtBrief.upload.documentPreview')} 
                        style={{ 
                          maxWidth: '100%',
                          maxHeight: '300px',
                          borderRadius: '8px',
                          border: '1px solid #e5e7eb'
                        }}
                      />
                    ) : (
                      <div style={{
                        background: '#f8fafc',
                        border: '1px solid #e1e8ed',
                        borderRadius: '8px',
                        padding: '2rem',
                        color: '#475569',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '3rem', marginBottom: '0.75rem', color: '#dc2626' }}>📄</div>
                        <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#1e293b' }}>
                          {uploadedFile.name}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>
                          PDF Document • {Math.round(uploadedFile.size / 1024)} KB
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button
                      onClick={analyzeDocument}
                      disabled={isAnalyzing}
                      style={{ 
                        background: '#000000',
                        color: 'white',
                        border: 'none',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '4px',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        cursor: isAnalyzing ? 'not-allowed' : 'pointer',
                        opacity: isAnalyzing ? 0.6 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      {isAnalyzing && <LoadingSpinner size="sm" />}
                      {isAnalyzing ? t('finanzamtBrief.analysis.analyzing') : t('finanzamtBrief.analysis.analyzeDocument')}
                    </button>
                    
                    <button
                      onClick={resetAnalysis}
                      style={{ 
                        background: 'transparent',
                        color: '#6b7280',
                        border: '1px solid #d1d5db',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '4px',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
{t('finanzamtBrief.analysis.reset')}
                    </button>
                  </div>
                </div>
              )}

              {error && (
                <div style={{ 
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#dc2626',
                  padding: '0.75rem',
                  borderRadius: '4px',
                  marginTop: '1rem',
                  fontSize: '0.875rem'
                }}>
                  {error}
                </div>
              )}
            </div>
          ) : (
            // Analysis Results Section
            <div>
              {/* Summary */}
              <div style={{ 
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '2rem',
                marginBottom: '2rem'
              }}>
                <div style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  marginBottom: '1rem'
                }}>
                  <h2 style={{ 
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    color: '#1f2937',
                    margin: '0'
                  }}>
                    {t('finanzamtBrief.analysis.summary')}
                  </h2>
                  <span style={{ 
                    background: getUrgencyColor(analysis.urgency),
                    color: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    textTransform: 'uppercase'
                  }}>
                    {t(`finanzamtBrief.urgency.${analysis.urgency}`)}
                  </span>
                </div>
                
                <div style={{ 
                  color: '#374151',
                  lineHeight: '1.7',
                  fontSize: '0.95rem'
                }}>
                  {analysis.summary.split('\n').map((paragraph, index) => (
                    <p key={index} style={{ 
                      margin: paragraph.trim() ? '0 0 1rem 0' : '0'
                    }}>
                      {paragraph.trim()}
                    </p>
                  ))}
                </div>

                {analysis.deadline && (
                  <div style={{ 
                    background: '#f9fafb',
                    border: '1px solid #ebedf1',
                    color: '#374151',
                    padding: '0.75rem',
                    borderRadius: '4px',
                    marginTop: '1rem',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}>
                    ⚠️ {t('finanzamtBrief.analysis.deadline')}: {analysis.deadline}
                  </div>
                )}
              </div>

              {/* Key Points */}
              <div style={{ 
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '2rem',
                marginBottom: '2rem'
              }}>
                <h3 style={{ 
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '1rem'
                }}>
                  {t('finanzamtBrief.analysis.keyPoints')}
                </h3>
                
                <ul style={{ 
                  listStyle: 'none',
                  padding: '0',
                  margin: '0'
                }}>
                  {analysis.keyPoints.map((point, index) => (
                    <li key={index} style={{ 
                      display: 'flex',
                      gap: '0.75rem',
                      marginBottom: '0.75rem',
                      color: '#4b5563',
                      lineHeight: '1.5'
                    }}>
                      <span style={{ 
                        color: '#6b7280',
                        fontWeight: '600',
                        minWidth: '1rem'
                      }}>
                        •
                      </span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Required */}
              <div style={{ 
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '2rem',
                marginBottom: '2rem'
              }}>
                <h3 style={{ 
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '1rem'
                }}>
                  {t('finanzamtBrief.analysis.actionRequired')}
                </h3>
                
                <ul style={{ 
                  listStyle: 'none',
                  padding: '0',
                  margin: '0'
                }}>
                  {analysis.actionRequired.map((action, index) => (
                    <li key={index} style={{ 
                      display: 'flex',
                      gap: '0.75rem',
                      marginBottom: '0.75rem',
                      color: '#4b5563',
                      lineHeight: '1.5'
                    }}>
                      <span style={{ 
                        color: '#6b7280',
                        fontWeight: '600',
                        minWidth: '1rem'
                      }}>
                        →
                      </span>
                      {action}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Follow-up Questions - Chat Interface */}
              <div style={{ 
                background: '#ffffff',
                border: '1px solid #ebedf1',
                borderRadius: '4px',
                padding: '2rem',
                marginBottom: '2rem'
              }}>
                <h3 style={{ 
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '1rem'
                }}>
                  {t('finanzamtBrief.analysis.followUp')}
                </h3>
                
                {/* Chat History */}
                {followUpHistory.length > 0 && (
                  <div style={{
                    maxHeight: '400px',
                    overflowY: 'auto',
                    marginBottom: '1rem',
                    border: '1px solid #ebedf1',
                    borderRadius: '4px',
                    padding: '1rem',
                    background: '#fafafa'
                  }}>
                    {followUpHistory.map((chat, index) => (
                      <div key={index} style={{ marginBottom: '1.5rem' }}>
                        {/* User Question */}
                        <div style={{
                          display: 'flex',
                          justifyContent: 'flex-end',
                          marginBottom: '0.5rem'
                        }}>
                          <div style={{
                            background: '#000000',
                            color: 'white',
                            padding: '0.75rem 1rem',
                            borderRadius: '12px 12px 4px 12px',
                            maxWidth: '80%',
                            fontSize: '0.875rem',
                            lineHeight: '1.4'
                          }}>
                            {chat.question}
                          </div>
                        </div>
                        
                        {/* AI Answer */}
                        <div style={{
                          display: 'flex',
                          justifyContent: 'flex-start'
                        }}>
                          <div style={{
                            background: '#ffffff',
                            color: '#374151',
                            padding: '1rem',
                            borderRadius: '12px 12px 12px 4px',
                            maxWidth: '80%',
                            fontSize: '0.875rem',
                            lineHeight: '1.6',
                            border: '1px solid #d1d5db',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                          }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              marginBottom: '0.75rem',
                              paddingBottom: '0.5rem',
                              borderBottom: '1px solid #e5e7eb'
                            }}>
                              <div style={{
                                width: '18px',
                                height: '18px',
                                borderRadius: '50%',
                                background: '#000000',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '9px',
                                color: 'white',
                                fontWeight: '600'
                              }}>
                                AI
                              </div>
                              <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '500' }}>
                                {t('finanzamtBrief.analysis.taxAssistant')}
                              </span>
                            </div>
                            <div>
                              {chat.answer.split('\n').map((paragraph, idx) => {
                                if (!paragraph.trim()) return null;
                                return (
                                  <p key={idx} style={{ 
                                    margin: '0 0 0.75rem 0',
                                    fontWeight: paragraph.includes('**') ? '600' : '400'
                                  }}>
                                    {paragraph.replace(/\*\*/g, '').trim()}
                                  </p>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Input Area */}
                <div style={{ 
                  display: 'flex',
                  gap: '1rem',
                  alignItems: 'flex-end'
                }}>
                  <input
                    type="text"
                    value={followUpQuestion}
                    onChange={(e) => setFollowUpQuestion(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !isAsking && followUpQuestion.trim()) {
                        askFollowUp();
                      }
                    }}
                    placeholder={t('finanzamtBrief.analysis.followUpPlaceholder')}
                    style={{ 
                      flex: '1',
                      padding: '0.75rem',
                      border: '1px solid #ebedf1',
                      borderRadius: '4px',
                      fontSize: '0.875rem',
                      resize: 'none',
                      outline: 'none'
                    }}
                  />
                  <button
                    onClick={askFollowUp}
                    disabled={isAsking || !followUpQuestion.trim()}
                    style={{ 
                      background: '#000000',
                      color: 'white',
                      border: 'none',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '4px',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: (isAsking || !followUpQuestion.trim()) ? 'not-allowed' : 'pointer',
                      opacity: (isAsking || !followUpQuestion.trim()) ? 0.6 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      minWidth: '80px'
                    }}
                  >
                    {isAsking && <LoadingSpinner size="sm" />}
                    {isAsking ? '...' : t('finanzamtBrief.analysis.ask')}
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div style={{ 
                display: 'flex',
                gap: '1rem',
                justifyContent: 'center'
              }}>
                <button
                  onClick={resetAnalysis}
                  style={{ 
                    background: '#000000',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '4px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
{t('finanzamtBrief.analysis.analyzeNew')}
                </button>
              </div>
            </div>
          )}

          {/* FAQ Section - Accordion */}
          <div style={{ 
            background: '#ffffff',
            border: '1px solid #ebedf1',
            borderRadius: '4px',
            padding: '2rem',
            marginTop: '3rem'
          }}>
            <h2 style={{ 
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '1.5rem'
            }}>
              {t('finanzamtBrief.faq.title')}
            </h2>

            <div>
              {faqData.map((faq, index) => (
                <div key={index} style={{ 
                  border: '1px solid #ebedf1',
                  borderRadius: '4px',
                  marginBottom: '0.5rem',
                  overflow: 'hidden'
                }}>
                  <button
                    onClick={() => toggleFaq(index)}
                    style={{
                      width: '100%',
                      padding: '1rem 1.5rem',
                      background: openFaqIndex === index ? '#f5f5f5' : '#ffffff',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: '#1f2937'
                    }}
                  >
                    <span>{faq.question}</span>
                    <span style={{
                      transform: openFaqIndex === index ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease',
                      fontSize: '1.25rem',
                      color: '#6b7280'
                    }}>
                      ▼
                    </span>
                  </button>
                  {openFaqIndex === index && (
                    <div style={{
                      padding: '1rem 1.5rem',
                      background: '#f5f5f5',
                      borderTop: '1px solid #ebedf1',
                      color: '#6b7280',
                      lineHeight: '1.6'
                    }}>
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Security & Privacy Notice */}
          <div style={{ 
            background: '#ffffff',
            border: '1px solid #ebedf1',
            borderRadius: '4px',
            padding: '1.5rem',
            marginTop: '2rem',
            fontSize: '0.875rem',
            color: '#6b7280',
            lineHeight: '1.5'
          }}>
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.75rem'
            }}>
              <span style={{ fontSize: '1.25rem' }}>🔒</span>
              <strong style={{ color: '#1f2937', fontSize: '1rem' }}>{t('finanzamtBrief.privacy.title')}</strong>
            </div>
            <ul style={{ 
              margin: '0',
              paddingLeft: '1.25rem',
              listStyleType: 'disc',
              color: '#6b7280'
            }}>
              <li>{t('finanzamtBrief.privacy.point1')}</li>
              <li>{t('finanzamtBrief.privacy.point2')}</li>
              <li>{t('finanzamtBrief.privacy.point3')}</li>
              <li>{t('finanzamtBrief.privacy.point4')}</li>
            </ul>
          </div>

          {/* Disclaimer */}
          <div style={{ 
            background: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '1.5rem',
            marginTop: '2rem',
            fontSize: '0.875rem',
            color: '#6b7280',
            lineHeight: '1.5'
          }}>
            <strong style={{ color: '#1f2937' }}>{t('finanzamtBrief.disclaimer.title')}</strong><br />
            {t('finanzamtBrief.disclaimer.text')}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function FinanzamtBriefPage() {
  return (
    <UILanguageProvider>
      <FinanzamtBriefPageContent />
    </UILanguageProvider>
  );
} 