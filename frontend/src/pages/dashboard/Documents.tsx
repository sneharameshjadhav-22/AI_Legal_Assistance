import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  FileText,
  Upload,
  Trash2,
  AlertTriangle,
  BookOpen,
  MessageSquare,
  Loader2,
  File,

} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';
import { documentApi } from '@/services/api';

interface Document {
  id: string;
  filename: string;
  uploadedAt: string;
  size: string;
}

const Documents = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = useCallback(async () => {
  try {
    const res = await documentApi.list();
    setDocuments(res.data);
  } catch (error) {
    console.error('Failed to fetch documents', error);
    toast({
      title: 'Error',
      description: 'Failed to load documents',
      variant: 'destructive',
    });
  }
}, [toast]);



  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];

      if (file.type !== 'application/pdf') {
        toast({
          title: 'Invalid file type',
          description: 'Please upload a PDF file.',
          variant: 'destructive',
        });
        return;
      }

      setIsUploading(true);

      try {
        await documentApi.upload(file);

        // ✅ REFRESH DOCUMENT LIST FROM BACKEND
        await fetchDocuments();

        toast({
          title: 'Document uploaded',
          description: `${file.name} uploaded successfully.`,
        });
      } catch (error) {
        console.error(error);
        toast({
          title: 'Upload failed',
          description: 'Something went wrong while uploading.',
          variant: 'destructive',
        });
      } finally {
        setIsUploading(false);
      }
    },
    [toast, fetchDocuments] // ✅ THIS IS CRITICAL
  );


  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    disabled: isUploading,
  });

  const handleDelete = async (id: string) => {
    try {
      await documentApi.delete(id);
      fetchDocuments();
      toast({
        title: 'Document deleted',
        description: 'The document has been removed.',
      });
    } catch (err) {
      toast({
        title: 'Delete failed',
        description: 'Could not delete document.',
        variant: 'destructive',
      });
    }
  };


  const handleAction = (action: string, filename: string) => {
    toast({
      title: `${action} started`,
      description: `Processing ${filename}...`,
    });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Documents</h1>
        <p className="text-muted-foreground mt-2">
          Upload and manage your legal contracts for AI analysis.
        </p>
      </div>

      {/* Upload Area */}
      <Card>
        <CardContent className="pt-6">
          <div
            {...getRootProps()}
            className={cn(
              'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
              isDragActive
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50',
              isUploading && 'opacity-50 cursor-not-allowed'
            )}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-3">
              {isUploading ? (
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
              ) : (
                <Upload className="h-10 w-10 text-muted-foreground" />
              )}
              <div>
                <p className="text-lg font-medium text-foreground">
                  {isUploading
                    ? 'Uploading...'
                    : isDragActive
                      ? 'Drop your PDF here'
                      : 'Drag & drop a PDF contract'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  or click to browse files
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle>Uploaded Documents</CardTitle>
          <CardDescription>
            {documents.length} document{documents.length !== 1 ? 's' : ''} uploaded
          </CardDescription>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-12">
              <File className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No documents uploaded yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{doc.filename}</p>
                      <p className="text-sm text-muted-foreground">
                        {doc.uploadedAt} • {doc.size}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAction('Risk Analysis', doc.filename)}
                    >
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      Analyze
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAction('Summary Generation', doc.filename)}
                    >
                      <BookOpen className="h-4 w-4 mr-1" />
                      Summarize
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAction('Chatbot', doc.filename)}
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Chat
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(doc.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Documents;
