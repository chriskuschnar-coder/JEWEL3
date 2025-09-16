import React, { useState } from 'react'
import { FileText, CheckCircle, Download, Eye, Shield, AlertCircle, ArrowRight, ArrowLeft, User, Building, DollarSign, Maximize2, Minimize2, ZoomIn, ZoomOut, RotateCw, X, Minus, Plus, Maximize, ExternalLink } from 'lucide-react'
import { useAuth } from './auth/AuthProvider'

interface DocumentSigningFlowProps {
  onComplete: () => void
  onBack: () => void
}

interface ExhibitAData {
  accreditedInvestorSelections: string[]
  qualifiedPurchaserSelections: string[]
  signature: string
}

interface BeneficialOwner {
  name: string
  ownershipPercent: string
  controlRole: string
  country: string
  address: string
}

interface ExhibitBData {
  beneficialOwners: BeneficialOwner[]
  noBeneficialOwners: boolean
  explanation: string
  signature: string
}

interface ExhibitCData {
  taxFormsAcknowledgment: boolean
}

interface ExhibitDData {
  signature: string
}

interface Document {
  id: string
  title: string
  description: string
  required: boolean
  signed: boolean
  url: string
  type: 'investment_agreement' | 'risk_disclosure' | 'accredited_investor' | 'subscription_agreement' | 'privacy_policy' | 'informational'
}

