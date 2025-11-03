import React, { useState } from 'react';
import { useAI } from '../../hooks/useAI';
import { FileText, Download, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import { toast } from 'react-hot-toast';

const CVOptimizer = ({ jobDescription, onClose }) => {
  const [cvText, setCvText] = useState('');
  const [optimizationResult, setOptimizationResult] = useState(null);

  const { optimizeCV, cvOptimizationLoading } = useAI();

  const handleOptimize = async () => {
    if (!cvText.trim() || !jobDescription) {
      toast.error('Please provide both CV text and job description');
      return;
    }

    try {
      const result = await optimizeCV({ cvText, jobDescription });
      setOptimizationResult(result.optimization);
    } catch (error) {
      console.error('CV optimization error:', error);
      toast.error('Failed to optimize CV. Please try again.');
    }
  };

  const exportToPDF = () => {
    if (!optimizationResult) return;

    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    let yPosition = margin;

    // Title
    pdf.setFontSize(18);
    pdf.text('CV Optimization Report', margin, yPosition);
    yPosition += 20;

    // Date
    pdf.setFontSize(12);
    pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, yPosition);
    yPosition += 15;

    // Content
    pdf.setFontSize(14);
    const lines = pdf.splitTextToSize(optimizationResult, pageWidth - 2 * margin);

    lines.forEach((line) => {
      if (yPosition > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }
      pdf.text(line, margin, yPosition);
      yPosition += 7;
    });

    pdf.save('cv-optimization-report.pdf');
    toast.success('Report exported to PDF!');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-blue-600 text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">CV Optimizer</h2>
                <p className="text-blue-100">Get AI-powered suggestions to improve your CV</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-blue-700 p-2 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* CV Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Paste your CV content here
            </label>
            <textarea
              value={cvText}
              onChange={(e) => setCvText(e.target.value)}
              placeholder="Paste your CV text here..."
              className="w-full h-48 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              disabled={cvOptimizationLoading}
            />
          </div>

          {/* Job Description Display */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Job Description
            </label>
            <div className="bg-gray-50 p-4 rounded-lg max-h-32 overflow-y-auto">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{jobDescription}</p>
            </div>
          </div>

          {/* Optimize Button */}
          <div className="flex justify-center">
            <button
              onClick={handleOptimize}
              disabled={!cvText.trim() || !jobDescription || cvOptimizationLoading}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {cvOptimizationLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Optimize CV</span>
                </>
              )}
            </button>
          </div>

          {/* Results */}
          {optimizationResult && (
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Optimization Results</h3>
                <button
                  onClick={exportToPDF}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Export PDF</span>
                </button>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-green-800 mb-2">AI Recommendations</h4>
                    <div className="text-sm text-green-700 whitespace-pre-wrap">
                      {optimizationResult}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {cvOptimizationLoading && !optimizationResult && (
            <div className="text-center py-8">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">AI is analyzing your CV and generating recommendations...</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CVOptimizer;