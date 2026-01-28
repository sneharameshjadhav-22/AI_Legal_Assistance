import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import jsPDF from 'jspdf';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BookOpen, FileText, Loader2, Download, RefreshCw } from 'lucide-react';
import { documentApi, laymanApi } from '@/services/api';
interface ClauseSummary {
  id: number;
  clause_text: string;
  layman_summary: string;
  risk_label: string;
}



const LaymanSummary = () => {
  const [selectedDocument, setSelectedDocument] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [summaries, setSummaries] = useState<ClauseSummary[]>([]);
  const [documents, setDocuments] = useState<{ id: string; filename: string }[]>([]);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const res = await documentApi.list();
        setDocuments(res.data);
      } catch {
        console.error('Failed to fetch documents');
      }
    };
    fetchDocuments();
  }, []);
  const handleGenerate = async () => {
    if (!selectedDocument) return;

    setIsGenerating(true);
    try {

      const res = await laymanApi.generate(selectedDocument);
      setSummaries(res.data);
    } catch (err) {
      console.error(err);
      setSummaries([]);
    } finally {
      setIsGenerating(false);
    }
  };
  const handleDownload = () => {
    const doc = new jsPDF();

    let y = 10; // vertical position

    doc.setFont('Times', 'Normal');
    doc.setFontSize(12);

    summaries.forEach((s, index) => {
      if (y > 260) {
        doc.addPage();
        y = 10;
      }

      doc.setFontSize(13);
      doc.text(`Clause ${s.id}`, 10, y);
      y += 8;

      doc.setFontSize(11);
      doc.text('Original Clause:', 10, y);
      y += 6;

      const originalText = doc.splitTextToSize(s.clause_text, 180);
      doc.text(originalText, 10, y);
      y += originalText.length * 6 + 4;

      doc.text('Layman Explanation:', 10, y);
      y += 6;

      const summaryText = doc.splitTextToSize(s.layman_summary, 180);
      doc.text(summaryText, 10, y);
      y += summaryText.length * 6 + 6;

      doc.text(`Risk Level: ${s.risk_label}`, 10, y);
      y += 10;

      if (index < summaries.length - 1) {
        doc.line(10, y, 200, y);
        y += 6;
      }
    });

    doc.save('layman-summary.pdf');
  };


  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Layman Summary</h1>
        <p className="text-muted-foreground mt-2">
          Get plain-language explanations of complex legal terms.
        </p>
      </div>

      {/* Document Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Document</CardTitle>
          <CardDescription>Choose a document to generate summaries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Select value={selectedDocument} onValueChange={setSelectedDocument}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Select a document" />
              </SelectTrigger>
              <SelectContent>
                {documents.map((doc) => (
                  <SelectItem key={doc.id} value={String(doc.id)}>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      {doc.filename}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleGenerate} disabled={!selectedDocument || isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <BookOpen className="mr-2 h-4 w-4" />
                  Generate Summary
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summaries */}
      {summaries.length > 0 && (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-foreground">
              Clause Explanations ({summaries.length})
            </h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleGenerate}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Regenerate
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            {summaries.map((summary, index) => (
              <Card
                key={summary.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
                      {summary.id}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Original Text */}
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">
                      Original Clause
                    </h4>
                    <p className="text-sm text-foreground bg-muted/50 p-3 rounded-lg border border-border italic">
                      "{summary.clause_text}"
                    </p>
                  </div>

                  {/* Layman Explanation */}
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">
                      Plain English Explanation
                    </h4>
                    <p className="text-foreground">{summary.layman_summary}</p>
                  </div>


                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Empty State */}
      {summaries.length === 0 && !isGenerating && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No Summaries Yet</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                Select a document and click "Generate Summary" to get plain-language explanations of your contract.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LaymanSummary;