export default function DocumentSigningFlow({ onComplete, onBack }: DocumentSigningFlowProps) {
  const { user, markDocumentsCompleted } = useAuth()
  const [currentDocumentIndex, setCurrentDocumentIndex] = useState(0)
  const [signedDocuments, setSignedDocuments] = useState<Set<string>>(new Set())
  const [signature, setSignature] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [showDocumentPreview, setShowDocumentPreview] = useState(false)
  const [previewDoc, setPreviewDoc] = useState<{ title: string; url: string } | null>(null)
  const [zoomLevel, setZoomLevel] = useState(100)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [exhibitAData, setExhibitAData] = useState<ExhibitAData>({
    accreditedInvestorSelections: [],
    qualifiedPurchaserSelections: [],
    signature: ''
  })
  const [exhibitBData, setExhibitBData] = useState<ExhibitBData>({
    beneficialOwners: [{ name: '', ownershipPercent: '', controlRole: '', country: '', address: '' }],
    noBeneficialOwners: false,
    explanation: '',
    signature: ''
  })
  const [exhibitCData, setExhibitCData] = useState<ExhibitCData>({
    taxFormsAcknowledgment: false
  })
  const [exhibitDData, setExhibitDData] = useState<ExhibitDData>({
    signature: ''
  })
  const [previewZoom, setPreviewZoom] = useState(100)

  // Check if user has already completed documents
  const hasCompletedDocuments = user?.documents_completed

  const documents: Document[] = [
    {
      id: 'confidential_private_placement_memorandum',
      title: 'Confidential Private Placement Memorandum',
      description: 'Comprehensive investment overview, strategy details, and fund structure information.',
      required: false,
      signed: false,
      url: '/documents/Global_Markets_PPM_Final_85pp_TOC (2) copy copy.pdf',
      type: 'informational'
    },
    {
      id: 'limited_partnership_agreement',
      title: 'Limited Partnership Agreement (LPA)',
      description: 'Legal framework governing the partnership structure and investor rights.',
      required: false,
      signed: false,
      url: '/documents/GLOBAL MARKETS, LP (1) (1) (1).pdf',
      type: 'informational'
    },
    {
      id: 'subscription_agreement',
      title: 'Subscription Agreement (Global Markets, LP)',
      description: 'Comprehensive subscription agreement including investor questionnaire, beneficial ownership, tax forms, and AML/KYC certification.',
      required: true,
      signed: false,
      url: '/documents/Global_Markets_Subscription_Agreement.html',
      type: 'subscription_agreement'
    },
  ]

  // If user has already completed documents, show completion message
  if (hasCompletedDocuments) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-green-900 mb-4">
          Documents Already Completed!
        </h3>
        <p className="text-gray-600 mb-6">
          You have already completed all required onboarding documents. 
          You can proceed directly to funding your account.
        </p>
        <button
          onClick={onComplete}
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 inline-flex items-center gap-3"
        >
          Continue to Funding
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    )
  }

  const currentDocument = documents[currentDocumentIndex]
  const allRequiredSigned = documents.filter(doc => doc.required).every(doc => signedDocuments.has(doc.id))
  const isCurrentDocumentRequired = currentDocument.required
  const isSubscriptionAgreement = currentDocument.id === 'subscription_agreement'

  // Accredited Investor options for Exhibit A
  const accreditedInvestorOptions = [
    'Individual with income exceeding $200,000 in each of the two most recent years',
    'Individual with joint income exceeding $300,000 in each of the two most recent years',
    'Individual with net worth exceeding $1,000,000 (excluding primary residence)',
    'Entity with assets exceeding $5,000,000',
    'Bank, insurance company, or registered investment company',
    'Employee benefit plan with assets exceeding $5,000,000',
    'Trust with assets exceeding $5,000,000 and sophisticated trustee',
    'Entity owned entirely by accredited investors'
  ]

  // Qualified Purchaser options for Exhibit A
  const qualifiedPurchaserOptions = [
    'Individual or family company with at least $5,000,000 in investments',
    'Trust with at least $5,000,000 in investments and trustee is qualified purchaser',
    'Entity with at least $25,000,000 in investments',
    'Qualified institutional buyer under Rule 144A',
    'Knowledgeable employee of investment adviser'
  ]

  const validateExhibitA = () => {
    const isValid = exhibitAData.accreditedInvestorSelections.length > 0 && 
                   exhibitAData.qualifiedPurchaserSelections.length > 0 && 
                   exhibitAData.signature.trim().length > 0
    console.log('🔍 Exhibit A validation:', {
      accreditedSelections: exhibitAData.accreditedInvestorSelections.length,
      qualifiedSelections: exhibitAData.qualifiedPurchaserSelections.length,
      hasSignature: !!exhibitAData.signature.trim(),
      isValid
    })
    return isValid
  }

  const validateExhibitB = () => {
    let isValid = false
    if (exhibitBData.noBeneficialOwners) {
      isValid = exhibitBData.explanation.trim().length > 0 && exhibitBData.signature.trim().length > 0
    } else {
      const hasValidOwner = exhibitBData.beneficialOwners.some(owner => 
        owner.name.trim() && owner.ownershipPercent.trim() && owner.controlRole.trim()
      )
      isValid = hasValidOwner && exhibitBData.signature.trim().length > 0
    }
    
    console.log('🔍 Exhibit B validation:', {
      noBeneficialOwners: exhibitBData.noBeneficialOwners,
      hasExplanation: !!exhibitBData.explanation.trim(),
      hasValidOwner: exhibitBData.beneficialOwners.some(owner => owner.name.trim()),
      hasSignature: !!exhibitBData.signature.trim(),
      isValid
    })
    return isValid
  }

  const validateExhibitC = () => {
    const isValid = exhibitCData.taxFormsAcknowledgment
    console.log('🔍 Exhibit C validation:', { taxFormsAcknowledgment: isValid })
    return isValid
  }

  const validateExhibitD = () => {
    const isValid = exhibitDData.signature.trim().length > 0
    console.log('🔍 Exhibit D validation:', { hasSignature: isValid, signatureLength: exhibitDData.signature.trim().length })
    return isValid
  }

  const isSubscriptionAgreementComplete = () => {
    const aValid = validateExhibitA()
    const bValid = validateExhibitB()
    const cValid = validateExhibitC()
    const dValid = validateExhibitD()
    const allValid = aValid && bValid && cValid && dValid
    
    console.log('🔍 Subscription Agreement validation summary:', {
      exhibitA: aValid,
      exhibitB: bValid,
      exhibitC: cValid,
      exhibitD: dValid,
      allComplete: allValid
    })
    
    return allValid
  }

  const addBeneficialOwner = () => {
    setExhibitBData(prev => ({
      ...prev,
      beneficialOwners: [...prev.beneficialOwners, { name: '', ownershipPercent: '', controlRole: '', country: '', address: '' }]
    }))
  }

  const removeBeneficialOwner = (index: number) => {
    setExhibitBData(prev => ({
      ...prev,
      beneficialOwners: prev.beneficialOwners.filter((_, i) => i !== index)
    }))
  }

  const updateBeneficialOwner = (index: number, field: keyof BeneficialOwner, value: string) => {
    setExhibitBData(prev => ({
      ...prev,
      beneficialOwners: prev.beneficialOwners.map((owner, i) => 
        i === index ? { ...owner, [field]: value } : owner
      )
    }))
  }

  const handlePreviewDocument = (doc: { title: string; url: string }) => {
    setPreviewDoc(doc)
    setShowDocumentPreview(true)
  }

  const handleSignDocument = async () => {
    console.log('🖊️ Starting document signing process...')
    console.log('📋 Current document:', currentDocument.id)
    console.log('📝 Is subscription agreement:', isSubscriptionAgreement)
    console.log('✅ Validation status:', isSubscriptionAgreement ? isSubscriptionAgreementComplete() : !!signature.trim())
    
    if (isSubscriptionAgreement) {
      if (!isSubscriptionAgreementComplete()) {
        setError('Please complete all required fields and signatures in all exhibits')
        console.log('❌ Subscription agreement validation failed')
        return
      }
    } else if (!signature.trim()) {
      setError('Please enter your full legal name as your signature')
      console.log('❌ Signature validation failed')
      return
    }

    setIsSubmitting(true)
    setError('')
    console.log('🔄 Setting isSubmitting to true')

    try {
      console.log('💾 Attempting to save document to database...')
      
      // Try to save to database but don't let it block the flow
      const savePromise = saveDocumentToDatabase()
      
      // Set a timeout to prevent infinite waiting
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database save timeout')), 5000)
      )
      
      try {
        await Promise.race([savePromise, timeoutPromise])
        console.log('✅ Document saved successfully')
      } catch (saveError) {
        console.warn('⚠️ Database save failed, but continuing flow:', saveError)
        // Don't throw - continue the flow even if save fails
      }

      // Mark document as signed
      setSignedDocuments(prev => new Set([...prev, currentDocument.id]))
      console.log('✅ Document marked as signed:', currentDocument.id)

      // Reset form data immediately
      resetFormData()
      
      // Move to next document or complete
      if (currentDocumentIndex < documents.length - 1) {
        console.log('📄 Moving to next document...')
        setCurrentDocumentIndex(prev => prev + 1)
      } else {
        console.log('🎉 All documents completed! Proceeding to congratulations...')
        
        // Complete the process in background, don't wait for it
        completeDocumentProcess().catch(error => {
          console.warn('⚠️ Failed to mark documents completed in profile:', error)
        })
        
        // Immediately proceed to congratulations
        onComplete()
      }
    } catch (err) {
      console.error('❌ Signing error:', err)
      setError('There was an issue saving your signature, but your documents are complete. Proceeding...')
      
      // Even on error, proceed to avoid stalling
      setTimeout(() => {
        setSignedDocuments(prev => new Set([...prev, currentDocument.id]))
        if (currentDocumentIndex < documents.length - 1) {
          resetFormData()
          setCurrentDocumentIndex(prev => prev + 1)
        } else {
          onComplete()
        }
      }, 2000)
    } finally {
      console.log('🔄 Setting isSubmitting to false')
      setIsSubmitting(false)
    }
  }

  const saveDocumentToDatabase = async () => {
    console.log('💾 saveDocumentToDatabase called')
    try {
      const { supabaseClient } = await import('../lib/supabase-client')
      console.log('📡 Supabase client imported')
      
      if (isSubscriptionAgreement) {
        console.log('💾 Saving subscription agreement with all exhibits...')
        
        const documentData = {
          user_id: user?.id,
          document_id: currentDocument.id,
          document_title: currentDocument.title,
          document_type: currentDocument.type,
          signature: 'Multiple signatures - see metadata',
          signed_at: new Date().toISOString(),
          ip_address: 'unknown',
          user_agent: navigator.userAgent,
          metadata: {
            exhibit_a: exhibitAData,
            exhibit_b: exhibitBData,
            exhibit_c: exhibitCData,
            exhibit_d: exhibitDData,
            completion_timestamp: new Date().toISOString(),
            user_email: user?.email,
            user_name: user?.full_name || user?.email
          }
        }
        
        console.log('📤 Inserting subscription agreement data:', {
          user_id: user?.id,
          document_id: currentDocument.id,
          hasExhibitA: !!exhibitAData.signature,
          hasExhibitB: !!exhibitBData.signature,
          hasExhibitC: exhibitCData.taxFormsAcknowledgment,
          hasExhibitD: !!exhibitDData.signature
        })
        
        const { error: signError } = await supabaseClient
          .from('signed_documents')
          .insert(documentData)
        
        if (signError) {
          console.error('❌ Failed to save subscription agreement:', signError)
          throw signError
        }
        console.log('✅ Subscription agreement saved successfully')
      } else {
        console.log('💾 Saving document signature...')
        
        const documentData = {
          user_id: user?.id,
          document_id: currentDocument.id,
          document_title: currentDocument.title,
          document_type: currentDocument.type,
          signature: signature.trim(),
          signed_at: new Date().toISOString(),
          ip_address: 'unknown',
          user_agent: navigator.userAgent,
          metadata: {
            user_email: user?.email,
            user_name: user?.full_name || user?.email,
            document_url: currentDocument.url
          }
        }
        
        console.log('📤 Inserting document signature:', {
          user_id: user?.id,
          document_id: currentDocument.id,
          signature_length: signature.trim().length
        })
        
        const { error: signError } = await supabaseClient
          .from('signed_documents')
          .insert(documentData)
        
        if (signError) {
          console.error('❌ Failed to save document signature:', signError)
          throw signError
        }
        console.log('✅ Document signature saved successfully')
      }
    } catch (error) {
      console.error('❌ Database save failed:', error)
      throw error // Re-throw so the calling function can handle it
    }
  }

  const resetFormData = () => {
    console.log('🔄 Resetting form data')
    setSignature('')
    setError('')
    
    // Reset exhibit data for subscription agreement
    if (currentDocument.id === 'subscription_agreement') {
      console.log('🔄 Resetting subscription agreement exhibit data')
      setExhibitAData({ accreditedInvestorSelections: [], qualifiedPurchaserSelections: [], signature: '' })
      setExhibitBData({ beneficialOwners: [{ name: '', ownershipPercent: '', controlRole: '', country: '', address: '' }], noBeneficialOwners: false, explanation: '', signature: '' })
      setExhibitCData({ taxFormsAcknowledgment: false })
      setExhibitDData({ signature: '' })
    }
  }

  const completeDocumentProcess = async () => {
    console.log('🏁 Starting document completion process...')
    try {
      console.log('🏁 Marking documents as completed in user profile...')
      await markDocumentsCompleted()
      console.log('✅ User profile updated - documents completed')
      return true
    } catch (error) {
      console.error('❌ Failed to mark documents completed:', error)
      return false
    }
  }

  const handlePreviousDocument = () => {
    if (currentDocumentIndex > 0) {
      setCurrentDocumentIndex(prev => prev - 1)
      setSignature('')
      setError('')
    }
  }

  const handleNextDocument = () => {
    if (currentDocumentIndex < documents.length - 1) {
      setCurrentDocumentIndex(prev => prev + 1)
      setSignature('')
      setError('')
    }
  }

  return (
    <>
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-700">
            Document {currentDocumentIndex + 1} of {documents.length}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(((currentDocumentIndex + 1) / documents.length) * 100)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-navy-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentDocumentIndex + 1) / documents.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Document Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-navy-100 rounded-lg flex items-center justify-center flex-shrink-0">
            {currentDocument.required ? (
              <FileText className="h-6 w-6 text-navy-600" />
            ) : (
              <Eye className="h-6 w-6 text-blue-600" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{currentDocument.title}</h3>
            {!currentDocument.required && (
              <div className="mb-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <Eye className="h-3 w-3 mr-1" />
                  Review Only - No Signature Required
                </span>
              </div>
            )}
            <p className="text-gray-600 mb-4">{currentDocument.description}</p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={currentDocument.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                <Eye className="h-4 w-4" />
                <span>Review Document</span>
              </a>
              <button
                onClick={() => setShowDocumentPreview(true)}
                className="inline-flex items-center space-x-2 text-navy-600 hover:text-navy-700 font-medium"
              >
                <Maximize2 className="h-4 w-4" />
                <span>Preview Document</span>
              </button>
              <a
                href={currentDocument.url}
                download
                className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-700 font-medium"
              >
                <Download className="h-4 w-4" />
                <span>Download PDF</span>
              </a>
            </div>
          </div>
          
          {signedDocuments.has(currentDocument.id) && (
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Signature Section or Review Section */}
      {isCurrentDocumentRequired ? (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          {isSubscriptionAgreement ? (
            <div className="space-y-8">
              <h4 className="text-xl font-semibold text-gray-900 mb-6">Complete Subscription Agreement</h4>
              
              {/* Exhibit A - Investor Questionnaire */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <User className="h-6 w-6 text-blue-600" />
                  <h5 className="text-lg font-bold text-blue-900">Exhibit A: Investor Questionnaire</h5>
                </div>
                
                <div className="space-y-6">
                  {/* Accredited Investor Section */}
                  <div>
                    <h6 className="font-semibold text-gray-900 mb-3">Accredited Investor Status (Select at least one):</h6>
                    <div className="space-y-2">
                      {accreditedInvestorOptions.map((option, index) => (
                        <label key={index} className="flex items-start space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={exhibitAData.accreditedInvestorSelections.includes(option)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setExhibitAData(prev => ({
                                  ...prev,
                                  accreditedInvestorSelections: [...prev.accreditedInvestorSelections, option]
                                }))
                              } else {
                                setExhibitAData(prev => ({
                                  ...prev,
                                  accreditedInvestorSelections: prev.accreditedInvestorSelections.filter(s => s !== option)
                                }))
                              }
                            }}
                            className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Qualified Purchaser Section */}
                  <div>
                    <h6 className="font-semibold text-gray-900 mb-3">Qualified Purchaser Status (Select at least one):</h6>
                    <div className="space-y-2">
                      {qualifiedPurchaserOptions.map((option, index) => (
                        <label key={index} className="flex items-start space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={exhibitAData.qualifiedPurchaserSelections.includes(option)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setExhibitAData(prev => ({
                                  ...prev,
                                  qualifiedPurchaserSelections: [...prev.qualifiedPurchaserSelections, option]
                                }))
                              } else {
                                setExhibitAData(prev => ({
                                  ...prev,
                                  qualifiedPurchaserSelections: prev.qualifiedPurchaserSelections.filter(s => s !== option)
                                }))
                              }
                            }}
                            className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Exhibit A Signature */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Exhibit A Electronic Signature
                    </label>
                    <input
                      type="text"
                      value={exhibitAData.signature}
                      onChange={(e) => setExhibitAData(prev => ({ ...prev, signature: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Type your full legal name"
                    />
                  </div>
                </div>
              </div>

              {/* Exhibit B - Beneficial Ownership */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Building className="h-6 w-6 text-green-600" />
                  <h5 className="text-lg font-bold text-green-900">Exhibit B: Beneficial Ownership Form</h5>
                </div>
                
                <div className="space-y-6">
                  {/* No Beneficial Owners Option */}
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exhibitBData.noBeneficialOwners}
                      onChange={(e) => setExhibitBData(prev => ({ ...prev, noBeneficialOwners: e.target.checked }))}
                      className="mt-1 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm font-medium text-gray-900">
                      No individual owns 25% or more of this entity (explain below)
                    </span>
                  </label>

                  {exhibitBData.noBeneficialOwners && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Explanation
                      </label>
                      <textarea
                        value={exhibitBData.explanation}
                        onChange={(e) => setExhibitBData(prev => ({ ...prev, explanation: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        rows={3}
                        placeholder="Explain ownership structure..."
                      />
                    </div>
                  )}

                  {/* Beneficial Owners Table */}
                  {!exhibitBData.noBeneficialOwners && (
                    <div>
                      <h6 className="font-semibold text-gray-900 mb-3">Beneficial Owners (25% or more ownership):</h6>
                      <div className="space-y-4">
                        {exhibitBData.beneficialOwners.map((owner, index) => (
                          <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h6 className="font-medium text-gray-900">Beneficial Owner {index + 1}</h6>
                              {exhibitBData.beneficialOwners.length > 1 && (
                                <button
                                  onClick={() => removeBeneficialOwner(index)}
                                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                  type="text"
                                  value={owner.name}
                                  onChange={(e) => updateBeneficialOwner(index, 'name', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                  placeholder="Full legal name"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ownership %</label>
                                <input
                                  type="text"
                                  value={owner.ownershipPercent}
                                  onChange={(e) => updateBeneficialOwner(index, 'ownershipPercent', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                  placeholder="e.g., 30%"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Control/Role</label>
                                <input
                                  type="text"
                                  value={owner.controlRole}
                                  onChange={(e) => updateBeneficialOwner(index, 'controlRole', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                  placeholder="e.g., CEO, Managing Member"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                                <input
                                  type="text"
                                  value={owner.country}
                                  onChange={(e) => updateBeneficialOwner(index, 'country', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                  placeholder="Country of residence"
                                />
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                <textarea
                                  value={owner.address}
                                  onChange={(e) => updateBeneficialOwner(index, 'address', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                  rows={2}
                                  placeholder="Full address"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                        <button
                          onClick={addBeneficialOwner}
                          className="text-green-600 hover:text-green-700 text-sm font-medium"
                        >
                          + Add Another Beneficial Owner
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Exhibit B Signature */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Exhibit B Electronic Signature
                    </label>
                    <input
                      type="text"
                      value={exhibitBData.signature}
                      onChange={(e) => setExhibitBData(prev => ({ ...prev, signature: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Type your full legal name"
                    />
                  </div>
                </div>
              </div>

              {/* Exhibit C - U.S. Tax Forms */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <DollarSign className="h-6 w-6 text-yellow-600" />
                  <h5 className="text-lg font-bold text-yellow-900">Exhibit C: U.S. Tax Forms</h5>
                </div>
                
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={exhibitCData.taxFormsAcknowledgment}
                    onChange={(e) => setExhibitCData(prev => ({ ...prev, taxFormsAcknowledgment: e.target.checked }))}
                    className="mt-1 rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                  />
                  <span className="text-sm font-medium text-gray-900">
                    I will provide the applicable IRS W-9 or W-8 form via the secure portal.
                  </span>
                </label>
              </div>

              {/* Exhibit D - AML/KYC Certification */}
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Shield className="h-6 w-6 text-purple-600" />
                  <h5 className="text-lg font-bold text-purple-900">Exhibit D: AML/KYC Certification</h5>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-purple-800 mb-4">
                    I certify that I am in compliance with all applicable anti-money laundering (AML) and 
                    know-your-customer (KYC) requirements, and I acknowledge that additional verification 
                    may be required.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Exhibit D Electronic Signature
                  </label>
                  <input
                    type="text"
                    value={exhibitDData.signature}
                    onChange={(e) => setExhibitDData(prev => ({ ...prev, signature: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Type your full legal name"
                  />
                </div>
              </div>

              {/* Legal Notice */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="h-5 w-5 text-gray-600" />
                  <span className="font-medium text-gray-900">Legal Electronic Signature</span>
                </div>
                <p className="text-sm text-gray-700">
                  By typing your full legal name in the signature fields above, you are providing legally binding 
                  electronic signatures equivalent to handwritten signatures under the Electronic Signatures in 
                  Global and National Commerce Act.
                </p>
              </div>
            </div>
          ) : (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Electronic Signature</h4>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-900">Legal Electronic Signature</span>
                </div>
                <p className="text-sm text-blue-700">
                  By typing your full legal name below, you are providing a legally binding electronic signature 
                  equivalent to a handwritten signature under the Electronic Signatures in Global and National Commerce Act.
                </p>
              </div>

              <div className="mb-6">
                <label htmlFor="signature" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Legal Name (Electronic Signature)
                </label>
                <input
                  type="text"
                  id="signature"
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-colors"
                  placeholder="Type your full legal name"
                  disabled={signedDocuments.has(currentDocument.id)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  This constitutes your legal electronic signature
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="text-red-900 font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Navigation and Sign Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between">
            <div className="flex gap-3">
              <button
                onClick={() => {
                  console.log('🔙 Going back to portfolio from document signing')
                  onBack()
                }}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-700 font-medium transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Portfolio</span>
              </button>
              
              {currentDocumentIndex > 0 && (
                <button
                  onClick={handlePreviousDocument}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Previous</span>
                </button>
              )}
            </div>

            <div className="flex gap-3">
              {!signedDocuments.has(currentDocument.id) && isCurrentDocumentRequired ? (
                <button
                  onClick={handleSignDocument}
                  disabled={isSubmitting || (isSubscriptionAgreement ? !isSubscriptionAgreementComplete() : !signature.trim())}
                  className="bg-navy-600 hover:bg-navy-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Completing...</span>
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4" />
                      <span>{isSubscriptionAgreement ? 'Complete Subscription Agreement' : 'Sign Document'}</span>
                    </>
                  )}
                </button>
              ) : isCurrentDocumentRequired ? (
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">{isSubscriptionAgreement ? 'Subscription Agreement Complete' : 'Document Signed'}</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-blue-600">
                  <Eye className="h-5 w-5" />
                  <span className="font-medium">Review Complete</span>
                </div>
              )}

              {(!isCurrentDocumentRequired || signedDocuments.has(currentDocument.id)) && currentDocumentIndex < documents.length - 1 && (
                <button
                  onClick={handleNextDocument}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2"
                >
                  <span>Next Document</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}

              {allRequiredSigned && currentDocumentIndex === documents.length - 1 && (
                <button
                  onClick={() => {
                    console.log('🎉 Final completion button clicked')
                    setSignedDocuments(prev => new Set([...prev, currentDocument.id]))
                    
                    // Mark documents as completed in background
                    markDocumentsCompleted().then(() => {
                      console.log('✅ Documents marked as completed in user profile')
                    }).catch(error => {
                      console.warn('⚠️ Failed to mark documents completed, but proceeding:', error)
                    })
                    
                    // Immediately proceed to congratulations
                    console.log('🎊 Proceeding to congratulations page')
                    onComplete()
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Complete Onboarding</span>
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="text-center">
            <Eye className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-blue-900 mb-2">Document Review</h4>
            <p className="text-blue-700 mb-6">
              Please review the Private Placement Memorandum above. This document provides important 
              information about the investment opportunity and does not require your signature.
            </p>
            
            <div className="flex justify-center gap-3">
              {currentDocumentIndex > 0 && (
                <button
                  onClick={handlePreviousDocument}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Previous</span>
                </button>
              )}
              
              {currentDocumentIndex < documents.length - 1 ? (
                <button
                  onClick={handleNextDocument}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2"
                >
                  <span>Continue to Signature Documents</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    console.log('🎉 Review completion button clicked')
                    markDocumentsCompleted().catch(console.error)
                    onComplete()
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Complete Onboarding</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Document List Overview */}
      <div className="mt-8 bg-gray-50 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Document Checklist</h4>
        <div className="space-y-3">
          {documents.map((doc, index) => (
            <div 
              key={doc.id}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                index === currentDocumentIndex ? 'border-navy-500 bg-navy-50' : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  signedDocuments.has(doc.id) ? 'bg-green-100' : 
                  index === currentDocumentIndex ? 'bg-navy-100' : 'bg-gray-100'
                }`}>
                  {signedDocuments.has(doc.id) ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : !doc.required ? (
                    <Eye className="h-4 w-4 text-blue-600" />
                  ) : (
                    <span className={`font-bold text-sm ${
                      index === currentDocumentIndex ? 'text-navy-600' : 'text-gray-600'
                    }`}>
                      {index + 1}
                    </span>
                  )}
                </div>
                <div>
                  <div className={`font-medium ${
                    index === currentDocumentIndex ? 'text-navy-900' : 'text-gray-900'
                  }`}>
                    {doc.title}
                  </div>
                  <div className="text-sm text-gray-600">{doc.description}</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {signedDocuments.has(doc.id) && (
                  <span className="text-sm font-medium text-green-600">Signed</span>
                )}
                {!doc.required && (
                  <span className="text-sm font-medium text-blue-600">Review Only</span>
                )}
                {index === currentDocumentIndex && (
                  <span className="text-sm font-medium text-navy-600">Current</span>
                )}
                <button
                  onClick={() => handlePreviewDocument({
                    title: doc.title,
                    url: doc.url
                  })}
                  className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  <span>Preview Document</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Document Preview Modal */}
    {showDocumentPreview && (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className={`bg-white rounded-xl shadow-2xl overflow-hidden transition-all duration-300 ${
          isFullscreen ? 'w-full h-full' : 'w-full max-w-6xl h-[90vh]'
        }`}>
          {/* Preview Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-navy-100 rounded-lg flex items-center justify-center">
                <FileText className="h-4 w-4 text-navy-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{currentDocument.title}</h3>
                <p className="text-sm text-gray-600">Document Preview</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Zoom Controls */}
              <div className="flex items-center space-x-1 bg-white rounded-lg border border-gray-200 p-1">
                <button
                  onClick={() => setPreviewZoom(Math.max(50, previewZoom - 25))}
                  className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="h-4 w-4 text-gray-600" />
                </button>
                <span className="px-3 py-1 text-sm font-medium text-gray-700 min-w-[60px] text-center">
                  {previewZoom}%
                </span>
                <button
                  onClick={() => setPreviewZoom(Math.min(200, previewZoom + 25))}
                  className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="h-4 w-4 text-gray-600" />
                </button>
              </div>
              
              {/* Fullscreen Toggle */}
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4 text-gray-600" />
                ) : (
                  <Maximize2 className="h-4 w-4 text-gray-600" />
                )}
              </button>
              
              {/* Close Button */}
              <button
                onClick={() => {
                  setShowDocumentPreview(false)
                  setIsFullscreen(false)
                  setPreviewZoom(100)
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Close Preview"
              >
                <X className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          </div>
          
          {/* Document Preview Content */}
          <div className="h-full bg-gray-100 overflow-hidden">
            {currentDocument.url.endsWith('.pdf') ? (
              <div className="h-full overflow-auto">
                <iframe
                  src={`${currentDocument.url}#toolbar=1&navpanes=1&scrollbar=1&view=FitH&zoom=${previewZoom}`}
                  className="w-full h-full border-none"
                  title={`Preview: ${currentDocument.title}`}
                  style={{
                    minHeight: isFullscreen ? '100vh' : '600px',
                    transform: `scale(${previewZoom / 100})`,
                    transformOrigin: 'top left'
                  }}
                />
              </div>
            ) : currentDocument.url.endsWith('.html') ? (
              <div className="h-full overflow-auto bg-white">
                <iframe
                  src={currentDocument.url}
                  className="w-full h-full border-none"
                  title={`Preview: ${currentDocument.title}`}
                  style={{
                    minHeight: isFullscreen ? '100vh' : '600px',
                    transform: `scale(${previewZoom / 100})`,
                    transformOrigin: 'top left'
                  }}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Preview Not Available</h3>
                  <p className="text-gray-600 mb-4">
                    This document type cannot be previewed in the browser.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <a
                      href={currentDocument.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center space-x-2"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Open in New Tab</span>
                    </a>
                    <a
                      href={currentDocument.url}
                      download
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center space-x-2"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download</span>
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Preview Footer */}
          <div className="bg-gray-50 border-t border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span>Secure Document Preview</span>
                </div>
                <div className="text-sm text-gray-500">
                  Use scroll wheel or trackpad to navigate through the document
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <a
                  href={currentDocument.url}
                  download
                  className="text-gray-600 hover:text-gray-700 text-sm font-medium inline-flex items-center space-x-1"
                >
                  <Download className="h-3 w-3" />
                  <span>Download</span>
                </a>
                <a
                  href={currentDocument.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center space-x-1"
                >
                  <Eye className="h-3 w-3" />
                  <span>Open in New Tab</span>
                </a>
                <button
                  onClick={() => {
                    setShowDocumentPreview(false)
                    setIsFullscreen(false)
                    setPreviewZoom(100)
                  }}
                  className="bg-navy-600 hover:bg-navy-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Document Preview Modal */}
    <DocumentPreviewModal />
    </>
  )
}

// Add the missing state and preview modal outside the main return
const DocumentPreviewModal = () => {
  const [showDocumentPreview, setShowDocumentPreview] = useState(false)
  const [previewDoc, setPreviewDoc] = useState<{ title: string; url: string } | null>(null)
  const [zoomLevel, setZoomLevel] = useState(100)
  const [isFullscreen, setIsFullscreen] = useState(false)

  if (!showDocumentPreview || !previewDoc) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden w-full max-w-5xl max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Eye className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{previewDoc.title}</h3>
              <p className="text-sm text-gray-600">Document Preview</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setZoomLevel(Math.max(50, zoomLevel - 25))}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              title="Zoom Out"
            >
              <Minus className="h-4 w-4 text-gray-600" />
            </button>
            <span className="text-sm text-gray-600 min-w-[60px] text-center">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel(Math.min(200, zoomLevel + 25))}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              title="Zoom In"
            >
              <Plus className="h-4 w-4 text-gray-600" />
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              title="Toggle Fullscreen"
            >
              <Maximize className="h-4 w-4 text-gray-600" />
            </button>
            <button
              onClick={() => setShowDocumentPreview(false)}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              title="Close Preview"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
        
        <div className={`${isFullscreen ? 'h-[85vh]' : 'h-[70vh]'} bg-gray-100 relative overflow-hidden`}>
          <div className="w-full h-full overflow-auto">
            {previewDoc.url.endsWith('.pdf') ? (
              <iframe
                src={`${previewDoc.url}#zoom=${zoomLevel}`}
                title={`Preview: ${previewDoc.title}`}
                className="w-full h-full border-none"
                style={{ minHeight: '100%' }}
              />
            ) : (
              <iframe
                src={previewDoc.url}
                title={`Preview: ${previewDoc.title}`}
                className="w-full h-full border-none"
                style={{ 
                  minHeight: '100%',
                  transform: `scale(${zoomLevel / 100})`,
                  transformOrigin: 'top left'
                }}
              />
            )}
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Shield className="h-4 w-4 text-green-600" />
              <span>Secure Document Preview</span>
            </div>
            <div className="flex items-center space-x-3">
              <a
                href={previewDoc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Open in New Tab</span>
              </a>
              <a
                href={previewDoc.url}
                download
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-700 text-sm font-medium transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Download PDF</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}