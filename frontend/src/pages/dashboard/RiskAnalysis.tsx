import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AlertTriangle, FileText, Loader2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';
import { documentApi, riskApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';



interface RiskClause {
  id: number;
  clause_text: string;
  risk_label: 'HIGH' | 'LOW';
  risk_score: number;
}


const RiskAnalysis = () => {
  const [selectedDocument, setSelectedDocument] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [riskData, setRiskData] = useState<RiskClause[]>([]);
  const { toast } = useToast();
  const [documents, setDocuments] = useState<{ id: string; filename: string }[]>([]);
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const res = await documentApi.list();
        setDocuments(res.data);
      } catch (err) {
        toast({ title: 'Error', description: 'Failed to load documents', variant: 'destructive', });
      }
    }; fetchDocuments();
  }, []);

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    let y = 10;

    doc.setFont('Times', 'Normal');
    doc.setFontSize(14);
    doc.text('Risk Analysis Report', 10, y);
    y += 10;

    riskData.forEach((clause, index) => {
      if (y > 260) {
        doc.addPage();
        y = 10;
      }

      doc.setFontSize(12);
      doc.text(`Clause ${clause.id}`, 10, y);
      y += 6;

      doc.setFontSize(10);
      const clauseText = doc.splitTextToSize(clause.clause_text, 180);
      doc.text(clauseText, 10, y);
      y += clauseText.length * 5 + 4;

      doc.text(`Risk Level: ${clause.risk_label}`, 10, y);
      y += 5;

      doc.text(`Risk Score: ${(clause.risk_score * 100).toFixed(0)}%`, 10, y);
      y += 8;

      if (index < riskData.length - 1) {
        doc.line(10, y, 200, y);
        y += 6;
      }
    });

    doc.save('risk-analysis.pdf');
  };




  const handleAnalyze = async () => {
    if (!selectedDocument) return;

    setIsAnalyzing(true);

    try {
      // 1️⃣ Trigger risk analysis
      await riskApi.analyze(selectedDocument);

      // 2️⃣ Fetch analyzed clauses
      const res = await riskApi.getAnalysis(selectedDocument);

      setRiskData(res.data);
    } catch (err) {
      toast({
        title: 'Risk analysis failed',
        description: 'Unable to analyze document',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskBadgeVariant = (risk: 'HIGH' | 'MEDIUM' | 'LOW') => {
    switch (risk) {
      case 'HIGH':
        return 'risk-high';
      case 'MEDIUM':
        return 'risk-medium';
      case 'LOW':
        return 'risk-low';
    }
  };

  const riskSummary = {
    high: riskData.filter((r) => r.risk_label === 'HIGH').length,
    low: riskData.filter((r) => r.risk_label === 'LOW').length,
  };


  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Risk Analysis</h1>
        <p className="text-muted-foreground mt-2">
          Analyze contract clauses and identify potential risks.
        </p>
      </div>

      {/* Document Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Document</CardTitle>
          <CardDescription>Choose a document to analyze for risks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Select value={selectedDocument} onValueChange={setSelectedDocument}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Select a document" />
              </SelectTrigger>
              <SelectContent>
                {documents.map((doc) => (
                  <SelectItem key={doc.id} value={doc.id}>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      {doc.filename}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleAnalyze} disabled={!selectedDocument || isAnalyzing}>
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Analyze Risk
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Risk Summary */}
      {riskData.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">High Risk</p>
                  <p className="text-3xl font-bold text-destructive">{riskSummary.high}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Low Risk</p>
                  <p className="text-3xl font-bold text-success">{riskSummary.low}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Risk Table */}
      {riskData.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Clause Analysis</CardTitle>
              <CardDescription>
                {riskData.length} clauses analyzed
              </CardDescription>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleAnalyze}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Re-analyze
              </Button>

              <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
                Download PDF
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">Clause ID</TableHead>
                  <TableHead className="w-[75%] text-center">Clause Text</TableHead>
                  <TableHead className="w-[80px] ">Risk Label</TableHead>
                  <TableHead className="w-[80px] text-right">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {riskData.map((clause) => (
                  <TableRow key={clause.id} className="align-middle">
                    <TableCell className="align-top font-mono text-sm  pt-3">{clause.id}</TableCell>
                    <TableCell className=" align-top px-4 py-3">
                      <div className="max-h-[180px] overflow-auto leading-relaxed">
                        {clause.clause_text}
                      </div>


                    </TableCell>
                    <TableCell className='align-middle'>
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
                          getRiskBadgeVariant(clause.risk_label)

                        )}
                      >
                        {clause.risk_label}
                      </span>
                    </TableCell>
                    <TableCell className="align-middle text-right font-mono">
                      {(clause.risk_score * 100).toFixed(0)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {riskData.length === 0 && !isAnalyzing && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No Analysis Yet</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                Select a document and click "Analyze Risk" to identify potential risks in your contract.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RiskAnalysis;
