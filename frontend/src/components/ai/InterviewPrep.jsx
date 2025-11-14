import React, { useState } from 'react';
import { useAI } from '../../hooks/useAI';
import { MessageSquare, Download, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import { toast } from 'react-hot-toast';

const InterviewPrep = ({ jobDescription, onClose }) => {
  const [experienceLevel, setExperienceLevel] = useState('mid');
  const [questions, setQuestions] = useState(null);

  const { prepareInterview, interviewPrepLoading } = useAI();

  const handleGenerateQuestions = async () => {
    if (!jobDescription) {
      toast.error('Job description is required');
      return;
    }

    try {
      const result = await prepareInterview({ jobDescription, experienceLevel });
      setQuestions(result.questions);
    } catch (error) {
      console.error('Interview prep error:', error);
      toast.error('Failed to generate interview questions. Please try again.');
    }
  };

  const exportToPDF = () => {
    if (!questions) return;

    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 20;
    let yPosition = margin;

    // Title
    pdf.setFontSize(18);
    pdf.text('Interview Preparation Questions', margin, yPosition);
    yPosition += 20;

    // Job Description
    pdf.setFontSize(14);
    pdf.text('Job Description:', margin, yPosition);
    yPosition += 10;

    pdf.setFontSize(12);
    const jobDescLines = pdf.splitTextToSize(jobDescription, pageWidth - 2 * margin);
    jobDescLines.forEach((line) => {
      if (yPosition > pdf.internal.pageSize.getHeight() - margin) {
        pdf.addPage();
        yPosition = margin;
      }
      pdf.text(line, margin, yPosition);
      yPosition += 7;
    });
    yPosition += 10;

    // Experience Level
    pdf.text(`Experience Level: ${experienceLevel}`, margin, yPosition);
    yPosition += 15;

    // Questions
    pdf.setFontSize(14);
    pdf.text('Interview Questions:', margin, yPosition);
    yPosition += 10;

    pdf.setFontSize(12);
    const questionLines = pdf.splitTextToSize(questions, pageWidth - 2 * margin);
    questionLines.forEach((line) => {
      if (yPosition > pdf.internal.pageSize.getHeight() - margin) {
        pdf.addPage();
        yPosition = margin;
      }
      pdf.text(line, margin, yPosition);
      yPosition += 7;
    });

    pdf.save('interview-preparation-questions.pdf');
    toast.success('Questions exported to PDF!');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-purple-600 text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MessageSquare className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">Interview Preparation</h2>
                <p className="text-purple-100">Generate tailored interview questions</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-purple-700 p-2 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Job Description Display */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Description
            </label>
            <div className="bg-gray-50 p-4 rounded-lg max-h-32 overflow-y-auto">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{jobDescription}</p>
            </div>
          </div>

          {/* Experience Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Experience Level
            </label>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="entry">Entry Level (0-2 years)</option>
              <option value="mid">Mid Level (2-5 years)</option>
              <option value="senior">Senior Level (5+ years)</option>
              <option value="executive">Executive Level</option>
            </select>
          </div>

          {/* Generate Button */}
          <div className="flex justify-center">
            <button
              onClick={handleGenerateQuestions}
              disabled={!jobDescription || interviewPrepLoading}
              className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {interviewPrepLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Generate Questions</span>
                </>
              )}
            </button>
          </div>

          {/* Results */}
          {questions && (
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Generated Questions</h3>
                <button
                  onClick={exportToPDF}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Export PDF</span>
                </button>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <MessageSquare className="w-6 h-6 text-purple-600 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm text-purple-700 whitespace-pre-wrap">
                      {questions}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-6 h-6 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-blue-800 mb-2">Interview Tips</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Practice answering questions out loud</li>
                      <li>• Research the company and role thoroughly</li>
                      <li>• Prepare questions to ask the interviewer</li>
                      <li>• Follow up with a thank-you email</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {interviewPrepLoading && !questions && (
            <div className="text-center py-8">
              <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
              <p className="text-gray-600">AI is generating tailored interview questions...</p>
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

export default InterviewPrep;