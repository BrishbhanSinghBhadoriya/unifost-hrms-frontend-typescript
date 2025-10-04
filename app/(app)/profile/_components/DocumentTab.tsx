import React, { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardTitle, CardHeader } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useAuth } from '@/lib/auth-context'
import { authService } from '@/lib/auth'
import DescriptionIcon from '@mui/icons-material/Description'
import DownloadIcon from '@mui/icons-material/Download'
import UploadIcon from '@mui/icons-material/Upload'
import VisibilityIcon from '@mui/icons-material/Visibility'
import CloseIcon from '@mui/icons-material/Close'
import CheckIcon from '@mui/icons-material/Check'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import CreditCardIcon from '@mui/icons-material/CreditCard'
import PersonIcon from '@mui/icons-material/Person'
import EditIcon from '@mui/icons-material/Edit'
import { toast } from 'sonner'

const DocumentTab = () => {
  const { user, updateUser } = useAuth();
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());
  const [editingNumbers, setEditingNumbers] = useState<Set<string>>(new Set());
  const [numberValues, setNumberValues] = useState<{ [key: string]: string }>({});
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  
  const documents = (user as any)?.documents || {};
  
  console.log('User ID:', (user as any)?._id || user?.id)
  // Removed automatic user data refresh to prevent unnecessary API calls
  
  const documentFields = [
    {
      key: 'adharImage',
      numberKey: 'adharNumber',
      label: 'Aadhar Card',
      description: 'Government issued identity proof',
      icon: PersonIcon,
      showNumber: true,
      numberLabel: 'Aadhar Number'
    },
    {
      key: 'panImage', 
      numberKey: 'panNumber',
      label: 'PAN Card',
      description: 'Permanent Account Number card',
      icon: CreditCardIcon,
      showNumber: true,
      numberLabel: 'PAN Number'
    },
    {
      key: 'experienceLetterImage',
      label: 'Experience Letter',
      description: 'Previous work experience certificate',
      icon: DescriptionIcon,
      showNumber: false
    },
    {
      key: 'MarksheetImage_10',
      label: '10th Marksheet',
      description: 'Class 10th academic records',
      icon: DescriptionIcon,
      showNumber: false
    },
    {
      key: 'MarksheetImage_12',
      label: '12th Marksheet', 
      description: 'Class 12th academic records',
      icon: DescriptionIcon,
      showNumber: false
    },
    {
      key: 'MarksheetImage_Graduation',
      label: 'Graduation Marksheet',
      description: 'Graduation degree marksheet',
      icon: DescriptionIcon,
      showNumber: false
    },
    {
      key: 'MarksheetImage_PostGraduationImage',
      label: 'Post Graduation Marksheet',
      description: 'Post graduation degree marksheet',
      icon: DescriptionIcon,
      showNumber: false
    }
  ];

  

  const handleDownloadDocument = async (documentUrl: string, filename: string) => {
    if (!documentUrl) {
      toast.error('Document URL not found');
      return;
    }

    try {
      // First try direct download
      const link = document.createElement('a');
      link.href = documentUrl;
      link.download = filename;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // If direct download fails, try fetch approach
      setTimeout(async () => {
        try {
          const response = await fetch(documentUrl, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${authService.getToken()}`
            }
          });
          
          if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
          } else {
            // Fallback: open in new tab
            window.open(documentUrl, '_blank');
          }
        } catch (error) {
          console.error('Download error:', error);
          // Final fallback: open in new tab
          window.open(documentUrl, '_blank');
        }
      }, 1000);
      
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download document. Opening in new tab...');
      window.open(documentUrl, '_blank');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, documentKey: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.includes('pdf') && !file.type.includes('image')) {
      toast.error('Please select a PDF or image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size should be less than 10MB');
      return;
    }

    if (!(user as any)?._id && !user?.id) {
      toast.error('User not found');
      return;
    }

    setUploadingFiles(prev => new Set(prev).add(documentKey));
    
    try {
      const result = await authService.uploadDocument(((user as any)?._id || user?.id) as string, documentKey, file);
      
      if (result.success) {
        // Update user state with the new document URL
        const updatedDocuments = {
          ...documents,
          [documentKey]: result.data?.url || result.data?.documentUrl || result.data
        };
        
        updateUser({
          documents: updatedDocuments
        } as any);
        
        // Also update the server with the document URL
        try {
          await authService.updateEmployeeProfile(((user as any)?._id || user?.id) as string, {
            documents: updatedDocuments
          });
        } catch (error) {
          console.error('Failed to update server with document URL:', error);
        }
        
        const isUpdate = !!documents[documentKey];
        toast.success(`${documentFields.find(d => d.key === documentKey)?.label} ${isUpdate ? 'updated' : 'uploaded'} successfully`);
      } else {
        toast.error(result.message || 'Failed to upload document');
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file');
    } finally {
      setUploadingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(documentKey);
        return newSet;
      });
    }
  };

  const handleDocumentUpdate = (documentKey: string) => {
    const documentLabel = documentFields.find(d => d.key === documentKey)?.label;
    
    // Show confirmation for document update
    if (window.confirm(`Are you sure you want to update ${documentLabel}? This will replace the existing document.`)) {
      // Trigger the file input for the specific document
      triggerFileInput(documentKey);
    }
  };

  const handleNumberEdit = (numberKey: string, currentValue: string) => {
    setEditingNumbers(prev => new Set(prev).add(numberKey));
    setNumberValues(prev => ({
      ...prev,
      [numberKey]: currentValue || ''
    }));
  };

  const handleNumberSave = async (numberKey: string) => {
    if (!(user as any)?._id && !user?.id) {
      toast.error('User not found');
      return;
    }

    const newValue = numberValues[numberKey]?.trim();
    if (!newValue) {
      toast.error('Please enter a valid number');
      return;
    }

    try {
      const updatedDocuments = {
        ...documents,
        [numberKey]: newValue
      };

      console.log('💾 Saving document number:', { numberKey, newValue, updatedDocuments });

      // Update server
      const result = await authService.updateEmployeeProfile(((user as any)?._id || user?.id) as string, {
        documents: updatedDocuments
      });

      console.log('💾 Server response:', result);

      if (result.success) {
        // Update local state
        updateUser({
          documents: updatedDocuments
        } as any);

        // Exit edit mode
        setEditingNumbers(prev => {
          const newSet = new Set(prev);
          newSet.delete(numberKey);
          return newSet;
        });

        toast.success('Number updated successfully');
      } else {
        console.error('💾 Server error:', result.message);
        toast.error(result.message || 'Failed to update number');
      }
    } catch (error) {
      console.error('💾 Update number error:', error);
      toast.error('Failed to update number');
    }
  };

  const handleNumberCancel = (numberKey: string) => {
    setEditingNumbers(prev => {
      const newSet = new Set(prev);
      newSet.delete(numberKey);
      return newSet;
    });
    setNumberValues(prev => {
      const newValues = { ...prev };
      delete newValues[numberKey];
      return newValues;
    });
  };

  const triggerFileInput = (documentKey: string) => {
    fileInputRefs.current[documentKey]?.click();
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${label} copied to clipboard`);
    }).catch(() => {
      toast.error('Failed to copy to clipboard');
    });
  };

  const formatDocumentNumber = (number: string, type: 'aadhar' | 'pan') => {
    if (!number) return '';
    
    if (type === 'aadhar') {
      return number.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3');
    } else if (type === 'pan') {
      return number.toUpperCase();
    }
    return number;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DescriptionIcon sx={{ fontSize: 20 }} />
            Document Management
          </CardTitle>
          <CardDescription>
            Manage your personal and professional documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {documentFields.map((doc) => {
              const documentUrl = documents[doc.key];
              const documentNumber = doc.numberKey ? documents[doc.numberKey] : null;
              const hasDocument = !!documentUrl;
              const hasNumber = !!documentNumber;
              const IconComponent = doc.icon;
              
              return (
                <div key={doc.key} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <IconComponent sx={{ fontSize: 16, color: '#6b7280' }} />
                        <Label className="text-sm font-medium">{doc.label}</Label>
                      </div>
                      <p className="text-xs text-muted-foreground">{doc.description}</p>
                      
                      {/* Document Number Display */}
                      {doc.showNumber && (
                        <div className="mt-2">
                          {editingNumbers.has(doc.numberKey!) ? (
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-muted-foreground">
                                {doc.numberLabel}:
                              </span>
                              <input
                                type="text"
                                value={numberValues[doc.numberKey!] || ''}
                                onChange={(e) => setNumberValues(prev => ({
                                  ...prev,
                                  [doc.numberKey!]: e.target.value
                                }))}
                                className="text-xs font-mono bg-background border border-input px-2 py-1 rounded w-32"
                                placeholder={doc.key === 'adharImage' ? '1234 5678 9012' : 'ABCDE1234F'}
                                maxLength={doc.key === 'adharImage' ? 12 : 10}
                                style={doc.key === 'panImage' ? { textTransform: 'uppercase' } : {}}
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 text-green-600"
                                onClick={() => handleNumberSave(doc.numberKey!)}
                              >
                                <CheckIcon sx={{ fontSize: 12 }} />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 text-red-600"
                                onClick={() => handleNumberCancel(doc.numberKey!)}
                              >
                                <CloseIcon sx={{ fontSize: 12 }} />
                              </Button>
                            </div>
                          ) : hasNumber ? (
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-muted-foreground">
                                {doc.numberLabel}:
                              </span>
                              <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
                                {formatDocumentNumber(documentNumber, doc.key === 'adharImage' ? 'aadhar' : 'pan')}
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0"
                                onClick={() => copyToClipboard(documentNumber, doc.numberLabel || '')}
                                title="Copy to clipboard"
                              >
                                <ContentCopyIcon sx={{ fontSize: 12 }} />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0"
                                onClick={() => handleNumberEdit(doc.numberKey!, documentNumber)}
                                title="Edit number"
                              >
                                <EditIcon sx={{ fontSize: 12 }} />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                {doc.numberLabel} not provided
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0"
                                onClick={() => handleNumberEdit(doc.numberKey!, '')}
                                title="Add number"
                              >
                                <EditIcon sx={{ fontSize: 12 }} />
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {hasDocument ? (
                        <>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline" title="View Document">
                                <VisibilityIcon sx={{ fontSize: 16 }} />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh]">
                              <DialogHeader>
                                <DialogTitle>{doc.label}</DialogTitle>
                              </DialogHeader>
                              <div className="flex justify-center">
                                {documentUrl.includes('data:image') || documentUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                                  <img 
                                    src={documentUrl} 
                                    alt={doc.label}
                                    className="max-w-full max-h-[60vh] object-contain rounded-lg"
                                  />
                                ) : documentUrl.match(/\.pdf$/i) || documentUrl.includes('pdf') ? (
                                  <div className="w-full h-[60vh] rounded-lg border">
                                    <iframe 
                                      src={`https://docs.google.com/gview?url=${encodeURIComponent(documentUrl)}&embedded=true`}
                                      className="w-full h-full rounded-lg"
                                      title={doc.label}
                                    />
                                    <div className="mt-2 text-center">
                                      <p className="text-xs text-muted-foreground">
                                        If PDF doesn't load, try downloading the file
                                      </p>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-center h-[60vh] text-muted-foreground">
                                    <div className="text-center">
                                      <DescriptionIcon sx={{ fontSize: 48, marginBottom: 2 }} />
                                      <p>Preview not available for this file type</p>
                                      <p className="text-sm">Click download to view the file</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownloadDocument(documentUrl, `${doc.label}.pdf`)}
                            title="Download Document"
                          >
                            <DownloadIcon sx={{ fontSize: 16 }} />
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDocumentUpdate(doc.key)}
                            disabled={uploadingFiles.has(doc.key)}
                            title="Update Document"
                          >
                            {uploadingFiles.has(doc.key) ? (
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                            ) : (
                              <EditIcon sx={{ fontSize: 16 }} />
                            )}
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => triggerFileInput(doc.key)}
                          disabled={uploadingFiles.has(doc.key)}
                          title="Upload Document"
                        >
                          {uploadingFiles.has(doc.key) ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                          ) : (
                            <UploadIcon sx={{ fontSize: 16 }} />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {hasDocument && (
                    <div className="flex items-center gap-2 text-xs text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Document uploaded - Click edit to update
                    </div>
                  )}
                  
                  {!hasDocument && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                      No document uploaded
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      {/* Hidden file inputs */}
      {documentFields.map((doc) => (
        <input
          key={doc.key}
          ref={(el) => (fileInputRefs.current[doc.key] = el)}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => handleFileUpload(e, doc.key)}
          className="hidden"
        />
      ))}
    </div>
  )
}

export default DocumentTab
