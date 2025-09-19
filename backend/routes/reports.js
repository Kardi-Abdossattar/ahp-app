import express from 'express';
import puppeteer from 'puppeteer';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Generate PDF report
router.get('/pdf/:projectId', authenticateToken, async (req, res) => {
  try {
    // Verify project ownership and get data
    const project = await req.prisma.project.findFirst({
      where: {
        id: req.params.projectId,
        userId: req.user.id,
      },
      include: {
        criteria: {
          orderBy: { order: 'asc' },
        },
        alternatives: {
          orderBy: { order: 'asc' },
        },
        results: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (!project.results[0]) {
      return res.status(400).json({ message: 'No results available. Please run calculation first.' });
    }

    const results = project.results[0].data;

    // Generate HTML content
    const htmlContent = generateReportHTML(project, results);

    // Generate PDF using Puppeteer
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm',
      },
    });
    
    await browser.close();

    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${project.title}_AHP_Report.pdf"`);
    res.send(pdf);

  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ message: 'Error generating PDF report' });
  }
});

function generateReportHTML(project, results) {
  const formatPercent = (value) => (value * 100).toFixed(2) + '%';
  const formatScore = (value) => value.toFixed(4);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>AHP Report - ${project.title}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #2563EB;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #2563EB;
          margin: 0;
        }
        .section {
          margin-bottom: 30px;
        }
        .section h2 {
          color: #1E40AF;
          border-left: 4px solid #2563EB;
          padding-left: 15px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 15px 0;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 12px;
          text-align: left;
        }
        th {
          background-color: #F3F4F6;
          font-weight: 600;
        }
        .rank-1 { background-color: #FEF3C7; }
        .rank-2 { background-color: #FEE2E2; }
        .rank-3 { background-color: #E0E7FF; }
        .consistency-good { color: #16A34A; font-weight: bold; }
        .consistency-poor { color: #DC2626; font-weight: bold; }
        .chart-placeholder {
          background-color: #F9FAFB;
          border: 2px dashed #D1D5DB;
          height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6B7280;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          margin-top: 50px;
          padding-top: 20px;
          border-top: 1px solid #E5E7EB;
          font-size: 12px;
          color: #6B7280;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>AHP Decision Analysis Report</h1>
        <h2>${project.title}</h2>
        <p><strong>Goal:</strong> ${project.goal}</p>
        <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
      </div>

      <div class="section">
        <h2>Executive Summary</h2>
        <p><strong>Best Alternative:</strong> ${results.finalScores[0]?.name} (Score: ${formatScore(results.finalScores[0]?.score)})</p>
        <p><strong>Number of Criteria:</strong> ${results.criteriaWeights.length}</p>
        <p><strong>Number of Alternatives:</strong> ${results.finalScores.length}</p>
        <p><strong>Overall Consistency:</strong> 
          <span class="${results.overallConsistency?.isConsistent ? 'consistency-good' : 'consistency-poor'}">
            ${results.overallConsistency?.isConsistent ? 'Acceptable' : 'Poor'} 
            (CR = ${(results.overallConsistency?.consistencyRatio || 0).toFixed(4)})
          </span>
        </p>
      </div>

      <div class="section">
        <h2>Final Rankings</h2>
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Alternative</th>
              <th>Score</th>
              <th>Percentage</th>
            </tr>
          </thead>
          <tbody>
            ${results.finalScores.map((alt, index) => `
              <tr class="rank-${Math.min(index + 1, 3)}">
                <td>${index + 1}</td>
                <td>${alt.name}</td>
                <td>${formatScore(alt.score)}</td>
                <td>${formatPercent(alt.score)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="section">
        <h2>Criteria Weights</h2>
        <table>
          <thead>
            <tr>
              <th>Criterion</th>
              <th>Weight</th>
              <th>Percentage</th>
              <th>Consistency Ratio</th>
            </tr>
          </thead>
          <tbody>
            ${results.criteriaWeights.map(criterion => `
              <tr>
                <td>${criterion.name}</td>
                <td>${formatScore(criterion.weight)}</td>
                <td>${formatPercent(criterion.weight)}</td>
                <td>${(criterion.consistencyRatio || 0).toFixed(4)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="section">
        <h2>Alternative Scores by Criteria</h2>
        ${results.criteriaWeights.map(criterion => `
          <h3>${criterion.name}</h3>
          <table>
            <thead>
              <tr>
                <th>Alternative</th>
                <th>Score</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              ${(results.alternativeScores[criterion.id] || []).map(alt => `
                <tr>
                  <td>${alt.name}</td>
                  <td>${formatScore(alt.score)}</td>
                  <td>${formatPercent(alt.score)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `).join('')}
      </div>

      <div class="section">
        <h2>Consistency Analysis</h2>
        <p>The Analytic Hierarchy Process includes consistency checking to ensure the reliability of judgments.</p>
        <ul>
          <li><strong>Consistency Ratio (CR) ≤ 0.1:</strong> Acceptable consistency</li>
          <li><strong>Consistency Ratio (CR) > 0.1:</strong> Inconsistent judgments, review recommended</li>
        </ul>
        <p><strong>Overall Consistency Ratio:</strong> ${(results.overallConsistency?.consistencyRatio || 0).toFixed(4)}</p>
      </div>

      <div class="section">
        <h2>Methodology</h2>
        <p>This analysis used the Analytic Hierarchy Process (AHP), a multi-criteria decision analysis method developed by Thomas Saaty. The process involves:</p>
        <ol>
          <li><strong>Hierarchy Construction:</strong> Decomposing the decision into goal, criteria, and alternatives</li>
          <li><strong>Pairwise Comparisons:</strong> Comparing elements using Saaty's 1-9 scale</li>
          <li><strong>Priority Derivation:</strong> Calculating weights using the eigenvector method</li>
          <li><strong>Consistency Verification:</strong> Ensuring logical consistency of judgments</li>
          <li><strong>Synthesis:</strong> Combining weights to determine final priorities</li>
        </ol>
      </div>

      <div class="footer">
        <p>Generated by AHP Decision Support System | ${new Date().toLocaleString()}</p>
      </div>
    </body>
    </html>
  `;
}

export default router;