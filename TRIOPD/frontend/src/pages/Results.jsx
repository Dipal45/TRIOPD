import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';

export default function Results() {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/assessment/all-results');
      const data = await response.json();
      setAssessments(data);
    } catch (err) {
      console.error('Error fetching assessments:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (score) => {
    if (score > 70) return '#dc2626'; // Red
    if (score > 40) return '#d97706'; // Yellow/Orange
    return '#16a34a'; // Green
  };

  const getRiskCategory = (score) => {
    if (score > 70) return 'High Risk';
    if (score > 40) return 'Moderate Risk';
    return 'Low Risk';
  };

  const generateExplanation = (score, modality) => {
    const explanations = {
      handwriting: {
        high: "The handwriting analysis detected significant tremor patterns, irregular spiral deviations, and inconsistent drawing speed. These motor control abnormalities are characteristic of Parkinson's Disease, particularly affecting fine motor skills and hand coordination.",
        moderate: "The handwriting analysis showed some irregularities in spiral drawing patterns, including mild tremor and slight variations in drawing speed. These findings suggest possible early motor symptoms that warrant further clinical evaluation.",
        low: "The handwriting analysis demonstrated normal motor control with smooth spiral patterns, consistent speed, and minimal tremor. No significant Parkinson's-related motor symptoms were detected in the handwriting sample."
      },
      voice: {
        high: "The voice analysis revealed significant vocal abnormalities including high jitter (pitch variation), elevated shimmer (loudness variation), and reduced harmonic-to-noise ratio. These acoustic features strongly indicate vocal cord stiffness and reduced vocal control, which are hallmark signs of Parkinson's Disease affecting speech production.",
        moderate: "The voice analysis detected moderate vocal variations including some pitch instability and mild loudness fluctuations. These patterns may indicate early vocal changes associated with Parkinson's Disease, though further clinical assessment is recommended.",
        low: "The voice analysis showed normal vocal characteristics with stable pitch, consistent loudness, and healthy harmonic patterns. No significant Parkinson's-related vocal symptoms were detected."
      },
      gait: {
        high: "The gait analysis identified significant walking abnormalities including reduced stride length, increased stride variability, decreased walking velocity, and irregular cadence patterns. These motor impairments are strongly associated with Parkinson's Disease, reflecting basal ganglia dysfunction affecting movement coordination and balance.",
        moderate: "The gait analysis revealed moderate walking pattern irregularities including slight reductions in stride length and mild variability in walking rhythm. These findings suggest possible early gait disturbances that may be associated with Parkinson's Disease.",
        low: "The gait analysis demonstrated normal walking patterns with consistent stride length, regular cadence, and stable movement coordination. No significant Parkinson's-related gait abnormalities were detected."
      }
    };

    const category = score > 70 ? 'high' : score > 40 ? 'moderate' : 'low';
    return explanations[modality][category];
  };

  const downloadPDF = (assessment) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFillColor(30, 58, 138); // Dark blue
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('TRIOPD', pageWidth / 2, 15, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Parkinson\'s Disease Assessment Report', pageWidth / 2, 25, { align: 'center' });
    
    const reportDate = new Date(assessment.timestamp).toLocaleDateString();
    doc.setFontSize(10);
    doc.text(`Report Generated: ${reportDate}`, pageWidth / 2, 35, { align: 'center' });

    // Patient Information
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Patient Information', 14, 55);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Patient Name: ${assessment.patient_name}`, 14, 65);
    doc.text(`Age: ${assessment.patient_age} years`, 14, 72);
    doc.text(`Assessment Date: ${new Date(assessment.timestamp).toLocaleString()}`, 14, 79);

    // Overall Risk Score
    doc.setFillColor(240, 240, 240);
    doc.rect(14, 90, pageWidth - 28, 30, 'F');
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 58, 138);
    doc.text('Overall Risk Assessment', 20, 100);
    
    doc.setFontSize(28);
    doc.setTextColor(getRiskColor(assessment.overall_score));
    doc.text(`${assessment.overall_score}%`, pageWidth - 30, 105, { align: 'right' });
    
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(`Category: ${assessment.overall_category}`, 20, 113);

    // Individual Test Results
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Individual Test Results & Explanations', 14, 135);

    const testResults = [
      { name: 'Handwriting Analysis', score: assessment.handwriting_score, type: 'handwriting' },
      { name: 'Voice Analysis', score: assessment.voice_score, type: 'voice' },
      { name: 'Gait/Walking Analysis', score: assessment.gait_score, type: 'gait' }
    ];

    let yPos = 145;
    testResults.forEach((test) => {
      if (test.score !== null && test.score !== undefined) {
        // Test header
        doc.setFillColor(248, 250, 252);
        doc.rect(14, yPos - 8, pageWidth - 28, 15, 'F');
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 58, 138);
        doc.text(test.name, 18, yPos);
        
        doc.setFontSize(12);
        doc.setTextColor(getRiskColor(test.score));
        doc.text(`Risk Score: ${test.score}% (${getRiskCategory(test.score)})`, pageWidth - 30, yPos, { align: 'right' });
        
        // Explanation
        yPos += 10;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(80, 80, 80);
        
        const explanation = generateExplanation(test.score, test.type);
        const splitExplanation = doc.splitTextToSize(explanation, pageWidth - 34);
        doc.text(splitExplanation, 18, yPos);
        
        yPos += (splitExplanation.length * 5) + 10;
        
        // Add page break if needed
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
      }
    });

    // Clinical Recommendation
    if (yPos > 220) {
      doc.addPage();
      yPos = 20;
    } else {
      yPos += 10;
    }

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 58, 138);
    doc.text('Clinical Recommendation', 14, yPos);
    yPos += 10;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    let recommendation = '';
    if (assessment.overall_score > 70) {
      recommendation = 'URGENT: Based on the comprehensive assessment showing HIGH RISK indicators across multiple motor domains, we strongly recommend immediate consultation with a neurologist specializing in movement disorders. Further diagnostic tests including DaTscan imaging and comprehensive neurological examination are advised.';
    } else if (assessment.overall_score > 40) {
      recommendation = 'MODERATE CONCERN: The assessment indicates possible early signs of Parkinson\'s Disease. We recommend scheduling an appointment with a neurologist within the next 2-4 weeks for comprehensive evaluation. Regular monitoring of symptoms is advised.';
    } else {
      recommendation = 'LOW RISK: The assessment did not detect significant Parkinson\'s Disease indicators. However, if you are experiencing concerning symptoms, please consult with your primary care physician. Regular health check-ups are recommended.';
    }
    
    const splitRecommendation = doc.splitTextToSize(recommendation, pageWidth - 28);
    doc.text(splitRecommendation, 14, yPos);

    // Footer
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text('This report is generated by TRIOPD - AI-Assisted Parkinson\'s Disease Screening Tool', 14, 280);
    doc.text('Disclaimer: This is a screening tool and does not replace professional medical diagnosis.', 14, 285);

    // Save PDF
    const fileName = `TRIOPD_Report_${assessment.patient_name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Assessment Results</h1>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading assessments...</p>
          </div>
        ) : assessments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-gray-600 mb-6 text-lg">No assessments found</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
            >
              Start New Assessment
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {assessments.map((assessment) => (
              <div key={assessment.id} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Patient: {assessment.patient_name}</h2>
                    <p className="text-gray-600">Age: {assessment.patient_age} years</p>
                    <p className="text-gray-500 text-sm">
                      Date: {new Date(assessment.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold" style={{ color: getRiskColor(assessment.overall_score) }}>
                      {assessment.overall_score}%
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Overall Risk</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {assessment.handwriting_score !== null && (
                    <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                      <h3 className="font-bold text-gray-800 mb-2">Handwriting</h3>
                      <p className="text-2xl font-bold" style={{ color: getRiskColor(assessment.handwriting_score) }}>
                        {assessment.handwriting_score}%
                      </p>
                      <p className="text-sm text-gray-600 mt-1">{getRiskCategory(assessment.handwriting_score)}</p>
                    </div>
                  )}
                  {assessment.voice_score !== null && (
                    <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                      <h3 className="font-bold text-gray-800 mb-2">Voice</h3>
                      <p className="text-2xl font-bold" style={{ color: getRiskColor(assessment.voice_score) }}>
                        {assessment.voice_score}%
                      </p>
                      <p className="text-sm text-gray-600 mt-1">{getRiskCategory(assessment.voice_score)}</p>
                    </div>
                  )}
                  {assessment.gait_score !== null && (
                    <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
                      <h3 className="font-bold text-gray-800 mb-2">Gait</h3>
                      <p className="text-2xl font-bold" style={{ color: getRiskColor(assessment.gait_score) }}>
                        {assessment.gait_score}%
                      </p>
                      <p className="text-sm text-gray-600 mt-1">{getRiskCategory(assessment.gait_score)}</p>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4 mb-6">
                  <p className="text-lg mb-2">
                    Overall Risk: <span className="font-bold" style={{ color: getRiskColor(assessment.overall_score) }}>
                      {assessment.overall_category}
                    </span>
                  </p>
                  <p className="text-gray-600">Tests Completed: {assessment.tests_completed}/3</p>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => downloadPDF(assessment)}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition flex items-center justify-center gap-2"
                  >
                     Download PDF Report
                  </button>
                  <button
                    onClick={() => navigate('/')}
                    className="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition"
                  >
                    Start New Assessment
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}